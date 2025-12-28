<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { fontSize, fontWeight, clockColor } from '../stores/settings'

const emit = defineEmits(['timerComplete'])

const hours = ref(0)
const minutes = ref(5)
const seconds = ref(0)

const remaining = ref(0)
const running = ref(false)
const showInputs = ref(true)
let intervalId = null

const displayStyle = computed(() => ({
  fontSize: `${fontSize.value * 1.2}px`,
  fontWeight: fontWeight.value,
  color: clockColor.value === 'default' ? 'var(--text-color)' : clockColor.value
}))

const presets = [
  { label: '1分钟', minutes: 1 },
  { label: '3分钟', minutes: 3 },
  { label: '5分钟', minutes: 5 },
  { label: '10分钟', minutes: 10 },
  { label: '15分钟', minutes: 15 },
  { label: '30分钟', minutes: 30 }
]

const displayTime = computed(() => {
  const totalSeconds = remaining.value
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const buttonText = computed(() => {
  if (!running.value && remaining.value === 0) return '开始'
  return running.value ? '暂停' : '继续'
})

function setPreset(presetMinutes) {
  hours.value = 0
  minutes.value = presetMinutes
  seconds.value = 0
  remaining.value = presetMinutes * 60
}

function toggleTimer() {
  if (running.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

function startTimer() {
  if (remaining.value === 0) {
    remaining.value =
      hours.value * 3600 +
      minutes.value * 60 +
      seconds.value
  }

  if (remaining.value <= 0) return

  running.value = true
  showInputs.value = false

  intervalId = setInterval(() => {
    remaining.value--

    if (remaining.value <= 0) {
      timerComplete()
    }
  }, 1000)
}

function pauseTimer() {
  running.value = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function resetTimer() {
  pauseTimer()
  remaining.value = 0
  showInputs.value = true
}

function timerComplete() {
  resetTimer()
  emit('timerComplete')
}

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="timer-panel">
    <h2 class="panel-title">计时器</h2>

    <div class="timer-display" :style="displayStyle">{{ displayTime }}</div>

    <div v-if="showInputs" class="timer-inputs">
      <div class="timer-input-group">
        <input
          v-model.number="hours"
          type="number"
          min="0"
          max="99"
          placeholder="00"
        >
        <label>时</label>
      </div>
      <div class="timer-input-group">
        <input
          v-model.number="minutes"
          type="number"
          min="0"
          max="59"
          placeholder="00"
        >
        <label>分</label>
      </div>
      <div class="timer-input-group">
        <input
          v-model.number="seconds"
          type="number"
          min="0"
          max="59"
          placeholder="00"
        >
        <label>秒</label>
      </div>
    </div>

    <div v-if="showInputs" class="timer-presets">
      <button
        v-for="preset in presets"
        :key="preset.minutes"
        class="preset-btn"
        @click="setPreset(preset.minutes)"
      >
        {{ preset.label }}
      </button>
    </div>

    <div class="timer-controls">
      <button class="btn" @click="toggleTimer">{{ buttonText }}</button>
      <button class="btn btn-secondary" @click="resetTimer">重置</button>
    </div>
  </div>
</template>

<style scoped>
.timer-panel {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.panel-title {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.timer-display {
  font-weight: 200;
  text-align: center;
  margin: 30px 0;
  font-variant-numeric: tabular-nums;
}

.timer-inputs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.timer-input-group {
  text-align: center;
}

.timer-input-group input {
  width: 80px;
  padding: 15px;
  font-size: 24px;
  text-align: center;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-color);
  color: var(--text-color);
}

.timer-input-group label {
  display: block;
  font-size: 12px;
  margin-top: 5px;
  opacity: 0.7;
}

.timer-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.preset-btn {
  padding: 10px 20px;
  background: var(--sidebar-bg);
  color: var(--text-color);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.preset-btn:hover {
  background: var(--sidebar-hover);
}

.timer-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 15px 40px;
  background: var(--button-bg);
  color: var(--button-text);
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: var(--sidebar-bg);
  color: var(--text-color);
}
</style>
