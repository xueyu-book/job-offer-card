<template>
  <main class="web-home">
    <h1 class="web-home__title">求职卡 · PC</h1>
    <p class="web-home__desc">Web 端页面（设计稿 1920）</p>
  </main>
</template>

<script setup>
</script>

<style scoped lang="scss">
.web-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 48px;
  background: $color-bg;
}

.web-home__title {
  font-size: 48px;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 16px;
}

.web-home__desc {
  font-size: 20px;
  color: $color-muted;
}
</style>
