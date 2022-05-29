<script setup lang="ts">
defineProps<{ msg: string }>()
const chooseFile = () => {}

const updateFile = () => {}
</script>

<template>
  <div class="item">
    <h1>{{ msg }}</h1>
    <el-button @click="chooseFile">选择文件</el-button>
    <el-button @click="updateFile">上传到服务器</el-button>
  </div>
</template>

<style scoped>
.item {
  height: 200px;
  width: 400px;
  border: 1px dashed #ccc;
}
</style>
