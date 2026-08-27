<template>
  <div
    class="flip-countdown"
    role="timer"
    :aria-label="ariaLabel"
  >
    <div
      v-for="unit in units"
      :key="unit.key"
      class="flip-countdown__unit"
    >
      <FlipDigit :digit="unit.tens" />
      <FlipDigit :digit="unit.ones" />
      <span class="flip-countdown__label">{{ unit.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import FlipDigit from './FlipDigit.vue'

const props = defineProps({
  endTime: {
    type: [String, Number, Date],
    required: true
  }
})

function computeRemain(endTime) {
  const end = new Date(endTime).getTime()
  const diff = Number.isFinite(end) ? Math.max(0, end - Date.now()) : 0
  return {
    days: Math.min(99, Math.floor(diff / 86400000)),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000)
  }
}

const remain = ref(computeRemain(props.endTime))
let tickTimer = null

function pad2(value) {
  return String(Math.max(0, value)).padStart(2, '0').slice(-2)
}

function readRemain() {
  remain.value = computeRemain(props.endTime)
}

const units = computed(() => {
  const days = pad2(remain.value.days)
  const hours = pad2(remain.value.hours)
  const minutes = pad2(remain.value.minutes)
  const seconds = pad2(remain.value.seconds)

  return [
    { key: 'days', label: 'days', tens: days[0], ones: days[1] },
    { key: 'hours', label: 'hours', tens: hours[0], ones: hours[1] },
    { key: 'minutes', label: 'minutes', tens: minutes[0], ones: minutes[1] },
    { key: 'seconds', label: 'seconds', tens: seconds[0], ones: seconds[1] }
  ]
})

const ariaLabel = computed(() => {
  const { days, hours, minutes, seconds } = remain.value
  return `倒计时 ${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`
})

watch(() => props.endTime, readRemain)

onMounted(() => {
  readRemain()
  tickTimer = window.setInterval(readRemain, 1000)
})

onUnmounted(() => {
  if (tickTimer != null) {
    clearInterval(tickTimer)
    tickTimer = null
  }
})
</script>

<style scoped lang="scss">
.flip-countdown {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  pointer-events: none;
  user-select: none;
}

.flip-countdown__unit {
  position: relative;
  display: flex;
  gap: 8px;
}

.flip-countdown__unit:nth-child(3) {
  margin-left: auto;
}

.flip-countdown__label {
  position: absolute;
  top: 86px;
  left: 0;
  font-family: 'Nacelle', sans-serif;
  font-size: 10px;
  font-weight: 400;
  line-height: 1;
  color: #fff;
  white-space: nowrap;
}
</style>
