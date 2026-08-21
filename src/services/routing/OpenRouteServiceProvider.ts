import type { Route, RouteStep, TransportMode } from '@/types'
import type { RoutingProvider, RouteRequest } from './RoutingProvider'

interface ORSDirectionsResponse {
  routes: {
    summary: { distance: number; duration: number }
    geometry: { coordinates: [number, number][] }
    legs: {
      steps: {
        instruction: string
        distance: number
        duration: number
      }[]
    }[]
  }[]
}

const orsModeMap: Record<TransportMode, string> = {
  walking: 'foot-walking',
  cycling: 'cycling-regular',
  driving: 'driving-car',
  transit: 'driving-car',
}

export class OpenRouteServiceProvider implements RoutingProvider {
  private apiKey: string
  private cache = new Map<string, Route[]>()

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getRoutes(request: RouteRequest): Promise<Route[]> {
    const modes: TransportMode[] = ['driving', 'walking', 'cycling']
    const results: Route[] = []

    for (const mode of modes) {
      const cacheKey = `${request.origin.latitude},${request.origin.longitude}-${request.destination.latitude},${request.destination.longitude}-${mode}`
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (cached) results.push(...cached)
        continue
      }

      try {
        const route = await this.fetchRoute(request, mode)
        this.cache.set(cacheKey, [route])
        results.push(route)
      } catch {
        // Silently fail individual modes
      }
    }

    return results
  }

  private async fetchRoute(request: RouteRequest, mode: TransportMode): Promise<Route> {
    const orsMode = orsModeMap[mode]
    const coords = [
      [request.origin.longitude, request.origin.latitude],
      [request.destination.longitude, request.destination.latitude],
    ]

    const res = await fetch(
      `https://api.openrouteservice.org/v2/directions/${orsMode}/geojson`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coordinates: coords }),
      },
    )

    if (!res.ok) {
      throw new Error(`ORS API error: ${res.status}`)
    }

    const data = await res.json()
    const geojson = data as { features: ORSDirectionsResponse[] }
    const route = geojson.features[0]?.routes[0]
    if (!route) throw new Error('No route found')

    const leg = route.legs[0]
    const steps: RouteStep[] = leg?.steps.map((s) => ({
      instruction: s.instruction,
      distance: Math.round(s.distance),
      duration: Math.round(s.duration),
      mode,
    })) || []

    return {
      id: `ors-${mode}-${Date.now()}`,
      mode,
      distance: Math.round(route.summary.distance),
      duration: Math.round(route.summary.duration),
      summary: `${mode === 'driving' ? '驾车' : mode === 'walking' ? '步行' : '骑行'}路线`,
      steps,
      coordinates: route.geometry.coordinates.map((c) => [c[1], c[0]]),
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }
}
