<template>
  <div
    ref="cardRef"
    class="card"
    :class="{ active, flipped }"
    :style="dynamicStyles"
  >
    <div class="card__translater">
      <button
        type="button"
        class="card__rotator"
        :aria-label="ariaLabel"
        :aria-expanded="active"
        @click="onCardClick"
      >
        <div class="card__back" aria-hidden="true">
          <div class="card__info" :class="infoLayoutClass">
            <template v-if="showLaterHeader">
              <span class="card__info-side">By TOHC</span>
              <span class="card__info-side">{{ date }}</span>
            </template>
            <span v-else class="card__info-text">评分待解锁</span>
          </div>
          <div class="card__body">
            <img class="card__bg" :src="cardBackSrc" alt="" />
          </div>
        </div>

        <div class="card__front">
          <div class="card__info" :class="infoLayoutClass">
            <template v-if="showLaterHeader">
              <span class="card__info-side">Rate:{{ rate }}</span>
              <span class="card__info-side">¥:{{ displayPrize }}</span>
            </template>
            <template v-else>
              <a
                class="card__info-link"
                href="https://www.xiaohongshu.com/user/profile/69fb3d8e0000000002001c08?xsec_token=ABpN3sUtBdDY6wccECFpZQ9qkfXazFRjUta0KNLon1ocY%3D&xsec_source=pc_search"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
              >{{ active ? '点此跳转购卡' : '购卡前往小红书@TOHC' }}</a>
            </template>
          </div>
          <div class="card__body">
            <img class="card__bg" :src="cardSrc" :alt="`求职卡 ${serial}`" />
          </div>
        </div>
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="imageViewerOpen"
        class="card-image-viewer"
        role="dialog"
        aria-modal="true"
        aria-label="卡片大图"
        @pointerdown.stop
        @click="closeImageViewer"
      >
        <img
          class="card-image-viewer__img"
          :src="viewerSrc"
          :alt="`求职卡 ${serial}`"
          draggable="false"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { round } from '@/utils/math'
import { useSpring } from '@/composables/useSpring'
import cardSfx from '@/assets/audio/card.mp3'
import { getHtmlSfx, playHtmlAudio } from '@/utils/audio'

function playCardAudio() {
  if (muted.value) return
  playHtmlAudio(getHtmlSfx(cardSfx))
}

const props = defineProps({
  id: { type: [String, Number], required: true },
  serial: { type: [String, Number], required: true },
  price: { type: [String, Number], default: '' },
  rate: { type: [String, Number], default: '' },
  prize: { type: [String, Number], default: '' },
  date: { type: [String, Number], default: '' }
})

function hasHeaderValue(value) {
  return value != null && String(value).trim() !== ''
}

const displayPrize = computed(() =>
  hasHeaderValue(props.prize) ? props.prize : props.price
)

const showLaterHeader = computed(
  () =>
    hasHeaderValue(props.rate) &&
    hasHeaderValue(displayPrize.value) &&
    hasHeaderValue(props.date)
)

const infoLayoutClass = computed(() =>
  showLaterHeader.value ? 'card__info--split' : 'card__info--plain'
)

const cardImages = import.meta.glob('@/assets/images/card/*.jpg', {
  eager: true,
  import: 'default'
})

function cardImageSrc(file) {
  const entry = Object.entries(cardImages).find(([path]) => path.endsWith(`/card/${file}`))
  return entry?.[1] ?? ''
}

const cardSrc = computed(() => cardImageSrc(`${props.serial}.jpg`))
const cardBackSrc = computed(() => cardImageSrc(`${props.serial}_back.jpg`))

const activeCardId = inject('activeCardId', ref(null))
const setActiveCardId = inject('setActiveCardId', () => {})
const muted = inject('muted', ref(true))

const CARD_WIDTH = 95
const CARD_HEIGHT = 152
const POPOVER_WIDTH = 179
const POPOVER_HEIGHT = 282
/** 列表态相对「放大尺寸」的缩放；布局始终按 POPOVER 渲染，避免放大时 GPU 糊图 */
const IDLE_SCALE_X = CARD_WIDTH / POPOVER_WIDTH
const IDLE_SCALE_Y = CARD_HEIGHT / POPOVER_HEIGHT
const DOUBLE_TAP_MS = 280

