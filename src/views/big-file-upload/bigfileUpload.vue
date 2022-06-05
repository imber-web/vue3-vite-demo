<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import SparkMD5 from 'spark-md5'
axios.defaults.headers.post['Content-Type'] = 'multipart/form-data'

// https://juejin.cn/post/6915795898609975309
defineProps<{ msg: string }>()
const myRef = ref<HTMLInputElement | null>(null)

// 获取buffer
const changeBuffer = (file: Blob) => {
  return new Promise((resolve) => {
    let fileReader = new FileReader()
    fileReader.readAsArrayBuffer(file)
    console.log(fileReader)
    // fileReader.的onload事件里面的e.result拿到buffer
    fileReader.onload = (e) => {
      let buffer = e.target?.result
      let spark = new SparkMD5.ArrayBuffer()
      let HASH: any
      // 后缀
      let suffix: any
      // console.log('buffer', buffer)
      // console.log('spark', spark)
      spark.append(buffer)
      // console.log('spark2', spark)
      //增量式
      HASH = spark.end()
      // @ts-ignore
      suffix = /\.([a-zA-Z0-9]+)$/.exec(file.name)[1]
      resolve({
        buffer,
        HASH,
        suffix,
        filenmae: `${HASH}.${suffix}`
      })
      // console.log(HASH, 'HASH')
    }
  })
}

// 选择文件并上传
const chooseFile = async () => {
  // @ts-ignore
  const file = myRef.value.files[0]
  if (!file) return
  let already = []
  let data: any = null
  // @ts-ignore
  let { HASH, suffix } = await changeBuffer(file)
  // 获取已经上传的切片信息
  data = axios({
    method: 'post',
    url: 'http://localhost:8888/upload_already',
    data: {
      HASH
    }
  })
  if (+data.code === 0) {
    already = data.fileList
  }

  let max = 1024 * 100
  let count = Math.ceil(file.size / max)
  let index = 0
  let chunks = []

  if (count > 100) {
    max = file.size / 100
    count = 100
  }
  while (index < count) {
    chunks.push({
      file: file.slice(index * max, (index + 1) * max),
      filename: `${HASH}_${index + 1}.${suffix}`
    })
    index++
  }

  //上传成功的处理
  index = 0
}

// Blob、ArrayBuffer、File可以归为一类，它们都是数据；
// FileReader算是一种工具，用来读取数据；
// FormData可以看做是一个应用数据的场景。
// -Blob作为一个整体文件，适合用于传输；
// 而只有需要关注细节（比如要修改某一段数据时），才需要用到ArrayBuffer
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
      <el-button @click="chooseFile">上传大文件到服务器</el-button>
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
