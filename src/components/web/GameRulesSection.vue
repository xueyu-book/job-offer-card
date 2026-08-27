<template>
  <section
    class="web-section game-rules-section"
    :class="{
      'is-select': view === 'select',
      'is-detail': view !== 'select'
    }"
  >
    <template v-if="view === 'select'">
      <img
        class="game-rules-section__title"
        src="@/assets/images/web/rule/section_title.svg"
        alt="SELECT YOUR CHARACTER"
        draggable="false"
      />
      <div class="game-rules-section__characters">
        <button
          type="button"
          class="game-rules-section__character game-rules-section__character--seeker"
          aria-label="求职者"
          @click="openRules('seeker')"
        >
          <img
            src="@/assets/images/web/rule/job_seeker.svg"
            alt="求职者"
            draggable="false"
          />
        </button>
        <button
          type="button"
          class="game-rules-section__character"
          aria-label="收藏家"
          @click="openRules('collector')"
        >
          <img
            src="@/assets/images/web/rule/collector.svg"
            alt="收藏家"
            draggable="false"
          />
        </button>
      </div>
    </template>

    <template v-else>
      <div class="game-rules-section__plate">
        <img :src="plateSrc" alt="" draggable="false" />
      </div>
      <div class="game-rules-section__panel">
        <button
          type="button"
          class="game-rules-section__back"
          aria-label="返回"
          @click="backToSelect"
        >
          <img
            src="@/assets/images/web/rule/back.svg"
            alt=""
            draggable="false"
          />
        </button>
        <img
          class="game-rules-section__rule-title"
          :src="ruleTitleSrc"
          alt="RULES 项目规则"
          draggable="false"
        />
        <div
          ref="scrollerRef"
          class="game-rules-section__scroller"
          @scroll="onScroll"
        >
          <div class="game-rules-section__copy">
            <div
              v-for="(step, index) in currentRules.steps"
              :key="index"
              class="game-rules-section__step"
            >
              <h3 class="game-rules-section__step-title">{{ step.title }}</h3>
              <p
                v-for="(line, lineIndex) in step.lines"
                :key="lineIndex"
                class="game-rules-section__step-body"
              >
                {{ line }}
              </p>
            </div>
            <div v-if="currentRules.notes?.length" class="game-rules-section__notes">
              <h3 class="game-rules-section__step-title">{{ currentRules.notesTitle }}</h3>
              <p
                v-for="(note, noteIndex) in currentRules.notes"
                :key="noteIndex"
                class="game-rules-section__step-body"
              >
                {{ note }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import { collectorRules, jobSeekerRules } from '@/content/gameRulesContent'
import jobSeekerPlate from '@/assets/images/web/rule/job_seeker_plate.svg'
import collectorPlate from '@/assets/images/web/rule/collector_plate.svg'
import jobSeekerRuleTitle from '@/assets/images/web/rule/rule_title.svg'
import collectorRuleTitle from '@/assets/images/web/rule/collector_rule_title.svg'

const pagerProgress = inject('pagerProgress', null)
const pagerOverflow = inject('pagerOverflow', null)

const view = ref('select')
const scrollerRef = ref(null)

const currentRules = computed(() =>
  view.value === 'collector' ? collectorRules : jobSeekerRules
)
const plateSrc = computed(() =>
  view.value === 'collector' ? collectorPlate : jobSeekerPlate
)
const ruleTitleSrc = computed(() =>
  view.value === 'collector' ? collectorRuleTitle : jobSeekerRuleTitle
)

function openRules(nextView) {
  view.value = nextView
}

function backToSelect() {
  view.value = 'select'
}

function syncPagerProgress() {
  const el = scrollerRef.value
  if (!el || view.value === 'select') {
    if (pagerOverflow) pagerOverflow.value = 0
    if (pagerProgress) pagerProgress.value = 0
    return
  }

  const max = Math.max(el.scrollHeight - el.clientHeight, 0)
  if (pagerOverflow) pagerOverflow.value = max
  if (pagerProgress) {
    pagerProgress.value = max <= 0 ? 0 : Math.min(Math.max(el.scrollTop / max, 0), 1)
  }
}

function onScroll() {
  syncPagerProgress()
}

function scrollByRows(rows = 2) {
  const el = scrollerRef.value
  if (!el || view.value === 'select') return

  const step = el.clientHeight / 2
  const max = Math.max(el.scrollHeight - el.clientHeight, 0)
  const next = Math.min(Math.max(el.scrollTop + rows * step, 0), max)
  el.scrollTo({ top: next, behavior: 'smooth' })
}

watch(view, () => {
  nextTick(() => {
    if (scrollerRef.value) scrollerRef.value.scrollTop = 0
    syncPagerProgress()
  })
})

onMounted(() => {
  syncPagerProgress()
})

defineExpose({
  scrollByRows,
  syncPagerProgress
})
</script>

<style lang="scss">
@font-face {
  font-family: 'Dream Han Sans W5';
  src: url('@/assets/fonts/mengyuan/DreamHanSansExpCN-W5.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Dream Han Sans W12';
  src: url('@/assets/fonts/mengyuan/DreamHanSansExpCN-W12.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
</style>

<style scoped lang="scss">
.web-section {
  position: relative;
  width: 1300px;
  height: 710px;
  flex-shrink: 0;
  overflow: hidden;
}

.game-rules-section.is-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  padding-top: 66px;
  background: url('@/assets/images/web/rule/section_bg.svg') center center / 100% 100% no-repeat;
}

.game-rules-section.is-detail {
  height: 100%;
}

.game-rules-section__title {
  display: block;
  width: 1000px;
  height: auto;
  max-width: none;
  margin-bottom: 54px;
}

.game-rules-section__characters {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.game-rules-section__character {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;

  img {
    display: block;
    width: 326px;
    height: auto;
    max-width: none;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    filter: brightness(1.08);
  }
}

.game-rules-section__character--seeker {
  margin-right: 106px;
}

.game-rules-section__plate {
  position: absolute;
  left: 0;
  bottom: 2px;
  z-index: 1;
  width: 420px;
  padding-top: 50px;
  pointer-events: none;

  img {
    display: block;
    width: 100%;
    height: auto;
    max-width: none;
  }
}

.game-rules-section__panel {
  position: absolute;
  top: 68px;
  left: 420px;
  right: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  height: 708px;
  max-height: calc(100% - 68px);
  padding-top: 50px;
  padding-bottom: 36px;
  overflow: hidden;
  border-radius: 20px;
  background: url('@/assets/images/web/rule/rule_bg.svg') center center / 100% 100% no-repeat;
}

.game-rules-section__back {
  position: absolute;
  top: 50px;
  left: 48px;
  z-index: 3;
  width: 64px;
  height: 64px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    display: block;
    width: 100%;
    height: 100%;
    max-width: none;
    pointer-events: none;
  }
}

.game-rules-section__rule-title {
  display: block;
  width: 240px;
  height: auto;
  max-width: none;
  margin-bottom: 64px;
}

.game-rules-section__scroller {
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  width: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 48px 24px;
  color: #f1f1f1;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.game-rules-section__copy {
  flex: 0 0 auto;
  width: 100%;
  margin-block: auto;
  text-align: center;
}

.game-rules-section__step,
.game-rules-section__notes {
  margin-bottom: 28px;
  text-align: center;

  &:last-child {
    margin-bottom: 0;
  }
}

.game-rules-section__notes {
  margin-top: 8px;
}

.game-rules-section__step-title {
  margin-bottom: 8px;
  font-family: 'Dream Han Sans W12', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.35;
  text-align: center;
  color: #fff000;
}

.game-rules-section__step-body {
  font-family: 'Dream Han Sans W5', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.45;
  text-align: center;
  color: #f1f1f1;
}
</style>
