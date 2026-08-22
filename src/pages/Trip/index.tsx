import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTrips, deleteTrip, getFavorites, removeFavorite } from '@/store/storage'
import type { Trip, Place } from '@/types'
import './Trip.css'

export default function Trip() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>(() => getTrips())
  const [favorites, setFavorites] = useState<Place[]>(() => getFavorites())
  const [tab, setTab] = useState<'trips' | 'favorites'>('trips')

  const handleDeleteTrip = useCallback((id: string) => {
    deleteTrip(id)
    setTrips(getTrips())
  }, [])

  const handleRemoveFavorite = useCallback((id: string) => {
    removeFavorite(id)
    setFavorites(getFavorites())
  }, [])

  const handleViewTrip = useCallback((trip: Trip) => {
    const params = new URLSearchParams()
    params.set('origin', trip.origin)
    params.set('dest', trip.destination)
    params.set('start', trip.startDate)
    params.set('end', trip.endDate)
    params.set('days', String(trip.days))
    params.set('people', String(trip.people))
    params.set('budget', String(trip.budget))
    params.set('styles', trip.styles.join(','))
    params.set('interests', trip.interests.join(','))
    navigate(`/travel/result?${params.toString()}`)
  }, [navigate])

  return (
    <div className="trip-page fade-in">
      <h1 className="trip-title">📔 我的行程</h1>

      <div className="trip-tabs">
        <button
          className={`trip-tab ${tab === 'trips' ? 'active' : ''}`}
          onClick={() => setTab('trips')}
        >
          行程 ({trips.length})
        </button>
        <button
          className={`trip-tab ${tab === 'favorites' ? 'active' : ''}`}
          onClick={() => setTab('favorites')}
        >
          收藏 ({favorites.length})
        </button>
      </div>

      {tab === 'trips' && (
        <div className="trip-list">
          {trips.length === 0 ? (
            <div className="trip-empty">
              <p>还没有行程</p>
              <button className="trip-empty-btn" onClick={() => navigate('/travel')}>
                开始规划旅行
              </button>
            </div>
          ) : (
            trips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <div className="trip-card-info">
                  <h3 className="trip-card-dest">{trip.destination}</h3>
                  <p className="trip-card-dates">
                    {trip.startDate} - {trip.endDate}
                  </p>
                  <p className="trip-card-meta">
                    {trip.days} 天 · {trip.people} 人
                  </p>
                </div>
                <div className="trip-card-actions">
                  <button className="trip-view-btn" onClick={() => handleViewTrip(trip)}>查看</button>
                  <button className="trip-delete-btn" onClick={() => handleDeleteTrip(trip.id)}>删除</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="trip-list">
          {favorites.length === 0 ? (
            <div className="trip-empty">
              <p>还没有收藏</p>
              <button className="trip-empty-btn" onClick={() => navigate('/travel')}>
                去发现景点
              </button>
            </div>
          ) : (
            favorites.map((place) => (
              <div key={place.id} className="fav-card">
                <div className="fav-card-info">
                  <h3 className="fav-card-name">{place.name}</h3>
                  <p className="fav-card-address">{place.address}</p>
                </div>
                <button className="fav-remove-btn" onClick={() => handleRemoveFavorite(place.id)}>
                  取消收藏
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
