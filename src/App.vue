<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Clock from './components/Clock.vue'
import Alarm from './components/Alarm.vue'
import Timer from './components/Timer.vue'
import Stopwatch from './components/Stopwatch.vue'
import Settings from './components/Settings.vue'
import AlarmAlert from './components/AlarmAlert.vue'
import { themeMode, getCurrentTheme, fontSize, fontWeight } from './stores/settings'
import { alarms } from './stores/alarms'
import { useAudio } from './composables/useAudio'

// 有效的视图列表（不包含 clock，因为 clock 用 / 表示）
const validViews = ['alarm', 'timer', 'stopwatch', 'settings']

// 从 URL 路径获取初始视图
function getViewFromPath() {
  const path = window.location.pathname.slice(1) // 去掉开头的 /
  if (path === '' || path === 'clock') return 'clock'
  return validViews.includes(path) ? path : 'clock'
}

const currentView = ref(getViewFromPath())
const sidebarCollapsed = ref(false)
const mainContentRef = ref(null)
const isFullscreen = ref(false)

// 闹钟提醒状态
const showAlarmAlert = ref(false)
const alertTime = ref('')
const alertLabel = ref('')

const { playAlarmSound, stopAlarmSound } = useAudio()

// 主题管理
const currentTheme = computed(() => getCurrentTheme())

watch(themeMode, () => {
  applyTheme()
})

// 监听视图变化，更新 URL 路径
watch(currentView, (newView) => {
  const newPath = newView === 'clock' ? '/' : `/${newView}`
  if (window.location.pathname !== newPath) {
    window.history.pushState({}, '', newPath)
  }
})

// 处理浏览器前进/后退
function handlePopState() {
  currentView.value = getViewFromPath()
}

function applyTheme() {
  document.documentElement.dataset.theme = getCurrentTheme()
}

// 闹钟检查
let alarmCheckInterval = null

function checkAlarms() {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentSecond = now.getSeconds()

  for (const alarm of alarms) {
    if (
      alarm.enabled &&
      alarm.hour === currentHour &&
      alarm.minute === currentMinute &&
      currentSecond === 0
    ) {
      triggerAlarm(alarm)
      break
    }
  }
}

function triggerAlarm(alarm) {
  alertTime.value = `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`
  alertLabel.value = alarm.label
  showAlarmAlert.value = true
  playAlarmSound()
}

function dismissAlarm() {
  showAlarmAlert.value = false
  stopAlarmSound()
}

function handleTimerComplete() {
  alertTime.value = '计时结束'
  alertLabel.value = '时间到!'
  showAlarmAlert.value = true
  playAlarmSound()
}

// 检测是否为 iOS 设备（iPad/iPhone）
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

// 进入/退出模拟全屏时的处理
function enterSimulatedFullscreen() {
  isFullscreen.value = true
  sidebarCollapsed.value = true
  document.body.classList.add('fullscreen-mode')
  // 滚动到顶部，隐藏 Safari 地址栏
  window.scrollTo(0, 1)
}

function exitSimulatedFullscreen() {
  isFullscreen.value = false
  document.body.classList.remove('fullscreen-mode')
}

// 全屏功能 - 兼容 iPad
function toggleFullscreen() {
  const mainContent = mainContentRef.value
  if (!mainContent) return

  // iOS 设备使用 CSS 模拟全屏（iOS Safari 不支持 Fullscreen API）
  if (isIOS) {
    if (isFullscreen.value) {
      exitSimulatedFullscreen()
    } else {
      enterSimulatedFullscreen()
    }
    return
  }

  // 获取当前全屏元素（兼容不同浏览器）
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

  if (!fullscreenElement) {
    // 进入全屏
    const requestFullscreen = mainContent.requestFullscreen || mainContent.webkitRequestFullscreen
    if (requestFullscreen) {
      requestFullscreen.call(mainContent).then(() => {
        isFullscreen.value = true
      }).catch(err => {
        // 如果原生全屏失败，使用 CSS 模拟
        console.log('全屏请求失败，使用模拟全屏:', err)
        enterSimulatedFullscreen()
      })
    } else {
      // 不支持全屏 API，使用 CSS 模拟
      enterSimulatedFullscreen()
    }
  } else {
    // 退出全屏
    const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen
    if (exitFullscreen) {
      exitFullscreen.call(document).then(() => {
        isFullscreen.value = false
      }).catch(() => {
        isFullscreen.value = false
      })
    } else {
      isFullscreen.value = false
    }
  }
}

// 监听全屏变化（兼容 webkit 前缀）
function handleFullscreenChange() {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
  isFullscreen.value = !!fullscreenElement
}

// 字体大小调节
function increaseFontSize() {
  if (fontSize.value < 200) {
    fontSize.value += 10
  }
}

