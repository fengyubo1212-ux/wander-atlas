import type { GeocodingProvider } from './GeocodingProvider'
import { NominatimProvider } from './NominatimProvider'
import { DemoGeocodingProvider } from './DemoGeocodingProvider'

let provider: GeocodingProvider | null = null

export function getGeocodingProvider(): GeocodingProvider {
  if (!provider) {
    const dataMode = localStorage.getItem('wander-data-mode')
    if (dataMode === 'demo') {
      provider = new DemoGeocodingProvider()
    } else {
      provider = new NominatimProvider()
    }
  }
  return provider
}

export function resetGeocodingProvider() {
  provider = null
}

export type { GeocodingProvider } from './GeocodingProvider'
