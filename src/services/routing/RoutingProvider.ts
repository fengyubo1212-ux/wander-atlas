import type { Route, TransportMode } from '@/types'

export interface RouteRequest {
  origin: { latitude: number; longitude: number }
  destination: { latitude: number; longitude: number }
  mode: TransportMode
}

export interface RoutingProvider {
  getRoutes(request: RouteRequest): Promise<Route[]>
  isAvailable(): boolean
}
