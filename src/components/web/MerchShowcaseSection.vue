<template>
  <section class="web-section merch-showcase-section">
    <img
      class="merch-showcase-section__banner"
      src="@/assets/images/web/periphery/1.svg"
      alt=""
      draggable="false"
      @click="openQrcode"
    />
    <div class="merch-showcase-section__row">
      <img
        class="merch-showcase-section__item"
        src="@/assets/images/web/periphery/2.svg"
        alt=""
        draggable="false"
        @click="openQrcode"
      />
      <img
        class="merch-showcase-section__item"
        src="@/assets/images/web/periphery/3.svg"
        alt=""
        draggable="false"
        @click="openQrcode"
      />
      <img
        class="merch-showcase-section__item"
        src="@/assets/images/web/periphery/4.svg"
        alt=""
        draggable="false"
        @click="openQrcode"
      />
    </div>
    <Teleport to="body">
      <div
        v-if="qrcodeVisible"
        class="merch-qrcode"
        role="dialog"
        aria-modal="true"
        aria-label="二维码"
        @click.self="closeQrcode"
      >
        <img
          class="merch-qrcode__image"
          src="@/assets/images/web/periphery/qrcode.svg"
          alt="二维码"
          draggable="false"
        />
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { onUnmounted, ref, watch } from 'vue'

const qrcodeVisible = ref(false)

function openQrcode() {
  qrcodeVisible.value = true
}

function closeQrcode() {
  qrcodeVisible.value = false
}

function onEscape(event) {
  if (event.key === 'Escape') closeQrcode()
}

watch(qrcodeVisible, (visible) => {
  if (visible) {
    window.addEventListener('keydown', onEscape)
    return
  }
  window.removeEventListener('keydown', onEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onEscape)
})
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

.merch-qrcode {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 6, 23, 0.55);
}

.merch-qrcode__image {
  display: block;
  width: 350px;
  height: auto;
}
</style>
