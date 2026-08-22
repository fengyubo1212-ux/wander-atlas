import { useState, useRef, useCallback, useMemo } from 'react'
import type { TransitNetwork, TransitStation } from '@/types/transit'
import { klTransitNetwork } from '@/data/transit/kualaLumpur'
import './MetroMap.css'

interface MetroMapInnerProps {
  network: TransitNetwork
  activeLineIds: string[]
  highlightStationIds: string[]
  onStationClick?: (station: TransitStation) => void
}

interface MetroMapProps {
  network?: TransitNetwork
  activeLineIds?: string[]
  highlightStationIds?: string[]
  onStationClick?: (station: TransitStation) => void
}

const SVG_WIDTH = 800
const SVG_HEIGHT = 600

function computeLayout(network: TransitNetwork): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()

  const latitudes = network.stations.map(s => s.latitude)
  const longitudes = network.stations.map(s => s.longitude)
  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLng = Math.min(...longitudes)
  const maxLng = Math.max(...longitudes)

  const padding = 60
  const w = SVG_WIDTH - padding * 2
  const h = SVG_HEIGHT - padding * 2

  for (const station of network.stations) {
    const x = padding + ((station.longitude - minLng) / (maxLng - minLng || 1)) * w
    const y = padding + ((maxLat - station.latitude) / (maxLat - minLat || 1)) * h
    positions.set(station.id, { x, y })
  }

  return positions
}

function MetroMapInner({
  network,
  activeLineIds,
  highlightStationIds,
  onStationClick,
}: MetroMapInnerProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [selectedStation, setSelectedStation] = useState<TransitStation | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const stationPositions = useMemo(() => computeLayout(network), [network])

  const linePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }[]>()
    for (const line of network.lines) {
      const points: { x: number; y: number }[] = []
      for (const sid of line.stationIds) {
        const pos = stationPositions.get(sid)
        if (pos) points.push(pos)
      }
      map.set(line.id, points)
    }
    return map
  }, [network, stationPositions])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsPanning(true)
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }, [isPanning, panStart])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(z => Math.max(0.5, Math.min(3, z + delta)))
  }, [])

  const handleStationClick = useCallback((station: TransitStation) => {
    setSelectedStation(station)
    onStationClick?.(station)
  }, [onStationClick])

  const fitView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const isLineActive = (lineId: string) =>
    activeLineIds.length === 0 || activeLineIds.includes(lineId)

  const isStationHighlighted = (stationId: string) =>
    highlightStationIds.includes(stationId)

  const isStationInterchange = (station: TransitStation) =>
    station.lineIds.length > 1

  return (
    <div className="metro-map-container">
      <div className="metro-map-controls">
        <button className="metro-control-btn" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>+</button>
        <button className="metro-control-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}>−</button>
        <button className="metro-control-btn" onClick={fitView}>⊞</button>
      </div>

      <svg
        ref={svgRef}
        className="metro-map-svg"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {network.lines.map(line => {
            const points = linePositions.get(line.id) ?? []
            if (points.length < 2) return null

            const pathData = points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
              .join(' ')

            return (
              <g key={line.id} opacity={isLineActive(line.id) ? 1 : 0.2}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )
          })}

          {network.stations.map(station => {
            const pos = stationPositions.get(station.id)
            if (!pos) return null

            const highlighted = isStationHighlighted(station.id)
            const interchange = isStationInterchange(station)
            const active = station.lineIds.some(lid => isLineActive(lid))

            return (
              <g
                key={station.id}
                transform={`translate(${pos.x},${pos.y})`}
                onClick={() => handleStationClick(station)}
                style={{ cursor: 'pointer' }}
                opacity={active ? 1 : 0.25}
              >
                {interchange ? (
                  <>
                    <circle
                      r={highlighted ? 9 : 7}
                      fill="#fff"
                      stroke={highlighted ? '#f59e0b' : '#333'}
                      strokeWidth={highlighted ? 3 : 2}
                    />
                    <circle
                      r={highlighted ? 4 : 3}
                      fill={highlighted ? '#f59e0b' : '#333'}
                    />
                  </>
                ) : (
                  <circle
                    r={highlighted ? 8 : 6}
                    fill={highlighted ? '#f59e0b' : '#fff'}
                    stroke={highlighted ? '#f59e0b' : (() => {
                      const firstLine = network.lines.find(l => l.id === station.lineIds[0])
                      return firstLine?.color ?? '#666'
                    })()}
                    strokeWidth={highlighted ? 3 : 2}
                  />
                )}

                <text
                  x={10}
                  y={4}
                  fontSize={11}
                  fontWeight={highlighted ? 700 : 500}
                  fill={highlighted ? '#f59e0b' : '#333'}
                >
                  {station.name}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {selectedStation && (
        <div className="station-tooltip">
          <div className="tooltip-name">{selectedStation.name}</div>
          {selectedStation.nameEn && selectedStation.nameEn !== selectedStation.name && (
            <div className="tooltip-name-en">{selectedStation.nameEn}</div>
          )}
          <div className="tooltip-lines">
            {selectedStation.lineIds.map(lid => {
              const line = network.lines.find(l => l.id === lid)
              return line ? (
                <span
                  key={lid}
                  className="tooltip-line-badge"
                  style={{ backgroundColor: line.color }}
                >
                  {line.shortName}
                </span>
              ) : null
            })}
          </div>
          {isStationInterchange(selectedStation) && (
            <div className="tooltip-interchange">换乘站</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MetroMap(props: MetroMapProps) {
  return (
    <MetroMapInner
      network={props.network ?? klTransitNetwork}
      activeLineIds={props.activeLineIds ?? []}
      highlightStationIds={props.highlightStationIds ?? []}
      onStationClick={props.onStationClick}
    />
  )
}

export { computeLayout }
