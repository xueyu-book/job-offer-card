<template>
  <div
    ref="cardRef"
    class="card"
    :class="{ active, interacting, flipped }"
    :style="dynamicStyles"
  >
    <div class="card__translater">
      <button
        type="button"
        class="card__rotator"
        :aria-label="ariaLabel"
        :aria-expanded="active"
        @click="onCardClick"
        @pointermove="interact"
        @pointerleave="interactEnd"
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
              <span class="card__info-line">购卡请前往小红书账号</span>
              <span class="card__info-line">TheOtherHandClub</span>
            </template>
          </div>
          <div class="card__body">
            <img class="card__bg" :src="cardSrc" :alt="`求职卡 ${serial}`" />
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { clamp, round } from '@/utils/math'
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

const cardImages = import.meta.glob('@/assets/images/web/card/*.jpg', {
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

const cardRef = ref(null)
const active = computed(() => activeCardId.value === props.id)
const interacting = ref(false)
const flipped = ref(false)
let flipAngle = 0

let rafId = null
let pendingUpdate = null
let repositionTimer = null

const springInteract = { stiffness: 0.066, damping: 0.25 }
const springPopover = { stiffness: 0.033, damping: 0.45 }

const springRotate = useSpring({ x: 0, y: 0 }, springInteract)
const springGlare = useSpring({ x: 50, y: 50, o: 0 }, springInteract)
const springRotateDelta = useSpring({ x: 0, y: 0 }, springPopover)
const springTranslate = useSpring({ x: 0, y: 0 }, springPopover)
const springScale = useSpring(1, springPopover)

const ariaLabel = computed(() => {
  if (!active.value) return `展开求职卡 ${props.serial}`
  if (!flipped.value) return `翻转查看背面：求职卡 ${props.serial}`
  return `翻转回正面：求职卡 ${props.serial}`
})

const dynamicStyles = computed(() => {
  const glare = springGlare.current.value
  const rotate = springRotate.current.value
  const rotateDelta = springRotateDelta.current.value
  const translate = springTranslate.current.value

  return {
    '--pointer-x': `${glare.x}%`,
    '--pointer-y': `${glare.y}%`,
    '--card-opacity': glare.o,
    '--rotate-x': `${rotate.x + rotateDelta.x}deg`,
    '--rotate-y': `${rotate.y + rotateDelta.y}deg`,
    '--card-scale': springScale.current.value,
    '--translate-x': `${translate.x}px`,
    '--translate-y': `${translate.y}px`
  }
})

function updateSprings(rotate, glare) {
  springRotate.setStiffness(springInteract.stiffness)
  springRotate.setDamping(springInteract.damping)
  springGlare.setStiffness(springInteract.stiffness)
  springGlare.setDamping(springInteract.damping)
  springRotate.set(rotate)
  springGlare.set(glare)
}

function interact(e) {
  if (activeCardId.value && activeCardId.value !== props.id) {
    interacting.value = false
    return
  }

  interacting.value = true

  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const absolute = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  const percent = {
    x: clamp(round((100 / rect.width) * absolute.x)),
    y: clamp(round((100 / rect.height) * absolute.y))
  }
  const center = {
    x: percent.x - 50,
    y: percent.y - 50
  }

  pendingUpdate = {
    rotate: {
      x: round(-(center.x / 3.5)),
      y: round(center.y / 3.5)
    },
    glare: {
      x: round(percent.x),
      y: round(percent.y),
      o: 1
    }
  }

  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      if (pendingUpdate) {
        updateSprings(pendingUpdate.rotate, pendingUpdate.glare)
        pendingUpdate = null
      }
      rafId = null
    })
  }
}

function interactEnd(_e, delay = 500) {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  pendingUpdate = null

  setTimeout(() => {
    interacting.value = false
    springRotate.setStiffness(0.01)
    springRotate.setDamping(0.06)
    springRotate.set({ x: 0, y: 0 }, { soft: 1 })
    springGlare.setStiffness(0.01)
    springGlare.setDamping(0.06)
    springGlare.set({ x: 50, y: 50, o: 0 }, { soft: 1 })
  }, delay)
}

