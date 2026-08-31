<template>
  <Teleport to="body">
    <div
      v-if="visible"
      :key="playKey"
      class="splash-screen"
      :class="{
        'splash-screen--mobile': isMobile,
        'splash-screen--leaving': leaving
      }"
      role="dialog"
      aria-modal="true"
      aria-label="开屏"
    >
      <div class="splash-screen__stage" aria-hidden="true" />
      <img
        class="icon-deco-1"
        src="@/assets/images/splash/1.svg"
        alt=""
      />
      <img
        class="icon-deco-2"
        src="@/assets/images/splash/2.svg"
        alt=""
      />
      <img
        class="icon-deco-3"
        src="@/assets/images/splash/3.svg"
        alt=""
      />
      <img
        class="icon-deco-4"
        src="@/assets/images/splash/3.svg"
        alt=""
      />
      <img
        class="icon-deco-5"
        src="@/assets/images/splash/2.svg"
        alt=""
      />
      <img
        class="icon-deco-6"
        src="@/assets/images/splash/1.svg"
        alt=""
      />
      <img
        src="@/assets/images/splash/logo.svg"
        alt=""
        class="icon-logo"
      />
      <img
        src="@/assets/images/splash/name.svg"
        alt=""
        class="icon-footer"
      />
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { isMobileDevice } from '@/utils/device'

const emit = defineEmits(['done'])

const DURATION_MS = 2000
const LEAVE_MS = 220
const THEME_COLOR_PAGE = '#ffffff'
const THEME_COLOR_SPLASH = '#7b00ff'

const visible = ref(true)
const leaving = ref(false)
const playKey = ref(0)
const isMobile = ref(isMobileDevice())
let closeTimer = null
let leaveTimer = null
let doneEmitted = false

function setThemeColor(color) {
  if (typeof document === 'undefined') return

  // 移除后重建，促使 Safari 重新采样顶底栏颜色
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.remove()
  })

  const meta = document.createElement('meta')
  meta.name = 'theme-color'
  meta.content = color
  document.head.appendChild(meta)
}

function emitDone() {
  if (doneEmitted) return
  doneEmitted = true
  setThemeColor(THEME_COLOR_PAGE)
  emit('done')
}

function clearCloseTimer() {
  if (closeTimer !== null) {
    window.clearTimeout(closeTimer)
    closeTimer = null
  }
  if (leaveTimer !== null) {
    window.clearTimeout(leaveTimer)
    leaveTimer = null
  }
}

function hideSplash() {
  leaving.value = true
  leaveTimer = window.setTimeout(() => {
    visible.value = false
    leaving.value = false
    leaveTimer = null
    emitDone()
  }, LEAVE_MS)
}

function scheduleClose() {
  clearCloseTimer()
  closeTimer = window.setTimeout(() => {
    closeTimer = null
    hideSplash()
  }, DURATION_MS)
}

function startSplash() {
  clearCloseTimer()
  doneEmitted = false
  leaving.value = false
  playKey.value += 1
  visible.value = true
  // 移动端始终白顶底栏；桌面开屏可用紫色主题
  setThemeColor(isMobile.value ? THEME_COLOR_PAGE : THEME_COLOR_SPLASH)
  scheduleClose()
}

function onPageShow(e) {
  // bfcache 恢复时组件不会重新 mount，需要手动重播开屏
  if (e.persisted) {
    startSplash()
  }
}

function onPrerenderingChange() {
  // 地址栏历史/联想常会预渲染页面，计时与动画在后台已跑完；激活后再开播
  if (!document.prerendering) {
    startSplash()
  }
}

onMounted(() => {
  window.addEventListener('pageshow', onPageShow)
  setThemeColor(isMobile.value ? THEME_COLOR_PAGE : THEME_COLOR_SPLASH)

  if (document.prerendering) {
    // 预渲染期间只遮罩，不启动关闭计时，等真正展示时再播动画
    document.addEventListener('prerenderingchange', onPrerenderingChange, {
      once: true
    })
  } else {
    scheduleClose()
  }
})

