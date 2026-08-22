import type { Route } from '@/types'
import { formatDuration } from '@/utils/format'
import { WalkIcon, ArrowUpDownIcon, ChevronRightIcon } from '@/components/common/Icons'
import './RouteOptionCard.css'

interface RouteOptionCardProps {
  route: Route
  isSelected: boolean
  onClick: () => void
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
      <div className="roc-top">
        <div className="roc-strategy">
          {strategy === 'fastest' && <span className="roc-badge roc-badge-recommended">推荐</span>}
          <span className="roc-strategy-label">{strategyLabels[strategy] ?? route.summary}</span>
        </div>
        <ChevronRightIcon size={16} color="#999" />
      </div>

      <div className="roc-duration">{formatDuration(route.duration)}</div>

      <div className="roc-meta">
        {route.walkDuration != null && route.walkDuration > 0 && (
          <span className="roc-meta-item">
            <WalkIcon size={13} color="#888" />
            {formatDuration(route.walkDuration)}
          </span>
        )}
        {route.transferCount != null && (
          <span className="roc-meta-item">
            <ArrowUpDownIcon size={13} color="#888" />
            换乘 {route.transferCount}
          </span>
        )}
      </div>

      {route.lineSummary && (
        <div className="roc-lines">
          {route.lineSummary.split(' → ').map((line, i, arr) => (
            <span key={i} className="roc-line-group">
              <span className="roc-line-tag" style={{ backgroundColor: getLineColor(line) }}>
                {line}
              </span>
              {i < arr.length - 1 && <span className="roc-line-arrow">→</span>}
            </span>
          ))}
        </div>
      )}

      <div className="roc-route-preview">
        {getStationSummary(route)}
      </div>
    </button>
  )
}

function getStationSummary(route: Route): string {
  const transitSteps = route.steps.filter(s => s.mode === 'transit' && s.boardingStation)
  if (transitSteps.length === 0) return ''
  const first = transitSteps[0]?.boardingStation
  const last = transitSteps[transitSteps.length - 1]?.alightingStation
  if (first && last) return `${first} → ${last}`
  return ''
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
