<template>
  <section class="web-section club-manifesto-section">
    <div class="club-manifesto-section__plate">
      <img
        src="@/assets/images/web/manifesto/plate.svg"
        alt=""
        draggable="false"
      />
    </div>
    <div class="club-manifesto-section__panel">
      <img
        class="club-manifesto-section__title"
        src="@/assets/images/web/manifesto/title.svg"
        alt="MANIFESTO 俱乐部主张"
        draggable="false"
      />
      <div
        ref="scrollerRef"
        class="club-manifesto-section__scroller"
        @scroll="onScroll"
      >
        <div class="club-manifesto-section__copy">
          <section
            v-for="(block, index) in manifestoSections"
            :key="index"
            class="club-manifesto-section__block"
          >
            <h3
              v-if="block.title"
              class="club-manifesto-section__heading"
            >
              {{ block.title }}
            </h3>
            <p
              v-for="(paragraph, paragraphIndex) in block.paragraphs"
              :key="paragraphIndex"
              class="club-manifesto-section__body"
            >
              <template v-if="typeof paragraph === 'string'">
                {{ paragraph }}
              </template>
              <template v-else>
                <span
                  v-for="(segment, segmentIndex) in paragraph.segments"
                  :key="segmentIndex"
                  :class="{ 'is-strike': segment.strike }"
                >{{ segment.text }}</span>
              </template>
            </p>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { manifestoSections } from '@/content/clubManifestoContent'

const pagerProgress = inject('pagerProgress', null)
const pagerOverflow = inject('pagerOverflow', null)
const scrollerRef = ref(null)

function syncPagerProgress() {
  const el = scrollerRef.value
  if (!el) {
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
  if (!el) return

  const step = el.clientHeight / 2
  const max = Math.max(el.scrollHeight - el.clientHeight, 0)
  const next = Math.min(Math.max(el.scrollTop + rows * step, 0), max)
  el.scrollTo({ top: next, behavior: 'smooth' })
}

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
  height: 100%;
  flex-shrink: 0;
  overflow: hidden;
}

.club-manifesto-section__plate {
  position: absolute;
  left: 0;
  bottom: 2px;
  z-index: 1;
  width: 420px;
  pointer-events: none;

  img {
    display: block;
    width: 100%;
    height: auto;
    max-width: none;
  }
}

.club-manifesto-section__panel {
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
  padding-top: 44px;
  padding-bottom: 36px;
  overflow: hidden;
  border-radius: 20px;
  background: url('@/assets/images/web/manifesto/section_bg.svg') center center / 100% 100% no-repeat;
}

.club-manifesto-section__title {
  display: block;
  width: 440px;
  height: auto;
  max-width: none;
  margin-bottom: 60px;
}

.club-manifesto-section__scroller {
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  width: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 56px 24px;
  color: #f1f1f1;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.club-manifesto-section__copy {
  flex: 0 0 auto;
  width: 100%;
  text-align: left;
}

.club-manifesto-section__block {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.club-manifesto-section__heading {
  margin-bottom: 8px;
  font-family: 'Dream Han Sans W12', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.45;
  color: #f1f1f1;
}

.club-manifesto-section__body {
  font-family: 'Dream Han Sans W5', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.45;
  color: #f1f1f1;
}

.club-manifesto-section__body .is-strike {
  text-decoration: line-through;
}
</style>
