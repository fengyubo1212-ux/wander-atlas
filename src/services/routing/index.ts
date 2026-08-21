import type { RoutingProvider } from './RoutingProvider'
import { DemoRoutingProvider } from './DemoRoutingProvider'
import { OpenRouteServiceProvider } from './OpenRouteServiceProvider'

let provider: RoutingProvider | null = null

export function getRoutingProvider(): RoutingProvider {
  if (!provider) {
    const apiKey = import.meta.env.VITE_ORS_API_KEY
    const dataMode = localStorage.getItem('wander-data-mode')

    if (dataMode === 'demo' || !apiKey) {
      provider = new DemoRoutingProvider()
    } else {
      provider = new OpenRouteServiceProvider(apiKey)
    }
  }
  return provider
}

export function resetRoutingProvider() {
  provider = null
}

export type { RoutingProvider, RouteRequest } from './RoutingProvider'
