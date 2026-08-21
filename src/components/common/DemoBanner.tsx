import { isDemoMode } from '@/utils/dataMode'
import './DemoBanner.css'

export default function DemoBanner() {
  if (!isDemoMode()) return null

  return (
    <div className="demo-banner">
      当前使用演示数据，不代表真实路线
    </div>
  )
}