function setCenter() {
  const el = cardRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const view = document.documentElement
  springTranslate.set({
    x: round(view.clientWidth / 2 - rect.x - rect.width / 2),
    y: round(view.clientHeight / 2 - rect.y - rect.height / 2)
  })
}

function popover() {
  const el = cardRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const scaleW = (window.innerWidth / rect.width) * 0.9
  const scaleH = (window.innerHeight / rect.height) * 0.9
  const scaleF = 1.75

  flipped.value = false
  flipAngle = 0
  setCenter()
  springRotateDelta.set({ x: 0, y: 0 }, { hard: true })
  flipAngle = 360
  springRotateDelta.set({ x: flipAngle, y: 0 })
  springScale.set(Math.min(scaleW, scaleH, scaleF))
  interactEnd(null, 1000)
}

function toggleFace() {
  flipAngle += 180
  flipped.value = flipAngle % 360 !== 0
  springRotateDelta.set({ x: flipAngle, y: 0 })
  interactEnd(null, 600)
}

function retreat() {
  flipped.value = false
  flipAngle = 0
  springScale.set(1, { soft: true })
  springTranslate.set({ x: 0, y: 0 }, { soft: true })
  springRotateDelta.set({ x: 0, y: 0 }, { hard: true })
  interactEnd(null, 100)
}

function onCardClick() {
  if (!active.value) {
    playCardAudio()
    setActiveCardId(props.id)
    return
  }
  toggleFace()
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
})

onUnmounted(() => {
  window.removeEventListener('scroll', reposition)
  window.removeEventListener('resize', reposition)
  clearTimeout(repositionTimer)
  if (rafId !== null) cancelAnimationFrame(rafId)
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
  --card-edge: #e50012;
  --pointer-x: 50%;
  --pointer-y: 50%;
  --card-scale: 1;
  --card-opacity: 0;
  --translate-x: 0px;
  --translate-y: 0px;
  --rotate-x: 0deg;
  --rotate-y: 0deg;

  position: relative;
  width: 188px;
  height: 300px;
  overflow: visible;
  transform: translate3d(0, 0, 0.01px);
  transform-style: preserve-3d;
  pointer-events: none;
  z-index: calc(var(--card-scale) * 2);
  will-change: transform, visibility, z-index;
}

.card.interacting,
.card.active {
  z-index: calc(var(--card-scale) * 120);
}

.card.active {
  contain: none;
  will-change: auto;
}

.card__translater,
.card__rotator {
  display: grid;
  perspective: 600px;
  transform-origin: center;
  transform-style: preserve-3d;
  will-change: transform, box-shadow;
}

.card__translater {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: visible;
  --translate-z: calc(var(--card-scale) * 150px + 0.01px);
  transform: translate3d(var(--translate-x), var(--translate-y), var(--translate-z))
    scale(var(--card-scale));
}

.card__rotator {
  width: 188px;
  height: 300px;
  padding: 0;
  border: none;
  background: transparent;
  appearance: none;
  cursor: pointer;
  pointer-events: auto;
  overflow: visible;
  transform: rotateY(var(--rotate-x)) rotateX(var(--rotate-y));
  transform-style: preserve-3d;
}

.card.active .card__translater,
.card.active .card__rotator {
  touch-action: none;
}

.card__front,
.card__back {
  grid-area: 1 / 1;
  width: 188px;
  height: 300px;
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
  width: 188px;
  height: 36px;
  margin-bottom: 8px;
  flex-shrink: 0;
  padding: 0 8px;
  border: 4px solid #e50012;
  background: #fff;
  color: #111;
  font-family: 'Dream Han Sans W10', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 8pt;
  font-weight: 400;
  line-height: 1.15;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.35s ease;
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

.card__info-line,
.card__info-text,
.card__info-side {
  display: block;
  white-space: nowrap;
}

.card__body {
  width: 188px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.35s ease;
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
