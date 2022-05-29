<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// TODO:点击不能跳转对应组件
import imgUpload from '@/views/big-file-upload/imgUpload.vue'
import bigfileUpload from '@/views/big-file-upload/bigfileUpload.vue'
</script>

<template>
  <div class="content">
    <imgUpload msg="图片上传" />
    <bigfileUpload msg="大文件上传" />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 80%;
  margin: 0 auto;
}
</style>
