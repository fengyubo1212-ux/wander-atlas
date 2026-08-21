import { useState, useEffect, useRef, useCallback } from 'react'
import { getGeocodingProvider } from '@/services/geocoding'
import type { Location } from '@/types'
import './LocationSearch.css'

interface LocationSearchProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSelect: (location: Location) => void
}

export default function LocationSearch({ placeholder, value, onChange, onSelect }: LocationSearchProps) {
  const [results, setResults] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const provider = getGeocodingProvider()
      const r = await provider.search(q)
      setResults(r)
      setShowResults(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 600)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, doSearch])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (loc: Location) => {
    onChange(loc.name)
    onSelect(loc)
    setShowResults(false)
    setResults([])
  }

  return (
    <div className="location-search" ref={containerRef}>
      <div className="search-input-wrap">
        <input
          type="text"
          className="location-search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        {loading && <span className="search-spinner" />}
      </div>
      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.map((loc, i) => (
            <button
              key={`${loc.latitude}-${loc.longitude}-${i}`}
              className="search-result-item"
              onClick={() => handleSelect(loc)}
            >
              <span className="result-name">{loc.name}</span>
              <span className="result-address">{loc.address}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
