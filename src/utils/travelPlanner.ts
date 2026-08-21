import type { Place, TripDay, TripItem, TravelInterest, TravelStyle } from '@/types'

interface PlanInput {
  destination: string
  origin: string
  startDate: string
  endDate: string
  days: number
  people: number
  budget: number
  styles: TravelStyle[]
  interests: TravelInterest[]
  places: Place[]
}

function haversine(a: Place, b: Place): number {
  const R = 6371
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function filterByInterests(places: Place[], interests: TravelInterest[]): Place[] {
  if (interests.length === 0) return places
  return places.filter((p) =>
    p.tags.some((t) => interests.includes(t as TravelInterest)),
  )
}

function clusterByProximity(places: Place[], maxDistanceKm: number): Place[][] {
  if (places.length === 0) return []

  const sorted = [...places].sort((a, b) => a.longitude - b.longitude)
  const clusters: Place[][] = []
  const used = new Set<number>()

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue
    const cluster: Place[] = [sorted[i]!]
    used.add(i)

    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue
      const closest = cluster.reduce((min, p) =>
        haversine(p, sorted[j]!) < haversine(min, sorted[j]!) ? p : min,
      )
      if (haversine(closest, sorted[j]!) <= maxDistanceKm) {
        cluster.push(sorted[j]!)
        used.add(j)
      }
    }

    clusters.push(cluster)
  }

  return clusters
}

function optimizeWithinCluster(cluster: Place[]): Place[] {
  if (cluster.length <= 2) return cluster

  const result: Place[] = [cluster[0]!]
  const remaining = cluster.slice(1)

  while (remaining.length > 0) {
    const last = result[result.length - 1]!
    let nearest = 0
    let minDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(last, remaining[i]!)
      if (d < minDist) {
        minDist = d
        nearest = i
      }
    }
    result.push(remaining[nearest]!)
    remaining.splice(nearest, 1)
  }

  return result
}

function distributeToDays(clusters: Place[][], totalDays: number): Place[][] {
  const days: Place[][] = Array.from({ length: totalDays }, () => [])

  const sortedClusters = [...clusters].sort((a, b) => b.length - a.length)

  for (const cluster of sortedClusters) {
    const optimized = optimizeWithinCluster(cluster)
    const dayIdx = days.reduce<number>((minIdx, _day, idx) =>
      days[idx]!.length < days[minIdx]!.length ? idx : minIdx,
    0)
    days[dayIdx]!.push(...optimized)
  }

  return days
}

function estimateBudget(days: number, people: number, styles: TravelStyle[]): {
  transport: number
  accommodation: number
  food: number
  tickets: number
  localTransport: number
  other: number
  total: number
} {
  const isLuxury = styles.includes('luxury')
  const isBudget = styles.includes('budget')

  const transport = Math.round(days * people * 80)
  const accommodation = Math.round(days * people * (isLuxury ? 300 : isBudget ? 60 : 150))
  const food = Math.round(days * people * (isLuxury ? 150 : isBudget ? 40 : 80))
  const tickets = Math.round(days * people * 50)
  const localTransport = Math.round(days * people * (isLuxury ? 50 : isBudget ? 15 : 30))
  const other = Math.round(days * people * 30)

  return {
    transport,
    accommodation,
    food,
    tickets,
    localTransport,
    other,
    total: transport + accommodation + food + tickets + localTransport + other,
  }
}

export function generateTripPlan(input: PlanInput): TripDay[] {
  let places = filterByInterests(input.places, input.interests)
  if (places.length === 0) places = input.places.slice(0, 5)

  const maxDist = input.days <= 3 ? 2 : input.days <= 5 ? 3 : 5
  const clusters = clusterByProximity(places, maxDist)
  const dayPlans = distributeToDays(clusters, input.days)

  const startDate = new Date(input.startDate)

  return dayPlans.map((dayPlaces, idx) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + idx)

    const items: TripItem[] = dayPlaces.map((place, pIdx) => {
      const hour = 9 + Math.floor(pIdx * 2.5)
      const timeStr = `${String(Math.min(hour, 20)).padStart(2, '0')}:00`
      return {
        id: `day${idx + 1}-item${pIdx}`,
        place,
        time: timeStr,
        stayDuration: place.stayDuration || 1.5,
      }
    })

    return {
      day: idx + 1,
      date: date.toISOString().split('T')[0] || '',
      items,
    }
  })
}

export function estimateTripBudget(days: number, people: number, styles: TravelStyle[]) {
  return estimateBudget(days, people, styles)
}
