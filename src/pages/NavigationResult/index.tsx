import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import MapView from '@/components/map/MapView'
import RouteOptionCard from '@/components/navigation/RouteOptionCard'
import RouteTimeline from '@/components/navigation/RouteTimeline'
import MetroMap from '@/components/navigation/MetroMap'
import { getRoutingProvider, resetRoutingProvider } from '@/services/routing'
import { getTransitProvider } from '@/services/transit'
import { DemoRoutingProvider } from '@/services/routing/DemoRoutingProvider'
import { isDemoMode } from '@/utils/dataMode'
import type { Route, TransportMode, TripItem } from '@/types'
import { klTransitNetwork } from '@/data/transit/kualaLumpur'
import './NavigationResult.css'

const modeIcons: Record<TransportMode, string> = {
  walking: '🚶',
  cycling: '🚲',
  driving: '🚗',
  transit: '🚇',
}

const modeLabels: Record<TransportMode, string> = {
  walking: '步行',
  cycling: '骑行',
  driving: '驾车',
  transit: '公交/地铁',
}

export default function NavigationResult() {
  const [searchParams] = useSearchParams()
  const [activeMode, setActiveMode] = useState<TransportMode>('transit')
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [addToTripDay, setAddToTripDay] = useState(1)
  const [addedToTrip, setAddedToTrip] = useState(false)
  const [mapTab, setMapTab] = useState<'map' | 'metro'>('map')

  const origin = useMemo(() => ({
    name: searchParams.get('oName') || '起点',
    latitude: parseFloat(searchParams.get('oLat') || '3.152'),
    longitude: parseFloat(searchParams.get('oLng') || '101.710'),
  }), [searchParams])

  const destination = useMemo(() => ({
    name: searchParams.get('dName') || '目的地',
    latitude: parseFloat(searchParams.get('dLat') || '3.1578'),
    longitude: parseFloat(searchParams.get('dLng') || '101.7116'),
  }), [searchParams])

  const tripDays = useMemo(() => {
    try {
      const stored = localStorage.getItem('wander-current-trip')
      if (stored) {
        const trip = JSON.parse(stored)
        return trip.days || 7
      }
    } catch { /* ignore */ }
    return 7
  }, [])

  const fetchRoutes = useCallback(async (useFallback: boolean) => {
    setLoading(true)
    setError(null)
    setSelectedIdx(0)
    try {
      if (activeMode === 'transit') {
        const transitProvider = getTransitProvider()
        const result = await transitProvider.getRoutes({
          origin: { latitude: origin.latitude, longitude: origin.longitude, name: origin.name },
          destination: { latitude: destination.latitude, longitude: destination.longitude, name: destination.name },
        })
        setRoutes(result)
        setUsedFallback(useFallback || isDemoMode())
      } else {
        let provider
        if (useFallback) {
          provider = new DemoRoutingProvider()
        } else {
          provider = getRoutingProvider()
        }
        const result = await provider.getRoutes({
          origin: { latitude: origin.latitude, longitude: origin.longitude },
          destination: { latitude: destination.latitude, longitude: destination.longitude },
          mode: activeMode,
        })
        setRoutes(result)
        setUsedFallback(useFallback)
      }
      setLoading(false)
    } catch {
      setLoading(false)
      if (!useFallback) {
        setError('路线服务暂时不可用。')
      } else {
        setError('演示数据加载失败。')
      }
    }
  }, [origin, destination, activeMode])

  useEffect(() => {
    fetchRoutes(false)
  }, [fetchRoutes])

  const handleModeChange = useCallback((mode: TransportMode) => {
    setActiveMode(mode)
    setSelectedIdx(0)
  }, [])

  const handleRetry = useCallback(() => {
    resetRoutingProvider()
    fetchRoutes(false)
  }, [fetchRoutes])

  const handleUseDemo = useCallback(() => {
    fetchRoutes(true)
  }, [fetchRoutes])

  const handleAddToTrip = useCallback(() => {
    const item: TripItem = {
      id: `nav-${Date.now()}`,
      place: {
        id: `nav-place-${Date.now()}`,
        name: destination.name,
        address: destination.name,
        latitude: destination.latitude,
        longitude: destination.longitude,
        type: 'other',
        tags: [],
      },
      time: '14:00',
      stayDuration: 1.5,
      note: '从导航添加',
    }

    try {
      const stored = localStorage.getItem('wander-trip-items')
      const items: (TripItem & { day: number })[] = stored ? JSON.parse(stored) : []
      items.push({ ...item, day: addToTripDay })
      localStorage.setItem('wander-trip-items', JSON.stringify(items))
      setAddedToTrip(true)
    } catch { /* ignore */ }
  }, [destination, addToTripDay])

  const selectedRoute = routes[selectedIdx]

  const markers = useMemo(() => [
    { latitude: origin.latitude, longitude: origin.longitude, label: origin.name, color: 'green' as const },
    { latitude: destination.latitude, longitude: destination.longitude, label: destination.name, color: 'red' as const },
  ], [origin, destination])

  const routeCoordinates = selectedRoute?.coordinates || []

  const highlightStationIds = useMemo(() => {
    if (!selectedRoute || selectedRoute.mode !== 'transit') return []
    const ids: string[] = []
    for (const step of selectedRoute.steps) {
      if (step.boardingStation) {
        const station = klTransitNetwork.stations.find(s => s.name === step.boardingStation)
        if (station) ids.push(station.id)
      }
      if (step.alightingStation) {
        const station = klTransitNetwork.stations.find(s => s.name === step.alightingStation)
        if (station) ids.push(station.id)
      }
    }
    return ids
  }, [selectedRoute])

  const activeLineIds = useMemo(() => {
    if (!selectedRoute || selectedRoute.mode !== 'transit') return []
    const ids: string[] = []
    for (const step of selectedRoute.steps) {
      if (step.lineId) ids.push(step.lineId)
    }
    return ids
  }, [selectedRoute])

  return (
    <div className="nav-result-page fade-in">
      <div className="nav-result-header-bar">
        <div className="nav-route-title">
          <span className="route-from">{origin.name}</span>
          <span className="route-arrow">→</span>
          <span className="route-to">{destination.name}</span>
        </div>

        <div className="nav-mode-tabs">
          {(Object.keys(modeIcons) as TransportMode[]).map(mode => (
            <button
              key={mode}
              className={`nav-mode-tab ${activeMode === mode ? 'active' : ''}`}
              onClick={() => handleModeChange(mode)}
            >
              <span className="mode-icon">{modeIcons[mode]}</span>
              <span className="mode-label">{modeLabels[mode]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="nav-result-body">
        <div className="nav-result-options">
          <div className="options-header">路线方案</div>
          {loading && (
            <div className="nav-result-status">
              <div className="loading-spinner" />
              <p>正在计算路线...</p>
            </div>
          )}

          {error && !loading && (
            <div className="nav-result-status">
              <p className="nav-result-error">{error}</p>
              <div className="nav-error-actions">
                <button className="nav-retry-btn" onClick={handleRetry}>重试</button>
                {!isDemoMode() && (
                  <button className="nav-demo-btn" onClick={handleUseDemo}>使用演示数据</button>
                )}
              </div>
            </div>
          )}

          {!loading && !error && routes.length > 0 && (
            <div className="route-options-list">
              {routes.map((route, i) => (
                <RouteOptionCard
                  key={route.id}
                  route={route}
                  isSelected={selectedIdx === i}
                  onClick={() => setSelectedIdx(i)}
                />
              ))}
            </div>
          )}

          {!loading && !error && routes.length === 0 && (
            <div className="nav-result-status">
              <p>未找到可用路线。</p>
            </div>
          )}
        </div>

        <div className="nav-result-timeline">
          {selectedRoute && (
            <RouteTimeline
              route={selectedRoute}
              originName={origin.name}
              destinationName={destination.name}
            />
          )}

          <div className="nav-add-to-trip">
            {addedToTrip ? (
              <p className="nav-added-msg">已加入行程</p>
            ) : (
              <>
                <p className="nav-add-label">加入旅行计划？</p>
                <div className="nav-add-row">
                  <select
                    className="nav-day-select"
                    value={addToTripDay}
                    onChange={(e) => setAddToTripDay(Number(e.target.value))}
                  >
                    {Array.from({ length: tripDays }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                    ))}
                  </select>
                  <button className="nav-add-btn" onClick={handleAddToTrip}>
                    + 加入我的行程
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="nav-result-map-panel">
          <div className="map-tab-bar">
            <button
              className={`map-tab ${mapTab === 'map' ? 'active' : ''}`}
              onClick={() => setMapTab('map')}
            >
              🗺️ 地图
            </button>
            <button
              className={`map-tab ${mapTab === 'metro' ? 'active' : ''}`}
              onClick={() => setMapTab('metro')}
            >
              🚇 地铁图
            </button>
          </div>

          <div className="map-content">
            {mapTab === 'map' ? (
              <MapView
                center={[origin.latitude, origin.longitude]}
                zoom={13}
                markers={markers}
                routeCoordinates={routeCoordinates}
              />
            ) : (
              <MetroMap
                activeLineIds={activeLineIds}
                highlightStationIds={highlightStationIds}
              />
            )}
          </div>
        </div>
      </div>

      {usedFallback && (
        <div className="nav-demo-badge">
          当前使用演示数据，不代表真实路线
        </div>
      )}
    </div>
  )
}
