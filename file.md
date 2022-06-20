### 分片上传

1. 初始化，拿到文件对象file = files[0]，定义size=50*1024，每一片50kb，定义fileChunks = [ ] 装每一片对象

   ```js
   const file: any = myRef.value?.files[0]
   const size = 50 * 1024
   let fileChunks = []
   let index = 0 //序号
   ```

2. 循环切割file，装入fileChunks

   ```js
   for (let cur = 0; cur < file?.size; cur += size) {
       fileChunks.push({
         hash: index++,
         chunk: file?.slice(cur, cur + size)
       })
     }
   ```

3. 把fileChunks变为[promise]格式

   ```js
   const uploadList = fileChunks.map((item, index) => {
       let formalData = new FormData()
       formalData.append('filename', file.name)
       formalData.append('hash', String(item.hash))
       formalData.append('chunk', item.chunk)
       return axios({
           url: 'http://localhost:8888/upload_chunk',
           headers: {
           'Content-Type': 'multipart/form-data'
           },
           method: 'post',
           data: formalData
       })
   })
   ```

4. 使用promise.all发请求，并在结束的时候发请求通知合并切片

   ```js
   await Promise.all(uploadList)
   await axios({
       method: 'post',
       url: 'http://127.0.0.1:8888/upload_merge',
       data: {
           HASH: 'HASH',
           count: 1
       },
       headers: {
           'Content-Type': 'application/x-www-form-urlencoded'
       }
   })
   ```

5. 总结：初始化->切割文件装入数组->数组包pormise格式->promise.all发请求->发请求通知合并切片

### 并发控制

1. 初始化

   ```js
   let pool = []
   let max = 3
   ```

2. 遍历生成promise，并push进pool，在promise完成后从pool删除

   ```js
   for(let i=0;i<fileChunks.length;i++){
       let item = fileChunks[i]
       let formData = new FormData()
       formData.append('filename', file.name)
       formData.append('hash', item.hash)
       formData.append('chunk', item.chunk)
       let task = axios({
           method: 'post',
           url: '/upload',
           data: formData
       })
       task.then((data)=>{
           //请求结束后将该Promise任务从并发池中移除
           let index = pool.findIndex(t=> t===task)
           pool.splice(index,1)
       })
       pool.push(task)
   }
   ```

3. 当pool达到最大并发数

   ```js
   if (pool.length === max) {
       //赛跑，执行完一个之后停止，且阻塞后面promise生成
       await Promise.race(pool)
   }
   ```

   
