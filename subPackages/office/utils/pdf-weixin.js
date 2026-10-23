// 仅由 pdf-service.uts 的 MP-WEIXIN 分支引用，不使用 DOM、网络或远程服务。
import { PDFDocument } from '../vendor/pdf-lib.esm.min.js'

// data
const MAX_BYTES = 30 * 1024 * 1024
const MAX_PAGES = 200
let sequence = 0

// methods
const api = (method, options) => new Promise((resolve, reject) => {
  method({ ...options, success: resolve, fail: reject })
})
const fs = () => wx.getFileSystemManager()
const friendlyError = (error) => {
  const message = String(error?.message || error?.errMsg || error)
  if (/cancel/i.test(message)) return new Error('cancel')
  if (/encrypt|password/i.test(message)) return new Error('暂不支持加密 PDF，请先解密后重试')
  if (/limit|quota|space|exceed/i.test(message)) return new Error('文件大小或本地存储空间超出限制，请减少文件后重试')
  if (/permission|auth|deny/i.test(message)) return new Error('未获得文件访问权限，请允许访问后重试')
  if (error instanceof Error && /[\u4e00-\u9fff]/.test(message)) return error
  return new Error('文件处理失败，请确认文件未损坏且为普通未加密 PDF 或 JPG/PNG 图片')
}
const readBytes = async (path) => {
  const info = await api(fs().getFileInfo.bind(fs()), { filePath: path })
  if (info.size <= 0 || info.size > MAX_BYTES) throw new Error('文件不能为空，单次处理总大小不能超过 30 MB')
  const result = await api(fs().readFile.bind(fs()), { filePath: path })
  return new Uint8Array(result.data)
}
const loadPdf = async (path) => {
  const doc = await PDFDocument.load(await readBytes(path), { updateMetadata: false })
  if (doc.isEncrypted) throw new Error('暂不支持加密 PDF')
  if (doc.getPageCount() < 1 || doc.getPageCount() > MAX_PAGES) throw new Error('单份 PDF 页数需在 1-200 页以内')
  return doc
}
const checkFiles = async (files) => {
  if (!Array.isArray(files) || files.length < 1 || files.length > 12) throw new Error('请选择 1-12 份文件')
  let total = 0
  for (const file of files) {
    const info = await api(fs().getFileInfo.bind(fs()), { filePath: file.path })
    total += info.size
  }
  if (total > MAX_BYTES) throw new Error('单次处理文件总大小不能超过 30 MB')
}

export const selectPdfFiles = async (count) => {
  try {
    const result = await api(wx.chooseMessageFile.bind(wx), {
      count: Math.min(Math.max(count, 1), 12), type: 'file', extension: ['pdf']
    })
    await checkFiles(result.tempFiles)
    const files = []
    for (const file of result.tempFiles) {
      if (!/\.pdf$/i.test(file.name)) throw new Error('请选择 .pdf 文件')
      const doc = await loadPdf(file.path)
      files.push({ id: `${Date.now()}-${++sequence}`, path: file.path, name: file.name, size: file.size, pages: doc.getPageCount() })
    }
    return JSON.stringify(files)
  } catch (error) {
    throw friendlyError(error)
  }
}

const addImagePage = async (doc, file, paper, direction) => {
  const bytes = await readBytes(file.path)
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8
  const png = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  if (!jpeg && !png) throw new Error('图片转 PDF 仅支持 JPG、PNG，请先转换 HEIC/WebP 等图片格式')
  const info = await api(wx.getImageInfo.bind(wx), { src: file.path })
  if (info.width * info.height > 24000000) throw new Error('单张图片不能超过 2400 万像素，请先缩小分辨率')
  const rotated = ['left', 'right', 'left-mirrored', 'right-mirrored'].includes(info.orientation)
  // 相机照片可能依赖 EXIF 旋转。避免输出方向错误，要求先保存为正向图片。
  if (rotated || ['down', 'down-mirrored', 'up-mirrored'].includes(info.orientation)) {
    throw new Error('这张照片包含旋转或镜像方向，请先在相册中编辑并保存为正向图片后重试')
  }
  const image = jpeg ? await doc.embedJpg(bytes) : await doc.embedPng(bytes)
  let width = paper === 'A5' ? 419.53 : 595.28
  let height = paper === 'A5' ? 595.28 : 841.89
  if (paper === '原图') {
    width = image.width * 0.75
    height = image.height * 0.75
  }
  const landscape = direction === '横向' || (direction === '自动' && image.width > image.height)
  if ((landscape && width < height) || (!landscape && width > height)) [width, height] = [height, width]
  if (Math.max(width, height) > 14400) throw new Error('原图尺寸超出 PDF 限制，请改用 A4 或 A5')
  const margin = paper === '原图' ? 0 : 18
  const scale = Math.min((width - margin * 2) / image.width, (height - margin * 2) / image.height)
  const imageWidth = image.width * scale
  const imageHeight = image.height * scale
  const page = doc.addPage([width, height])
  page.drawImage(image, { x: (width - imageWidth) / 2, y: (height - imageHeight) / 2, width: imageWidth, height: imageHeight })
}

