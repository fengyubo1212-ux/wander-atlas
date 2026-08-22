import type { Route, RouteStep } from '@/types'
import type { TransitProvider, TransitRouteRequest } from './TransitProvider'
import type { TransitNetwork, TransitStation } from '@/types/transit'
import { klTransitNetwork } from '@/data/transit/kualaLumpur'

interface GraphNode {
  id: string
  stationId: string
  lineId: string | null
}

interface GraphEdge {
  from: string
  to: string
  weight: number
  type: 'ride' | 'transfer' | 'walk'
  lineId?: string
  fromStationId?: string
  toStationId?: string
}

interface DijkstraResult {
  cost: number
  path: string[]
  edges: GraphEdge[]
}

const WALK_SPEED = 1.4
const TRANSFER_PENALTY_DEFAULT = 180
const TRANSFER_PENALTY_HIGH = 600
const WALK_PENALTY_LOW = 0.5
const WALK_PENALTY_HIGH = 3.0

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function findNearestStation(
  lat: number,
  lng: number,
  stations: TransitStation[],
  maxDistance = 2000,
): TransitStation | null {
  let nearest: TransitStation | null = null
  let minDist = maxDistance
  for (const s of stations) {
    const d = haversineDistance(lat, lng, s.latitude, s.longitude)
    if (d < minDist) {
      minDist = d
      nearest = s
    }
  }
  return nearest
}

function buildGraph(
  network: TransitNetwork,
): { nodes: Map<string, GraphNode>; edges: GraphEdge[] } {
  const nodes = new Map<string, GraphNode>()
  const edges: GraphEdge[] = []

  for (const line of network.lines) {
    const stationIds = line.stationIds
    for (let i = 0; i < stationIds.length; i++) {
      const sid = stationIds[i]
      if (!sid) continue
      const nodeId = `${line.id}:${sid}`
      nodes.set(nodeId, { id: nodeId, stationId: sid, lineId: line.id })

      if (i > 0) {
        const prevSid = stationIds[i - 1]
        if (!prevSid) continue
        const prevStation = network.stations.find(s => s.id === prevSid)
        const currStation = network.stations.find(s => s.id === sid)
        if (prevStation && currStation) {
          const dist = haversineDistance(
            prevStation.latitude, prevStation.longitude,
            currStation.latitude, currStation.longitude,
          )
          const duration = Math.round(dist / 20)
          edges.push({
            from: `${line.id}:${prevSid}`,
            to: nodeId,
            weight: duration,
            type: 'ride',
            lineId: line.id,
            fromStationId: prevSid,
            toStationId: sid,
          })
          edges.push({
            from: nodeId,
            to: `${line.id}:${prevSid}`,
            weight: duration,
            type: 'ride',
            lineId: line.id,
            fromStationId: sid,
            toStationId: prevSid,
          })
        }
      }
    }
  }

  for (const t of network.transfers) {
    const fromNode = `${t.fromLineId}:${t.fromStationId}`
    const toNode = `${t.toLineId}:${t.toStationId}`
    if (nodes.has(fromNode) && nodes.has(toNode)) {
      edges.push({
        from: fromNode,
        to: toNode,
        weight: t.duration,
        type: 'transfer',
      })
      edges.push({
        from: toNode,
        to: fromNode,
        weight: t.duration,
        type: 'transfer',
      })
    }
  }

  return { nodes, edges }
}

function dijkstra(
  graph: { nodes: Map<string, GraphNode>; edges: GraphEdge[] },
  startIds: string[],
  endIds: string[],
  strategy: 'fastest' | 'fewest_transfers' | 'least_walking',
): DijkstraResult | null {
  const transferPenalty = strategy === 'fewest_transfers' ? TRANSFER_PENALTY_HIGH : TRANSFER_PENALTY_DEFAULT
  const walkPenalty = strategy === 'least_walking' ? WALK_PENALTY_HIGH : WALK_PENALTY_LOW

  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const prevEdge = new Map<string, GraphEdge | null>()
  const visited = new Set<string>()

  for (const nodeId of graph.nodes.keys()) {
    dist.set(nodeId, Infinity)
    prev.set(nodeId, null)
    prevEdge.set(nodeId, null)
  }

  for (const sid of startIds) {
    dist.set(sid, 0)
  }

  const queue: string[] = [...graph.nodes.keys()]

  while (queue.length > 0) {
    queue.sort((a, b) => (dist.get(a) ?? Infinity) - (dist.get(b) ?? Infinity))
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)

    const currentDist = dist.get(current) ?? Infinity
    if (currentDist === Infinity) break

    for (const edge of graph.edges) {
      if (edge.from !== current) continue
      const neighbor = edge.to
      if (!graph.nodes.has(neighbor)) continue

      let weight = edge.weight
      if (edge.type === 'transfer') weight += transferPenalty
      if (edge.type === 'walk') weight *= walkPenalty

      const newDist = currentDist + weight
      if (newDist < (dist.get(neighbor) ?? Infinity)) {
        dist.set(neighbor, newDist)
        prev.set(neighbor, current)
        prevEdge.set(neighbor, edge)
      }
    }
  }

  let bestEnd: string | null = null
  let bestCost = Infinity
  for (const eid of endIds) {
    const d = dist.get(eid) ?? Infinity
    if (d < bestCost) {
      bestCost = d
      bestEnd = eid
    }
  }

  if (bestEnd === null || bestCost === Infinity) return null

  const path: string[] = []
  const pathEdges: GraphEdge[] = []
  let current: string | null = bestEnd
  while (current !== null) {
    path.unshift(current)
    const edge = prevEdge.get(current)
    if (edge) pathEdges.unshift(edge)
    current = prev.get(current) ?? null
  }

  return { cost: bestCost, path, edges: pathEdges }
}

