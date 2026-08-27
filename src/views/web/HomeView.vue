<template>
  <main class="web-home" :class="{ 'is-card-active': activeCardId !== null }">
    <SplashScreen @done="onSplashDone" />
    <img
      class="web-home__logo"
      src="@/assets/images/web/home/logo.gif"
      alt="求职卡"
    />
    <FlipCountdown
      class="web-home__countdown"
      :end-time="countdownEndTime"
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
    <a
      class="web-home__provision"
      :href="provisionPdf"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="条款"
    >
      <img
        src="@/assets/images/web/home/provision.svg"
        alt="条款"
        draggable="false"
      />
    </a>
    <a
      v-for="link in externalLinks"
      :key="link.id"
      class="web-home__external"
      :class="`web-home__external--${link.id}`"
      :href="link.href"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img :src="link.src" alt="" draggable="false" />
    </a>
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
      <div
        class="web-home__content"
        :class="{ 'is-flush': isFlushContent }"
      >
        <component
          :is="tab.component"
          v-for="tab in tabs"
          v-show="activeTab === tab.id"
          :key="tab.id"
          :ref="(el) => setSectionRef(tab.id, el)"
        />
        <div v-show="showPager" class="web-home__pager">
          <img
            class="web-home__pager-line"
            src="@/assets/images/web/home/page_line.svg"
            alt=""
            draggable="false"
          />
          <img
            class="web-home__pager-dot"
            :style="{ top: pagerDotTop }"
            src="@/assets/images/web/home/page_dot.svg"
            alt=""
            draggable="false"
          />
          <button
            type="button"
            class="web-home__pager-up"
            :disabled="!canPageUp"
            aria-label="上一页"
            @click="pageUp"
          >
            <img
              src="@/assets/images/web/home/page_up.svg"
              alt=""
              draggable="false"
            />
          </button>
          <button
            type="button"
            class="web-home__pager-down"
            :disabled="!canPageDown"
            aria-label="下一页"
            @click="pageDown"
          >
            <img
              src="@/assets/images/web/home/page_down.svg"
              alt=""
              draggable="false"
            />
          </button>
        </div>
      </div>
    </div>

    <div class="web-home__site">
      <a
        href="https://www.theotherhandclub.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        WWW.THEOTHERHANDCLUB.COM
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
      class="web-home__backdrop"
      :class="{ active: activeCardId !== null }"
      @click="setActiveCardId(null)"
    />
  </main>
</template>

<script setup>
import { computed, nextTick, onUnmounted, provide, ref, watch } from 'vue'
import SplashScreen from '@/components/web/SplashScreen.vue'
import FlipCountdown from '@/components/web/FlipCountdown.vue'
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
import provisionPdf from '@/assets/TOHC-provision.pdf'
import externalIcon1 from '@/assets/images/web/external-link/1.svg'
import externalIcon2 from '@/assets/images/web/external-link/2.svg'
import externalIcon3 from '@/assets/images/web/external-link/3.svg'
import externalIcon4 from '@/assets/images/web/external-link/4.svg'
import { getHtmlSfx, pauseAllHtmlAudio, playHtmlAudio, readMutedPreference, requestAudioPermission, requestMicrophonePermission, writeMutedPreference } from '@/utils/audio'
import { pxToRem } from '@/utils/rem'

const TAB_FLASH_COUNT = 2
const TAB_FRAME_MS = 80
const PAGE_ROWS = 2
const PAGE_DOT_TOP_MIN = 160
const PAGE_DOT_TOP_MAX = 606

const countdownEndTime = '2026-09-17T18:00:00+08:00'

const activeCardId = ref(null)
const activeTab = ref(1)
const splashDone = ref(false)
const muted = ref(readMutedPreference())
const pagerProgress = ref(0)
const pagerOverflow = ref(0)
const sectionRefs = Object.create(null)

provide('pagerProgress', pagerProgress)
provide('pagerOverflow', pagerOverflow)

function setSectionRef(id, el) {
  if (el) sectionRefs[id] = el
  else delete sectionRefs[id]
}

const showPager = computed(() => activeTab.value !== 2)
const isFlushContent = computed(() => activeTab.value === 3 || activeTab.value === 4 || activeTab.value === 5)
const pagerDotTop = computed(() =>
  pxToRem(PAGE_DOT_TOP_MIN + pagerProgress.value * (PAGE_DOT_TOP_MAX - PAGE_DOT_TOP_MIN))
)
const canPageUp = computed(
  () => activeCardId.value == null && pagerProgress.value > 0.001
)
const canPageDown = computed(
  () =>
    activeCardId.value == null &&
    pagerOverflow.value > 1 &&
    pagerProgress.value < 0.999
)

