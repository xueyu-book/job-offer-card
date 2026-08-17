<template>
  <main class="web-home" :class="{ 'is-card-active': activeCardId !== null }">
    <SplashScreen @done="onSplashDone" />
    <img
      class="web-home__logo"
      src="@/assets/images/web/home/logo.gif"
      alt="求职卡"
    />
    <button
      type="button"
      class="web-home__mute"
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
    <div class="web-home__container">
      <nav class="web-home__tabbar">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.id"
          type="button"
          class="web-home__tab"
          :class="{ active: isTabActive(tab) }"
          :style="{ zIndex: tabs.length - index }"
          @click="selectTab(tab.id)"
        >
          <img
            class="web-home__tab-icon"
            :src="tab.icon"
            :alt="tab.label"
            draggable="false"
          />
          <img
            class="web-home__tab-icon web-home__tab-icon--active"
            :src="tab.activeIcon"
            alt=""
            draggable="false"
          />
        </button>
      </nav>
      <div class="web-home__content">
        <component
          :is="tab.component"
          v-for="tab in tabs"
          v-show="activeTab === tab.id"
          :key="tab.id"
        />
      </div>
    </div>

    <div
      class="web-home__backdrop"
      :class="{ active: activeCardId !== null }"
      @click="setActiveCardId(null)"
    />
  </main>
</template>

<script setup>
import { onUnmounted, provide, ref, watch } from 'vue'
import SplashScreen from '@/components/web/SplashScreen.vue'
import CardShowcaseSection from '@/components/web/CardShowcaseSection.vue'
import MerchShowcaseSection from '@/components/web/MerchShowcaseSection.vue'
import GameRulesSection from '@/components/web/GameRulesSection.vue'
import ClubManifestoSection from '@/components/web/ClubManifestoSection.vue'
import FaqSection from '@/components/web/FaqSection.vue'
import tabIcon1 from '@/assets/images/web/tabbar/1.svg'
import tabIcon2 from '@/assets/images/web/tabbar/2.svg'
import tabIcon3 from '@/assets/images/web/tabbar/3.svg'
import tabIcon4 from '@/assets/images/web/tabbar/4.svg'
import tabIcon5 from '@/assets/images/web/tabbar/5.svg'
import tabIcon1Active from '@/assets/images/web/tabbar/1_active.svg'
import tabIcon2Active from '@/assets/images/web/tabbar/2_active.svg'
import tabIcon3Active from '@/assets/images/web/tabbar/3_active.svg'
import tabIcon4Active from '@/assets/images/web/tabbar/4_active.svg'
import tabIcon5Active from '@/assets/images/web/tabbar/5_active.svg'
import navSfx from '@/assets/audio/nav.wav'
import iconPlay from '@/assets/images/web/home/icon_play.svg'
import iconMute from '@/assets/images/web/home/icon_mute.svg'
import { getHtmlSfx, pauseAllHtmlAudio, playHtmlAudio, readMutedPreference, requestAudioPermission, requestMicrophonePermission, writeMutedPreference } from '@/utils/audio'

const TAB_FLASH_COUNT = 2
const TAB_FRAME_MS = 160

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
  if (event.target?.closest?.('.web-home__mute')) return
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
  { id: 3, label: '游戏规则', icon: tabIcon3, activeIcon: tabIcon3Active, component: GameRulesSection },
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

<style scoped lang="scss">
.web-home {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background: url('@/assets/images/web/home/page_bg.svg') center center / cover no-repeat;
  color: #f8fafc;
  overflow: hidden;
}

.web-home__logo {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 244px;
  height: auto;
  z-index: 2;
}

.web-home__mute {
  position: absolute;
  top: 25px;
  right: 250px;
  z-index: 100;
  width: 38px;
  height: 38px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    display: block;
    width: 100%;
    height: 100%;
  }

  &:disabled {
    pointer-events: none;
    cursor: default;
  }
}

.web-home__container {
  display: flex;
  width: 1448px;
  height: 844px;
  margin-top: 168px;
  flex-shrink: 0;
}

.web-home__tabbar {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 36px;
  height: 844px;
  padding-top: 68px;
  padding-bottom: 36px;
  flex-shrink: 0;
}

.web-home__tab {
  position: relative;
  width: 36px;
  height: 169px;
  padding: 0;
  flex-shrink: 0;
  cursor: pointer;

  &:not(:first-child) {
    margin-top: -26px;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.web-home__tab-icon--active {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
}

.web-home__tab.active {
  .web-home__tab-icon:not(.web-home__tab-icon--active) {
    opacity: 0;
  }

  .web-home__tab-icon--active {
    opacity: 1;
  }
}

.web-home__content {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  height: 100%;
  padding-left: 30px;
  background: url('@/assets/images/web/home/card_bg.svg') center center / 100% 100% no-repeat;
  margin-left: -1px;
}

.web-home__header {
  max-width: 1200px;
  margin: 0 auto 48px;
  text-align: center;
}

.web-home__title {
  font-size: 56px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}

.web-home__desc {
  font-size: 20px;
  color: rgba(248, 250, 252, 0.65);
}

.web-home__backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(2, 6, 23, 0.55);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}

.web-home__backdrop.active {
  opacity: 1;
  pointer-events: auto;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 48px 40px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  transform-style: preserve-3d;
}

.card-grid.active {
  z-index: 99;
}

@media screen and (max-width: 1100px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media screen and (max-width: 700px) {
  .card-grid {
    grid-template-columns: 1fr;
    max-width: 360px;
  }
}
</style>
