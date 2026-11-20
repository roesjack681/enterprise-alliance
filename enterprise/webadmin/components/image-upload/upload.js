import CryptoJS from 'crypto-js'

// 分片大小（500KB）
const CHUNK_SIZE = 500 * 1024

// 项目名称作为请求头传给后端，决定上传路径
const PROJECT_NAME = 'enterprise'

// 判断平台
const platform = uni.getSystemInfoSync().platform
const isMiniProgram = process.env.UNI_PLATFORM === 'mp-weixin'

// 计算文件哈希（SHA256）
const calculateFileHash = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
  return CryptoJS.SHA256(wordArray).toString()
}

// 读取文件指定分片为 base64
const readChunkAsBase64 = async (file, start, end) => {
  if (isMiniProgram) {
    const fs = wx.getFileSystemManager()
    return new Promise((resolve, reject) => {
      fs.readFile({
        filePath: file.tempFilePath,
        position: start,
        length: end - start,
        encoding: 'base64',
        success: res => resolve(res.data),
        fail: reject
      })
    })
  } else {
    const blob = file.slice(start, end)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result.replace(/^data:.+;base64,/, '')
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}

// 包装 uni.request 为 Promise（附带 project 请求头）
const uniPost = (url, data) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: 'POST',
      header: {
        'x-project-name': PROJECT_NAME,
        'Content-Type': 'application/json'
      },
      data,
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

// 控制并发数的异步池
const concurrencyPool = async (tasks, concurrency = 5) => {
  const results = []
  const executing = []

  for (const task of tasks) {
    const p = task().then(res => {
      executing.splice(executing.indexOf(p), 1)
      return res
    })
    results.push(p)
    executing.push(p)
    if (executing.length >= concurrency) {
      await Promise.race(executing)
    }
  }
  return Promise.all(results)
}

// 单片上传（带重试机制）
const uploadChunkWithRetry = async ({
  file,
  index,
  hash,
  total,
  suffix,
  uploadUrl,
  retries = 3
}) => {
  const start = index * CHUNK_SIZE
  const end = Math.min(file.size, (index + 1) * CHUNK_SIZE)
  const base64Chunk = await readChunkAsBase64(file, start, end)

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const payload = {
        chunk: base64Chunk,
        hash: `${hash}-${index}`,
        index,
        total,
        suffix
      }
      const res = await uniPost(uploadUrl, payload)
      if (![200, 206].includes(res.code)) {
        throw new Error(`上传分片 ${index} 失败，状态码 ${res.code}`)
      }
      return res
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise(r => setTimeout(r, 1000 * 2 ** (attempt - 1))) // 指数退避
    }
  }
}

/**
 * 将文件按 base64 分片方式上传，支持并发上传、断点续传与失败重试。
 * 
 * @param {File} file - 要上传的文件对象（浏览器或小程序 File 对象）。
 * @param {Object} options - 上传配置项。
 * @param {Function} [options.onProgress] - 上传进度回调函数，参数为完成百分比 (0-100)。
 * @param {string} [options.verifyUrl='/upload/verFileIsExist'] - 验证接口。
 * @param {string} [options.uploadUrl='/upload/upload'] - 上传接口。
 * @param {number} [options.concurrency=5] - 最大并发上传分片数。
 * @param {number} [options.retries=3] - 单个分片失败后的最大重试次数。
 * 
 * @returns {Promise<Object>} 最终服务端返回合并完成后的响应结果。
 */
export const uploadFileInChunks = async (file, {
  onProgress = () => {},
  verifyUrl = '/upload/verFileIsExist',
  uploadUrl = '/upload/upload',
  concurrency = 5,
  retries = 3
} = {}) => {
  const suffix = file.name.split('.').pop()
  const total = Math.ceil(file.size / CHUNK_SIZE)
  const hash = await calculateFileHash(file)

  const verifyRes = await uniPost(verifyUrl, { fileHash: hash, suffix })
  if (verifyRes.shouldUpload === false) {
    return { code: 200, message: '文件已存在，无需上传', filePath: verifyRes.filePath }
  }

  const uploadedChunks = verifyRes.uploadedChunkList || []
  const missingChunks = Array.from({ length: total }, (_, i) => i)
    .filter(i => !uploadedChunks.includes(i.toString()))

  let uploadedCount = 0
  let finalRes = null

  const tasks = missingChunks.map(index => async () => {
    const res = await uploadChunkWithRetry({
      file,
      index,
      hash,
      total,
      suffix,
      uploadUrl,
      retries
    })
    if (res.code === 200) {
      finalRes = res
    }
    uploadedCount++
    onProgress(Math.floor((uploadedCount / missingChunks.length) * 100))
    return res
  })

  await concurrencyPool(tasks, concurrency)

  return finalRes || { code: 200, message: '全部分片已上传，但未收到合并响应', filePath: '' }
}
