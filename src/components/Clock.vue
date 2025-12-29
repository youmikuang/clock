<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { timeFormat, showSeconds, showDate, clockColor, fontSize, fontWeight } from '../stores/settings'

const now = ref(new Date())
let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

const timeDisplay = computed(() => {
  let hours = now.value.getHours()
  const minutes = now.value.getMinutes()
  const seconds = now.value.getSeconds()

  if (Number(timeFormat.value) === 12) {
    hours = hours % 12 || 12
  }

  const h = String(hours).padStart(2, '0')
  const m = String(minutes).padStart(2, '0')
  const s = String(seconds).padStart(2, '0')

  return { hours: h, minutes: m, seconds: s }
})

const dateDisplay = computed(() => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  return now.value.toLocaleDateString('zh-CN', options)
})

const clockStyle = computed(() => {
  const style = {}
  if (clockColor.value !== 'default') {
    style.color = clockColor.value
  }
  const baseSize = fontSize.value
  style.fontSize = `clamp(${baseSize * 0.8}px, ${baseSize * 0.2}vw, ${baseSize * 2}px)`
  style.fontWeight = fontWeight.value
  return style
})
</script>

<template>
  <div class="clock-container">
    <div class="time-display" :style="clockStyle">
      {{ timeDisplay.hours }}:{{ timeDisplay.minutes }}<template v-if="showSeconds">:{{ timeDisplay.seconds }}</template>
    </div>
    <div v-if="showDate" class="date-display">
      {{ dateDisplay }}
    </div>
  </div>
</template>

<style scoped>
.clock-container {
  text-align: center;
  user-select: none;
}

.time-display {
  font-size: clamp(100px, 25vw, 300px);
  font-weight: 100;
  letter-spacing: -2px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.date-display {
  font-size: clamp(18px, 3vw, 32px);
  opacity: 0.6;
  margin-top: 30px;
  font-weight: 100;
}
</style>
