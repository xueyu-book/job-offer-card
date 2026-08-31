<template>
  <section
    class="mobile-section game-rules-section"
    :class="{
      'is-select': view === 'select',
      'is-detail': view !== 'select'
    }"
  >
    <template v-if="view === 'select'">
      <img
        class="game-rules-section__title"
        src="@/assets/images/mobile/rule/section_title.svg"
        alt="SELECT YOUR CHARACTER"
        draggable="false"
      />
      <div class="game-rules-section__characters">
        <button
          type="button"
          class="game-rules-section__character"
          aria-label="求职者"
          @click="openRules('seeker')"
        >
          <img
            src="@/assets/images/mobile/rule/job_seeker.svg"
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
            src="@/assets/images/mobile/rule/collector.svg"
            alt="收藏家"
            draggable="false"
          />
        </button>
      </div>
    </template>

    <template v-else>
      <button
        type="button"
        class="game-rules-section__back"
        aria-label="返回"
        @click="backToSelect"
      >
        <img
          src="@/assets/images/mobile/rule/back.svg"
          alt=""
          draggable="false"
        />
      </button>
      <img
        class="game-rules-section__rule-title"
        :src="ruleTitleSrc"
        alt="RULES"
        draggable="false"
      />
      <div ref="scrollerRef" class="game-rules-section__scroller">
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
    </template>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { collectorRules, jobSeekerRules } from '@/content/gameRulesContent'
import jobSeekerRuleTitle from '@/assets/images/mobile/rule/rule_title.svg'
import collectorRuleTitle from '@/assets/images/mobile/rule/collector_rule_title.svg'

const view = ref('select')
const scrollerRef = ref(null)

const currentRules = computed(() =>
  view.value === 'collector' ? collectorRules : jobSeekerRules
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

watch(view, () => {
  nextTick(() => {
    if (scrollerRef.value) scrollerRef.value.scrollTop = 0
  })
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
.mobile-section {
  position: relative;
  box-sizing: border-box;
  width: 297px;
  height: 489px;
  flex-shrink: 0;
  overflow: hidden;
  background: url('@/assets/images/mobile/home/section.svg') center center / 100% 100% no-repeat;
}

.game-rules-section.is-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 12px 12px;
}

.game-rules-section.is-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px 12px;
}

.game-rules-section__title {
  display: block;
  width: 254px;
  height: auto;
  max-width: none;
  margin-bottom: 26px;
}

.game-rules-section__characters {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.game-rules-section__character {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    display: block;
    width: 134px;
    height: auto;
    max-width: none;
    pointer-events: none;
  }
}

.game-rules-section__back {
  position: absolute;
  top: 16px;
  left: 12px;
  z-index: 3;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  background: transparent;

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
  width: 118px;
  height: auto;
  max-width: none;
  margin-bottom: 16px;
}

.game-rules-section__scroller {
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  width: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 8px 8px;
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
  text-align: center;
}

.game-rules-section__step,
.game-rules-section__notes {
  margin-bottom: 14px;
  text-align: center;

  &:last-child {
    margin-bottom: 0;
  }
}

.game-rules-section__step-title {
  margin-bottom: 4px;
  font-family: 'Dream Han Sans W12', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  text-align: center;
  color: #fff000;
}

.game-rules-section__step-body {
  font-family: 'Dream Han Sans W5', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;
  text-align: center;
  color: #f1f1f1;
}
</style>
