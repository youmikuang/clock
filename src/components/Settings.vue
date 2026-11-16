<script setup>
import { computed, ref } from 'vue'
import { timeFormat, showSeconds, showDate, themeMode, clockColor, fontSize, getCurrentTheme, buildShareUrl } from '../stores/settings'

defineProps({
  sidebarCollapsed: {
    type: Boolean,
    default: false
  },
  isFullscreen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-sidebar', 'toggle-fullscreen'])

const colors = [
  { value: 'default', label: '默认' },
  { value: '#e74c3c', label: '红色' },
  { value: '#3498db', label: '蓝色' },
  { value: '#2ecc71', label: '绿色' },
  { value: '#9b59b6', label: '紫色' },
  { value: '#f39c12', label: '橙色' },
  { value: '#1abc9c', label: '青色' },
  { value: '#e91e63', label: '粉色' }
]

// 计算属性
const isAutoMode = computed(() => themeMode.value === 'auto')
const is24Hour = computed(() => timeFormat.value === 24)

function toggleTimeFormat() {
  timeFormat.value = timeFormat.value === 24 ? 12 : 24
}

function toggleShowSeconds() {
  showSeconds.value = !showSeconds.value
}

function toggleShowDate() {
  showDate.value = !showDate.value
}

function toggleAutoMode() {
  if (themeMode.value === 'auto') {
    // 关闭自动模式，根据当前实际主题设置
    themeMode.value = getCurrentTheme()
  } else {
    // 开启自动模式
    themeMode.value = 'auto'
  }
}

function setClockColor(color) {
  clockColor.value = color
}

function setFontSize(size) {
  fontSize.value = parseInt(size)
}

// 配置链接（含当前所有设置）
const shareUrl = computed(() => buildShareUrl())
const copied = ref(false)
let copyTimer = null

async function copyShareUrl() {
  const text = shareUrl.value
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // 兼容非安全上下文（如 http 局域网访问）
      const input = document.createElement('textarea')
      input.value = text
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copied.value = false }, 2000)
  } catch (error) {
    console.warn('复制失败:', error)
  }
}
</script>

<template>
  <div class="settings-panel">
    <h2 class="panel-title">设置</h2>

    <div class="setting-group">
      <div class="setting-row">
        <div class="setting-label">24小时制</div>
        <label class="toggle-switch">
          <input type="checkbox" :checked="is24Hour" @change="toggleTimeFormat">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="setting-group">
      <div class="setting-row">
        <div class="setting-label">显示秒钟</div>
        <label class="toggle-switch">
          <input type="checkbox" :checked="showSeconds" @change="toggleShowSeconds">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="setting-group">
      <div class="setting-row">
        <div class="setting-label">显示日期</div>
        <label class="toggle-switch">
          <input type="checkbox" :checked="showDate" @change="toggleShowDate">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="setting-group">
      <div class="setting-row">
        <div class="setting-label">自动跟随时间</div>
        <label class="toggle-switch">
          <input type="checkbox" :checked="isAutoMode" @change="toggleAutoMode">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="setting-hint">开启后将根据时间自动切换主题（6:00-18:00 白天）</div>
    </div>

    <div class="setting-group">
      <div class="setting-row">
        <div class="setting-label">折叠侧边栏</div>
        <label class="toggle-switch">
          <input type="checkbox" :checked="sidebarCollapsed" @change="emit('toggle-sidebar')">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="setting-row setting-row-spaced">
        <div class="setting-label">全屏模式</div>
        <label class="toggle-switch">
          <input type="checkbox" :checked="isFullscreen" @change="emit('toggle-fullscreen')">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="setting-hint">全屏时按 F 或 Esc 可退出（支持 iPad 模拟全屏）</div>
    </div>

    <div class="setting-group">
      <div class="setting-label">时钟颜色</div>
      <div class="color-picker">
        <div
          v-for="color in colors"
          :key="color.value"
          class="color-option"
          :class="{ active: clockColor === color.value }"
          :style="{
            background: color.value === 'default' ? 'var(--text-color)' : color.value
          }"
          :title="color.label"
          @click="setClockColor(color.value)"
        ></div>
      </div>
    </div>

    <div class="setting-group">
      <div class="setting-label">字体大小: {{ fontSize }}%</div>
      <input
        type="range"
        class="font-size-slider"
        min="50"
        max="150"
        :value="fontSize"
        @input="setFontSize($event.target.value)"
      >
    </div>

    <div class="setting-group">
      <div class="setting-label">配置链接</div>
      <div class="share-row">
        <input
          class="share-input"
          type="text"
          :value="shareUrl"
          readonly
          @focus="$event.target.select()"
        >
        <button class="share-btn" @click="copyShareUrl">{{ copied ? '已复制' : '复制' }}</button>
      </div>
      <div class="setting-hint">
        链接中的参数优先于本地缓存，可通过 URL 直接指定配置，例如
        ?timeFormat=12&amp;showSeconds=false&amp;themeMode=dark
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  width: 100%;
  max-width: 500px;
}

.panel-title {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.setting-group {
  margin-bottom: 25px;
}

.setting-label {
  font-size: 14px;
  margin-bottom: 10px;
  opacity: 0.8;
}

.setting-options {
  display: flex;
  gap: 10px;
}

.setting-option {
  flex: 1;
  padding: 12px;
  background: var(--sidebar-bg);
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s;
}

.setting-option.active {
  border-color: var(--accent-color);
}

.setting-option:hover {
  background: var(--sidebar-hover);
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-row + .setting-row-spaced {
  margin-top: 18px;
}

.setting-hint {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 8px;
}

/* Toggle Switch 开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--sidebar-bg);
  border: 2px solid var(--border-color);
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: var(--text-color);
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
  background-color: white;
}

.toggle-switch.disabled {
  opacity: 0.5;
}

.toggle-switch.disabled .toggle-slider {
  cursor: not-allowed;
}

.color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: transform 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px var(--bg-color), 0 0 0 4px var(--accent-color);
}

.font-size-slider {
  width: 100%;
  margin-top: 10px;
  height: 8px;
  -webkit-appearance: none;
  background: var(--sidebar-bg);
  border-radius: 4px;
  outline: none;
}

.font-size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  background: var(--accent-color);
  border-radius: 50%;
  cursor: pointer;
}

.font-size-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: var(--accent-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.share-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.share-input {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  font-size: 12px;
  color: var(--text-color);
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  outline: none;
}

.share-input:focus {
  border-color: var(--accent-color);
}

.share-btn {
  flex-shrink: 0;
  padding: 8px 14px;
  font-size: 12px;
  color: var(--text-color);
  background: transparent;
  border: 1px solid var(--accent-color);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.share-btn:hover {
  background: var(--sidebar-hover);
}
</style>
