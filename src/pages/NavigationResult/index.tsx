import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import MapView from '@/components/map/MapView'
import RouteOptionCard from '@/components/navigation/RouteOptionCard'
import RouteTimeline from '@/components/navigation/RouteTimeline'
import MetroMap from '@/components/navigation/MetroMap'
import { getRoutingProvider, resetRoutingProvider } from '@/services/routing'
import { getTransitProvider } from '@/services/transit'
import { DemoRoutingProvider } from '@/services/routing/DemoRoutingProvider'
import { isDemoMode } from '@/utils/dataMode'
import { MapPinIcon, NavigationIcon, ArrowUpDownIcon } from '@/components/common/Icons'
import type { Route, TransportMode, TripItem } from '@/types'
import { klTransitNetwork } from '@/data/transit/kualaLumpur'
import './NavigationResult.css'

const modeConfig: Array<{ mode: TransportMode; label: string; icon: React.ReactNode }> = [
  { mode: 'transit', label: '公交/地铁', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="8" cy="20" r="1"/><circle cx="16" cy="20" r="1"/></svg> },
  { mode: 'driving', label: '驾车', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg> },
  { mode: 'walking', label: '步行', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="2"/><path d="M10 22V18L7 15l3-5 4 2 2-2"/><path d="M15 11l2 4-3 1"/></svg> },
  { mode: 'cycling', label: '骑行', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M12 18V6l-4 8"/><path d="M12 18l4-8h3"/></svg> },
]

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
  const [mobileTab, setMobileTab] = useState<'routes' | 'map'>('routes')

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
    <div className="nav-result-page">
      {/* Navigation Input Bar */}
      <div className="nr-nav-input">
        <Link to="/navigation" className="nr-nav-edit" title="修改起终点">
          <NavigationIcon size={16} color="#fff" />
        </Link>
        <div className="nr-nav-points">
          <div className="nr-nav-point">
            <span className="nr-dot nr-dot-origin" />
            <span className="nr-nav-name">{origin.name}</span>
          </div>
          <div className="nr-nav-swap">
            <ArrowUpDownIcon size={14} color="#999" />
          </div>
          <div className="nr-nav-point">
            <span className="nr-dot nr-dot-dest" />
            <span className="nr-nav-name">{destination.name}</span>
          </div>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="nr-mode-bar">
        {modeConfig.map(({ mode, label, icon }) => (
          <button
            key={mode}
            className={`nr-mode-btn ${activeMode === mode ? 'active' : ''}`}
            onClick={() => handleModeChange(mode)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Tab Switcher */}
      <div className="nr-mobile-tabs">
        <button
          className={`nr-mobile-tab ${mobileTab === 'routes' ? 'active' : ''}`}
          onClick={() => setMobileTab('routes')}
        >
          路线
        </button>
        <button
          className={`nr-mobile-tab ${mobileTab === 'map' ? 'active' : ''}`}
          onClick={() => setMobileTab('map')}
        >
          地图
        </button>
      </div>

      {/* Main Content */}
      <div className="nr-body">
        {/* Left: Route Options */}
        <div className={`nr-options ${mobileTab === 'routes' ? 'mobile-visible' : ''}`}>
          <div className="nr-options-header">
            <span>路线方案</span>
            {!loading && routes.length > 0 && (
              <span className="nr-options-count">{routes.length} 个方案</span>
            )}
          </div>

          {loading && (
            <div className="nr-status">
              <div className="loading-spinner" />
              <p>正在计算路线...</p>
            </div>
          )}

          {error && !loading && (
            <div className="nr-status">
              <p className="nr-error">{error}</p>
              <div className="nr-error-actions">
                <button className="nr-btn nr-btn-primary" onClick={handleRetry}>重试</button>
                {!isDemoMode() && (
                  <button className="nr-btn nr-btn-secondary" onClick={handleUseDemo}>使用演示数据</button>
                )}
              </div>
            </div>
          )}

          {!loading && !error && routes.length > 0 && (
            <div className="nr-options-list">
              {routes.map((route, i) => (
                <RouteOptionCard
                  key={route.id}
                  route={route}
                  isSelected={selectedIdx === i}
                  onClick={() => {
                    setSelectedIdx(i)
                    setMobileTab('routes')
                  }}
                />
              ))}
            </div>
          )}

          {!loading && !error && routes.length === 0 && (
            <div className="nr-status">
              <p>未找到可用路线。</p>
            </div>
          )}
        </div>

        {/* Center: Timeline */}
        <div className={`nr-timeline ${mobileTab === 'routes' ? 'mobile-visible' : ''}`}>
          {selectedRoute && (
            <RouteTimeline
              route={selectedRoute}
              originName={origin.name}
              destinationName={destination.name}
            />
          )}

          <div className="nr-add-trip">
            {addedToTrip ? (
              <p className="nr-added-msg">已加入行程</p>
            ) : (
              <>
                <p className="nr-add-label">加入旅行计划？</p>
                <div className="nr-add-row">
                  <select
                    className="nr-day-select"
                    value={addToTripDay}
                    onChange={(e) => setAddToTripDay(Number(e.target.value))}
                  >
                    {Array.from({ length: tripDays }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                    ))}
                  </select>
                  <button className="nr-btn nr-btn-primary nr-add-btn" onClick={handleAddToTrip}>
                    + 加入我的行程
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Map / Metro */}
        <div className={`nr-map-panel ${mobileTab === 'map' ? 'mobile-visible' : ''}`}>
          <div className="nr-map-tabs">
            <button
              className={`nr-map-tab ${mapTab === 'map' ? 'active' : ''}`}
              onClick={() => setMapTab('map')}
            >
              <MapPinIcon size={14} />
              地图
            </button>
            <button
              className={`nr-map-tab ${mapTab === 'metro' ? 'active' : ''}`}
              onClick={() => setMapTab('metro')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="8" cy="20" r="1"/><circle cx="16" cy="20" r="1"/></svg>
              地铁图
            </button>
          </div>

          <div className="nr-map-content">
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
        <div className="nr-demo-badge">
          演示数据 · 票价仅供界面展示
        </div>
      )}
    </div>
  )
}
