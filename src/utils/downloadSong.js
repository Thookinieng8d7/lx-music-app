import RNFS from 'react-native-fs'
import { uploadMusicToNAS } from './nasSync'

/**
 * 下載歌曲並同步至 NAS
 * @param {object} musicInfo 歌曲資訊 (name, singer, ext)
 * @param {string} audioUrl 歌曲真實下載/播放連結
 * @param {object} nasConfig NAS 帳號連線設定
 */
export const downloadAndSyncToNAS = async (musicInfo, audioUrl, nasConfig) => {
  const downloadDir = `${RNFS.ExternalStorageDirectoryPath}/Music/LXMusic`

  if (!(await RNFS.exists(downloadDir))) {
    await RNFS.mkdir(downloadDir)
  }

  const fileName = `${musicInfo.singer || '未知'} - ${musicInfo.name || '未知'}.${musicInfo.ext || 'mp3'}`
  const localFilePath = `${downloadDir}/${fileName}`

  const res = await RNFS.downloadFile({
    fromUrl: audioUrl,
    toFile: localFilePath,
    background: true,
  }).promise

  if (res.statusCode === 200) {
    if (nasConfig && nasConfig.enabled) {
      await uploadMusicToNAS(localFilePath, fileName, nasConfig)
    }
    return { success: true, path: localFilePath }
  } else {
    throw new Error(`Download failed with status code ${res.statusCode}`)
  }
}