function pageUp() {
  if (!canPageUp.value) return
  sectionRefs[activeTab.value]?.scrollByRows?.(-PAGE_ROWS)
}

function pageDown() {
  if (!canPageDown.value) return
  sectionRefs[activeTab.value]?.scrollByRows?.(PAGE_ROWS)
}

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
  if (event.target?.closest?.('.web-home__mute, .web-home__provision, .web-home__external, .web-home__site')) return
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

watch(activeTab, () => {
  pagerProgress.value = 0
  pagerOverflow.value = 0
  nextTick(() => {
    sectionRefs[activeTab.value]?.syncPagerProgress?.()
  })
})

const externalLinks = [
  { id: 1, href: 'https://www.gsxt.gov.cn/index.html', src: externalIcon1 },
  { id: 2, href: 'https://www.doubao.com', src: externalIcon2 },
  {
    id: 3,
    href: 'https://www.disneycareers.com/en/search-jobs?acm=ALL&alrpm=ALL&ascf=[%7B%22key%22:%22custom_fields.Theming%22,%22value%22:%22Hong+Kong+Disneyland+Resort+Professional%22%7D,%7B%22key%22:%22custom_fields.IndustryCustomField%22,%22value%22:%22Hong+Kong+Disneyland+Resort%22%7D]',
    src: externalIcon3
  },
  {
    id: 4,
    href: 'https://v.qq.com/x/cover/4hzk4qyf1nghvbu/t0015x6wdny.html?no_refer=1&traceid=12_360',
    src: externalIcon4
  }
]

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

<style lang="scss">
@font-face {
  font-family: 'Nacelle';
  src: url('@/assets/fonts/Nacelle-Regular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
</style>

<style scoped lang="scss">
.web-home {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: url('@/assets/images/web/home/page_bg.svg') center top / 100% auto no-repeat;
  color: #f8fafc;
  overflow: hidden;
}

.web-home.is-card-active {
  overflow: visible;

  .web-home__mute,
  .web-home__provision {
    z-index: 2;
  }
}

.web-home__logo {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: auto;
  z-index: 2;
}

.web-home__countdown {
  position: absolute;
  top: 26px;
  left: 238px;
  right: 238px;
  z-index: 2;
}

.web-home__mute,
.web-home__provision {
  position: absolute;
  right: 54px;
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
}

.web-home__mute {
  top: 25px;

  &:disabled {
    pointer-events: none;
    cursor: default;
  }
}

.web-home__provision {
  top: 70px;
}

.web-home__external {
  position: absolute;
  z-index: 3;
  max-width: none;
  cursor: pointer;

  img {
    display: block;
    width: 100%;
    height: auto;
    max-width: none;
    object-fit: contain;
    pointer-events: none;
  }
}

.web-home__external--1 {
  top: 162px;
  right: -33px;
  width: 260px;
  z-index: 5;
}

.web-home__external--2 {
  top: 835px;
  left: -44px;
  width: 246px;
  z-index: 5;
}

.web-home__external--3 {
  top: 687px;
  left: 35px;
  width: 255px;
}

.web-home__external--4 {
  top: 317px;
  right: 60px;
  width: 166px;
}

.web-home__site {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 22px;
  font-family: 'Nacelle', sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 1;
  color: #f8fafc;
  white-space: nowrap;

  a {
    color: inherit;
    cursor: pointer;
  }
}

.web-home__container {
  position: relative;
  z-index: 4;
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
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  height: 100%;
  padding-left: 30px;
  background: url('@/assets/images/web/home/card_bg.svg') center center / 100% 100% no-repeat;
  margin-left: -1px;

  &.is-flush {
    padding-left: 0;
  }
}

.web-home__pager {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.web-home__pager-line,
.web-home__pager-dot,
.web-home__pager-up,
.web-home__pager-down {
  position: absolute;
  max-width: none;
}

.web-home__pager-line {
  top: 92px;
  right: 46px;
  width: auto;
  height: 534px;
}

.web-home__pager-dot {
  top: 160px;
  right: 37px;
  width: 20px;
  height: auto;
}

.web-home__pager-up,
.web-home__pager-down {
  right: 28px;
  width: 42px;
  height: auto;
  padding: 0;
  border: none;
  background: transparent;
  pointer-events: auto;
  cursor: pointer;

  img {
    display: block;
    width: 100%;
    height: auto;
    max-width: none;
    pointer-events: none;
  }

  &:disabled {
    cursor: default;
  }
}

.web-home__pager-up {
  bottom: 150px;
}

.web-home__pager-down {
  bottom: 78px;
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
