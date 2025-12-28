import { ref } from 'vue'

let audioContext = null
let oscillator = null
let gainNode = null
let beepInterval = null

export function useAudio() {
  const isPlaying = ref(false)

  function initAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioContext
  }

  function playAlarmSound() {
    const ctx = initAudioContext()
    isPlaying.value = true

    function beep() {
      oscillator = ctx.createOscillator()
      gainNode = ctx.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.2)
    }

    beep()
    beepInterval = setInterval(beep, 500)
  }

  function stopAlarmSound() {
    isPlaying.value = false
    if (beepInterval) {
      clearInterval(beepInterval)
      beepInterval = null
    }
  }

  return {
    isPlaying,
    playAlarmSound,
    stopAlarmSound
  }
}
