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
let gestureUnlocked = false
let wechatBridgeBound = false

export function isAudioGestureUnlocked() {
  return gestureUnlocked
}

export function isWeChatBrowser() {
  if (typeof navigator === 'undefined') return false
  return /MicroMessenger/i.test(navigator.userAgent || '')
}

/**
 * 微信内刷新后无用户手势也能播音频的常见解锁方式。
 * 在 WeixinJSBridge 回调里执行 playFn。
 */
export function runWithWeChatAudioUnlock(playFn) {
  if (typeof playFn !== 'function') return

  if (!isWeChatBrowser()) {
    playFn()
    return
  }

  const invokePlay = () => {
    try {
      if (window.WeixinJSBridge?.invoke) {
        window.WeixinJSBridge.invoke('getNetworkType', {}, () => {
          playFn()
        })
        return
      }
    } catch {
      // fall through
    }
    playFn()
  }

  if (window.WeixinJSBridge) {
    invokePlay()
    return
  }

  if (!wechatBridgeBound && typeof document !== 'undefined') {
    wechatBridgeBound = true
    document.addEventListener('WeixinJSBridgeReady', invokePlay, false)
  }

  // Bridge 迟迟未就绪时兜底，避免一直无声
  window.setTimeout(() => {
    playFn()
  }, 800)
}

export function getAudioContext() {
  if (typeof window === 'undefined') return null

  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null

  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioCtx()
  }

  return audioContext
}

function configureHtmlAudio(audio) {
  audio.preload = 'auto'
  audio.playsInline = true
  try {
    audio.setAttribute('playsinline', '')
    audio.setAttribute('webkit-playsinline', '')
  } catch {
    // 非 HTMLElement 时忽略
  }
  return audio
}

/** 同一音效全局只创建、请求一次 */
export function getHtmlSfx(src) {
  let audio = htmlAudios.get(src)
  if (audio) return audio

  audio = configureHtmlAudio(new Audio(src))
  htmlAudios.set(src, audio)
  return audio
}

/**
 * 墙体音效单独创建，不进入 htmlAudios。
 * 避免 requestAudioPermission 的静音解锁 play/pause 打断正在播放的 wall。
 */
export function createStandaloneSfx(src) {
  return configureHtmlAudio(new Audio(src))
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
  if (playPromise && typeof playPromise.then === 'function') {
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
  // 已在正常播放的音效不要动
  if (!audio.paused && !audio.muted) return Promise.resolve()

  const token = audio.sfxToken || 0
  audio.muted = true
  const playPromise = audio.play()

  const finish = () => {
    if (audio.sfxToken !== token) return
    if (!audio.paused && !audio.muted) return
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
  gestureUnlocked = true
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