function buildRouteFromResult(
  result: DijkstraResult,
  network: TransitNetwork,
  origin: { latitude: number; longitude: number; name?: string },
  destination: { latitude: number; longitude: number; name?: string },
  strategy: 'fastest' | 'fewest_transfers' | 'least_walking',
  originStation: TransitStation,
  destStation: TransitStation,
): Route {
  const steps: RouteStep[] = []
  const polyline: [number, number][] = []

  const walkToOriginDist = haversineDistance(
    origin.latitude, origin.longitude,
    originStation.latitude, originStation.longitude,
  )
  const walkToOriginDuration = Math.round(walkToOriginDist / WALK_SPEED)
  steps.push({
    instruction: `步行至 ${originStation.name}`,
    distance: Math.round(walkToOriginDist),
    duration: walkToOriginDuration,
    mode: 'walking',
  })
  polyline.push([origin.latitude, origin.longitude])
  polyline.push([originStation.latitude, originStation.longitude])

  let currentLine: string | null = null
  let rideSteps: { from: string; to: string; lineId: string; stations: string[] }[] = []

  for (const edge of result.edges) {
    if (edge.type === 'ride') {
      if (currentLine !== edge.lineId) {
        if (rideSteps.length > 0 && currentLine) {
          const first = rideSteps[0]
          const last = rideSteps[rideSteps.length - 1]
          const line = network.lines.find(l => l.id === currentLine)
          const fromStation = network.stations.find(s => s.id === first?.from)
          const toStation = network.stations.find(s => s.id === last?.to)
          const stationNames = rideSteps.map(s => {
            const st = network.stations.find(ss => ss.id === s.to)
            return st?.name ?? s.to
          })
          const rideDist = rideSteps.reduce((sum, s) => {
            const from = network.stations.find(ss => ss.id === s.from)
            const to = network.stations.find(ss => ss.id === s.to)
            if (from && to) return sum + haversineDistance(from.latitude, from.longitude, to.latitude, to.longitude)
            return sum
          }, 0)
          steps.push({
            instruction: `乘坐 ${line?.shortName ?? currentLine}`,
            distance: Math.round(rideDist),
            duration: rideSteps.length * 120,
            mode: 'transit',
            lineId: currentLine,
            lineName: line?.name,
            lineColor: line?.color,
            direction: toStation?.name,
            boardingStation: fromStation?.name,
            alightingStation: toStation?.name,
            stopCount: rideSteps.length,
            stations: stationNames,
          })
          if (fromStation) polyline.push([fromStation.latitude, fromStation.longitude])
          if (toStation) polyline.push([toStation.latitude, toStation.longitude])
        }
        currentLine = edge.lineId ?? null
        rideSteps = []
      }
      if (edge.lineId) {
        rideSteps.push({
          from: edge.fromStationId ?? '',
          to: edge.toStationId ?? '',
          lineId: edge.lineId,
          stations: [],
        })
      }
    } else if (edge.type === 'transfer') {
      if (rideSteps.length > 0 && currentLine) {
        const first = rideSteps[0]
        const last = rideSteps[rideSteps.length - 1]
        const line = network.lines.find(l => l.id === currentLine)
        const fromStation = network.stations.find(s => s.id === first?.from)
        const toStation = network.stations.find(s => s.id === last?.to)
        const stationNames = rideSteps.map(s => {
          const st = network.stations.find(ss => ss.id === s.to)
          return st?.name ?? s.to
        })
        const rideDist = rideSteps.reduce((sum, s) => {
          const from = network.stations.find(ss => ss.id === s.from)
          const to = network.stations.find(ss => ss.id === s.to)
          if (from && to) return sum + haversineDistance(from.latitude, from.longitude, to.latitude, to.longitude)
          return sum
        }, 0)
        steps.push({
          instruction: `乘坐 ${line?.shortName ?? currentLine}`,
          distance: Math.round(rideDist),
          duration: rideSteps.length * 120,
          mode: 'transit',
          lineId: currentLine,
          lineName: line?.name,
          lineColor: line?.color,
          direction: toStation?.name,
          boardingStation: fromStation?.name,
          alightingStation: toStation?.name,
          stopCount: rideSteps.length,
          stations: stationNames,
        })
        if (fromStation) polyline.push([fromStation.latitude, fromStation.longitude])
        if (toStation) polyline.push([toStation.latitude, toStation.longitude])
      }

      steps.push({
        instruction: '换乘',
        distance: 0,
        duration: edge.weight,
        mode: 'walking',
      })
      currentLine = null
      rideSteps = []
    }
  }

  if (rideSteps.length > 0 && currentLine) {
    const first = rideSteps[0]
    const last = rideSteps[rideSteps.length - 1]
    const line = network.lines.find(l => l.id === currentLine)
    const fromStation = network.stations.find(s => s.id === first?.from)
    const toStation = network.stations.find(s => s.id === last?.to)
    const stationNames = rideSteps.map(s => {
      const st = network.stations.find(ss => ss.id === s.to)
      return st?.name ?? s.to
    })
    const rideDist = rideSteps.reduce((sum, s) => {
      const from = network.stations.find(ss => ss.id === s.from)
      const to = network.stations.find(ss => ss.id === s.to)
      if (from && to) return sum + haversineDistance(from.latitude, from.longitude, to.latitude, to.longitude)
      return sum
    }, 0)
    steps.push({
      instruction: `乘坐 ${line?.shortName ?? currentLine}`,
      distance: Math.round(rideDist),
      duration: rideSteps.length * 120,
      mode: 'transit',
      lineId: currentLine,
      lineName: line?.name,
      lineColor: line?.color,
      direction: toStation?.name,
      boardingStation: fromStation?.name,
      alightingStation: toStation?.name,
      stopCount: rideSteps.length,
      stations: stationNames,
    })
    if (fromStation) polyline.push([fromStation.latitude, fromStation.longitude])
    if (toStation) polyline.push([toStation.latitude, toStation.longitude])
  }

  const walkToDestDist = haversineDistance(
    destStation.latitude, destStation.longitude,
    destination.latitude, destination.longitude,
  )
  const walkToDestDuration = Math.round(walkToDestDist / WALK_SPEED)
  steps.push({
    instruction: `步行至 ${destination.name ?? '目的地'}`,
    distance: Math.round(walkToDestDist),
    duration: walkToDestDuration,
    mode: 'walking',
  })
  polyline.push([destStation.latitude, destStation.longitude])
  polyline.push([destination.latitude, destination.longitude])

  const totalDistance = steps.reduce((sum, s) => sum + s.distance, 0)
  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0)
  const walkDuration = steps.filter(s => s.mode === 'walking').reduce((sum, s) => sum + s.duration, 0)
  const transferCount = steps.filter(s => s.instruction === '换乘').length

  const strategyLabels: Record<string, string> = {
    fastest: '最快到达',
    fewest_transfers: '最少换乘',
    least_walking: '最少步行',
  }

  const transitSteps = steps.filter(s => s.mode === 'transit')
  const lineSummary = transitSteps.map(s => s.lineName ?? s.lineId).join(' → ')

  return {
    id: `transit-${strategy}-${Date.now()}`,
    mode: 'transit',
    distance: totalDistance,
    duration: totalDuration,
    steps,
    coordinates: polyline,
    summary: strategyLabels[strategy],
    strategy,
    walkDuration,
    transferCount,
    fare: null,
    lineSummary,
  }
}