onBeforeUnmount(() => {
  clearCloseTimer()
  window.removeEventListener('pageshow', onPageShow)
  document.removeEventListener('prerenderingchange', onPrerenderingChange)
  visible.value = false
  leaving.value = false
  setThemeColor(THEME_COLOR_PAGE)
  emitDone()
})
</script>

<style lang="scss" scoped>
// 单段偏长 + 短间隔叠化，避免上一阶段停稳后再切下一阶段
$stage-duration: 1s;
$stage-ease: cubic-bezier(0.33, 0, 0.2, 1);
$stage-1-delay: 0s;
$stage-2-delay: 0.18s;
$stage-3-delay: 0.36s;
$stage-4-delay: 0.58s;
$stage-5-delay: 0.78s;
$slide-distance: 56px;

@keyframes splash-in-from-left {
  0% {
    opacity: 0;
    transform: translate3d(-#{$slide-distance}, 0, 0);
  }
  40% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes splash-in-from-right {
  0% {
    opacity: 0;
    transform: translate3d(#{$slide-distance}, 0, 0) scaleX(-1);
  }
  40% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scaleX(-1);
  }
}

@keyframes splash-fade-up {
  0% {
    opacity: 0;
    transform: translate3d(0, 12px, 0);
  }
  45% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes splash-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 10001;
  width: 100%;
  height: 100%;
  height: 100dvh;
  background: #7b00ff;
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.22s ease;

  &--leaving {
    opacity: 0;
    pointer-events: none;
  }

  // 移动端：外层白底留给 Safari 顶底栏采样；紫色只铺在中间舞台
  &--mobile {
    background: #ffffff;

    .splash-screen__stage {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: #7b00ff;
      pointer-events: none;
    }
  }

  .splash-screen__stage {
    display: none;
  }

  &--mobile .splash-screen__stage {
    display: block;
  }

  img {
    position: relative;
    z-index: 1;
    max-width: none;
    opacity: 0;
    backface-visibility: hidden;
    will-change: transform, opacity;
  }

  .icon-deco-1 {
    position: absolute;
    left: 0;
    top: calc(50% - 436px);
    width: 566px;
    height: 872px;
    animation: splash-in-from-left $stage-duration $stage-ease $stage-1-delay both;
  }

  .icon-deco-2 {
    position: absolute;
    left: 318px;
    top: calc(50% - 269px);
    width: 342px;
    height: 538px;
    animation: splash-in-from-left $stage-duration $stage-ease $stage-2-delay both;
  }

  .icon-deco-3 {
    position: absolute;
    left: 535px;
    top: calc(50% - 191px);
    width: 246px;
    height: 382px;
    animation: splash-in-from-left $stage-duration $stage-ease $stage-3-delay both;
  }

  .icon-deco-4 {
    position: absolute;
    right: 535px;
    top: calc(50% - 191px);
    width: 246px;
    height: 382px;
    animation: splash-in-from-right $stage-duration $stage-ease $stage-3-delay both;
  }

  .icon-deco-5 {
    position: absolute;
    right: 318px;
    top: calc(50% - 269px);
    width: 342px;
    height: 538px;
    animation: splash-in-from-right $stage-duration $stage-ease $stage-2-delay both;
  }

  .icon-deco-6 {
    position: absolute;
    right: 0;
    top: calc(50% - 436px);
    width: 566px;
    height: 872px;
    animation: splash-in-from-right $stage-duration $stage-ease $stage-1-delay both;
  }

  .icon-logo {
    position: absolute;
    top: calc(50% - 43px);
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 164px;
    animation: splash-fade-up 0.9s $stage-ease $stage-4-delay both;
  }

  .icon-footer {
    position: absolute;
    bottom: 100px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 152px;
    animation: splash-fade-in 0.7s $stage-ease $stage-5-delay both;
  }

  &--mobile .icon-footer {
    bottom: 400px;
  }
}
</style>
