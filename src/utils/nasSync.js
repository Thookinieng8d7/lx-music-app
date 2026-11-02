import { createClient } from 'webdav'
import RNFS from 'react-native-fs'

/**
 * 上傳檔案至綠聯 NAS (WebDAV)
 * @param {string} localFilePath 本地檔案路徑
 * @param {string} fileName 儲存檔名 (例如: "周杰倫 - 晴天.mp3")
 * @param {object} config NAS 配置
 */
export const uploadMusicToNAS = async (localFilePath, fileName, config) => {
  if (!config || !config.url || !config.enabled) return

  const client = createClient(config.url, {
    username: config.username,
    password: config.password,
  })

  try {
    const targetDir = config.targetDir || '/Music'
    if (!(await client.exists(targetDir))) {
      await client.createDirectory(targetDir, { recursive: true })
    }

    const fileData = await RNFS.readFile(localFilePath, 'base64')
    const remotePath = `${targetDir}/${fileName}`
    await client.putFileContents(remotePath, Buffer.from(fileData, 'base64'), {
      overwrite: true,
    })

    // 同步成功後是否清理手機本地檔案
    if (config.deleteAfterUpload) {
      await RNFS.unlink(localFilePath)
    }

    return { success: true }
  } catch (error) {
    console.error('[NAS Upload Failed]:', error)
    return { success: false, error: error.message }
  }
}