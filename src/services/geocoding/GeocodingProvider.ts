import type { Location } from '@/types'

export interface GeocodingProvider {
  search(query: string): Promise<Location[]>
  reverse(lat: number, lng: number): Promise<Location | null>
  isAvailable(): boolean
}
