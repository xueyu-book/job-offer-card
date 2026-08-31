<template>
  <main class="mobile-home" :class="{ 'is-card-active': activeCardId !== null }">
    <SplashScreen @done="onSplashDone" />
    <img
      class="mobile-home__logo"
      src="@/assets/images/mobile/home/logo.gif"
      alt="求职卡"
    />
    <FlipCountdown
      class="mobile-home__countdown"
      :end-time="countdownEndTime"
    />
    <div class="mobile-home__actions">
      <button
        type="button"
        class="mobile-home__mute"
        :disabled="activeCardId !== null"
        :aria-label="muted ? '开启声音' : '静音'"
        :aria-pressed="muted"
        @click="toggleMute"
      >
        <img
          :src="muted ? iconMute : iconPlay"
          :alt="muted ? '静音' : '声音开启'"
          draggable="false"
        />
      </button>
      <a
        class="mobile-home__provision"
        :href="provisionPdf"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="条款"
      >
        <img
          src="@/assets/images/mobile/home/provision.svg"
          alt="条款"
          draggable="false"
        />
      </a>
    </div>
    <div class="mobile-home__container">
      <nav class="mobile-home__tabbar">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.id"
          type="button"
          class="mobile-home__tab"
          :class="{ active: isTabActive(tab) }"
          :style="{ zIndex: tabs.length - index }"
          @click="selectTab(tab.id)"
        >
          <img
            class="mobile-home__tab-icon"
            :src="tab.icon"
            :alt="tab.label"
            draggable="false"
          />
          <img
            class="mobile-home__tab-icon mobile-home__tab-icon--active"
            :src="tab.activeIcon"
            alt=""
            draggable="false"
          />
        </button>
      </nav>
      <div class="mobile-home__content">
        <component
          :is="tab.component"
          v-for="tab in tabs"
          v-show="activeTab === tab.id"
          :key="tab.id"
        />
      </div>
    </div>

    <div class="mobile-home__site">
      <a
        href="https://www.theotherhandclub.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        THEOTHERHANDCLUB.COM
      </a>
      <a
        href="https://www.xiaohongshu.com/user/profile/69fb3d8e0000000002001c08?xsec_token=ABpN3sUtBdDY6wccECFpZQ9qkfXazFRjUta0KNLon1ocY%3D&xsec_source=pc_search"
        target="_blank"
        rel="noopener noreferrer"
      >
        SUPPORT
      </a>
    </div>
    <div
      class="mobile-home__backdrop"
      :class="{ active: activeCardId !== null }"
      @click="setActiveCardId(null)"
    />
  </main>
</template>

<script setup>
import { onUnmounted, provide, ref, watch } from 'vue'
import SplashScreen from '@/components/web/SplashScreen.vue'
import FlipCountdown from '@/components/mobile/FlipCountdown.vue'
import CardShowcaseSection from '@/components/mobile/CardShowcaseSection.vue'
import MerchShowcaseSection from '@/components/mobile/MerchShowcaseSection.vue'
import GameRulesSection from '@/components/mobile/GameRulesSection.vue'
import ClubManifestoSection from '@/components/mobile/ClubManifestoSection.vue'
import FaqSection from '@/components/mobile/FaqSection.vue'
import tabIcon1 from '@/assets/images/mobile/tabbar/1.svg'
import tabIcon2 from '@/assets/images/mobile/tabbar/2.svg'
import tabIcon3 from '@/assets/images/mobile/tabbar/3.svg'
import tabIcon4 from '@/assets/images/mobile/tabbar/4.svg'
import tabIcon5 from '@/assets/images/mobile/tabbar/5.svg'
import tabIcon1Active from '@/assets/images/mobile/tabbar/1_active.svg'
import tabIcon2Active from '@/assets/images/mobile/tabbar/2_active.svg'
import tabIcon3Active from '@/assets/images/mobile/tabbar/3_active.svg'
import tabIcon4Active from '@/assets/images/mobile/tabbar/4_active.svg'
import tabIcon5Active from '@/assets/images/mobile/tabbar/5_active.svg'
import navSfx from '@/assets/audio/nav.wav'
import iconPlay from '@/assets/images/mobile/home/icon_play.svg'
import iconMute from '@/assets/images/mobile/home/icon_mute.svg'
import provisionPdf from '@/assets/TOHC-provision.pdf'
import { getHtmlSfx, pauseAllHtmlAudio, playHtmlAudio, readMutedPreference, requestAudioPermission, requestMicrophonePermission, writeMutedPreference } from '@/utils/audio'

const TAB_FLASH_COUNT = 2
const TAB_FRAME_MS = 80

const countdownEndTime = '2026-11-30T18:00:00+08:00'

const activeCardId = ref(null)
const activeTab = ref(1)
const splashDone = ref(false)
const muted = ref(readMutedPreference())

provide('splashDone', splashDone)
provide('muted', muted)

function onSplashDone() {
  splashDone.value = true
}

const flashTabId = ref(null)
const flashShowActive = ref(true)
let flashTimer = null
let flashToken = 0

function setActiveCardId(id) {
  activeCardId.value = id
}

function onPointerDownOutsideCard(event) {
  if (activeCardId.value == null) return
  if (event.target?.closest?.('.card.active')) return
  if (event.target?.closest?.('.mobile-home__actions, .mobile-home__site')) return
  setActiveCardId(null)
}

function bindCardDismiss() {
  window.addEventListener('pointerdown', onPointerDownOutsideCard, true)
}

function unbindCardDismiss() {
  window.removeEventListener('pointerdown', onPointerDownOutsideCard, true)
}

provide('activeCardId', activeCardId)
provide('setActiveCardId', setActiveCardId)

