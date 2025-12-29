<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { timeFormat, showSeconds, showDate, clockColor, fontSize, fontWeight } from '../stores/settings'

const now = ref(new Date())
let intervalId = null
let syncIntervalId = null
const timeOffset = ref(0) // 网络时间与本地时间的偏移量（毫秒）

// 获取网络时间并计算偏移量
async function syncNetworkTime() {
  try {
    const beforeRequest = Date.now()
    // 请求当前站点获取服务器时间（通过 HTTP Date 响应头）
    const response = await fetch(window.location.origin + '/favicon.ico?' + Date.now(), {
      method: 'HEAD',
      cache: 'no-store'
    })
    const afterRequest = Date.now()

    const dateHeader = response.headers.get('Date')
    if (dateHeader) {
      const networkTime = new Date(dateHeader).getTime()
      const localTime = (beforeRequest + afterRequest) / 2
      timeOffset.value = networkTime - localTime
      console.log(`时间同步成功，偏移量: ${timeOffset.value}ms`)
      return
    }
  } catch (error) {
    console.warn('时间同步失败:', error.message)
  }
  console.warn('时间同步失败，使用本地时间')
}

// 获取校正后的当前时间
function getCorrectedTime() {
  return new Date(Date.now() + timeOffset.value)
}

onMounted(() => {
  // 立即同步一次网络时间
  syncNetworkTime()

  // 每秒更新时间显示
  intervalId = setInterval(() => {
    now.value = getCorrectedTime()
  }, 1000)

  // 每3分钟同步一次网络时间
  syncIntervalId = setInterval(syncNetworkTime, 3 * 60 * 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  if (syncIntervalId) {
    clearInterval(syncIntervalId)
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
