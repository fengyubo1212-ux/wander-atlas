import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

interface Marker {
  latitude: number
  longitude: number
  label: string
  color: 'green' | 'red'
}

interface MapViewProps {
  center: [number, number]
  zoom?: number
  markers?: Marker[]
  routeCoordinates?: [number, number][]
  className?: string
}

function createIcon(color: 'green' | 'red') {
  const svg = color === 'green'
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#16a34a"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/></svg>`

  return L.divIcon({
    html: `<div style="width:28px;height:28px">${svg}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

const greenIcon = createIcon('green')
const redIcon = createIcon('red')

export default function MapView({ center, zoom = 13, markers = [], routeCoordinates = [], className = '' }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: false,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    map.setView(center, zoom)
  }, [center, zoom])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    markers.forEach((m) => {
      const icon = m.color === 'green' ? greenIcon : redIcon
      const marker = L.marker([m.latitude, m.longitude], { icon })
        .addTo(map)
        .bindPopup(m.label)
      markersRef.current.push(marker)
    })

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.latitude, m.longitude] as [number, number]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [markers])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    if (routeCoordinates.length > 1) {
      polylineRef.current = L.polyline(routeCoordinates, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.8,
      }).addTo(map)

      map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] })
    }
  }, [routeCoordinates])

  return (
    <div className={`map-container ${className}`}>
      <div ref={mapRef} className="map-view" />
      <div className="map-attribution">
        © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
      </div>
    </div>
  )
}
