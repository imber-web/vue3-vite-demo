export const Concurrency = () => {
  const arr: any = []
  for (let i = 0; i < 3; i++) {
    arr.push(
      new Promise((resolve, reject) => {
        resolve(i)
      })
    )
  }
}
