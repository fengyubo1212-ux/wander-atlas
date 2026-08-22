import { useState, useRef, useCallback, useMemo } from 'react'
import type { TransitNetwork, TransitStation } from '@/types/transit'
import { klTransitNetwork } from '@/data/transit/kualaLumpur'
import { SearchIcon, PlusIcon, MinusIcon, MaximizeIcon } from '@/components/common/Icons'
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

const SVG_W = 700
const SVG_H = 520

// Topological positions for KL Metro map
const topoPositions: Record<string, { x: number; y: number }> = {
  // KJ Line (diagonal NW → SE)
  'kj-gombak': { x: 80, y: 60 },
  'kj-wangsa-maju': { x: 140, y: 120 },
  'kj-klcc': { x: 200, y: 180 },
  'pasar-seni': { x: 310, y: 290 },
  'masjid-jamek': { x: 350, y: 330 },
  'hang-tuah': { x: 420, y: 400 },
  'titiwangsa': { x: 460, y: 340 },
  'kl-sentral': { x: 500, y: 400 },

  // SBK Line (vertical W)
  'sbk-kwasa-damai': { x: 340, y: 60 },
  'sbk-sri-petaling': { x: 340, y: 120 },
  'sbk-kinrara': { x: 340, y: 180 },
  'sbk-taman-midah': { x: 340, y: 240 },
  'sbk-taman-connaught': { x: 340, y: 300 },
  'sbk-kajang': { x: 340, y: 400 },

  // Monorail (short vertical center)
  'ml-medan-tuanku': { x: 460, y: 240 },
  'ml-bukit-nanas': { x: 460, y: 280 },
  'ml-raja-chulan': { x: 500, y: 280 },

  // MRT Line (vertical E)
  'mrt-bukit-kiara': { x: 580, y: 60 },
  'mrt-taman-duta': { x: 580, y: 120 },
  'mrt-kerinchi': { x: 580, y: 180 },
  'mrt-sri-raya': { x: 580, y: 290 },
  'mrt-bukit-teruntum': { x: 580, y: 330 },
  'mrt-balakong': { x: 580, y: 400 },
}

