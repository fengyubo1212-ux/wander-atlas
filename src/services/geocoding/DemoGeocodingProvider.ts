import type { Location } from '@/types'
import type { GeocodingProvider } from './GeocodingProvider'
import { demoPlacesKL, demoPlacesTokyo } from '@/data/demo'

const allPlaces = [...demoPlacesKL, ...demoPlacesTokyo]

export class DemoGeocodingProvider implements GeocodingProvider {
  async search(query: string): Promise<Location[]> {
    await new Promise((r) => setTimeout(r, 300))

    const q = query.toLowerCase()
    return allPlaces
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
          p.address.toLowerCase().includes(q),
      )
      .map((p) => ({
        name: p.name,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        type: p.type,
      }))
  }

  async reverse(_lat: number, _lng: number): Promise<Location | null> {
    return null
  }

  isAvailable(): boolean {
    return true
  }
}