function decreaseFontSize() {
  if (fontSize.value > 50) {
    fontSize.value -= 10
  }
}

// 字体粗细切换
function toggleFontWeight() {
  fontWeight.value = fontWeight.value === 100 ? 400 : 100
}

// 自动主题检查
let themeCheckInterval = null

onMounted(() => {
  applyTheme()
  alarmCheckInterval = setInterval(checkAlarms, 1000)
  themeCheckInterval = setInterval(() => {
    if (themeMode.value === 'auto') {
      applyTheme()
    }
  }, 60000)

  // 键盘快捷键
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  // 监听浏览器前进/后退
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  if (alarmCheckInterval) clearInterval(alarmCheckInterval)
  if (themeCheckInterval) clearInterval(themeCheckInterval)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  window.removeEventListener('popstate', handlePopState)
})

function handleKeydown(e) {
  if (e.target.matches('input, select, textarea')) return

  if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen()
  }
  if (e.key === 'Escape' && showAlarmAlert.value) {
    dismissAlarm()
  }
}
</script>

<template>
  <div class="app" :data-theme="currentTheme">
    <Sidebar
      v-model:currentView="currentView"
      v-model:collapsed="sidebarCollapsed"
    />

    <main
      ref="mainContentRef"
      class="main-content"
      :class="{
        'sidebar-collapsed': sidebarCollapsed,
        'is-fullscreen': isFullscreen
      }"
    >
      <Clock v-if="currentView === 'clock'" />
      <Alarm v-else-if="currentView === 'alarm'" />
      <Timer v-else-if="currentView === 'timer'" @timer-complete="handleTimerComplete" />
      <Stopwatch v-else-if="currentView === 'stopwatch'" />
      <Settings v-else-if="currentView === 'settings'" />

      <!-- 右上角控制按钮组 -->
      <div v-show="currentView !== 'settings'" class="control-buttons">
        <button class="control-btn" @click="toggleFontWeight" title="切换字体粗细">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
          </svg>
        </button>
        <button class="control-btn" @click="decreaseFontSize" title="缩小">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>
        <button class="control-btn" @click="increaseFontSize" title="放大">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        <button class="control-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏 (F)' : '全屏 (F)'">
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
          </svg>
        </button>
      </div>

      <!-- 闹钟提醒 - 放在全屏容器内部以确保全屏时也能显示 -->
      <AlarmAlert
        :show="showAlarmAlert"
        :time="alertTime"
        :label="alertLabel"
        @dismiss="dismissAlarm"
      />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-color: #ffffff;
  --text-color: #1a1a2e;
  --sidebar-bg: #f5f5f5;
  --sidebar-hover: #e0e0e0;
  --panel-bg: #ffffff;
  --border-color: #ddd;
  --accent-color: #4a90d9;
  --button-bg: #4a90d9;
  --button-text: #ffffff;
  --shadow: rgba(0, 0, 0, 0.1);
}

:root[data-theme="dark"] {
  --bg-color: #000000;
  --text-color: #ffffff;
  --sidebar-bg: #111111;
  --sidebar-hover: #222222;
  --panel-bg: #111111;
  --border-color: #222222;
  --accent-color: #ff9500;
  --button-bg: #ff9500;
  --button-text: #000000;
  --shadow: rgba(0, 0, 0, 0.5);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
  overflow: hidden;
}

.app {
  min-height: 100vh;
}

.main-content {
  margin-left: 60px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: margin-left 0.3s ease;
  padding: 20px;
  background-color: var(--bg-color);
  position: relative;
}

.main-content.sidebar-collapsed {
  margin-left: 0;
}

.main-content.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin-left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh; /* 动态视口高度，适配 iOS Safari */
  height: -webkit-fill-available;
  z-index: 9999;
  /* 安全区域内边距，适配刘海屏 */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* iPad/iOS 全屏模式下的 body 样式 */
body.fullscreen-mode {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
  touch-action: none;
}

/* 全屏模式下隐藏侧边栏切换按钮 */
body.fullscreen-mode .sidebar-toggle {
  display: none !important;
}

.control-buttons {
  position: absolute;
  top: 115px;
  right: 115px;
  display: flex;
  gap: 8px;
  z-index: 100;
}

.is-fullscreen .control-buttons {
  top: 20px;
  right: 20px;
}

.control-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--text-color);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, opacity 0.2s;
  opacity: 0.5;
}

.control-btn:hover {
  opacity: 1;
  background: var(--sidebar-hover);
}

.control-btn.active {
  opacity: 1;
  background: var(--accent-color);
}

.control-btn svg {
  width: 16px;
  height: 16px;
  fill: var(--text-color);
}
</style>
