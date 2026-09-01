<template>
  <section
    class="mobile-section card-showcase-section"
    :class="{ active: activeCardId !== null }"
  >
    <div
      v-if="!wallSettled"
      class="card-showcase-section__wall"
      :class="{ 'card-showcase-section__wall--sliding': wallSliding }"
      aria-hidden="true"
    >
      <img
        class="card-showcase-section__wall-panel card-showcase-section__wall-panel--top"
        src="@/assets/images/mobile/home/wall_top.svg"
        alt=""
      />
      <img
        class="card-showcase-section__wall-panel card-showcase-section__wall-panel--bottom"
        src="@/assets/images/mobile/home/wall_bottom.svg"
        alt=""
      />
    </div>
    <div
      ref="scrollerRef"
      class="card-showcase-section__scroller"
      @scroll="onScroll"
    >
      <div class="card-showcase-section__grid">
        <div
          v-for="(card, index) in cardList"
          :key="card.id"
          class="card-showcase-section__item"
          :class="{
            'card-showcase-section__item--revealed': cardsRevealed,
            'card-showcase-section__item--settled': cardsSettled,
            'card-showcase-section__item--active': activeCardId === card.id
          }"
          :style="getCardItemStyle(index)"
        >
          <ShowcaseOfferCard
            :id="card.id"
            :serial="card.serial"
            :price="card.price"
            :rate="card.rate"
            :prize="card.prize"
            :date="card.date"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import ShowcaseOfferCard from './ShowcaseOfferCard.vue'
import { cardList } from '@/content/cardShowcaseContent'
import wallSfx from '@/assets/audio/wall.mp3'
import { createStandaloneSfx, requestAudioPermission, runWithWeChatAudioUnlock } from '@/utils/audio'

const CARD_HEIGHT = 152
const ROW_GAP = 21
const ROW_STEP = CARD_HEIGHT + ROW_GAP
const WALL_SLIDE_DURATION_MS = 2000
const CARD_GRID_COLUMNS = 2
const CARD_REVEAL_STAGGER_ROW_MS = 55
const CARD_REVEAL_STAGGER_COL_MS = 30
const CARD_REVEAL_DURATION_MS = 750

const activeCardId = inject('activeCardId', ref(null))
const splashDone = inject('splashDone', ref(true))
const muted = inject('muted', ref(true))
const registerUnmuteHandler = inject('registerUnmuteHandler', null)
const scrollerRef = ref(null)
const wallSliding = ref(false)
const wallSettled = ref(false)
const cardsRevealed = ref(false)
const cardsSettled = ref(false)

const AUDIO_UNLOCK_EVENTS = ['pointerdown', 'touchstart', 'keydown']

let snapTimer = null
let programmatic = false
let programmaticTimer = null
let wallSettleTimer = null
let cardSettleTimer = null
let revealFrame = null
let wallAudio = null
let wallSoundPlaying = false
let wallSoundStarted = false
let pendingWallSound = false
let audioUnlockBound = false
let unregisterUnmuteHandler = null

function getCardItemStyle(index) {
  const row = Math.floor(index / CARD_GRID_COLUMNS)
  const col = index % CARD_GRID_COLUMNS

  return {
    '--card-reveal-delay': `${row * CARD_REVEAL_STAGGER_ROW_MS + col * CARD_REVEAL_STAGGER_COL_MS}ms`
  }
}

function getCardRevealTotalMs() {
  const lastIndex = Math.max(cardList.length - 1, 0)
  const row = Math.floor(lastIndex / CARD_GRID_COLUMNS)
  const col = lastIndex % CARD_GRID_COLUMNS
  return (
    row * CARD_REVEAL_STAGGER_ROW_MS +
    col * CARD_REVEAL_STAGGER_COL_MS +
    CARD_REVEAL_DURATION_MS
  )
}

function resetCardsReveal() {
  cardsRevealed.value = false
  cardsSettled.value = false

  if (revealFrame) {
    cancelAnimationFrame(revealFrame)
    revealFrame = null
  }
  if (cardSettleTimer !== null) {
    window.clearTimeout(cardSettleTimer)
    cardSettleTimer = null
  }
}

function triggerCardsReveal() {
  resetCardsReveal()

  nextTick(() => {
    revealFrame = requestAnimationFrame(() => {
      revealFrame = requestAnimationFrame(() => {
        cardsRevealed.value = true
        revealFrame = null
        cardSettleTimer = window.setTimeout(() => {
          cardsSettled.value = true
          cardSettleTimer = null
        }, getCardRevealTotalMs())
      })
    })
  })
}

function clampScrollTop(top) {
  const el = scrollerRef.value
  if (!el) return 0
  const max = Math.max(el.scrollHeight - el.clientHeight, 0)
  return Math.min(Math.max(0, top), max)
}

