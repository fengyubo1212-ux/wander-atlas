import type { RoutingProvider } from './RoutingProvider'
import { DemoRoutingProvider } from './DemoRoutingProvider'

let provider: RoutingProvider | null = null

export function getRoutingProvider(): RoutingProvider {
  if (!provider) {
    const apiKey = import.meta.env.VITE_ORS_API_KEY
    if (apiKey) {
      // Phase 3: import OpenRouteServiceProvider
      // provider = new OpenRouteServiceProvider(apiKey)
      provider = new DemoRoutingProvider()
    } else {
      provider = new DemoRoutingProvider()
    }
  }
  return provider
}

export type { RoutingProvider, RouteRequest } from './RoutingProvider'
