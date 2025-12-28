import { reactive, watch } from 'vue'

const STORAGE_KEY = 'clock-alarms'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export const alarms = reactive(loadFromStorage())

watch(
  () => [...alarms],
  (newAlarms) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAlarms))
  },
  { deep: true }
)

export function addAlarm(alarm) {
  alarms.push({
    id: Date.now(),
    hour: alarm.hour,
    minute: alarm.minute,
    label: alarm.label || '闹钟',
    sound: alarm.sound || 'default',
    enabled: true
  })
}

export function removeAlarm(id) {
  const index = alarms.findIndex(a => a.id === id)
  if (index !== -1) {
    alarms.splice(index, 1)
  }
}

export function toggleAlarm(id) {
  const alarm = alarms.find(a => a.id === id)
  if (alarm) {
    alarm.enabled = !alarm.enabled
  }
}
