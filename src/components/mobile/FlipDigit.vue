<template>
  <div class="flip-digit" aria-hidden="true">
    <div class="flip-digit__half flip-digit__half--top">
      <span class="flip-digit__inn">{{ flipping ? next : current }}</span>
    </div>
    <div class="flip-digit__half flip-digit__half--bottom">
      <span class="flip-digit__inn">{{ current }}</span>
    </div>
    <template v-if="flipping">
      <div class="flip-digit__flap flip-digit__flap--top">
        <span class="flip-digit__inn">{{ current }}</span>
      </div>
      <div class="flip-digit__flap flip-digit__flap--bottom">
        <span class="flip-digit__inn">{{ next }}</span>
      </div>
    </template>
    <i class="flip-digit__hinge" />
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const FLIP_MS = 560

const props = defineProps({
  digit: {
    type: [String, Number],
    required: true
  }
})

const current = ref(String(props.digit))
const next = ref(String(props.digit))
const flipping = ref(false)

let pending = null
let flipTimer = null

function clearFlipTimer() {
  if (flipTimer != null) {
    clearTimeout(flipTimer)
    flipTimer = null
  }
}

function finishFlip() {
  current.value = next.value
  flipping.value = false
  flipTimer = null

  if (pending != null && pending !== current.value) {
    const queued = pending
    pending = null
    nextTick(() => startFlip(queued))
    return
  }

  pending = null
}

function startFlip(value) {
  if (value === current.value && !flipping.value) return

  if (flipping.value) {
    pending = value
    return
  }

  next.value = value
  flipping.value = true
  clearFlipTimer()
  flipTimer = window.setTimeout(finishFlip, FLIP_MS)
}

watch(
  () => String(props.digit),
  (value) => {
    startFlip(value)
  }
)

onBeforeUnmount(clearFlipTimer)
</script>

<style lang="scss">
@font-face {
  font-family: 'Bebas Neue';
  src: url('@/assets/fonts/BebasNeue-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
</style>

<style scoped lang="scss">
.flip-digit {
  position: relative;
  width: 15px;
  height: 24px;
  flex-shrink: 0;
  perspective: 72px;
  transform-style: preserve-3d;
}

.flip-digit__half,
.flip-digit__flap {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  background: url('@/assets/images/mobile/home/countdown.svg') no-repeat;
  background-size: 15px 24px;
}

.flip-digit__half--top,
.flip-digit__flap--top {
  top: 0;
  background-position: top center;
  border-radius: 3px 3px 0 0;
}

.flip-digit__half--bottom,
.flip-digit__flap--bottom {
  bottom: 0;
  background-position: bottom center;
  border-radius: 0 0 3px 3px;
}

.flip-digit__half--top,
.flip-digit__half--bottom {
  z-index: 1;
}

.flip-digit__flap {
  backface-visibility: hidden;
}

.flip-digit__flap--top {
  z-index: 4;
  transform-origin: center bottom;
  animation: countdown-flip-top 0.28s ease-in forwards;
}

.flip-digit__flap--bottom {
  z-index: 3;
  transform-origin: center top;
  transform: rotateX(90deg);
  animation: countdown-flip-bottom 0.28s ease-out 0.28s forwards;
}

.flip-digit__flap--top::after,
.flip-digit__flap--bottom::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.flip-digit__flap--top::after {
  background: #000;
  opacity: 0;
  animation: countdown-flip-shade-in 0.28s ease-in forwards;
}

.flip-digit__flap--bottom::after {
  background: #000;
  opacity: 0.4;
  animation: countdown-flip-shade-out 0.28s ease-out 0.28s forwards;
}

.flip-digit__inn {
  position: absolute;
  left: 0;
  width: 100%;
  height: 200%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 21px;
  font-weight: 400;
  line-height: 0.75;
  color: #111;
  transform: translateY(1px);
}

.flip-digit__half--top .flip-digit__inn,
.flip-digit__flap--top .flip-digit__inn {
  top: 0;
}

.flip-digit__half--bottom .flip-digit__inn,
.flip-digit__flap--bottom .flip-digit__inn {
  top: -100%;
}

.flip-digit__hinge {
  position: absolute;
  left: 1px;
  right: 1px;
  top: 50%;
  z-index: 5;
  height: 1px;
  margin-top: 0;
  background: rgba(6, 0, 1, 0.28);
  pointer-events: none;
}

@keyframes countdown-flip-top {
  from {
    transform: rotateX(0deg);
  }

  to {
    transform: rotateX(-90deg);
  }
}

@keyframes countdown-flip-bottom {
  from {
    transform: rotateX(90deg);
  }

  to {
    transform: rotateX(0deg);
  }
}

@keyframes countdown-flip-shade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 0.45;
  }
}

@keyframes countdown-flip-shade-out {
  from {
    opacity: 0.4;
  }

  to {
    opacity: 0;
  }
}
</style>
