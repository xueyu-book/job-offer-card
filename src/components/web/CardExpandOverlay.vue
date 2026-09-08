<template>
  <Teleport to="body">
    <div
      v-if="rendered"
      class="card-expand-overlay"
      :class="{ 'is-leaving': leaving }"
      role="dialog"
      aria-modal="true"
      aria-label="卡片放大"
    >
      <button
        type="button"
        class="card-expand-overlay__backdrop"
        aria-label="关闭"
        :disabled="leaving"
        @click="requestClose"
      />
      <div
        class="card-expand-overlay__stage"
        :style="{ width: `${stageWidth}px`, height: `${stageHeight}px` }"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onUnmounted, ref, watch } from 'vue'

/** 蒙层淡出 + 卡片回位缓冲时长 */
const CLOSE_MS = 560

const props = defineProps({
  visible: { type: Boolean, default: false },
  stageWidth: { type: Number, default: 188 },
  stageHeight: { type: Number, default: 300 }
})

const emit = defineEmits(['close', 'leave'])

const rendered = ref(false)
const leaving = ref(false)

let previousOverflow = ''
let previousPaddingRight = ''
let locked = false
let closeTimer = null

function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth
}

function lockScroll() {
  if (locked || typeof document === 'undefined') return
  const { body } = document
  previousOverflow = body.style.overflow
  previousPaddingRight = body.style.paddingRight
  const scrollbarWidth = getScrollbarWidth()
  body.style.overflow = 'hidden'
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`
  }
  locked = true
}

function unlockScroll() {
  if (!locked || typeof document === 'undefined') return
  const { body } = document
  body.style.overflow = previousOverflow
  body.style.paddingRight = previousPaddingRight
  locked = false
}

function clearCloseTimer() {
  if (closeTimer == null) return
  window.clearTimeout(closeTimer)
  closeTimer = null
}

function finishClose() {
  clearCloseTimer()
  leaving.value = false
  rendered.value = false
  unlockScroll()
  window.removeEventListener('keydown', onKeydown)
  emit('close')
}

function requestClose() {
  if (!rendered.value || leaving.value) return

  leaving.value = true
  emit('leave')
  clearCloseTimer()
  closeTimer = window.setTimeout(finishClose, CLOSE_MS)
}

function onKeydown(event) {
  if (event.key === 'Escape') requestClose()
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      clearCloseTimer()
      leaving.value = false
      rendered.value = true
      lockScroll()
      window.addEventListener('keydown', onKeydown)
      return
    }

    // 离场动画进行中：等 finishClose
    if (leaving.value) return

    // 外部直接关掉：走同一套离场缓冲
    if (rendered.value) {
      requestClose()
      return
    }

    unlockScroll()
    window.removeEventListener('keydown', onKeydown)
  },
  { immediate: true }
)

onUnmounted(() => {
  clearCloseTimer()
  unlockScroll()
  window.removeEventListener('keydown', onKeydown)
})

defineExpose({
  requestClose
})
</script>

<style scoped lang="scss">
.card-expand-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-expand-overlay__backdrop {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  border: none;
  background: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  appearance: none;
  opacity: 1;
  transition: opacity 0.56s ease;
}

.card-expand-overlay.is-leaving {
  pointer-events: none;

  .card-expand-overlay__backdrop {
    opacity: 0;
    cursor: default;
  }

  .card-expand-overlay__stage {
    pointer-events: none;
  }
}

.card-expand-overlay__stage {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  :deep(.card) {
    pointer-events: auto;
  }
}
</style>
