<script setup>
import { ref, computed } from 'vue'
import { alarms, addAlarm, removeAlarm, toggleAlarm } from '../stores/alarms'
import { fontSize, clockColor } from '../stores/settings'

const showModal = ref(false)
const alarmForm = ref({
  hour: 7,
  minute: 0,
  label: '',
  sound: 'default'
})

const timeStyle = computed(() => ({
  fontSize: `${fontSize.value * 0.4}px`,
  color: clockColor.value === 'default' ? 'var(--text-color)' : clockColor.value
}))

function openModal() {
  const now = new Date()
  alarmForm.value = {
    hour: now.getHours(),
    minute: 0,
    label: '',
    sound: 'default'
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveAlarm() {
  addAlarm({
    hour: Math.min(23, Math.max(0, alarmForm.value.hour)),
    minute: Math.min(59, Math.max(0, alarmForm.value.minute)),
    label: alarmForm.value.label || '闹钟',
    sound: alarmForm.value.sound
  })
  closeModal()
}

function formatTime(hour, minute) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}
</script>

<template>
  <div class="alarm-panel">
    <h2 class="panel-title">闹钟</h2>

    <div class="alarm-list">
      <p v-if="alarms.length === 0" class="empty-text">暂无闹钟</p>

      <div v-for="alarm in alarms" :key="alarm.id" class="alarm-item">
        <div>
          <div class="alarm-time" :style="timeStyle">{{ formatTime(alarm.hour, alarm.minute) }}</div>
          <div class="alarm-label">{{ alarm.label }}</div>
        </div>
        <div class="alarm-actions">
          <div
            class="alarm-toggle"
            :class="{ active: alarm.enabled }"
            @click="toggleAlarm(alarm.id)"
          ></div>
          <button class="btn btn-danger btn-small" @click="removeAlarm(alarm.id)">删除</button>
        </div>
      </div>
    </div>

    <button class="btn add-alarm-btn" @click="openModal">+ 添加闹钟</button>

    <!-- 添加闹钟模态框 -->
    <div v-if="showModal" class="modal active" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="modal-title">添加闹钟</h3>

        <div class="form-group">
          <label>时间</label>
          <div class="time-picker">
            <input
              v-model.number="alarmForm.hour"
              type="number"
              min="0"
              max="23"
              placeholder="时"
            >
            <span class="time-separator">:</span>
            <input
              v-model.number="alarmForm.minute"
              type="number"
              min="0"
              max="59"
              placeholder="分"
            >
          </div>
        </div>

        <div class="form-group">
          <label>标签</label>
          <input
            v-model="alarmForm.label"
            type="text"
            placeholder="闹钟"
            maxlength="20"
          >
        </div>

        <div class="form-group">
          <label>提示音</label>
          <select v-model="alarmForm.sound">
            <option value="default">默认铃声</option>
            <option value="bell">铃铛</option>
            <option value="digital">数字音</option>
          </select>
        </div>

        <div class="modal-buttons">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn" @click="saveAlarm">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alarm-panel {
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

.alarm-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.empty-text {
  text-align: center;
  opacity: 0.6;
  padding: 20px;
}

.alarm-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: var(--sidebar-bg);
  border-radius: 10px;
  margin-bottom: 10px;
}

.alarm-time {
  font-size: 28px;
  font-weight: 500;
}

.alarm-label {
  font-size: 14px;
  opacity: 0.7;
}

.alarm-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.alarm-toggle {
  position: relative;
  width: 50px;
  height: 26px;
  background: var(--border-color);
  border-radius: 13px;
  cursor: pointer;
  transition: background 0.3s;
}

.alarm-toggle.active {
  background: var(--accent-color);
}

.alarm-toggle::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.alarm-toggle.active::after {
  transform: translateX(24px);
}

.btn {
  padding: 15px;
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

.btn-danger {
  background: #e74c3c;
}

.btn-small {
  padding: 8px 12px;
  font-size: 14px;
}

.add-alarm-btn {
  width: 30%;
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--panel-bg);
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 40px var(--shadow);
}

.modal-title {
  font-size: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 16px;
}

.time-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-picker input {
  flex: 1;
  text-align: center;
  font-size: 24px;
}

.time-separator {
  font-size: 24px;
  font-weight: bold;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-buttons .btn {
  flex: 1;
}
</style>