const cardRef = ref(null)
const active = computed(() => activeCardId.value === props.id)
const flipped = ref(false)
const imageViewerOpen = ref(false)
let flipAngle = 0
let repositionTimer = null
let flipTimer = null
let lastTapAt = 0

const springPopover = { stiffness: 0.033, damping: 0.45 }
const springRotateDelta = useSpring({ x: 0, y: 0 }, springPopover)
const springTranslate = useSpring({ x: 0, y: 0 }, springPopover)
const springScale = useSpring({ x: IDLE_SCALE_X, y: IDLE_SCALE_Y }, springPopover)

const viewerSrc = computed(() => (flipped.value ? cardBackSrc.value : cardSrc.value))

const ariaLabel = computed(() => {
  if (!active.value) return `展开求职卡 ${props.serial}`
  if (!flipped.value) return `翻转查看背面：求职卡 ${props.serial}`
  return `翻转回正面：求职卡 ${props.serial}`
})

const dynamicStyles = computed(() => {
  const rotateDelta = springRotateDelta.current.value
  const translate = springTranslate.current.value
  const scale = springScale.current.value

  return {
    // 归一到列表尺寸倍数，供 z-index / translate-z 使用（列表≈1，展开≈1.88）
    '--card-scale': Math.max(scale.x / IDLE_SCALE_X, scale.y / IDLE_SCALE_Y),
    '--card-scale-x': scale.x,
    '--card-scale-y': scale.y,
    '--translate-x': `${translate.x}px`,
    '--translate-y': `${translate.y}px`,
    '--rotate-x': `${rotateDelta.x}deg`
  }
})

function getScreenCenter() {
  const viewport = window.visualViewport
  if (viewport) {
    return {
      x: viewport.offsetLeft + viewport.width / 2,
      y: viewport.offsetTop + viewport.height / 2
    }
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  }
}

function setCenter() {
  const el = cardRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const center = getScreenCenter()
  springTranslate.set({
    x: round(center.x - rect.x - rect.width / 2),
    y: round(center.y - rect.y - rect.height / 2)
  })
}

function clearFlipTimer() {
  if (flipTimer != null) {
    clearTimeout(flipTimer)
    flipTimer = null
  }
}

function openImageViewer() {
  imageViewerOpen.value = true
}

function closeImageViewer() {
  imageViewerOpen.value = false
}

function popover() {
  if (!cardRef.value) return

  flipped.value = false
  flipAngle = 0
  closeImageViewer()
  clearFlipTimer()
  lastTapAt = 0
  setCenter()
  springRotateDelta.set({ x: 0, y: 0 }, { hard: true })
  flipAngle = 360
  springRotateDelta.set({ x: flipAngle, y: 0 })
  springScale.set({ x: 1, y: 1 })
}

function toggleFace() {
  flipAngle += 180
  flipped.value = flipAngle % 360 !== 0
  playCardAudio()
  springRotateDelta.set({ x: flipAngle, y: 0 })
}

function retreat() {
  flipped.value = false
  flipAngle = 0
  closeImageViewer()
  clearFlipTimer()
  lastTapAt = 0
  springScale.set({ x: IDLE_SCALE_X, y: IDLE_SCALE_Y }, { soft: true })
  springTranslate.set({ x: 0, y: 0 }, { soft: true })
  springRotateDelta.set({ x: 0, y: 0 }, { hard: true })
}

function onCardClick() {
  if (!active.value) {
    playCardAudio()
    setActiveCardId(props.id)
    return
  }

  const now = performance.now()
  const isDouble = now - lastTapAt < DOUBLE_TAP_MS
  lastTapAt = now

  if (isDouble) {
    clearFlipTimer()
    lastTapAt = 0
    openImageViewer()
    return
  }

  // 双击判定窗口内暂缓翻面，避免误翻
  clearFlipTimer()
  flipTimer = setTimeout(() => {
    flipTimer = null
    toggleFace()
  }, DOUBLE_TAP_MS)
}

function reposition() {
  clearTimeout(repositionTimer)
  repositionTimer = setTimeout(() => {
    if (active.value) setCenter()
  }, 300)
}

