import { useState, useCallback } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  loading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
  })

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: '当前浏览器不支持定位。' }))
      return
    }

    setState((s) => ({ ...s, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        })
      },
      (err) => {
        let msg = '无法获取当前位置。'
        if (err.code === err.PERMISSION_DENIED) {
          msg = '无法获取当前位置。\n\n你可以手动输入出发地点。'
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = '位置信息不可用。'
        } else if (err.code === err.TIMEOUT) {
          msg = '定位请求超时。'
        }
        setState((s) => ({ ...s, loading: false, error: msg }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [])

  return { ...state, locate }
}
