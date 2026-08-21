import type { Route, TransportMode } from '@/types'
import type { RoutingProvider, RouteRequest } from './RoutingProvider'

function generateDemoRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  mode: TransportMode,
): Route {
  const latDiff = destination.latitude - origin.latitude
  const lngDiff = destination.longitude - origin.longitude
  const steps = 5

  const coordinates: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const jitterLat = (Math.random() - 0.5) * 0.002
    const jitterLng = (Math.random() - 0.5) * 0.002
    coordinates.push([
      origin.latitude + latDiff * t + jitterLat,
      origin.longitude + lngDiff * t + jitterLng,
    ])
  }

  const speedMap: Record<TransportMode, number> = {
    walking: 1.4,
    cycling: 4.5,
    driving: 12,
    transit: 8,
  }

  const R = 6371000
  let totalDistance = 0
  for (let i = 1; i < coordinates.length; i++) {
    const curr = coordinates[i]
    const prev = coordinates[i - 1]
    if (!curr || !prev) continue
    const dLat = ((curr[0] - prev[0]) * Math.PI) / 180
    const dLng = ((curr[1] - prev[1]) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((prev[0] * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2
    totalDistance += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const distance = Math.round(totalDistance)
  const duration = Math.round(distance / speedMap[mode])

  const modeLabels: Record<TransportMode, string> = {
    walking: '步行',
    cycling: '骑行',
    driving: '驾车',
    transit: '公交',
  }

  return {
    id: `demo-${mode}-${Date.now()}`,
    mode,
    distance,
    duration,
    summary: `演示${modeLabels[mode]}路线`,
    steps: [
      { instruction: '从起点出发', distance: Math.round(distance * 0.2), duration: Math.round(duration * 0.2), mode },
      { instruction: '沿主要道路直行', distance: Math.round(distance * 0.3), duration: Math.round(duration * 0.3), mode },
      { instruction: '继续前行', distance: Math.round(distance * 0.3), duration: Math.round(duration * 0.3), mode },
      { instruction: '接近目的地', distance: Math.round(distance * 0.15), duration: Math.round(duration * 0.15), mode },
      { instruction: '到达目的地', distance: Math.round(distance * 0.05), duration: Math.round(duration * 0.05), mode },
    ],
    coordinates,
  }
}

export class DemoRoutingProvider implements RoutingProvider {
  async getRoutes(request: RouteRequest): Promise<Route[]> {
    await new Promise((r) => setTimeout(r, 500))

    const modes: TransportMode[] = ['driving', 'walking', 'cycling']
    return modes.map((mode) =>
      generateDemoRoute(request.origin, request.destination, mode),
    )
  }

  isAvailable(): boolean {
    return true
  }
}
