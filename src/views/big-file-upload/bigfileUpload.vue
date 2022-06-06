<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import SparkMD5 from 'spark-md5'
axios.defaults.headers.post['Content-Type'] = 'multipart/form-data'

// https://juejin.cn/post/6915795898609975309
defineProps<{ msg: string }>()
const myRef = ref<HTMLInputElement | null>(null)

// 接收file，返回buffer，HASH，suffix,filename
const changeBuffer = (file: Blob) => {
  return new Promise((resolve) => {
    let fileReader = new FileReader()
    fileReader.readAsArrayBuffer(file)
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
  // 拿到file对象
  const file = myRef.value.files[0]
  //如果没有 就return
  if (!file) return
  // 表示已经上传的数组
  let already: any = []
  // 后端返回的数据
  let data: any = null
  // @ts-ignore
  // 通过changeBuffer获取hash和suffix后缀名
  let { HASH, suffix } = await changeBuffer(file)
  // 获取已经上传的切片信息，传{HASH}
  console.log(HASH, '通过spark-md5获取的hash发请求拿到already')
  data = axios({
    method: 'post',
    url: 'http://localhost:8888/upload_already',
    data: {
      HASH
    },
    headers: {}
  })
  // 如果成功
  if (+data.code === 0) {
    // 给已经上传的数组赋值
    already = data.fileList
  }
  console.log(already, 'already获取')
  // 最大的一个片大小
  let max = 1024 * 100
  // 有多少片
  let count = Math.ceil(file.size / max)
  // 计数
  let index = 0
  // chunk数组
  let chunks = []
  // 片》100
  if (count > 100) {
    //最大的一个片大小为/100 --- 避免太多片了估计
    max = file.size / 100
    // 就有100片
    count = 100
  }
  //当计数index<总的片
  while (index < count) {
    // chunk数组添加每一个对象
    chunks.push({
      file: file.slice(index * max, (index + 1) * max),
      filename: `${HASH}_${index + 1}.${suffix}`
    })
    index++
  }
  console.log(chunks, '这个chunks啥样的')
  //上传成功的处理
  index = 0

  //已上传完成
  const complate = async () => {
    index++
    if (index < count) return
    try {
      data = await axios({
        url: '/upload_merge',
        data: {
          HASH: HASH,
          count: count
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if (+data.code === 0) {
        alert(
          `恭喜您，文件上传成功，您可以基于 ${data.servicePath} 访问该文件~~`
        )
        return
      }
      throw data.codeText
    } catch (err) {
      console.log(err)
    }
  }

  //切片上传
  chunks.forEach((chunk) => {
    // 已经上传的无需上传
    if (already.length > 0 && already.includes(chunk.filename)) {
      complate()
      return
    }
    let fm = new FormData()
    fm.append('file', chunk.file)
    fm.append('filename', chunk.filename)
    axios({
      url: 'http://localhost:8888/upload_chunk',
      data: fm
    })
      .then((data: any) => {
        if (+data.code === 0) {
          complate()
          return
        }
        return Promise.reject(data.codeText)
      })
      .catch(() => {
        console.log('切片上传失败')
      })
  })
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
