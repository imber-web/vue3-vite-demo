<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'

axios.defaults.headers.post['Content-Type'] = 'multipart/form-data'
defineProps<{ msg: string }>()

const myRef = ref<HTMLInputElement | null>(null)

const chooseImg = () => {
  // @ts-ignore
  const file = myRef.value.files[0]
  let formData = new FormData()
  formData.append('file', file)
  formData.append('filename', file.name)
  axios({
    method: 'post',
    url: 'http://localhost:8000/upload_img',
    data: formData
  }).then((res) => {
    console.log(res.data)
  })
}
</script>

<template>
  <div class="item">
    <h1>{{ msg }}</h1>
    <div class="btns">
      <input
        type="file"
        class="upload_inp"
        accept=".png,.jpg,.jpeg"
        ref="myRef"
      />
      <el-button @click="chooseImg">上传图片到服务器</el-button>
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
