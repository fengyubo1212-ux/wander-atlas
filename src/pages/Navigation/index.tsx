import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGeolocation } from '@/hooks/useGeolocation'
import LocationSearch from '@/components/common/LocationSearch'
import type { Location } from '@/types'
import './Navigation.css'

interface LocationInput {
  name: string
  latitude: number | null
  longitude: number | null
}

export default function Navigation() {
  const navigate = useNavigate()
  const geo = useGeolocation()
  const [origin, setOrigin] = useState<LocationInput>({ name: '', latitude: null, longitude: null })
  const [destination, setDestination] = useState<LocationInput>({ name: '', latitude: null, longitude: null })

  useEffect(() => {
    if (geo.latitude && geo.longitude && !origin.latitude) {
      setOrigin({
        name: `${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)}`,
        latitude: geo.latitude,
        longitude: geo.longitude,
      })
    }
  }, [geo.latitude, geo.longitude, origin.latitude])

  const handleSwap = useCallback(() => {
    setOrigin(destination)
    setDestination(origin)
  }, [origin, destination])

  const handleStart = useCallback(() => {
    if (!origin.name || !destination.name) return

    const params = new URLSearchParams()
    if (origin.latitude && origin.longitude) {
      params.set('oLat', String(origin.latitude))
      params.set('oLng', String(origin.longitude))
    }
    params.set('oName', origin.name)
    if (destination.latitude && destination.longitude) {
      params.set('dLat', String(destination.latitude))
      params.set('dLng', String(destination.longitude))
    }
    params.set('dName', destination.name)

    navigate(`/navigation/result?${params.toString()}`)
  }, [origin, destination, navigate])

  const handleOriginSelect = (loc: Location) => {
    setOrigin({ name: loc.name, latitude: loc.latitude, longitude: loc.longitude })
  }

  const handleDestSelect = (loc: Location) => {
    setDestination({ name: loc.name, latitude: loc.latitude, longitude: loc.longitude })
  }

  const canStart = origin.name.trim() && destination.name.trim()

  return (
    <div className="nav-input-page fade-in">
      <div className="nav-input-card">
        <h1 className="nav-input-title">🧭 导航</h1>

        <div className="nav-input-fields">
          <div className="nav-field">
            <label className="nav-label">出发地</label>
            <button
              className="nav-location-btn"
              onClick={() => geo.locate()}
              disabled={geo.loading}
            >
              {geo.loading ? '定位中...' : '📍 使用我的当前位置'}
            </button>
            {geo.error && <p className="nav-error">{geo.error}</p>}
            <LocationSearch
              placeholder="输入出发地点"
              value={origin.name}
              onChange={(v) => setOrigin((s) => ({ ...s, name: v }))}
              onSelect={handleOriginSelect}
            />
          </div>

          <button className="nav-swap-btn" onClick={handleSwap} title="交换起点和终点">
            ⇅
          </button>

          <div className="nav-field">
            <label className="nav-label">目的地</label>
            <LocationSearch
              placeholder="🔍 输入目的地"
              value={destination.name}
              onChange={(v) => setDestination((s) => ({ ...s, name: v }))}
              onSelect={handleDestSelect}
            />
          </div>
        </div>

        <button
          className="nav-start-btn"
          onClick={handleStart}
          disabled={!canStart}
        >
          开始规划路线
        </button>

        <p className="nav-demo-hint">
          当前为演示模式，路线为模拟数据
        </p>
      </div>
    </div>
  )
}
