import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getPlacesProvider } from '@/services/places'
import { generateTripPlan, estimateTripBudget } from '@/utils/travelPlanner'
import type { TripDay, TripItem, TravelStyle, TravelInterest } from '@/types'
import './TravelResult.css'

export default function TravelResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [daysPlan, setDaysPlan] = useState<TripDay[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDay, setExpandedDay] = useState<number>(1)

  const params = useMemo(() => ({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('dest') || '东京',
    startDate: searchParams.get('start') || '',
    endDate: searchParams.get('end') || '',
    days: parseInt(searchParams.get('days') || '7'),
    people: parseInt(searchParams.get('people') || '2'),
    budget: parseInt(searchParams.get('budget') || '5000'),
    styles: (searchParams.get('styles') || 'comfort').split(',') as TravelStyle[],
    interests: (searchParams.get('interests') || 'food,attractions').split(',') as TravelInterest[],
  }), [searchParams])

  const budget = useMemo(
    () => estimateTripBudget(params.days, params.people, params.styles),
    [params.days, params.people, params.styles],
  )

  useEffect(() => {
    let cancelled = false
    async function plan() {
      setLoading(true)
      const provider = getPlacesProvider()
      const places = await provider.searchByDestination(params.destination)
      const plan = generateTripPlan({ ...params, places })
      if (!cancelled) {
        setDaysPlan(plan)
        setLoading(false)
      }
    }
    plan()
    return () => { cancelled = true }
  }, [params])

  const handleNavigateTo = useCallback((placeName: string) => {
    navigate(`/navigation?dest=${encodeURIComponent(placeName)}`)
  }, [navigate])

  const handleRemoveItem = useCallback((dayIdx: number, itemId: string) => {
    setDaysPlan((prev) =>
      prev.map((day, di) =>
        di === dayIdx
          ? { ...day, items: day.items.filter((it) => it.id !== itemId) }
          : day,
      ),
    )
  }, [])

  const handleMoveItem = useCallback((dayIdx: number, itemIdx: number, dir: -1 | 1) => {
    setDaysPlan((prev) =>
      prev.map((day, di) => {
        if (di !== dayIdx) return day
        const newItems = [...day.items]
        const targetIdx = itemIdx + dir
        if (targetIdx < 0 || targetIdx >= newItems.length) return day
        const temp = newItems[itemIdx]
        newItems[itemIdx] = newItems[targetIdx]!
        newItems[targetIdx] = temp!
        return { ...day, items: newItems }
      }),
    )
  }, [])

  if (loading) {
    return (
      <div className="travel-result-page fade-in">
        <div className="travel-result-loading">
          <div className="loading-spinner" />
          <p>正在规划旅行...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="travel-result-page fade-in">
      <div className="travel-result-header">
        <h1 className="result-destination">{params.destination} · {params.days}日旅行</h1>
        <div className="result-meta">
          <span>{params.people} 人</span>
          <span>{params.days} 天</span>
        </div>
        <div className="result-budget">
          <span className="budget-label">预计预算</span>
          <span className="budget-amount">RM {budget.total.toLocaleString()}</span>
          <span className="budget-note">估算费用</span>
        </div>
        <div className="budget-breakdown">
          <div className="budget-item"><span>交通</span><span>RM {budget.transport}</span></div>
          <div className="budget-item"><span>住宿</span><span>RM {budget.accommodation}</span></div>
          <div className="budget-item"><span>餐饮</span><span>RM {budget.food}</span></div>
          <div className="budget-item"><span>门票</span><span>RM {budget.tickets}</span></div>
          <div className="budget-item"><span>市内交通</span><span>RM {budget.localTransport}</span></div>
          <div className="budget-item"><span>其他</span><span>RM {budget.other}</span></div>
        </div>
      </div>

      <div className="travel-result-days">
        {daysPlan.map((day, dayIdx) => (
          <div key={day.day} className="day-card">
            <button
              className={`day-header ${expandedDay === day.day ? 'expanded' : ''}`}
              onClick={() => setExpandedDay(expandedDay === day.day ? 0 : day.day)}
            >
              <div className="day-info">
                <span className="day-number">DAY {day.day}</span>
                <span className="day-date">{day.date}</span>
              </div>
              <span className="day-count">{day.items.length} 个景点</span>
            </button>

            {expandedDay === day.day && (
              <div className="day-items">
                {day.items.map((item, itemIdx) => (
                  <PlaceCard
                    key={item.id}
                    item={item}
                    itemIdx={itemIdx}
                    totalItems={day.items.length}
                    onNavigate={() => handleNavigateTo(item.place.name)}
                    onRemove={() => handleRemoveItem(dayIdx, item.id)}
                    onMoveUp={() => handleMoveItem(dayIdx, itemIdx, -1)}
                    onMoveDown={() => handleMoveItem(dayIdx, itemIdx, 1)}
                  />
                ))}
                {day.items.length === 0 && (
                  <div className="day-empty">暂无景点</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="travel-result-demo">
        当前使用演示数据，行程为算法推荐
      </div>
    </div>
  )
}

function PlaceCard({
  item,
  itemIdx,
  totalItems,
  onNavigate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  item: TripItem
  itemIdx: number
  totalItems: number
  onNavigate: () => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <div className="place-card">
      <div className="place-card-header">
        <span className="place-time">{item.time}</span>
        <div className="place-actions">
          <button className="place-action-btn" onClick={onMoveUp} disabled={itemIdx === 0} title="上移">↑</button>
          <button className="place-action-btn" onClick={onMoveDown} disabled={itemIdx === totalItems - 1} title="下移">↓</button>
          <button className="place-action-btn remove" onClick={onRemove} title="删除">✕</button>
        </div>
      </div>
      <h3 className="place-name">{item.place.name}</h3>
      {item.place.nameEn && <p className="place-name-en">{item.place.nameEn}</p>}
      <p className="place-address">{item.place.address}</p>
      <div className="place-meta">
        <span className="place-stay">建议停留 {item.stayDuration} 小时</span>
        {item.place.rating && <span className="place-rating">⭐ {item.place.rating}</span>}
      </div>
      {item.note && <p className="place-note">{item.note}</p>}
      <div className="place-card-actions">
        <button className="place-nav-btn" onClick={onNavigate}>🧭 怎么去</button>
      </div>
    </div>
  )
}
