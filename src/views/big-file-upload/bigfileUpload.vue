<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
// https://juejin.cn/post/6915795898609975309
defineProps<{ msg: string }>()
const myRef = ref<HTMLInputElement | null>(null)
const chooseFile = () => {
  // @ts-ignore
  const file = myRef.value.files[0]
  changeBuffer(file)
  // axios.defaults.headers.post['Content-Type'] = 'multipart/form-data'
  // axios({
  //   method: 'post',
  //   url: 'http://localhost:8888/upload_single',
  //   data: formData
  // }).then((res) => {
  //   console.log(res.data)
  // })
}

const changeBuffer = (file: Blob) => {
  return new Promise((resolve) => {
    let fileReader = new FileReader()
    fileReader.readAsArrayBuffer(file)
    console.log(fileReader)
    fileReader.onload = (e) => {
      let buffer = e.target?.result
      console.log(buffer)
    }
  })
}

// Blob、ArrayBuffer、File可以归为一类，它们都是数据；
// FileReader算是一种工具，用来读取数据；
// FormData可以看做是一个应用数据的场景。
// -Blob作为一个整体文件，适合用于传输；
// 而只有需要关注细节（比如要修改某一段数据时），才需要用到ArrayBuffer

const updateFile = () => {}
</script>

<template>
  <div class="item">
    <h1>{{ msg }}</h1>
    <div class="btns">
      <!-- wins必须在js做限制 -->
      <input
        type="file"
        class="upload_inp"
        accept=".png,.jpg,.jpeg"
        ref="myRef"
      />
      <el-button @click="chooseFile">选择文件</el-button>
      <el-button @click="updateFile">上传到服务器</el-button>
    </div>
  </div>
</template>

<style scoped>
.item {
  height: 200px;
  width: 600px;
  border: 1px dashed #ccc;
}
.btns {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
</style>
