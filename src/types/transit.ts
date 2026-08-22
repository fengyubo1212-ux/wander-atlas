export type TransitMode = 'subway' | 'light_rail' | 'monorail' | 'bus' | 'commuter_rail'

export interface TransitLine {
  id: string
  shortName: string
  name: string
  nameEn?: string
  color: string
  mode: TransitMode
  stationIds: string[]
}

export interface TransitStation {
  id: string
  name: string
  nameEn?: string
  latitude: number
  longitude: number
  lineIds: string[]
}

export interface TransitTransfer {
  fromStationId: string
  toStationId: string
  fromLineId: string
  toLineId: string
  walkDistance: number
  duration: number
}

export interface TransitNetwork {
  lines: TransitLine[]
  stations: TransitStation[]
  transfers: TransitTransfer[]
}

export interface TransitRouteRequest {
  origin: { latitude: number; longitude: number; name?: string }
  destination: { latitude: number; longitude: number; name?: string }
  strategy: 'fastest' | 'fewest_transfers' | 'least_walking'
}

export interface TransitRouteResult {
  totalDuration: number
  totalDistance: number
  walkDistance: number
  transferCount: number
  fare: number | null
  steps: TransitRouteStep[]
  polyline: [number, number][]
}

export interface TransitRouteStep {
  type: 'walk' | 'ride' | 'transfer' | 'wait'
  mode?: TransitMode
  lineId?: string
  lineName?: string
  lineColor?: string
  direction?: string
  fromStation?: string
  toStation?: string
  stopCount?: number
  distance: number
  duration: number
  stations?: string[]
}
