<template>
  <section class="mobile-section merch-showcase-section">
    <a
      class="merch-showcase-section__banner"
      :href="merchHref"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="前往小红书"
    >
      <img
        src="@/assets/images/mobile/periphery/1.svg"
        alt=""
        draggable="false"
      />
    </a>
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
  </section>
</template>

<script setup>
import merchItem2 from '@/assets/images/mobile/periphery/2.svg'
import merchItem3 from '@/assets/images/mobile/periphery/3.svg'
import merchItem4 from '@/assets/images/mobile/periphery/4.svg'

const merchHref =
  'https://www.xiaohongshu.com/user/profile/69fb3d8e0000000002001c08?xsec_token=ABpN3sUtBdDY6wccECFpZQ9qkfXazFRjUta0KNLon1ocY%3D&xsec_source=pc_search'
const merchItems = [merchItem2, merchItem3, merchItem4]
</script>

<style scoped lang="scss">
.mobile-section {
  box-sizing: border-box;
  width: 297px;
  height: 489px;
  flex-shrink: 0;
  padding: 10px 11px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: url('@/assets/images/mobile/periphery/section_bg.svg') center center / 100% 100% no-repeat;

  &::-webkit-scrollbar {
    display: none;
  }
}

.merch-showcase-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.merch-showcase-section__banner,
.merch-showcase-section__item {
  display: block;
  flex-shrink: 0;
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
  width: 275px;
  height: 64px;
}

.merch-showcase-section__item {
  width: 275px;
  height: 130px;
}
</style>
