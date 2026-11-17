<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)

let ctx = null
let rafId = null
let particles = []
let width = 0
let height = 0
let dpr = 1
let color = '#888888'
let resizeTimer = null
let themeObserver = null
let sizeObserver = null

const prefersReducedMotion = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

// 跟随主题取色，保持与界面同一个色调
function readColor() {
  const styles = getComputedStyle(document.documentElement)
  color = styles.getPropertyValue('--accent-color').trim() || '#888888'
}

function createParticles() {
  // 按面积控制数量，保持稀疏、不喧宾夺主
  const count = Math.min(60, Math.max(18, Math.round((width * height) / 26000)))
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 0.6 + Math.random() * 1.4,
    vx: (Math.random() - 0.5) * 0.16,
    vy: (Math.random() - 0.5) * 0.16,
    alpha: 0.06 + Math.random() * 0.12
  }))
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  width = rect.width
  height = rect.height
  if (!width || !height) return

  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  createParticles()
  draw()
}

function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = color

  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy

    // 越界后从另一侧进入，避免出现边缘堆积
    if (p.x < -p.r) p.x = width + p.r
    else if (p.x > width + p.r) p.x = -p.r
    if (p.y < -p.r) p.y = height + p.r
    else if (p.y > height + p.r) p.y = -p.r

    ctx.globalAlpha = p.alpha
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 1
}

function loop() {
  draw()
  rafId = requestAnimationFrame(loop)
}

function start() {
  if (rafId || prefersReducedMotion) return
  rafId = requestAnimationFrame(loop)
}

function stop() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function scheduleResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(resize, 150)
}

function handleVisibilityChange() {
  if (document.hidden) stop()
  else start()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  ctx = canvas.getContext('2d')
  readColor()
  resize()

  if (prefersReducedMotion) {
    draw()
  } else {
    start()
  }

  // 主题变化时同步颜色
  themeObserver = new MutationObserver(() => {
    readColor()
    if (prefersReducedMotion) draw()
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })

  // 侧边栏折叠、窗口缩放都会改变画布尺寸
  if (window.ResizeObserver) {
    sizeObserver = new ResizeObserver(scheduleResize)
    sizeObserver.observe(canvas)
  } else {
    window.addEventListener('resize', scheduleResize)
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stop()
  if (resizeTimer) clearTimeout(resizeTimer)
  if (themeObserver) themeObserver.disconnect()
  if (sizeObserver) {
    sizeObserver.disconnect()
  } else {
    window.removeEventListener('resize', scheduleResize)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<style scoped>
.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