function nearestRowTop(scrollTop) {
  return clampScrollTop(Math.round(scrollTop / ROW_STEP) * ROW_STEP)
}

function scrollToTop(top, behavior = 'smooth') {
  const el = scrollerRef.value
  if (!el) return

  const next = clampScrollTop(top)
  if (Math.abs(el.scrollTop - next) < 1) return

  programmatic = true
  clearTimeout(programmaticTimer)
  el.scrollTo({ top: next, behavior })
  programmaticTimer = setTimeout(() => {
    programmatic = false
  }, behavior === 'smooth' ? 450 : 0)
}

function snapToNearestRow() {
  const el = scrollerRef.value
  if (!el || programmatic || activeCardId.value != null) return

  const target = nearestRowTop(el.scrollTop)
  if (Math.abs(el.scrollTop - target) < 1) return
  scrollToTop(target)
}

function scheduleSnap() {
  if (programmatic || activeCardId.value != null) return
  clearTimeout(snapTimer)
  snapTimer = setTimeout(snapToNearestRow, 180)
}

function onScroll() {
  scheduleSnap()
}

function onScrollEnd() {
  clearTimeout(snapTimer)
  snapToNearestRow()
}

function ensureWallAudio() {
  if (wallAudio) return wallAudio
  // 独立 Audio，不进全局 htmlAudios，避免解锁逻辑 pause 掉 wall
  wallAudio = createStandaloneSfx(wallSfx)
  return wallAudio
}

function primeWallAudioInGesture() {
  const audio = ensureWallAudio()
  const unlockToken = audio.sfxToken || 0
  audio.muted = true
  audio.volume = 0
  const playPromise = audio.play()
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise
      .then(() => {
        if (audio.sfxToken !== unlockToken) return
        audio.pause()
        try {
          audio.currentTime = 0
        } catch {
          // 元数据未就绪时忽略
        }
        audio.muted = false
        audio.volume = 1
      })
      .catch(() => {
        audio.muted = false
        audio.volume = 1
      })
    return
  }
  audio.pause()
  audio.muted = false
  audio.volume = 1
}

function stopWallAudio() {
  if (!wallAudio) return
  wallAudio.sfxToken = (wallAudio.sfxToken || 0) + 1
  wallAudio.pause()
  try {
    wallAudio.currentTime = 0
  } catch {
    // 元数据未就绪时忽略
  }
  wallSoundPlaying = false
}

function playWallAudio() {
  if (wallSoundStarted) return

  if (muted.value) {
    pendingWallSound = true
    return
  }

  const audio = ensureWallAudio()
  audio.sfxToken = (audio.sfxToken || 0) + 1
  const token = audio.sfxToken

  try {
    audio.pause()
    audio.currentTime = 0
  } catch {
    // 元数据未就绪时忽略
  }

  audio.muted = false
  audio.volume = 1

  const playPromise = audio.play()
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise
      .then(() => {
        if (audio.sfxToken !== token) return
        // 部分 WebKit resolve 后仍是 paused（自动播放被静默拒绝）
        if (audio.paused) {
          wallSoundPlaying = false
          pendingWallSound = true
          return
        }
        wallSoundPlaying = true
        wallSoundStarted = true
        pendingWallSound = false
      })
      .catch(() => {
        if (audio.sfxToken !== token) return
        wallSoundPlaying = false
        pendingWallSound = true
      })
    return
  }

  wallSoundPlaying = true
  wallSoundStarted = true
  pendingWallSound = false
}

function onAudioUnlockGesture() {
  // 刷新后浏览器禁止自动播放：先在手势里唤醒 wall 元素
  if (!wallSoundStarted) {
    if (!muted.value && splashDone.value) {
      playWallAudio()
    } else {
      primeWallAudioInGesture()
      if (!muted.value) pendingWallSound = true
    }
  }

  requestAudioPermission()
}

/** 微信浮窗切换等可见性变化时，若尚未成功播放则补播 */
function onVisibilityChange() {
  if (muted.value || wallSoundStarted) return
  if (!splashDone.value && !pendingWallSound) return
  playWallAudio()
}

function bindAudioUnlock() {
  if (audioUnlockBound || typeof window === 'undefined') return

  audioUnlockBound = true
  AUDIO_UNLOCK_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, onAudioUnlockGesture, {
      capture: true,
      passive: true
    })
  })
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('pageshow', onVisibilityChange)
  window.addEventListener('focus', onVisibilityChange)
}

function unbindAudioUnlock() {
  if (!audioUnlockBound || typeof window === 'undefined') return

  audioUnlockBound = false
  AUDIO_UNLOCK_EVENTS.forEach((eventName) => {
    window.removeEventListener(eventName, onAudioUnlockGesture, { capture: true })
  })
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('pageshow', onVisibilityChange)
  window.removeEventListener('focus', onVisibilityChange)
}