function getPos(id: string, network: TransitNetwork): { x: number; y: number } {
  if (topoPositions[id]) return topoPositions[id]
  const s = network.stations.find(st => st.id === id)
  if (s) return { x: 350, y: 260 }
  return { x: 350, y: 260 }
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
  const [filterLine, setFilterLine] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)

  const isLineActive = (lineId: string) => {
    if (filterLine) return filterLine === lineId
    if (activeLineIds.length > 0) return activeLineIds.includes(lineId)
    return true
  }

  const isStationHighlighted = (stationId: string) =>
    highlightStationIds.includes(stationId)

  const isStationInterchange = (station: TransitStation) =>
    station.lineIds.length > 1

  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return network.stations
    const q = searchQuery.toLowerCase()
    return network.stations.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.nameEn && s.nameEn.toLowerCase().includes(q))
    )
  }, [network, searchQuery])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsPanning(true)
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }, [isPanning, panStart])

  const handleMouseUp = useCallback(() => setIsPanning(false), [])

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

  return (
    <div className="metro-map-container">
      {/* Top bar: search + line filter */}
      <div className="metro-top-bar">
        <div className="metro-search">
          <SearchIcon size={14} color="#999" />
          <input
            type="text"
            placeholder="搜索站点..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="metro-search-input"
          />
        </div>
        <div className="metro-line-filter">
          <button
            className={`metro-filter-btn ${filterLine === null ? 'active' : ''}`}
            onClick={() => setFilterLine(null)}
          >
            全部
          </button>
          {network.lines.map(line => (
            <button
              key={line.id}
              className={`metro-filter-btn ${filterLine === line.id ? 'active' : ''}`}
              onClick={() => setFilterLine(filterLine === line.id ? null : line.id)}
              style={filterLine === line.id ? { borderColor: line.color, color: line.color } : undefined}
            >
              <span className="filter-dot" style={{ backgroundColor: line.color }} />
              {line.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Map */}
      <div className="metro-svg-wrapper">
        <div className="metro-controls">
          <button className="metro-ctrl" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>
            <PlusIcon size={14} />
          </button>
          <button className="metro-ctrl" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}>
            <MinusIcon size={14} />
          </button>
          <button className="metro-ctrl" onClick={fitView}>
            <MaximizeIcon size={14} />
          </button>
        </div>

        <svg
          ref={svgRef}
          className="metro-svg"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        >
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* Lines */}
            {network.lines.map(line => {
              const points = line.stationIds.map(sid => getPos(sid, network))
              if (points.length < 2) return null
              const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
              return (
                <g key={line.id} opacity={isLineActive(line.id) ? 1 : 0.12}>
                  <path
                    d={d}
                    fill="none"
                    stroke={line.color}
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )
            })}

            {/* Stations */}
            {network.stations.map(station => {
              const pos = topoPositions[station.id]
              if (!pos) return null
              const highlighted = isStationHighlighted(station.id)
              const interchange = isStationInterchange(station)
              const active = station.lineIds.some(lid => isLineActive(lid))
              const isSearchResult = searchQuery.trim() && filteredStations.includes(station)

              return (
                <g
                  key={station.id}
                  transform={`translate(${pos.x},${pos.y})`}
                  onClick={() => handleStationClick(station)}
                  style={{ cursor: 'pointer' }}
                  opacity={active ? 1 : 0.15}
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
                      r={highlighted || isSearchResult ? 7 : 5}
                      fill={highlighted ? '#f59e0b' : isSearchResult ? '#3b82f6' : '#fff'}
                      stroke={highlighted ? '#f59e0b' : isSearchResult ? '#3b82f6' : (network.lines.find(l => l.id === station.lineIds[0])?.color ?? '#666')}
                      strokeWidth={highlighted || isSearchResult ? 2.5 : 1.5}
                    />
                  )}

                  {(highlighted || isSearchResult) && (
                    <circle
                      r={12}
                      fill="none"
                      stroke={highlighted ? '#f59e0b' : '#3b82f6'}
                      strokeWidth={1.5}
                      opacity={0.4}
                    >
                      <animate
                        attributeName="r"
                        from="8"
                        to="16"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.4"
                        to="0"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  <text
                    x={10}
                    y={4}
                    fontSize={10}
                    fontWeight={highlighted ? 700 : 400}
                    fill={highlighted ? '#f59e0b' : '#333'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {station.name}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        {/* Legend */}
        <div className="metro-legend">
          {network.lines.map(line => (
            <div
              key={line.id}
              className={`legend-item ${filterLine && filterLine !== line.id ? 'legend-dim' : ''}`}
              onClick={() => setFilterLine(filterLine === line.id ? null : line.id)}
            >
              <span className="legend-color" style={{ backgroundColor: line.color }} />
              <span className="legend-name">{line.shortName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Station tooltip */}
      {selectedStation && (
        <div className="metro-tooltip">
          <button className="tooltip-close" onClick={() => setSelectedStation(null)}>×</button>
          <div className="tooltip-name">{selectedStation.name}</div>
          {selectedStation.nameEn && selectedStation.nameEn !== selectedStation.name && (
            <div className="tooltip-en">{selectedStation.nameEn}</div>
          )}
          <div className="tooltip-lines">
            {selectedStation.lineIds.map(lid => {
              const line = network.lines.find(l => l.id === lid)
              return line ? (
                <span key={lid} className="tooltip-badge" style={{ backgroundColor: line.color }}>
                  {line.shortName}
                </span>
              ) : null
            })}
          </div>
          {isStationInterchange(selectedStation) && (
            <div className="tooltip-transfer">换乘站</div>
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
