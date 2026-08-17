const MUTE_STORAGE_KEY = 'job-offer-card:muted'
const MUTE_TTL_MS = 24 * 60 * 60 * 1000

export function readMutedPreference() {
  if (typeof localStorage === 'undefined') return true

  try {
    const raw = localStorage.getItem(MUTE_STORAGE_KEY)
    if (!raw) return true

    const data = JSON.parse(raw)
    if (typeof data?.muted !== 'boolean' || typeof data?.expiresAt !== 'number') {
      localStorage.removeItem(MUTE_STORAGE_KEY)
      return true
    }

    if (Date.now() >= data.expiresAt) {
      localStorage.removeItem(MUTE_STORAGE_KEY)
      return true
    }

    return data.muted
  } catch {
    return true
  }
}

export function writeMutedPreference(muted) {
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(
      MUTE_STORAGE_KEY,
      JSON.stringify({
        muted: Boolean(muted),
        expiresAt: Date.now() + MUTE_TTL_MS
      })
    )
  } catch {
    // 隐私模式或存储配额不足时忽略
  }
}

const htmlAudios = new Map()

let audioContext = null

export function getAudioContext() {
  if (typeof window === 'undefined') return null

  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null

  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioCtx()
  }

  return audioContext
}

/** 同一音效全局只创建、请求一次 */
export function getHtmlSfx(src) {
  let audio = htmlAudios.get(src)
  if (audio) return audio

  audio = new Audio(src)
  audio.preload = 'auto'
  htmlAudios.set(src, audio)
  return audio
}

export function playHtmlAudio(audio) {
  if (!audio) return Promise.resolve()

  audio.sfxToken = (audio.sfxToken || 0) + 1
  audio.muted = false
  audio.volume = 1
  try {
    audio.pause()
    audio.currentTime = 0
  } catch {
    // 元数据未就绪时忽略
  }

  const playPromise = audio.play()
  if (playPromise && typeof playPromise.catch === 'function') {
    return playPromise.catch(() => {})
  }
  return Promise.resolve()
}

export function pauseAllHtmlAudio() {
  htmlAudios.forEach((audio) => {
    audio.pause()
  })
}

function unlockHtmlAudio(audio) {
  if (!audio) return Promise.resolve()

  const token = audio.sfxToken || 0
  audio.muted = true
  const playPromise = audio.play()

  const finish = () => {
    if (audio.sfxToken !== token) return
    audio.pause()
    try {
      audio.currentTime = 0
    } catch {
      // 元数据未就绪时忽略
    }
    audio.muted = false
    audio.volume = 1
  }

  if (playPromise && typeof playPromise.then === 'function') {
    return playPromise.then(finish).catch(() => {
      audio.muted = false
      audio.volume = 1
    })
  }

  finish()
  return Promise.resolve()
}

/** 必须在用户手势回调里同步调用，用于申请/解锁音频播放权限 */
export function requestAudioPermission() {
  const ctx = getAudioContext()

  if (ctx) {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    try {
      const silent = ctx.createBuffer(1, 1, ctx.sampleRate || 22050)
      const source = ctx.createBufferSource()
      source.buffer = silent
      source.connect(ctx.destination)
      source.start(0)
    } catch {
      // 部分环境禁止无声音频，忽略
    }
  }

  htmlAudios.forEach((audio) => {
    unlockHtmlAudio(audio)
  })

  return ctx
}

/**
 * 必须在用户手势回调里同步调用，弹出浏览器麦克风权限框。
 * 拿到权限后立刻关掉轨道，站点只播音效，不录音。
 */
export function requestMicrophonePermission() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return Promise.resolve(false)
  }

  return navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      stream.getTracks().forEach((track) => track.stop())
      return true
    })
    .catch(() => false)
}
