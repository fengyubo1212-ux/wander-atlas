import type { Route, RouteStep } from '@/types'
import { formatDistance, formatDuration } from '@/utils/format'
import './RouteTimeline.css'

interface RouteTimelineProps {
  route: Route
  originName: string
  destinationName: string
}

function formatTime(seconds: number): string {
  const now = new Date()
  now.setSeconds(now.getSeconds() + seconds)
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function getStepIcon(step: RouteStep): string {
  if (step.mode === 'walking') return '🚶'
  if (step.mode === 'transit') {
    if (step.lineId === 'monorail') return '🚝'
    return '🚇'
  }
  if (step.mode === 'cycling') return '🚲'
  if (step.mode === 'driving') return '🚗'
  return '📍'
}

function getStepColor(step: RouteStep): string {
  if (step.lineColor) return step.lineColor
  if (step.mode === 'walking') return '#888'
  return '#2563eb'
}

export default function RouteTimeline({ route, originName, destinationName }: RouteTimelineProps) {
  let accumulatedTime = 0

  return (
    <div className="route-timeline">
      <div className="timeline-header">
        <div className="timeline-origin">
          <span className="timeline-dot origin-dot" />
          <div className="timeline-location-info">
            <span className="timeline-time">{formatTime(0)}</span>
            <span className="timeline-name">{originName}</span>
          </div>
        </div>
      </div>

      <div className="timeline-steps">
        {route.steps.map((step, i) => {
          const startTime = accumulatedTime
          accumulatedTime += step.duration

          return (
            <div key={i} className="timeline-step">
              <div className="step-line-container">
                <div
                  className="step-line"
                  style={{ backgroundColor: getStepColor(step) }}
                />
                <div className="step-icon-wrapper">
                  <span className="step-icon" style={{ backgroundColor: getStepColor(step) }}>
                    {getStepIcon(step)}
                  </span>
                </div>
              </div>

              <div className="step-content">
                <div className="step-time">{formatTime(startTime)}</div>

                {step.mode === 'walking' && step.instruction !== '换乘' && (
                  <div className="step-detail">
                    <span className="step-action">步行</span>
                    <span className="step-meta">
                      {formatDistance(step.distance)} · {formatDuration(step.duration)}
                    </span>
                  </div>
                )}

                {step.instruction === '换乘' && (
                  <div className="step-detail transfer-step">
                    <span className="step-action">🔄 换乘</span>
                    <span className="step-meta">
                      步行 {formatDistance(step.distance)} · {formatDuration(step.duration)}
                    </span>
                  </div>
                )}

                {step.mode === 'transit' && step.lineId && (
                  <div className="step-detail transit-step">
                    <div className="transit-line-info">
                      <span
                        className="transit-line-badge"
                        style={{ backgroundColor: step.lineColor ?? '#666' }}
                      >
                        {step.lineName ?? step.lineId}
                      </span>
                      <span className="transit-direction">
                        往 {step.direction ?? '…'}
                      </span>
                    </div>
                    <div className="transit-stations">
                      {step.boardingStation && (
                        <div className="transit-station">
                          <span className="station-dot boarding-dot" />
                          {step.boardingStation}
                        </div>
                      )}
                      {step.stations && step.stations.length > 0 && (
                        <div className="transit-stop-count">
                          {step.stopCount ?? step.stations.length} 站 · {formatDuration(step.duration)}
                        </div>
                      )}
                      {step.alightingStation && (
                        <div className="transit-station">
                          <span className="station-dot alighting-dot" />
                          {step.alightingStation}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step.mode === 'transit' && !step.lineId && (
                  <div className="step-detail">
                    <span className="step-action">{step.instruction}</span>
                    <span className="step-meta">
                      {formatDistance(step.distance)} · {formatDuration(step.duration)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="timeline-footer">
        <div className="step-line-container">
          <div className="step-line destination-line" />
          <div className="step-icon-wrapper">
            <span className="step-icon destination-icon">📍</span>
          </div>
        </div>
        <div className="step-content">
          <div className="step-time">{formatTime(route.duration)}</div>
          <div className="step-detail">
            <span className="step-action">{destinationName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
