import type { TransitProvider } from './TransitProvider'
import { DemoTransitProvider } from './DemoTransitProvider'

let singleton: TransitProvider | null = null

export function getTransitProvider(): TransitProvider {
  if (!singleton) {
    singleton = new DemoTransitProvider()
  }
  return singleton
}

export function resetTransitProvider(): void {
  singleton = null
}

export type { TransitProvider, TransitRouteRequest } from './TransitProvider'
export { DemoTransitProvider } from './DemoTransitProvider'
