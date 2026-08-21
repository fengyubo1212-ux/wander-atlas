import type { Place } from '@/types'

export interface PlacesProvider {
  searchByDestination(destination: string): Promise<Place[]>
  getById(id: string): Promise<Place | null>
}
