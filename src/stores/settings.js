import { ref, watch } from 'vue'

const STORAGE_KEY = 'clock-settings'

const defaultSettings = {
  timeFormat: 24,
  showSeconds: true,
  showDate: true,
  themeMode: 'auto',
  clockColor: '#f39c12',
  fontSize: 100,
  fontWeight: 100
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : { ...defaultSettings }
  } catch {
    return { ...defaultSettings }
  }
}

// 使用 ref 而不是 reactive，确保响应式
export const timeFormat = ref(loadFromStorage().timeFormat)
export const showSeconds = ref(loadFromStorage().showSeconds)
export const showDate = ref(loadFromStorage().showDate)
export const themeMode = ref(loadFromStorage().themeMode)
export const clockColor = ref(loadFromStorage().clockColor)
export const fontSize = ref(loadFromStorage().fontSize)
export const fontWeight = ref(loadFromStorage().fontWeight)

// 保存设置到 localStorage
function saveSettings() {
  const settings = {
    timeFormat: timeFormat.value,
    showSeconds: showSeconds.value,
    showDate: showDate.value,
    themeMode: themeMode.value,
    clockColor: clockColor.value,
    fontSize: fontSize.value,
    fontWeight: fontWeight.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

// 监听所有设置变化
watch([timeFormat, showSeconds, showDate, themeMode, clockColor, fontSize, fontWeight], saveSettings)

export function getCurrentTheme() {
  if (themeMode.value === 'auto') {
    const hour = new Date().getHours()
    return (hour >= 6 && hour < 18) ? 'light' : 'dark'
  }
  return themeMode.value
}
