import { ref, watch } from 'vue'

const STORAGE_KEY = 'clock-settings'

export const defaultSettings = {
  timeFormat: 24,
  showSeconds: true,
  showDate: true,
  themeMode: 'auto',
  clockColor: '#f39c12',
  fontSize: 100,
  fontWeight: 100,
  // 是否显示右上角控制按钮（可全屏、字体粗细、缩放）
  showControls: true,
  // 界面状态（仅保存在本地，不参与 URL 配置）
  sidebarCollapsed: false
}

// URL 查询参数名（含别名） -> 设置项
const URL_PARAM_ALIASES = {
  timeFormat: 'timeFormat',
  format: 'timeFormat',
  showSeconds: 'showSeconds',
  seconds: 'showSeconds',
  showDate: 'showDate',
  date: 'showDate',
  themeMode: 'themeMode',
  theme: 'themeMode',
  clockColor: 'clockColor',
  color: 'clockColor',
  fontSize: 'fontSize',
  size: 'fontSize',
  fontWeight: 'fontWeight',
  weight: 'fontWeight',
  fullscreen: 'fullscreen',
  fs: 'fullscreen',
  cbs: 'showControls',
  showControls: 'showControls',
  controls: 'showControls'
}

function clampNumber(value, min, max) {
  const num = Number(value)
  if (!Number.isFinite(num)) return undefined
  return Math.min(max, Math.max(min, num))
}

function parseBoolean(value) {
  const v = String(value).trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(v)) return true
  if (['0', 'false', 'no', 'off'].includes(v)) return false
  return undefined
}

// 校验并转换 URL 参数值，非法值返回 undefined
function normalizeValue(key, raw) {
  if (raw === null || raw === '') return undefined

  switch (key) {
    case 'timeFormat': {
      const num = Number(raw)
      return num === 12 || num === 24 ? num : undefined
    }
    case 'showSeconds':
    case 'showDate':
    case 'fullscreen':
    case 'showControls':
      return parseBoolean(raw)
    case 'themeMode': {
      const value = String(raw).trim().toLowerCase()
      return ['auto', 'light', 'dark'].includes(value) ? value : undefined
    }
    case 'clockColor': {
      const value = String(raw).trim()
      if (value === 'default') return 'default'
      const color = value.startsWith('#') ? value : `#${value}`
      return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : undefined
    }
    case 'fontSize':
      return clampNumber(raw, 50, 200)
    case 'fontWeight':
      return clampNumber(raw, 100, 900)
    default:
      return undefined
  }
}

// 从 URL 查询参数中读取配置
export function readSettingsFromUrl() {
  const result = {}
  if (typeof window === 'undefined') return result

  const params = new URLSearchParams(window.location.search)
  for (const [param, raw] of params.entries()) {
    const key = URL_PARAM_ALIASES[param]
    if (!key) continue
    const value = normalizeValue(key, raw)
    if (value !== undefined) result[key] = value
  }
  return result
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : { ...defaultSettings }
  } catch {
    return { ...defaultSettings }
  }
}

// 优先级：URL 参数 > localStorage 缓存 > 默认值
const urlSettings = readSettingsFromUrl()
const settingsFromUrl = Object.keys(urlSettings).length > 0
const initialSettings = { ...loadFromStorage(), ...urlSettings }

// 使用 ref 而不是 reactive，确保响应式
export const timeFormat = ref(initialSettings.timeFormat)
export const showSeconds = ref(initialSettings.showSeconds)
export const showDate = ref(initialSettings.showDate)
export const themeMode = ref(initialSettings.themeMode)
export const clockColor = ref(initialSettings.clockColor)
export const fontSize = ref(initialSettings.fontSize)
export const fontWeight = ref(initialSettings.fontWeight)
export const showControls = ref(initialSettings.showControls !== false)
export const sidebarCollapsed = ref(!!initialSettings.sidebarCollapsed)
// 全屏是临时界面状态：不写入 localStorage，仅支持通过 URL 参数指定
export const isFullscreen = ref(!!initialSettings.fullscreen)

// 保存设置到 localStorage
function saveSettings() {
  const settings = {
    timeFormat: timeFormat.value,
    showSeconds: showSeconds.value,
    showDate: showDate.value,
    themeMode: themeMode.value,
    clockColor: clockColor.value,
    fontSize: fontSize.value,
    fontWeight: fontWeight.value,
    showControls: showControls.value,
    sidebarCollapsed: sidebarCollapsed.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

// 生成包含当前配置的链接（可直接分享）
export function buildShareUrl() {
  const url = new URL(window.location.href)
  const params = new URLSearchParams()
  params.set('timeFormat', String(timeFormat.value))
  params.set('showSeconds', String(showSeconds.value))
  params.set('showDate', String(showDate.value))
  params.set('themeMode', String(themeMode.value))
  params.set('clockColor', String(clockColor.value).replace(/^#/, ''))
  params.set('fontSize', String(fontSize.value))
  params.set('fontWeight', String(fontWeight.value))
  params.set('fullscreen', String(isFullscreen.value))
  params.set('cbs', String(showControls.value))
  url.search = params.toString()
  return url.toString()
}

// 当 URL 中带有配置时，保持地址栏与当前配置一致
function syncSettingsToUrl() {
  const next = new URL(buildShareUrl())
  if (window.location.search === next.search) return
  window.history.replaceState(
    window.history.state,
    '',
    `${next.pathname}${next.search}${next.hash}`
  )
}

// 监听所有设置变化
watch([timeFormat, showSeconds, showDate, themeMode, clockColor, fontSize, fontWeight, showControls, sidebarCollapsed], saveSettings)

if (settingsFromUrl) {
  watch(
    [timeFormat, showSeconds, showDate, themeMode, clockColor, fontSize, fontWeight, showControls, isFullscreen],
    syncSettingsToUrl
  )
}

export function getCurrentTheme() {
  if (themeMode.value === 'auto') {
    // 优先检测系统主题偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    // 如果无法检测系统偏好，则根据时间判断
    const hour = new Date().getHours()
    return (hour >= 6 && hour < 18) ? 'light' : 'dark'
  }
  return themeMode.value
}
