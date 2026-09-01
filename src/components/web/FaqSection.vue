<template>
  <section class="web-section faq-section">
    <div class="faq-section__plate">
      <img
        src="@/assets/images/web/faq/plate.svg"
        alt=""
        draggable="false"
      />
    </div>
    <div class="faq-section__panel">
      <img
        class="faq-section__title"
        src="@/assets/images/web/faq/title.svg"
        alt="FAQ 常见问题"
        draggable="false"
      />
      <div
        ref="scrollerRef"
        class="faq-section__scroller"
        @scroll="onScroll"
      >
        <div class="faq-section__copy">
          <article
            v-for="(item, index) in faqItems"
            :key="index"
            class="faq-section__item"
          >
            <h3 class="faq-section__question">Q：{{ item.question }}</h3>
            <p
              v-for="(paragraph, paragraphIndex) in item.answer"
              :key="`a-${paragraphIndex}`"
              class="faq-section__answer"
            >
              A：{{ paragraph }}
            </p>
            <table v-if="item.table" class="faq-section__table">
              <thead>
                <tr>
                  <th
                    v-for="(header, headerIndex) in item.table.headers"
                    :key="headerIndex"
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in item.table.rows"
                  :key="rowIndex"
                >
                  <td
                    v-for="(cell, cellIndex) in row"
                    :key="cellIndex"
                  >
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
            <p
              v-for="(paragraph, paragraphIndex) in item.after || []"
              :key="`after-${paragraphIndex}`"
              class="faq-section__answer"
            >
              {{ paragraph }}
            </p>
          </article>
          <p class="faq-section__contact">
            {{ faqContact.before }}<a :href="`mailto:${faqContact.email}`">{{ faqContact.email }}</a>。
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { faqContact, faqItems } from '@/content/faqContent'

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

.faq-section__plate {
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

.faq-section__panel {
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
  background: url('@/assets/images/web/faq/section_bg.svg') center center / 100% 100% no-repeat;
}

.faq-section__title {
  display: block;
  width: 148px;
  height: auto;
  max-width: none;
  margin-bottom: 60px;
}

.faq-section__scroller {
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  width: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 56px 24px;
  color: #ffffff;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.faq-section__copy {
  flex: 0 0 auto;
  width: 100%;
  text-align: left;
}

.faq-section__item {
  margin-bottom: 32px;
}

.faq-section__question {
  margin-bottom: 8px;
  font-family: 'Dream Han Sans W12', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.45;
  color: #fff000;
}

.faq-section__answer,
.faq-section__contact {
  font-family: 'Dream Han Sans W5', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.45;
  color: #ffffff;
}

.faq-section__table {
  width: 100%;
  max-width: 520px;
  margin: 16px 0 20px;
  border-collapse: collapse;
  font-family: 'Dream Han Sans W5', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.45;
  color: #ffffff;
}

.faq-section__table th,
.faq-section__table td {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  text-align: left;
  white-space: pre-wrap;
}

.faq-section__table th {
  font-family: 'Dream Han Sans W12', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  color: #fff000;
}

.faq-section__contact {
  a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 4px;
  }
}
</style>
