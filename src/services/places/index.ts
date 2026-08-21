import type { PlacesProvider } from './PlacesProvider'
import { DemoPlacesProvider } from './DemoPlacesProvider'

let provider: PlacesProvider | null = null

export function getPlacesProvider(): PlacesProvider {
  if (!provider) {
    provider = new DemoPlacesProvider()
  }
  return provider
}

export type { PlacesProvider } from './PlacesProvider'