watch(activeCardId, (id) => {
  unbindCardDismiss()
  if (id != null) bindCardDismiss()
})

const tabs = [
  { id: 1, label: '卡牌展示', icon: tabIcon1, activeIcon: tabIcon1Active, component: CardShowcaseSection },
  { id: 2, label: '周边展示', icon: tabIcon2, activeIcon: tabIcon2Active, component: MerchShowcaseSection },
  { id: 3, label: '玩法规则', icon: tabIcon3, activeIcon: tabIcon3Active, component: GameRulesSection },
  { id: 4, label: '俱乐部主张', icon: tabIcon4, activeIcon: tabIcon4Active, component: ClubManifestoSection },
  { id: 5, label: '常见问题', icon: tabIcon5, activeIcon: tabIcon5Active, component: FaqSection }
]

function isTabActive(tab) {
  if (flashTabId.value === tab.id) {
    return flashShowActive.value
  }
  return activeTab.value === tab.id
}

function preloadTabIcons() {
  tabs.forEach((tab) => {
    ;[tab.icon, tab.activeIcon].forEach((src) => {
      const img = new Image()
      img.src = src
      img.decode?.().catch(() => {})
    })
  })
}

preloadTabIcons()

let navAudio = null

function ensureNavAudio() {
  if (navAudio) return navAudio
  navAudio = getHtmlSfx(navSfx)
  return navAudio
}

function playNavAudio() {
  if (muted.value) return
  playHtmlAudio(ensureNavAudio())
}

function toggleMute() {
  if (muted.value) {
    requestAudioPermission()
    requestMicrophonePermission()
    muted.value = false
    writeMutedPreference(false)
    return
  }

  muted.value = true
  writeMutedPreference(true)
  pauseAllHtmlAudio()
}

ensureNavAudio()

function clearFlashTimer() {
  if (flashTimer != null) {
    clearTimeout(flashTimer)
    flashTimer = null
  }
}

function selectTab(id) {
  if (id === activeTab.value && flashTabId.value == null) return

  playNavAudio()
  clearFlashTimer()
  const token = ++flashToken
  activeTab.value = id
  flashTabId.value = id
  flashShowActive.value = false

  let step = 0
  const totalSteps = TAB_FLASH_COUNT * 2

  const tick = () => {
    if (token !== flashToken) return

    flashShowActive.value = step % 2 === 1
    step += 1

    if (step < totalSteps) {
      flashTimer = setTimeout(tick, TAB_FRAME_MS)
      return
    }

    flashShowActive.value = true
    flashTabId.value = null
    flashTimer = null
  }

  tick()
}

onUnmounted(() => {
  flashToken += 1
  clearFlashTimer()
  unbindCardDismiss()
  if (navAudio) {
    navAudio.pause()
    navAudio = null
  }
})
</script>

<style lang="scss">
@font-face {
  font-family: 'Nacelle';
  src: url('@/assets/fonts/Nacelle-Regular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* 移动端锁定文档层：禁止整页滚动，避免露出 body 浅色底 */
html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  overscroll-behavior: none;
  background: #ffffff;
}

body {
  position: fixed;
  inset: 0;
}
</style>

<style scoped lang="scss">
.mobile-home {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  height: 100dvh;
  background: #070001 url('@/assets/images/mobile/home/page_bg.svg') center top / 100% auto no-repeat;
  color: #f8fafc;
  overflow: hidden;
}

.mobile-home.is-card-active {
  overflow: visible;

  .mobile-home__container {
    z-index: 90;
  }

  .mobile-home__actions {
    z-index: 2;
  }
}

.mobile-home__logo {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 108px;
  height: auto;
  z-index: 2;
}

.mobile-home__countdown {
  position: absolute;
  top: 17px;
  left: 18px;
  right: 18px;
  z-index: 2;
}

.mobile-home__actions {
  position: absolute;
  top: 70px;
  right: 16px;
  z-index: 100;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}

.mobile-home__mute,
.mobile-home__provision {
  width: 23px;
  height: 23px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;

  img {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.mobile-home__mute:disabled {
  pointer-events: none;
  cursor: default;
}

.mobile-home__site {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: env(safe-area-inset-bottom);
  font-family: 'Nacelle', sans-serif;
  font-weight: 400;
  font-size: 8px;
  line-height: 1;
  color: #f8fafc;
  white-space: nowrap;

  a {
    color: inherit;
    cursor: pointer;
  }
}

.mobile-home__container {
  position: relative;
  z-index: 4;
  display: flex;
  width: 340px;
  height: 523px;
  margin-top: 102px;
  flex-shrink: 0;
}

.mobile-home__tabbar {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  box-sizing: border-box;
  width: 24px;
  height: 493px;
  margin-top: 22px;
  flex-shrink: 0;
}

.mobile-home__tab {
  position: relative;
  width: 24px;
  height: 111px;
  margin-top: -15px;
  padding: 0;
  flex-shrink: 0;
  cursor: pointer;

  &:first-child {
    margin-top: 0;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.mobile-home__tab-icon--active {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
}

.mobile-home__tab.active {
  .mobile-home__tab-icon:not(.mobile-home__tab-icon--active) {
    opacity: 0;
  }

  .mobile-home__tab-icon--active {
    opacity: 1;
  }
}

.mobile-home__content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 316px;
  height: 523px;
  padding: 24px 10px 10px;
  flex-shrink: 0;
  background: url('@/assets/images/mobile/home/card_bg.svg') center center / 100% 100% no-repeat;
  margin-left: -1px;
}

.mobile-home__backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(2, 6, 23, 0.55);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}

.mobile-home__backdrop.active {
  opacity: 1;
  pointer-events: auto;
}
</style>
