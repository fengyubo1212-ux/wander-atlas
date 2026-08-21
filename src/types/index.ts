export interface Location {
  name: string
  address: string
  latitude: number
  longitude: number
  type: LocationType
}

export type LocationType =
  | 'city'
  | 'address'
  | 'attraction'
  | 'hotel'
  | 'mall'
  | 'airport'
  | 'train_station'
  | 'metro_station'
  | 'bus_stop'
  | 'restaurant'
  | 'other'

export type TransportMode = 'walking' | 'cycling' | 'driving' | 'transit'

export interface RouteStep {
  instruction: string
  distance: number
  duration: number
  mode: TransportMode
}

export interface Route {
  id: string
  mode: TransportMode
  distance: number
  duration: number
  steps: RouteStep[]
  coordinates: [number, number][]
  summary?: string
}

export interface Place {
  id: string
  name: string
  nameEn?: string
  address: string
  latitude: number
  longitude: number
  type: LocationType
  tags: string[]
  description?: string
  openingHours?: string
  stayDuration?: number
  rating?: number
}

export type TravelStyle =
  | 'budget'
  | 'comfort'
  | 'luxury'
  | 'intense'
  | 'relaxed'
  | 'photography'
  | 'couple'
  | 'family'

export type TravelInterest =
  | 'food'
  | 'attractions'
  | 'photography'
  | 'nature'
  | 'shopping'
  | 'history'
  | 'anime'
  | 'nightlife'
  | 'coffee'
  | 'art'

export interface Trip {
  id: string
  destination: string
  origin: string
  startDate: string
  endDate: string
  days: number
  people: number
  budget: number
  currency: string
  styles: TravelStyle[]
  interests: TravelInterest[]
  daysPlan: TripDay[]
  createdAt: string
}

export interface TripDay {
  day: number
  date: string
  items: TripItem[]
}

export interface TripItem {
  id: string
  place: Place
  time: string
  stayDuration: number
  note?: string
}

export interface UserSettings {
  unit: 'km' | 'mile'
  currency: 'MYR' | 'USD' | 'JPY' | 'CNY'
  defaultTransport: TransportMode
  mapStyle: 'standard' | 'dark'
  dataMode: 'auto' | 'demo'
}
