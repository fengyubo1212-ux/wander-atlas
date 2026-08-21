import type { Place } from '@/types'
import type { PlacesProvider } from './PlacesProvider'
import { demoPlacesTokyo, demoPlacesKL } from '@/data/demo'

const allPlaces: Record<string, Place[]> = {
  '东京': demoPlacesTokyo,
  'tokyo': demoPlacesTokyo,
  '吉隆坡': demoPlacesKL,
  'kuala lumpur': demoPlacesKL,
  'kl': demoPlacesKL,
}

export class DemoPlacesProvider implements PlacesProvider {
  async searchByDestination(destination: string): Promise<Place[]> {
    await new Promise((r) => setTimeout(r, 200))
    const q = destination.toLowerCase()
    for (const [key, places] of Object.entries(allPlaces)) {
      if (q.includes(key) || key.includes(q)) return places
    }
    return demoPlacesTokyo
  }

  async getById(id: string): Promise<Place | null> {
    const all = [...demoPlacesTokyo, ...demoPlacesKL]
    return all.find((p) => p.id === id) || null
  }
}
