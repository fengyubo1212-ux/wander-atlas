import type { Location } from '@/types'
import type { GeocodingProvider } from './GeocodingProvider'

interface NominatimResult {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  lat: string
  lon: string
  display_name: string
  type: string
  importance: number
  address?: Record<string, string>
}

export class NominatimProvider implements GeocodingProvider {
  private cache = new Map<string, Location[]>()
  private lastRequestTime = 0
  private readonly minInterval = 1100

  async search(query: string): Promise<Location[]> {
    const key = query.trim().toLowerCase()
    if (this.cache.has(key)) return this.cache.get(key)!

    await this.throttle()

    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '8',
      'accept-language': 'zh,en',
      addressdetails: '1',
    })

    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': 'Wander/1.0 (travel-planner)' },
    })

    if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`)

    const data: NominatimResult[] = await res.json()
    const locations = data.map((r) => this.mapResult(r))
    this.cache.set(key, locations)
    return locations
  }

  async reverse(lat: number, lng: number): Promise<Location | null> {
    await this.throttle()

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'json',
      'accept-language': 'zh,en',
      addressdetails: '1',
    })

    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: { 'User-Agent': 'Wander/1.0 (travel-planner)' },
    })

    if (!res.ok) return null

    const data: NominatimResult = await res.json()
    return this.mapResult(data)
  }

  isAvailable(): boolean {
    return true
  }

  private mapResult(r: NominatimResult): Location {
    const addr = r.address || {}
    const type = this.guessType(r.type, addr)

    const parts: string[] = []
    if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village || '')
    if (addr.state) parts.push(addr.state)
    if (addr.country) parts.push(addr.country)

    return {
      name: r.display_name.split(',')[0] || r.display_name,
      address: parts.join(', ') || r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      type,
    }
  }

  private guessType(
    osmType: string,
    addr: Record<string, string>,
  ): Location['type'] {
    if (addr.airport) return 'airport'
    if (addr.railway || addr.station === 'railway') return 'train_station'
    if (addr.station) return 'metro_station'
    if (addr.bus) return 'bus_stop'
    if (addr.hotel || addr.hostel || addr.motel) return 'hotel'
    if (osmType === 'attraction' || osmType === 'tourism') return 'attraction'
    if (osmType === 'mall' || osmType === 'retail') return 'mall'
    if (osmType === 'restaurant' || osmType === 'cafe') return 'restaurant'
    if (osmType === 'city' || osmType === 'town' || osmType === 'village') return 'city'
    return 'other'
  }

  private async throttle() {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime
    if (elapsed < this.minInterval) {
      await new Promise((r) => setTimeout(r, this.minInterval - elapsed))
    }
    this.lastRequestTime = Date.now()
  }
}
