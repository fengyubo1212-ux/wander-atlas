import type { Route } from '@/types'
import { formatDuration } from '@/utils/format'
import './RouteOptionCard.css'

interface RouteOptionCardProps {
  route: Route
  isSelected: boolean
  onClick: () => void
}

const strategyIcons: Record<string, string> = {
  fastest: '⚡',
  fewest_transfers: '🔄',
  least_walking: '🚶',
}

const strategyLabels: Record<string, string> = {
  fastest: '最快到达',
  fewest_transfers: '最少换乘',
  least_walking: '最少步行',
}

export default function RouteOptionCard({ route, isSelected, onClick }: RouteOptionCardProps) {
  const strategy = route.strategy ?? 'fastest'

  return (
    <button
      className={`route-option-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="route-option-header">
        <span className="route-option-icon">{strategyIcons[strategy] ?? '📍'}</span>
        <span className="route-option-label">{strategyLabels[strategy] ?? route.summary}</span>
      </div>

      <div className="route-option-main">
        <span className="route-option-duration">{formatDuration(route.duration)}</span>
      </div>

      <div className="route-option-details">
        {route.walkDuration != null && route.walkDuration > 0 && (
          <span className="route-option-detail">
            🚶 {formatDuration(route.walkDuration)}
          </span>
        )}
        {route.transferCount != null && route.transferCount > 0 && (
          <span className="route-option-detail">
            🔄 换乘 {route.transferCount} 次
          </span>
        )}
        {route.fare != null && (
          <span className="route-option-detail">
            💰 ¥{route.fare}
          </span>
        )}
      </div>

      {route.lineSummary && (
        <div className="route-option-lines">
          {route.lineSummary.split(' → ').map((line, i, arr) => (
            <span key={i}>
              <span className="line-badge" style={{ backgroundColor: getLineColor(line) }}>
                {line}
              </span>
              {i < arr.length - 1 && <span className="line-arrow">→</span>}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

function getLineColor(lineName: string): string {
  const colorMap: Record<string, string> = {
    'KJ': '#e53935',
    'Kelana Jaya Line': '#e53935',
    'SBK': '#43a047',
    'Sungai Buloh-Kajang Line': '#43a047',
    'MR': '#fb8c00',
    'KL Monorail': '#fb8c00',
    'MRT': '#1e88e5',
    'MRT Circle Line': '#1e88e5',
  }
  return colorMap[lineName] ?? '#666'
}
