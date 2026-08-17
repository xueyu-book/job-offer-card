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
          <div class="card__back-inner">
            <span class="card__back-logo">求职卡</span>
            <span class="card__back-mark">JOB OFFER</span>
            <p class="card__back-hint">点击返回正面</p>
          </div>
        </div>

        <div class="card__front">
          <div class="card__front-top">
            <span class="card__badge">{{ badge }}</span>
            <span class="card__salary">{{ salary }}</span>
          </div>
          <h3 class="card__title">{{ title }}</h3>
          <p class="card__company">{{ company }}</p>
          <ul v-if="tags.length" class="card__tags">
            <li v-for="tag in tags" :key="tag">{{ tag }}</li>
          </ul>
          <p class="card__hint">{{ frontHint }}</p>
          <div class="card__shine" />
          <div class="card__glare" />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { clamp, round } from '@/utils/math'
import { useSpring } from '@/composables/useSpring'

const props = defineProps({
  id: { type: [String, Number], required: true },
  title: { type: String, default: '前端工程师' },
  company: { type: String, default: '星尘科技' },
  salary: { type: String, default: '25-40K' },
  badge: { type: String, default: '热招' },
  tags: { type: Array, default: () => ['北京', '本科', '3-5年'] },
  glow: { type: String, default: 'hsl(210, 90%, 60%)' }
})

const activeCardId = inject('activeCardId', ref(null))
const setActiveCardId = inject('setActiveCardId', () => {})

const cardRef = ref(null)
const active = computed(() => activeCardId.value === props.id)
const interacting = ref(false)
/** 居中后是否已翻到背面 */
const flipped = ref(false)
/** 累计旋转角（180 的倍数），保证每次都是正向翻转 */
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

const frontHint = computed(() => {
  if (!active.value) return '点击放大居中'
  if (!flipped.value) return '点击查看背面'
  return ''
})

const ariaLabel = computed(() => {
  if (!active.value) return `展开求职卡：${props.title}`
  if (!flipped.value) return `翻转查看背面：${props.title}`
  return `翻转回正面：${props.title}`
})

const dynamicStyles = computed(() => {
  const glare = springGlare.current.value
  const rotate = springRotate.current.value
  const rotateDelta = springRotateDelta.current.value
  const translate = springTranslate.current.value

  return {
    '--card-glow': props.glow,
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

/** 第一阶段：旋转放大居中，最终停在正面 */
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
  // 转一整圈后仍显示正面
  flipAngle = 360
  springRotateDelta.set({ x: flipAngle, y: 0 })
  springScale.set(Math.min(scaleW, scaleH, scaleF))
  interactEnd(null, 1000)
}

/** 第二阶段：在居中态下翻到背面 / 翻回正面 */
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
    // 第一阶段：打开并居中
    setActiveCardId(props.id)
    return
  }
  // 第二阶段：翻转正背面
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

<style scoped lang="scss">
.card {
  --card-aspect: 0.718;
  --card-radius: 18px;
  --card-edge: hsl(47, 100%, 78%);
  --card-back: hsl(215, 72%, 22%);
  --card-glow: hsl(210, 90%, 60%);
  --pointer-x: 50%;
  --pointer-y: 50%;
  --card-scale: 1;
  --card-opacity: 0;
  --translate-x: 0px;
  --translate-y: 0px;
  --rotate-x: 0deg;
  --rotate-y: 0deg;

  position: relative;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  aspect-ratio: var(--card-aspect);
  border-radius: var(--card-radius);
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
  position: relative;
  --translate-z: calc(var(--card-scale) * 150px + 0.01px);
  transform: translate3d(var(--translate-x), var(--translate-y), var(--translate-z))
    scale(var(--card-scale));
}

.card__rotator {
  aspect-ratio: var(--card-aspect);
  border-radius: var(--card-radius);
  padding: 0;
  border: none;
  background: transparent;
  appearance: none;
  cursor: pointer;
  pointer-events: auto;
  transform: rotateY(var(--rotate-x)) rotateX(var(--rotate-y));
  transform-style: preserve-3d;
  box-shadow:
    0 0 3px -1px transparent,
    0 0 2px 1px transparent,
    0 0 5px 0 transparent,
    0 10px 20px -5px rgba(0, 0, 0, 0.45),
    0 2px 15px -5px rgba(0, 0, 0, 0.35);
  transition: box-shadow 0.4s ease;
}

.card.active .card__rotator,
.card__rotator:focus-visible {
  box-shadow:
    0 0 3px -1px #fff,
    0 0 3px 1px var(--card-edge),
    0 0 12px 2px var(--card-glow),
    0 10px 20px -5px rgba(0, 0, 0, 0.55),
    0 0 40px -30px var(--card-glow),
    0 0 50px -20px var(--card-glow);
}

.card.active .card__translater,
.card.active .card__rotator {
  touch-action: none;
}

.card__front,
.card__back {
  grid-area: 1 / 1;
  width: 100%;
  aspect-ratio: var(--card-aspect);
  border-radius: var(--card-radius);
  overflow: hidden;
  pointer-events: none;
  transform-style: preserve-3d;
}

.card__back {
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.12), transparent 45%),
    radial-gradient(circle at 70% 80%, rgba(96, 165, 250, 0.25), transparent 40%),
    linear-gradient(145deg, #0b1f3a 0%, #153a66 45%, #0d2748 100%);
  transform: rotateY(180deg) translateZ(1px);
  display: grid;
  place-items: center;
  color: #e8f1ff;
  backface-visibility: hidden;
}

.card__back-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.card__back-logo {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.card__back-mark {
  font-size: 14px;
  letter-spacing: 0.28em;
  opacity: 0.7;
}

.card__back-hint {
  margin-top: 16px;
  font-size: 13px;
  opacity: 0.65;
}

.card__front {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 28px 24px;
  color: #f8fafc;
  background:
    linear-gradient(180deg, transparent 0%, rgba(8, 15, 30, 0.55) 45%, rgba(8, 15, 30, 0.92) 100%),
    linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 42%, #22d3ee 100%);
  transform: translate3d(0, 0, 0.01px);
  backface-visibility: hidden;
}

.card__front-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.card__badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 14px;
  backdrop-filter: blur(6px);
}

.card__salary {
  font-size: 22px;
  font-weight: 700;
}

.card__title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 8px;
}

.card__company {
  font-size: 18px;
  opacity: 0.88;
  margin-bottom: 16px;
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin-bottom: 20px;
}

.card__tags li {
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 13px;
}

.card__hint {
  font-size: 13px;
  opacity: 0.65;
}

.card__shine,
.card__glare {
  position: absolute;
  inset: 0;
  border-radius: var(--card-radius);
  pointer-events: none;
}

.card__shine {
  transform: translateZ(1px);
  background: linear-gradient(
    115deg,
    transparent 40%,
    rgba(255, 255, 255, 0.35) 45%,
    transparent 55%
  );
  background-size: 200% 200%;
  background-position: var(--pointer-x) var(--pointer-y);
  mix-blend-mode: color-dodge;
  opacity: var(--card-opacity);
  filter: brightness(0.9) contrast(1.4);
}

.card__glare {
  transform: translateZ(1.41px);
  background-image: radial-gradient(
    farthest-corner circle at var(--pointer-x) var(--pointer-y),
    hsla(0, 0%, 100%, 0.8) 10%,
    hsla(0, 0%, 100%, 0.45) 20%,
    hsla(0, 0%, 0%, 0.45) 90%
  );
  mix-blend-mode: overlay;
  opacity: var(--card-opacity);
}
</style>
