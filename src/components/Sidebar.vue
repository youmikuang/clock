<script setup>
import { ref, computed } from 'vue'
import { themeMode, getCurrentTheme } from '../stores/settings'

const props = defineProps({
  currentView: {
    type: String,
    default: 'clock'
  },
  collapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:currentView', 'update:collapsed'])

const navItems = [
  { id: 'clock', label: '时钟', icon: 'clock' },
  { id: 'alarm', label: '闹钟', icon: 'alarm' },
  { id: 'timer', label: '计时器', icon: 'timer' },
  { id: 'stopwatch', label: '秒表', icon: 'stopwatch' }
]

const isDark = computed(() => getCurrentTheme() === 'dark')

function selectView(viewId) {
  emit('update:currentView', viewId)
}

function toggleSidebar() {
  emit('update:collapsed', !props.collapsed)
}

function toggleTheme() {
  themeMode.value = themeMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <nav class="sidebar" :class="{ collapsed: collapsed }">
    <button
      v-for="item in navItems"
      :key="item.id"
      class="nav-item"
      :class="{ active: currentView === item.id }"
      :title="item.label"
      @click="selectView(item.id)"
    >
      <!-- 时钟图标 -->
      <svg v-if="item.icon === 'clock'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
      </svg>
      <!-- 闹钟图标 -->
      <svg v-else-if="item.icon === 'alarm'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v5l4.25 2.52.77-1.28-3.02-1.79V9z"/>
      </svg>
      <!-- 计时器图标 -->
      <svg v-else-if="item.icon === 'timer'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
      </svg>
      <!-- 秒表图标 -->
      <svg v-else-if="item.icon === 'stopwatch'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8-1.41-1.42z"/>
      </svg>
      <span class="nav-label">{{ item.label }}</span>
    </button>

    <div class="sidebar-bottom">
      <!-- 主题切换按钮 -->
      <button
        class="nav-item theme-toggle-btn"
        :title="isDark ? '切换到白天模式' : '切换到黑夜模式'"
        @click="toggleTheme"
      >
        <!-- 太阳图标（白天模式） -->
        <svg v-if="!isDark" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
        </svg>
        <!-- 月亮图标（黑夜模式） -->
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
        </svg>
        <span class="nav-label"></span>
      </button>

      <button
        class="nav-item"
        :class="{ active: currentView === 'settings' }"
        title="设置"
        @click="selectView('settings')"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
        <span class="nav-label">设置</span>
      </button>
    </div>
  </nav>

  <!-- 侧边栏切换按钮 -->
  <button class="sidebar-toggle" :class="{ 'sidebar-collapsed': collapsed }" @click="toggleSidebar">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
    </svg>
  </button>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 60px;
  height: 100vh;
  background-color: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 10px var(--shadow);
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-toggle {
  position: fixed;
  left: 60px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 60px;
  background-color: var(--sidebar-bg);
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: left 0.3s ease, background-color 0.3s;
  box-shadow: 2px 0 5px var(--shadow);
}

.sidebar-toggle.sidebar-collapsed {
  left: 0;
}

.sidebar-toggle:hover {
  background-color: var(--sidebar-hover);
}

.sidebar-toggle svg {
  width: 16px;
  height: 16px;
  fill: var(--text-color);
  transition: transform 0.3s;
}

.sidebar-toggle.sidebar-collapsed svg {
  transform: rotate(180deg);
}

.nav-item {
  width: 100%;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
  background: none;
  color: var(--text-color);
}

.nav-item:hover {
  background-color: var(--sidebar-hover);
}

.nav-item.active {
  background-color: var(--accent-color);
  color: white;
}

.nav-item svg {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.theme-toggle-btn svg {
  width: 30px;
  height: 30px;
}

.nav-label {
  font-size: 10px;
}

.sidebar-bottom {
  margin-top: auto;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .sidebar {
    width: 50px;
  }

  .sidebar-toggle {
    left: 50px;
  }

  .sidebar-toggle.sidebar-collapsed {
    left: 0;
  }

  .nav-label {
    display: none;
  }
}
</style>