watch(active, (isActive) => {
  if (isActive) {
    requestAnimationFrame(() => popover())
  } else {
    retreat()
  }
})

onMounted(() => {
  window.addEventListener('scroll', reposition, { passive: true })
  window.addEventListener('resize', reposition)
  window.visualViewport?.addEventListener('resize', reposition)
  window.visualViewport?.addEventListener('scroll', reposition)
})

onUnmounted(() => {
  window.removeEventListener('scroll', reposition)
  window.removeEventListener('resize', reposition)
  window.visualViewport?.removeEventListener('resize', reposition)
  window.visualViewport?.removeEventListener('scroll', reposition)
  clearTimeout(repositionTimer)
  clearFlipTimer()
})
</script>

<style lang="scss">
@font-face {
  font-family: 'Dream Han Sans W10';
  src: url('@/assets/fonts/mengyuan/DreamHanSansExpCN-W10.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
</style>

<style scoped lang="scss">
.card {
  --card-scale: 1;
  --card-scale-x: calc(95 / 179);
  --card-scale-y: calc(152 / 282);
  --translate-x: 0px;
  --translate-y: 0px;
  --rotate-x: 0deg;

  position: relative;
  width: 95px;
  height: 152px;
  overflow: visible;
  transform: translate3d(0, 0, 0.01px);
  transform-style: preserve-3d;
  pointer-events: none;
  z-index: calc(var(--card-scale) * 2);
}

.card.active {
  z-index: calc(var(--card-scale) * 120);
  contain: none;
}

.card__translater,
.card__rotator {
  display: grid;
  perspective: 600px;
  transform-origin: center;
  transform-style: preserve-3d;
}

.card__translater {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 179px;
  height: 282px;
  overflow: visible;
  --translate-z: calc(var(--card-scale) * 80px + 0.01px);
  transform: translate3d(
      calc(-50% + var(--translate-x)),
      calc(-50% + var(--translate-y)),
      var(--translate-z)
    )
    scale(var(--card-scale-x), var(--card-scale-y));
}

.card__rotator {
  width: 179px;
  height: 282px;
  padding: 0;
  border: none;
  background: transparent;
  appearance: none;
  cursor: pointer;
  pointer-events: auto;
  overflow: visible;
  transform: rotateY(var(--rotate-x));
  transform-style: preserve-3d;
}

.card.active .card__translater,
.card.active .card__rotator {
  touch-action: none;
}

.card__front,
.card__back {
  grid-area: 1 / 1;
  width: 179px;
  height: 282px;
  pointer-events: none;
  transform-style: preserve-3d;
}

.card__back {
  position: relative;
  display: flex;
  flex-direction: column;
  transform: rotateY(180deg) translateZ(1px);
  backface-visibility: hidden;
}

.card__front {
  position: relative;
  display: flex;
  flex-direction: column;
  background: transparent;
  transform: translate3d(0, 0, 0.01px);
  backface-visibility: hidden;
}

.card__info {
  box-sizing: border-box;
  display: flex;
  width: 179px;
  height: calc(18 * 282px / 152);
  margin-bottom: calc(4 * 282px / 152);
  flex-shrink: 0;
  padding: 0 calc(3 * 179px / 95);
  border: calc(2 * 179px / 95) solid #e50012;
  background: #fff;
  color: #111;
  font-family: 'Dream Han Sans W10', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: calc(6 * 179px / 95);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.02em;
  box-shadow: 0 calc(2 * 179px / 95) calc(6 * 179px / 95) rgba(0, 0, 0, 0.4);
}

.card__info--plain {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.card__info--split {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.card__info-text,
.card__info-side,
.card__info-link {
  display: block;
  white-space: nowrap;
}

.card__info-link {
  color: inherit;
  pointer-events: auto;
  cursor: pointer;
}

.card__body {
  width: 179px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  box-shadow: 0 calc(2 * 179px / 95) calc(6 * 179px / 95) rgba(0, 0, 0, 0.4);
}

.card.active {
  .card__info,
  .card__body {
    box-shadow: none;
  }
}

.card__bg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

<style lang="scss">
.card-image-viewer {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.92);
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

.card-image-viewer__img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}
</style>
