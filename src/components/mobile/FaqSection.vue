<template>
  <section class="mobile-section faq-section">
    <img
      class="faq-section__title"
      src="@/assets/images/mobile/faq/title.svg"
      alt="FAQ 常见问题"
      draggable="false"
    />
    <div class="faq-section__scroller">
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
  </section>
</template>

<script setup>
import { faqContact, faqItems } from '@/content/faqContent'
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

.faq-section__title {
  display: block;
  width: 74px;
  height: auto;
  max-width: none;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.faq-section__scroller {
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

.faq-section__copy {
  flex: 0 0 auto;
  width: 100%;
  text-align: left;
}

.faq-section__item {
  margin-bottom: 16px;
}

.faq-section__question {
  margin-bottom: 4px;
  font-family: 'Dream Han Sans W12', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;
  color: #fff000;
}

.faq-section__answer,
.faq-section__contact {
  font-family: 'Dream Han Sans W5', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;
  color: #f1f1f1;
}

.faq-section__table {
  width: 100%;
  margin: 10px 0 12px;
  border-collapse: collapse;
  font-family: 'Dream Han Sans W5', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.45;
  color: #f1f1f1;
}

.faq-section__table th,
.faq-section__table td {
  padding: 4px 8px;
  border: 1px solid rgba(241, 241, 241, 0.45);
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
    text-underline-offset: 2px;
  }
}
</style>
