import type { Trip, Place } from '@/types'

const KEYS = {
  TRIPS: 'wander-trips',
  FAVORITES: 'wander-favorites',
  RECENT_SEARCH: 'wander-recent-search',
  SETTINGS: 'wander-settings',
} as const

function safeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* quota exceeded */ }
}

// --- Trips ---
export function getTrips(): Trip[] {
  return safeGet<Trip[]>(KEYS.TRIPS) || []
}

export function saveTrip(trip: Trip) {
  const trips = getTrips()
  const idx = trips.findIndex((t) => t.id === trip.id)
  if (idx >= 0) {
    trips[idx] = trip
  } else {
    trips.unshift(trip)
  }
  safeSet(KEYS.TRIPS, trips)
}

export function deleteTrip(id: string) {
  const trips = getTrips().filter((t) => t.id !== id)
  safeSet(KEYS.TRIPS, trips)
}

// --- Favorites ---
export function getFavorites(): Place[] {
  return safeGet<Place[]>(KEYS.FAVORITES) || []
}

export function addFavorite(place: Place) {
  const favs = getFavorites()
  if (!favs.find((f) => f.id === place.id)) {
    favs.unshift(place)
    safeSet(KEYS.FAVORITES, favs)
  }
}

export function removeFavorite(id: string) {
  const favs = getFavorites().filter((f) => f.id !== id)
  safeSet(KEYS.FAVORITES, favs)
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id)
}

// --- Recent Search ---
export interface RecentSearch {
  name: string
  latitude: number
  longitude: number
  timestamp: number
}

export function getRecentSearches(): RecentSearch[] {
  return safeGet<RecentSearch[]>(KEYS.RECENT_SEARCH) || []
}

export function addRecentSearch(item: Omit<RecentSearch, 'timestamp'>) {
  const list = getRecentSearches().filter((r) => r.name !== item.name)
  list.unshift({ ...item, timestamp: Date.now() })
  safeSet(KEYS.RECENT_SEARCH, list.slice(0, 10))
}

export function clearRecentSearches() {
  safeSet(KEYS.RECENT_SEARCH, [])
}
