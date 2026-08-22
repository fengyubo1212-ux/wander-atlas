import { useState, useCallback } from 'react'
import { setDataMode, getDataMode } from '@/utils/dataMode'
import { resetRoutingProvider } from '@/services/routing'
import { resetGeocodingProvider } from '@/services/geocoding'
import type { DataMode } from '@/utils/dataMode'
import './Settings.css'

interface SettingsState {
  unit: 'km' | 'mile'
  currency: 'MYR' | 'USD' | 'JPY' | 'CNY'
  defaultTransport: 'driving' | 'walking' | 'cycling'
  mapStyle: 'standard' | 'dark'
  dataMode: DataMode
}

const STORAGE_KEY = 'wander-settings'

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {
    unit: 'km',
    currency: 'MYR',
    defaultTransport: 'driving',
    mapStyle: 'standard',
    dataMode: getDataMode(),
  }
}

function saveSettings(s: SettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>(loadSettings)

  const update = useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      saveSettings(next)

      if (key === 'dataMode') {
        setDataMode(value as DataMode)
        resetRoutingProvider()
        resetGeocodingProvider()
      }

      return next
    })
  }, [])

  return (
    <div className="settings-page fade-in">
      <h1 className="settings-title">⚙️ 设置</h1>

      <div className="settings-group">
        <h2 className="settings-group-title">显示</h2>

        <div className="settings-item">
          <label className="settings-label">距离单位</label>
          <select
            className="settings-select"
            value={settings.unit}
            onChange={(e) => update('unit', e.target.value as 'km' | 'mile')}
          >
            <option value="km">公里</option>
            <option value="mile">英里</option>
          </select>
        </div>

        <div className="settings-item">
          <label className="settings-label">货币</label>
          <select
            className="settings-select"
            value={settings.currency}
            onChange={(e) => update('currency', e.target.value as SettingsState['currency'])}
          >
            <option value="MYR">MYR (马来西亚林吉特)</option>
            <option value="USD">USD (美元)</option>
            <option value="JPY">JPY (日元)</option>
            <option value="CNY">CNY (人民币)</option>
          </select>
        </div>
      </div>

      <div className="settings-group">
        <h2 className="settings-group-title">导航</h2>

        <div className="settings-item">
          <label className="settings-label">默认交通方式</label>
          <select
            className="settings-select"
            value={settings.defaultTransport}
            onChange={(e) => update('defaultTransport', e.target.value as SettingsState['defaultTransport'])}
          >
            <option value="driving">🚗 驾车</option>
            <option value="walking">🚶 步行</option>
            <option value="cycling">🚲 骑行</option>
          </select>
        </div>
      </div>

      <div className="settings-group">
        <h2 className="settings-group-title">数据</h2>

        <div className="settings-item">
          <label className="settings-label">数据模式</label>
          <select
            className="settings-select"
            value={settings.dataMode}
            onChange={(e) => update('dataMode', e.target.value as DataMode)}
          >
            <option value="auto">自动</option>
            <option value="demo">演示模式</option>
          </select>
        </div>
        <p className="settings-hint">
          {settings.dataMode === 'demo'
            ? '当前强制使用演示数据'
            : '有 API Key 时使用真实数据，否则自动使用演示数据'}
        </p>
      </div>
    </div>
  )
}
