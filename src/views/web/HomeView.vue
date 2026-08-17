<template>
  <main class="web-home" :class="{ 'is-card-active': activeCardId !== null }">
    <SplashScreen @done="onSplashDone" />
    <img
      class="web-home__logo"
      src="@/assets/images/web/home/logo.gif"
      alt="求职卡"
    />
    <div class="web-home__container">
      <nav class="web-home__tabbar">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.id"
          type="button"
          class="web-home__tab"
          :class="{ active: activeTab === tab.id }"
          :style="{ zIndex: tabs.length - index }"
          @click="selectTab(tab.id)"
        >
          <img :src="getTabIcon(tab)" :alt="tab.label" />
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
import { onUnmounted, provide, ref } from 'vue'
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

const TAB_FLASH_COUNT = 2
const TAB_FRAME_MS = 160

const activeCardId = ref(null)
const activeTab = ref(1)
const splashDone = ref(false)

provide('splashDone', splashDone)

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

provide('activeCardId', activeCardId)
provide('setActiveCardId', setActiveCardId)

const tabs = [
  { id: 1, label: '卡牌展示', icon: tabIcon1, activeIcon: tabIcon1Active, component: CardShowcaseSection },
  { id: 2, label: '周边展示', icon: tabIcon2, activeIcon: tabIcon2Active, component: MerchShowcaseSection },
  { id: 3, label: '游戏规则', icon: tabIcon3, activeIcon: tabIcon3Active, component: GameRulesSection },
  { id: 4, label: '俱乐部主张', icon: tabIcon4, activeIcon: tabIcon4Active, component: ClubManifestoSection },
  { id: 5, label: '常见问题', icon: tabIcon5, activeIcon: tabIcon5Active, component: FaqSection }
]

function getTabIcon(tab) {
  if (flashTabId.value === tab.id) {
    return flashShowActive.value ? tab.activeIcon : tab.icon
  }
  return activeTab.value === tab.id ? tab.activeIcon : tab.icon
}

function clearFlashTimer() {
  if (flashTimer != null) {
    clearTimeout(flashTimer)
    flashTimer = null
  }
}

function selectTab(id) {
  if (id === activeTab.value && flashTabId.value == null) return

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
    width: 100%;
    height: 100%;
    object-fit: contain;
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
