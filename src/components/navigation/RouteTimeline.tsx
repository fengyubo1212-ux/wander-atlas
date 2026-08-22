import type { Route } from '@/types'
import { formatDistance, formatDuration } from '@/utils/format'
import { WalkIcon, FootprintsIcon } from '@/components/common/Icons'
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

export default function RouteTimeline({ route, originName, destinationName }: RouteTimelineProps) {
  let accumulatedTime = 0

  return (
    <div className="route-timeline">
      {/* Origin */}
      <div className="tl-station tl-origin">
        <div className="tl-left">
          <div className="tl-dot tl-dot-start" />
          <div className="tl-connector" />
        </div>
        <div className="tl-right">
          <div className="tl-time">{formatTime(0)}</div>
          <div className="tl-station-name">{originName}</div>
        </div>
      </div>

      {/* Steps */}
      {route.steps.map((step, i) => {
        const startTime = accumulatedTime
        accumulatedTime += step.duration

        if (step.instruction === '换乘') {
          return (
            <div key={i} className="tl-step tl-transfer">
              <div className="tl-left">
                <div className="tl-dot tl-dot-transfer" />
                <div className="tl-connector tl-connector-transfer" />
              </div>
              <div className="tl-right">
                <div className="tl-time">{formatTime(startTime)}</div>
                <div className="tl-transfer-box">
                  <FootprintsIcon size={14} color="#92400e" />
                  <span>换乘 · 步行 {formatDistance(step.distance)}</span>
                </div>
              </div>
            </div>
          )
        }

        if (step.mode === 'walking') {
          return (
            <div key={i} className="tl-step tl-walk">
              <div className="tl-left">
                <div className="tl-dot tl-dot-walk" />
                <div className="tl-connector tl-connector-walk" />
              </div>
              <div className="tl-right">
                <div className="tl-time">{formatTime(startTime)}</div>
                <div className="tl-walk-info">
                  <WalkIcon size={14} color="#888" />
                  <span>步行 {formatDistance(step.distance)} · {formatDuration(step.duration)}</span>
                </div>
              </div>
            </div>
          )
        }

        if (step.mode === 'transit' && step.lineId) {
          return (
            <div key={i} className="tl-step tl-transit">
              <div className="tl-left">
                <div className="tl-dot tl-dot-transit" style={{ backgroundColor: step.lineColor ?? '#666' }} />
                <div className="tl-connector" style={{ backgroundColor: step.lineColor ?? '#666' }} />
              </div>
              <div className="tl-right">
                <div className="tl-time">{formatTime(startTime)}</div>
                <div className="tl-transit-card">
                  <div className="tl-transit-header">
                    <span className="tl-line-badge" style={{ backgroundColor: step.lineColor ?? '#666' }}>
                      {step.lineName ?? step.lineId}
                    </span>
                    <span className="tl-direction">往 {step.direction ?? '…'}</span>
                  </div>
                  <div className="tl-transit-body">
                    {step.boardingStation && (
                      <div className="tl-station-row">
                        <span className="tl-station-dot tl-boarding" />
                        <span className="tl-station-text">{step.boardingStation}</span>
                      </div>
                    )}
                    {step.stations && step.stations.length > 0 && (
                      <div className="tl-stop-info">
                        <span className="tl-stop-line" style={{ borderColor: step.lineColor ?? '#666' }} />
                        <span>{step.stopCount ?? step.stations.length} 站 · {formatDuration(step.duration)}</span>
                      </div>
                    )}
                    {step.alightingStation && (
                      <div className="tl-station-row">
                        <span className="tl-station-dot tl-alighting" />
                        <span className="tl-station-text">{step.alightingStation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        return (
          <div key={i} className="tl-step">
            <div className="tl-left">
              <div className="tl-dot tl-dot-default" />
              <div className="tl-connector" />
            </div>
            <div className="tl-right">
              <div className="tl-time">{formatTime(startTime)}</div>
              <div className="tl-step-text">{step.instruction}</div>
            </div>
          </div>
        )
      })}

      {/* Destination */}
      <div className="tl-station tl-destination">
        <div className="tl-left">
          <div className="tl-dot tl-dot-end" />
        </div>
        <div className="tl-right">
          <div className="tl-time">{formatTime(route.duration)}</div>
          <div className="tl-station-name">{destinationName}</div>
        </div>
      </div>
    </div>
  )
}