export class DemoTransitProvider implements TransitProvider {
  private network: TransitNetwork

  constructor(network: TransitNetwork = klTransitNetwork) {
    this.network = network
  }

  async getRoutes(request: TransitRouteRequest): Promise<Route[]> {
    await new Promise(r => setTimeout(r, 300))

    const originStation = findNearestStation(
      request.origin.latitude, request.origin.longitude,
      this.network.stations,
    )
    const destStation = findNearestStation(
      request.destination.latitude, request.destination.longitude,
      this.network.stations,
    )

    if (!originStation || !destStation) return []

    const graph = buildGraph(this.network)

    const originNodeIds = this.network.lines
      .filter(l => l.stationIds.includes(originStation.id))
      .map(l => `${l.id}:${originStation.id}`)

    const destNodeIds = this.network.lines
      .filter(l => l.stationIds.includes(destStation.id))
      .map(l => `${l.id}:${destStation.id}`)

    if (originNodeIds.length === 0 || destNodeIds.length === 0) return []

    const strategies: Array<'fastest' | 'fewest_transfers' | 'least_walking'> = [
      'fastest', 'fewest_transfers', 'least_walking',
    ]

    const routes: Route[] = []
    for (const strategy of strategies) {
      const result = dijkstra(graph, originNodeIds, destNodeIds, strategy)
      if (result) {
        routes.push(
          buildRouteFromResult(result, this.network, request.origin, request.destination, strategy, originStation, destStation),
        )
      }
    }

    return routes
  }

  isAvailable(): boolean {
    return true
  }
}
