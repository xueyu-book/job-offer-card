<template>
  <main class="mobile-home">
    <h1 class="mobile-home__title">求职卡 · 手机</h1>
    <p class="mobile-home__desc">Mobile 端页面（设计稿 375）</p>
  </main>
</template>

<script setup>
</script>

<style scoped lang="scss">
.mobile-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: $color-bg;
}

.mobile-home__title {
  font-size: 24px;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 12px;
}

.mobile-home__desc {
  font-size: 14px;
  color: $color-muted;
}
</style>
