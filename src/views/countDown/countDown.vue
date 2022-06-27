<template>
  <h1>{{ count }}</h1>
  <button @click="suspend">暂停</button>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
const props = defineProps<{
  time: number
  onTime: Function
}>()
const count = ref(props.time)
const flag = ref(true)
if (props.time <= 0 || count.value <= 0) {
  props.onTime()
}
const timer = setInterval(() => {
  if (count.value > 0 && flag.value === true) {
    count.value--
  }
}, 1000)
onBeforeUnmount(() => {
  clearInterval(timer)
})
const suspend = () => {
  flag.value = !flag.value
}
</script>