export const runPdfTask = async (kind, json) => {
  let outputPath = ''
  try {
    const payload = JSON.parse(json)
    await checkFiles(payload.files)
    const doc = await PDFDocument.create()
    if (kind === 'images') {
      for (const file of payload.files) await addImagePage(doc, file, payload.paper, payload.direction)
    } else if (kind === 'merge') {
      for (const file of payload.files) {
        const source = await loadPdf(file.path)
        if (doc.getPageCount() + source.getPageCount() > MAX_PAGES) throw new Error('合并后不能超过 200 页')
        const pages = await doc.copyPages(source, source.getPageIndices())
        pages.forEach(page => doc.addPage(page))
      }
    } else if (kind === 'split') {
      if (payload.files.length !== 1) throw new Error('拆分时只能选择一份 PDF')
      const source = await loadPdf(payload.files[0].path)
      const indices = payload.indices
      if (!Array.isArray(indices) || indices.length < 1 || indices.length > MAX_PAGES ||
          indices.some(index => !Number.isInteger(index) || index < 0 || index >= source.getPageCount())) {
        throw new Error('提取页码无效，请重新设置页码')
      }
      const pages = await doc.copyPages(source, [...new Set(indices)].sort((a, b) => a - b))
      pages.forEach(page => doc.addPage(page))
    } else {
      throw new Error('不支持的 PDF 操作')
    }
    const bytes = await doc.save({ useObjectStreams: true })
    const names = { images: '图片合集.pdf', merge: '合并文档.pdf', split: '文档_提取.pdf' }
    const extractedName = payload.files[0].name.replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').slice(0, 80)
    const name = kind === 'split' ? `${extractedName}_提取.pdf` : names[kind]
    outputPath = `${wx.env.USER_DATA_PATH}/shixu-pdf-temp-${Date.now()}-${++sequence}.pdf`
    // 必须写入视图对应的字节范围，不能将带偏移的整个底层缓冲区写入。
    const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    await api(fs().writeFile.bind(fs()), { filePath: outputPath, data })
    return JSON.stringify({ path: outputPath, name, size: bytes.length, pages: doc.getPageCount() })
  } catch (error) {
    if (outputPath) removePdfFile(outputPath)
    throw friendlyError(error)
  }
}

export const exportPdfFile = async (path, name, share) => {
  try {
    if (share) {
      if (typeof wx.shareFileMessage !== 'function') throw new Error('当前微信版本不支持分享文件，请升级微信或使用保存文件菜单')
      await api(wx.shareFileMessage.bind(wx), { filePath: path, fileName: name })
      return true
    }
    // 保存一份用户主动保留的文件，页面离开时只清理 temp，不删除此副本。
    const savedPath = `${wx.env.USER_DATA_PATH}/shixu-pdf-saved-${Date.now()}-${++sequence}.pdf`
    await api(fs().copyFile.bind(fs()), { srcPath: path, destPath: savedPath })
    try {
      await api(wx.openDocument.bind(wx), { filePath: savedPath, fileType: 'pdf', showMenu: true })
    } catch (error) {
      fs().unlink({ filePath: savedPath, fail: () => {} })
      throw error
    }
    return true
  } catch (error) {
    throw friendlyError(error)
  }
}

export const removePdfFile = (path) => {
  if (!path.startsWith(`${wx.env.USER_DATA_PATH}/shixu-pdf-temp-`)) return
  fs().unlink({ filePath: path, fail: () => {} })
}
