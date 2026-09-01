<template>
  <section class="mobile-section club-manifesto-section">
    <img
      class="club-manifesto-section__title"
      src="@/assets/images/mobile/manifesto/title.svg"
      alt="MANIFESTO 俱乐部主张"
      draggable="false"
    />
    <div class="club-manifesto-section__scroller">
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
                :class="{
                  'is-strike': segment.strike,
                  'is-highlight': segment.highlight
                }"
              >{{ segment.text }}</span>
            </template>
          </p>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { manifestoSections } from '@/content/clubManifestoContent'
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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 297px;
  height: 489px;
  flex-shrink: 0;
  padding: 18px 14px 12px;
  overflow: hidden;
  background: url('@/assets/images/mobile/home/section.svg') center center / 100% 100% no-repeat;
}

.club-manifesto-section__title {
  display: block;
  width: 218px;
  height: auto;
  max-width: none;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.club-manifesto-section__scroller {
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  width: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
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
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.club-manifesto-section__heading {
  margin-bottom: 6px;
  font-family: 'Dream Han Sans W12', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.45;
  color: #fff000;
}

.club-manifesto-section__body {
  font-family: 'Dream Han Sans W5', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.45;
  color: #ffffff;
}

.club-manifesto-section__body .is-strike {
  text-decoration: line-through;
}

.club-manifesto-section__body .is-highlight {
  font-family: 'Dream Han Sans W12', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  color: #fff000;
}
</style>