function startWallSplit() {
  if (wallSliding.value || wallSettled.value) return

  wallSoundStarted = false
  pendingWallSound = true
  // 微信内用 JSBridge 解锁后播放，避免刷新后无手势导致开墙无声、收起页面才补播
  runWithWeChatAudioUnlock(() => {
    playWallAudio()
  })
  triggerCardsReveal()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      wallSliding.value = true
      wallSettleTimer = window.setTimeout(() => {
        wallSettled.value = true
        wallSettleTimer = null
      }, WALL_SLIDE_DURATION_MS)
    })
  })
}

ensureWallAudio()
bindAudioUnlock()

watch(
  splashDone,
  (done) => {
    if (!done) return
    startWallSplit()
  },
  { immediate: true }
)

watch(muted, (isMuted) => {
  if (isMuted) {
    stopWallAudio()
    return
  }

  if (splashDone.value && !wallSoundStarted) {
    runWithWeChatAudioUnlock(() => {
      playWallAudio()
    })
  }
})

onMounted(() => {
  scrollerRef.value?.addEventListener('scrollend', onScrollEnd)
  // 开声音按钮点击栈内同步补播（不能只靠 watch，真机手势会丢）
  unregisterUnmuteHandler = registerUnmuteHandler?.(() => {
    if (!wallSoundStarted) playWallAudio()
  }) || null

  // 微信 Bridge 晚于开墙动画就绪时再补一次
  runWithWeChatAudioUnlock(() => {
    if (!muted.value && splashDone.value && !wallSoundStarted) {
      playWallAudio()
    }
  })
})

onUnmounted(() => {
  scrollerRef.value?.removeEventListener('scrollend', onScrollEnd)
  clearTimeout(snapTimer)
  clearTimeout(programmaticTimer)
  if (wallSettleTimer !== null) {
    window.clearTimeout(wallSettleTimer)
  }
  resetCardsReveal()
  unbindAudioUnlock()
  unregisterUnmuteHandler?.()
  unregisterUnmuteHandler = null
  pendingWallSound = false
  wallSoundPlaying = false
  wallSoundStarted = false
  stopWallAudio()
  wallAudio = null
})
</script>

<style scoped lang="scss">
$wall-slide-duration: 2s;
$wall-mechanism-easing: cubic-bezier(0.58, 0, 0.72, 0.82);
$wall-seam-overlap: 1px;
$card-reveal-duration: 0.75s;

.mobile-section {
  width: 297px;
  height: 489px;
  flex-shrink: 0;
  background-color: #251714;
  background-image: url('@/assets/images/mobile/home/section.svg');
  background-position: center center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.card-showcase-section {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  position: relative;
}

.card-showcase-section.active {
  z-index: 120;
  overflow: visible;

  .card-showcase-section__scroller {
    overflow: hidden;
  }

  .card-showcase-section__item:not(.card-showcase-section__item--active) {
    pointer-events: none;
  }
}

.card-showcase-section__wall {
  position: absolute;
  inset: 0;
  z-index: 5;
  overflow: hidden;
  pointer-events: none;
}

.card-showcase-section__wall-panel {
  position: absolute;
  left: 0;
  width: 100%;
  height: calc(50% + #{$wall-seam-overlap});
  object-fit: fill;
  user-select: none;
  pointer-events: none;
  will-change: transform;
  transition: transform $wall-slide-duration $wall-mechanism-easing;

  &--top {
    top: 0;
  }

  &--bottom {
    bottom: 0;
  }
}

.card-showcase-section__wall--sliding {
  .card-showcase-section__wall-panel--top {
    transform: translateY(-100%);
  }

  .card-showcase-section__wall-panel--bottom {
    transform: translateY(100%);
  }
}

.card-showcase-section__scroller {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.card-showcase-section__grid {
  display: grid;
  grid-template-columns: repeat(2, 95px);
  gap: 21px 42px;
  justify-content: center;
  position: relative;
  transform-style: preserve-3d;
}

.card-showcase-section__item {
  width: 95px;
  height: 152px;
  transform-style: preserve-3d;
  opacity: 0;
  transform: translateX(-8px) scale(0.92);
  transition:
    opacity $card-reveal-duration ease-out,
    transform $card-reveal-duration cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--card-reveal-delay, 0ms), var(--card-reveal-delay, 0ms);
}

.card-showcase-section__item--revealed {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.card-showcase-section__item--settled {
  transform: none;
  transition: none;
}

.card-showcase-section__item--active {
  z-index: 1;
  overflow: visible;
}
</style>
