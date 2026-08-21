import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import LocationSearch from '@/components/common/LocationSearch'
import type { Location, TravelStyle, TravelInterest } from '@/types'
import './Travel.css'

const styles: { value: TravelStyle; label: string; icon: string }[] = [
  { value: 'budget', label: '穷游', icon: '💰' },
  { value: 'comfort', label: '舒适', icon: '⚖️' },
  { value: 'luxury', label: '豪华', icon: '✨' },
  { value: 'intense', label: '特种兵', icon: '⚡' },
  { value: 'relaxed', label: '佛系', icon: '🌿' },
  { value: 'photography', label: '拍照', icon: '📸' },
  { value: 'couple', label: '情侣', icon: '💕' },
  { value: 'family', label: '家庭', icon: '👨‍👩‍👧' },
]

const interests: { value: TravelInterest; label: string; icon: string }[] = [
  { value: 'food', label: '美食', icon: '🍜' },
  { value: 'attractions', label: '景点', icon: '🏯' },
  { value: 'photography', label: '拍照', icon: '📸' },
  { value: 'nature', label: '自然', icon: '🌿' },
  { value: 'shopping', label: '购物', icon: '🛍️' },
  { value: 'history', label: '历史文化', icon: '🏛️' },
  { value: 'anime', label: '二次元', icon: '🎮' },
  { value: 'nightlife', label: '夜生活', icon: '🌃' },
  { value: 'coffee', label: '咖啡', icon: '☕' },
  { value: 'art', label: '艺术', icon: '🎨' },
]

export default function Travel() {
  const navigate = useNavigate()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [people, setPeople] = useState(2)
  const [budget, setBudget] = useState(5000)
  const [selectedStyles, setSelectedStyles] = useState<TravelStyle[]>(['comfort'])
  const [selectedInterests, setSelectedInterests] = useState<TravelInterest[]>(['food', 'attractions'])

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0
    const s = new Date(startDate)
    const e = new Date(endDate)
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }, [startDate, endDate])

  const toggleStyle = useCallback((v: TravelStyle) => {
    setSelectedStyles((s) =>
      s.includes(v) ? s.filter((x) => x !== v) : [...s, v],
    )
  }, [])

  const toggleInterest = useCallback((v: TravelInterest) => {
    setSelectedInterests((s) =>
      s.includes(v) ? s.filter((x) => x !== v) : [...s, v],
    )
  }, [])

  const handleStart = useCallback(() => {
    if (!destination || !startDate || !endDate || days === 0) return

    const params = new URLSearchParams()
    if (origin) params.set('origin', origin)
    params.set('dest', destination)
    params.set('start', startDate)
    params.set('end', endDate)
    params.set('days', String(days))
    params.set('people', String(people))
    params.set('budget', String(budget))
    params.set('styles', selectedStyles.join(','))
    params.set('interests', selectedInterests.join(','))

    navigate(`/travel/result?${params.toString()}`)
  }, [origin, destination, startDate, endDate, days, people, budget, selectedStyles, selectedInterests, navigate])

  const handleOriginSelect = (loc: Location) => {
    setOrigin(loc.name)
  }

  const handleDestSelect = (loc: Location) => {
    setDestination(loc.name)
  }

  const canStart = destination.trim() && startDate && endDate && days > 0

  return (
    <div className="travel-page fade-in">
      <div className="travel-card">
        <h1 className="travel-title">✈️ 规划旅行</h1>

        <div className="travel-section">
          <label className="travel-label">从哪里出发？</label>
          <LocationSearch
            placeholder="出发城市"
            value={origin}
            onChange={setOrigin}
            onSelect={handleOriginSelect}
          />
        </div>

        <div className="travel-section">
          <label className="travel-label">去哪里？</label>
          <LocationSearch
            placeholder="目的地"
            value={destination}
            onChange={setDestination}
            onSelect={handleDestSelect}
          />
        </div>

        <div className="travel-row">
          <div className="travel-section">
            <label className="travel-label">旅行日期</label>
            <input
              type="date"
              className="travel-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="travel-section">
            <label className="travel-label">返回日期</label>
            <input
              type="date"
              className="travel-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
            />
          </div>
        </div>

        {days > 0 && (
          <div className="travel-days-hint">
            {days} 天
          </div>
        )}

        <div className="travel-row">
          <div className="travel-section">
            <label className="travel-label">旅行人数</label>
            <div className="travel-counter">
              <button
                className="counter-btn"
                onClick={() => setPeople((p) => Math.max(1, p - 1))}
              >-</button>
              <span className="counter-value">{people}</span>
              <button
                className="counter-btn"
                onClick={() => setPeople((p) => Math.min(20, p + 1))}
              >+</button>
            </div>
          </div>
          <div className="travel-section">
            <label className="travel-label">预算 (MYR)</label>
            <input
              type="number"
              className="travel-budget"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              min={0}
              step={500}
            />
          </div>
        </div>

        <div className="travel-section">
          <label className="travel-label">旅行风格</label>
          <div className="travel-tags">
            {styles.map((s) => (
              <button
                key={s.value}
                className={`travel-tag ${selectedStyles.includes(s.value) ? 'active' : ''}`}
                onClick={() => toggleStyle(s.value)}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="travel-section">
          <label className="travel-label">旅行兴趣</label>
          <div className="travel-tags">
            {interests.map((i) => (
              <button
                key={i.value}
                className={`travel-tag ${selectedInterests.includes(i.value) ? 'active' : ''}`}
                onClick={() => toggleInterest(i.value)}
              >
                {i.icon} {i.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="travel-start-btn"
          onClick={handleStart}
          disabled={!canStart}
        >
          生成旅行计划
        </button>

        <p className="travel-demo-hint">
          当前为演示模式，行程为算法推荐
        </p>
      </div>
    </div>
  )
}
