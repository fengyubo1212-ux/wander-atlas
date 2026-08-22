import type { Route } from '@/types'

export interface TransitRouteRequest {
  origin: { latitude: number; longitude: number; name?: string }
  destination: { latitude: number; longitude: number; name?: string }
}

export interface TransitProvider {
  getRoutes(request: TransitRouteRequest): Promise<Route[]>
  isAvailable(): boolean
}
