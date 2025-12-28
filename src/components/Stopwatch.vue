<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { fontSize, fontWeight, clockColor } from '../stores/settings'

const elapsed = ref(0)
const running = ref(false)
const laps = ref([])
let intervalId = null
let startTime = 0

const displayStyle = computed(() => ({
  fontSize: `${fontSize.value * 1.2}px`,
  fontWeight: fontWeight.value,
  color: clockColor.value === 'default' ? 'var(--text-color)' : clockColor.value
}))

const displayTime = computed(() => {
  const totalMs = elapsed.value
  const minutes = Math.floor(totalMs / 60000)
  const seconds = Math.floor((totalMs % 60000) / 1000)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const displayMs = computed(() => {
  const ms = Math.floor((elapsed.value % 1000) / 10)
  return `.${String(ms).padStart(2, '0')}`
})

const buttonText = computed(() => {
  if (!running.value && elapsed.value === 0) return '开始'
  return running.value ? '暂停' : '继续'
})

function toggleStopwatch() {
  if (running.value) {
    pauseStopwatch()
  } else {
    startStopwatch()
  }
}

function startStopwatch() {
  running.value = true
  startTime = Date.now() - elapsed.value

  intervalId = setInterval(() => {
    elapsed.value = Date.now() - startTime
  }, 10)
}

function pauseStopwatch() {
  running.value = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function resetStopwatch() {
  pauseStopwatch()
  elapsed.value = 0
  laps.value = []
}

function recordLap() {
  if (!running.value && elapsed.value === 0) return

  laps.value.unshift({
    number: laps.value.length + 1,
    time: elapsed.value
  })
}

function formatLapTime(time) {
  const minutes = Math.floor(time / 60000)
  const seconds = Math.floor((time % 60000) / 1000)
  const ms = Math.floor((time % 1000) / 10)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
}

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="stopwatch-panel">
    <h2 class="panel-title">秒表</h2>

    <div class="stopwatch-display" :style="displayStyle">
      <span class="main-time">{{ displayTime }}</span><span class="ms-time">{{ displayMs }}</span>
    </div>

    <div v-if="laps.length > 0" class="lap-list">
      <div v-for="lap in laps" :key="lap.number" class="lap-item">
        <span>计次 {{ lap.number }}</span>
        <span>{{ formatLapTime(lap.time) }}</span>
      </div>
    </div>

    <div class="stopwatch-controls">
      <button class="btn" @click="toggleStopwatch">{{ buttonText }}</button>
      <button class="btn btn-secondary" @click="recordLap">计次</button>
      <button class="btn btn-secondary" @click="resetStopwatch">重置</button>
    </div>
  </div>
</template>

<style scoped>
.stopwatch-panel {
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

.stopwatch-display {
  font-weight: 100;
  text-align: center;
  margin: 30px 0;
  font-variant-numeric: tabular-nums;
}

.ms-time {
  font-size: 0.5em;
  opacity: 0.7;
}

.lap-list {
  max-height: 200px;
  overflow-y: auto;
  margin: 20px 0;
}

.lap-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: var(--sidebar-bg);
  border-radius: 8px;
  margin-bottom: 5px;
}

.stopwatch-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 15px 30px;
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
