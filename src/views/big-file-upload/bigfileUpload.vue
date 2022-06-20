<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import SparkMD5 from 'spark-md5'
axios.defaults.headers.post['Content-Type'] = 'multipart/form-data'

defineProps<{ msg: string }>()
const myRef = ref<HTMLInputElement | null>(null)

//计算hash
const changeBuffer = (file: Blob) => {
  return new Promise((resolve) => {
    let fileReader = new FileReader()
    fileReader.readAsArrayBuffer(file)
    // fileReader.的onload事件里面的e.result拿到buffer
    fileReader.onload = (e) => {
      let buffer = e.target?.result
      let spark = new SparkMD5.ArrayBuffer()
      let HASH: any
      let suffix: any // 后缀
      spark.append(buffer)
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
    }
  })
}
//获取chunks（分片）
const getFileChunks = (file: any, HASH: any, suffix: any) => {
  const size = 50 * 10 * 1024
  let fileChunks: any = []
  let index = 0 //序号
  for (let cur = 0; cur < file?.size; cur += size) {
    fileChunks.push({
      file: file?.slice(cur, cur + size),
      filename: `${HASH}_${index + 1}.${suffix}`
    })
  }
  return fileChunks
}
//上传完通知合并
const postmerge = (HASH: any) => {
  return axios({
    method: 'post',
    url: 'http://127.0.0.1:8888/upload_merge',
    data: {
      HASH: HASH
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}
//获取已上传信息
const getalready = (HASH: any) => {
  return axios({
    method: 'get',
    url: 'http://127.0.0.1:8888/upload_already',
    params: {
      HASH: HASH
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
//上传切片（秒传，续传，并发控制）
const postChunks = async (
  list: any,
  HASH: any,
  fileChunks: any,
  fileList: any
) => {
  if (list.length === 0) {
    await postmerge(HASH)
    return
  }
  let pool: any = []
  let max = 3
  let finish = 0
  let failList: any = [] //续传
  for (let i = 0; i < fileChunks.length; i++) {
    let item = fileChunks[i]
    // 秒传
    if (fileList.includes(item.filename)) {
      console.log('已经上传了,直接视为成功，秒传')
      return
    }
    let formData = new FormData()
    formData.append('file', item.file)
    formData.append('filename', item.filename)
    let task = axios({
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      url: 'http://localhost:8888/upload_chunk',
      data: formData
    })
    task
      .then((data) => {
        //请求结束后将该Promise任务从并发池中移除
        let index = pool.findIndex((t: any) => t === task)
        pool.splice(index, 1)
      })
      .catch(() => {
        failList.push(item)
      })
      .finally(() => {
        finish++
        if (finish === list.length) {
          postChunks(failList, HASH, fileChunks, fileList)
        }
      })
    pool.push(task)
    if (pool.length === max) {
      //每当并发池跑完一个任务，就再塞入一个任务
      await Promise.race(pool)
    }
  }
}

// Blob、ArrayBuffer、File可以归为一类，它们都是数据；
// FileReader算是一种工具，用来读取数据；
// FormData可以看做是一个应用数据的场景。
// Blob作为一个整体文件，适合用于传输；
// 而只有需要关注细节（比如要修改某一段数据时），才需要用到ArrayBuffer
const chooseFile = async () => {
  // @ts-ignore 第一步：拿到文件对象
  const file: any = myRef.value?.files[0]
  // @ts-ignore 第二步：计算hash
  let { HASH, suffix } = await changeBuffer(file)
  // @ts-ignore 第三步：获取切片，切片上传功能
  let fileChunks = getFileChunks(file, HASH, suffix)
  // 第四步发请求查看已经上传完的信息
  let {
    data: { fileList }
  } = await getalready(HASH)
  //第五步 上传切片（没有上传的、断点续传功能，秒传功能）
  await postChunks(fileChunks, HASH, fileChunks, fileList)
}
</script>

<template>
  <div class="item">
    <h1>{{ msg }}</h1>
    <div class="btns">
      <!-- wins必须在js做限制 -->
      <!-- accept=".png,.jpg,.jpeg" -->
      <input type="file" class="upload_inp" ref="myRef" />
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
