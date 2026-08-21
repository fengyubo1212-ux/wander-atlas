import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import MapView from '@/components/map/MapView'
import { getRoutingProvider, resetRoutingProvider } from '@/services/routing'
import { DemoRoutingProvider } from '@/services/routing/DemoRoutingProvider'
import { isDemoMode } from '@/utils/dataMode'
import type { Route, TransportMode } from '@/types'
import { formatDistance, formatDuration } from '@/utils/format'
import './NavigationResult.css'

const modeIcons: Record<TransportMode, string> = {
  walking: '🚶',
  cycling: '🚲',
  driving: '🚗',
  transit: '🚌',
}

const modeLabels: Record<TransportMode, string> = {
  walking: '步行',
  cycling: '骑行',
  driving: '驾车',
  transit: '公交',
}

export default function NavigationResult() {
  const [searchParams] = useSearchParams()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)

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

  const fetchRoutes = useCallback(async (useFallback: boolean) => {
    setLoading(true)
    setError(null)
    try {
      let provider
      if (useFallback) {
        provider = new DemoRoutingProvider()
      } else {
        provider = getRoutingProvider()
      }
      const result = await provider.getRoutes({
        origin: { latitude: origin.latitude, longitude: origin.longitude },
        destination: { latitude: destination.latitude, longitude: destination.longitude },
        mode: 'driving',
      })
      setRoutes(result)
      setUsedFallback(useFallback)
      setLoading(false)
    } catch {
      setLoading(false)
      if (!useFallback) {
        setError('路线服务暂时不可用。')
      } else {
        setError('演示数据加载失败。')
      }
    }
  }, [origin, destination])

  useEffect(() => {
    let cancelled = false
    if (!cancelled) fetchRoutes(false)
    return () => { cancelled = true }
  }, [fetchRoutes])

  const handleRetry = useCallback(() => {
    resetRoutingProvider()
    fetchRoutes(false)
  }, [fetchRoutes])

  const handleUseDemo = useCallback(() => {
    fetchRoutes(true)
  }, [fetchRoutes])

  const selectedRoute = routes[selectedIdx]

  const markers = useMemo(() => [
    { latitude: origin.latitude, longitude: origin.longitude, label: origin.name, color: 'green' as const },
    { latitude: destination.latitude, longitude: destination.longitude, label: destination.name, color: 'red' as const },
  ], [origin, destination])

  const routeCoordinates = selectedRoute?.coordinates || []

  return (
    <div className="nav-result-page fade-in">
      <div className="nav-result-sidebar">
        <div className="nav-result-header">
          <h2 className="nav-result-route-name">
            {origin.name} → {destination.name}
          </h2>
        </div>

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
          <>
            <div className="nav-mode-tabs">
              {routes.map((route, i) => (
                <button
                  key={route.mode}
                  className={`nav-mode-tab ${selectedIdx === i ? 'active' : ''}`}
                  onClick={() => setSelectedIdx(i)}
                >
                  <span className="mode-icon">{modeIcons[route.mode]}</span>
                  <div className="mode-info">
                    <span className="mode-label">{modeLabels[route.mode]}</span>
                    <span className="mode-detail">{formatDuration(route.duration)}</span>
                    <span className="mode-distance">{formatDistance(route.distance)}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedRoute && (
              <div className="nav-route-details">
                <h3 className="details-title">路线详情</h3>
                <div className="details-steps">
                  {selectedRoute.steps.map((step, i) => (
                    <div key={i} className="detail-step">
                      <div className="step-dot" />
                      <div className="step-content">
                        <span className="step-instruction">{step.instruction}</span>
                        <span className="step-meta">
                          {formatDistance(step.distance)} · {formatDuration(step.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {usedFallback && (
              <div className="nav-demo-badge">
                当前使用演示数据，不代表真实路线
              </div>
            )}
          </>
        )}

        {!loading && !error && routes.length === 0 && (
          <div className="nav-result-status">
            <p>未找到可用路线。</p>
          </div>
        )}
      </div>

      <div className="nav-result-map">
        <MapView
          center={[origin.latitude, origin.longitude]}
          zoom={13}
          markers={markers}
          routeCoordinates={routeCoordinates}
        />
      </div>
    </div>
  )
}
