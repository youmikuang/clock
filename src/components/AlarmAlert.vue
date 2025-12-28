<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  time: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['dismiss'])

function dismiss() {
  emit('dismiss')
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="alarm-alert" @click="dismiss">
      <div class="alarm-alert-content">
        <div class="alarm-alert-time">{{ time }}</div>
        <div class="alarm-alert-label">{{ label }}</div>
        <button class="btn" @click.stop="dismiss">关闭</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.alarm-alert {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { background: rgba(0, 0, 0, 0.8); }
  50% { background: rgba(233, 69, 96, 0.8); }
}

.alarm-alert-content {
  text-align: center;
}

.alarm-alert-time {
  font-size: 80px;
  color: white;
  margin-bottom: 20px;
  font-weight: 300;
}

.alarm-alert-label {
  font-size: 24px;
  color: white;
  margin-bottom: 40px;
}

.btn {
  padding: 20px 60px;
  background: var(--button-bg);
  color: var(--button-text);
  border: none;
  border-radius: 10px;
  font-size: 20px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .alarm-alert-time {
    font-size: 50px;
  }

  .alarm-alert-label {
    font-size: 18px;
  }

  .btn {
    padding: 15px 40px;
    font-size: 16px;
  }
}
</style>
