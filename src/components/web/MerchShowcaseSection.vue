<template>
  <section class="web-section merch-showcase-section">
    <a
      class="merch-showcase-section__banner"
      :href="merchHref"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="前往小红书"
    >
      <img
        src="@/assets/images/web/periphery/1.svg"
        alt=""
        draggable="false"
      />
    </a>
    <div class="merch-showcase-section__row">
      <a
        v-for="src in merchItems"
        :key="src"
        class="merch-showcase-section__item"
        :href="merchHref"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="前往小红书"
      >
        <img :src="src" alt="" draggable="false" />
      </a>
    </div>
  </section>
</template>

<script setup>
import merchItem2 from '@/assets/images/web/periphery/2.svg'
import merchItem3 from '@/assets/images/web/periphery/3.svg'
import merchItem4 from '@/assets/images/web/periphery/4.svg'

const merchHref =
  'https://www.xiaohongshu.com/user/profile/69fb3d8e0000000002001c08?xsec_token=ABpN3sUtBdDY6wccECFpZQ9qkfXazFRjUta0KNLon1ocY%3D&xsec_source=pc_search'
const merchItems = [merchItem2, merchItem3, merchItem4]
</script>

<style scoped lang="scss">
.web-section {
  box-sizing: border-box;
  width: 1340px;
  height: 708px;
  flex-shrink: 0;
  padding: 18px 0 0 22px;
  background: url('@/assets/images/web/periphery/section_bg.svg') center center / 100% 100% no-repeat;
}

.merch-showcase-section {
  display: flex;
  flex-direction: column;
}

.merch-showcase-section__banner,
.merch-showcase-section__item {
  cursor: pointer;

  img {
    display: block;
    width: 100%;
    height: 100%;
    max-width: none;
    pointer-events: none;
  }
}

.merch-showcase-section__banner {
  display: block;
  width: 1296px;
  height: 296px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.merch-showcase-section__row {
  display: flex;
  width: 1296px;
  gap: 12px;
  flex-shrink: 0;
}

.merch-showcase-section__item {
  display: block;
  width: 424px;
  height: 366px;
  flex-shrink: 0;
}
</style>
