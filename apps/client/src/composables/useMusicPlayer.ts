import { ref } from 'vue'
import  type { LyricLine, Track } from '@/types/music'

// 播放列表
const playlist: Track[] = [
  { id: 1, title: '晴天', artist: '周杰伦', src: '/audio/周杰伦-晴天.mp3', lrcSrc: '/audio/晴天-周杰伦-歌词.lrc' },
  { id: 2, title: '花海', artist: '周杰伦', src: '/audio/周杰伦-花海.mp3', lrcSrc: '/audio/花海-周杰伦-歌词.lrc' },
  { id: 3, title: '等你下课', artist: '周杰伦', src: '/audio/等你下课 - 周杰伦.mp3', lrcSrc: '/audio/等你下课-周杰伦-歌词.lrc' },
  { id: 4, title: '发如雪', artist: '周杰伦', src: '/audio/周杰伦 - 发如雪.mp3', lrcSrc: '/audio/发如雪-周杰伦-歌词.lrc' },
  { id: 5, title: '你听得到', artist: '周杰伦', src: '/audio/周杰伦 - 你听得到.mp3', lrcSrc: '/audio/你听得到-周杰伦-歌词.lrc' },
]

// 是否正在播放
const isPlaying = ref(false)
// 当前播放的歌曲
const currentTrack = ref<Track>(playlist[0])
// 播放列表面板是否打开
const playlistOpen = ref(false)
// 音频可视化波形高度
const heights = ref([0.3, 0.3, 0.3, 0.3, 0.3])
// 解析后的歌词数组
const lyrics = ref<LyricLine[]>([])
// 当前高亮歌词索引
const currentLyricIndex = ref(-1)
// 当前显示的歌词文本
const currentLyricText = ref('')

// 音频实例
let audio: HTMLAudioElement | null = null
// 波形动画定时器
let intervalId: ReturnType<typeof setInterval> | null = null
// 歌词同步定时器
let lyricIntervalId: ReturnType<typeof setInterval> | null = null

// 生成 5 个随机波形高度（0.2~1.1）
const randomHeights = () =>
  Array.from({ length: 5 }, () => Math.random() * 0.9 + 0.2)

// 解析 LRC 歌词文本
const parseLrc = (text: string): LyricLine[] => {
  const lines: LyricLine[] = []
  // 按行拆分
  for (const raw of text.split('\n')) {
    // 正则匹配 [00:00.00] 开头的歌词行
    const match = raw.match(/^\[(\d{2}):(\d{2})\.\d{2,3}\]\s*(.*)$/)
    if (match) {
      // 转换成秒数
      const time = parseInt(match[1], 10) * 60 + parseInt(match[2], 10)
      const text = match[3].trim()
      // 只添加非空歌词
      if (text) lines.push({ time, text })
    }
  }
  // 按时间从小到大排序
  return lines.sort((a, b) => a.time - b.time)
}

// 根据当前播放时间查找对应歌词索引
const findLyricIndex = (currentTime: number): number => {
  // 倒序找：第一个 <= 当前时间的歌词
  for (let i = lyrics.value.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics.value[i].time) return i
  }
  return -1
}

// 加载并解析歌词文件
const loadLyrics = async (lrcSrc: string) => {
  try {
    const res = await fetch(lrcSrc)
    const text = await res.text()
    // 解析歌词
    lyrics.value = parseLrc(text)
    // 重置歌词状态
    currentLyricIndex.value = -1
    currentLyricText.value = ''
  } catch {
    // 加载失败清空歌词
    lyrics.value = []
    currentLyricIndex.value = -1
    currentLyricText.value = ''
  }
}

// 开始播放波形动画
const startWaveform = () => {
  // 先设置一次
  heights.value = randomHeights()
  // 每 100ms 更新一次高度
  intervalId = setInterval(() => {
    heights.value = randomHeights()
  }, 100)
}

// 停止波形动画
const stopWaveform = () => {
  if (intervalId) clearInterval(intervalId)
  intervalId = null
  // 恢复默认高度
  heights.value = [0.3, 0.3, 0.3, 0.3, 0.3]
}

// 开始同步歌词
const startLyricSync = () => {
  // 每 200ms 检查一次当前时间
  lyricIntervalId = setInterval(() => {
    if (!audio) return
    const idx = findLyricIndex(audio.currentTime)
    // 索引变化才更新
    if (idx !== currentLyricIndex.value) {
      currentLyricIndex.value = idx
      currentLyricText.value = idx >= 0 ? lyrics.value[idx].text : ''
    }
  }, 200)
}

// 停止歌词同步
const stopLyricSync = () => {
  if (lyricIntervalId) clearInterval(lyricIntervalId)
  lyricIntervalId = null
  currentLyricIndex.value = -1
  currentLyricText.value = ''
}
//自动播放下一首
const nextTrack = async ()=>{
   await playTrack(playlist[(currentLyricIndex.value + 1) % playlist.length])
}
// 播放指定歌曲
const playTrack = async (track: Track) => {
  // 先停止上一首
  if (audio) {
    audio.pause()
    audio.src = ''
  }

  // 更新当前歌曲
  currentTrack.value = track
  // 加载歌词
  await loadLyrics(track.lrcSrc)

  // 创建新音频
  audio = new Audio(track.src)

  // 播放结束监听
  audio.addEventListener('ended', async () => {
    isPlaying.value = false
    stopWaveform()
    stopLyricSync()
    await nextTrack()
  })

  try {
    await audio.play()
    isPlaying.value = true
    // 启动动画与歌词同步
    startWaveform()
    startLyricSync()
  } catch {
    isPlaying.value = false
  }
}

// 音乐播放器 Hook
export function useMusicPlayer() {
  // 播放/暂停切换
  const toggle = async () => {
    if (isPlaying.value) {
      // 暂停
      audio?.pause()
      isPlaying.value = false
      stopWaveform()
      stopLyricSync()
    } else {
      // 播放
      if (audio) {
        try {
          await audio.play()
          isPlaying.value = true
          startWaveform()
          startLyricSync()
        } catch {}
      } else {
        // 无音频实例则初始化播放当前歌曲
        await playTrack(currentTrack.value)
      }
    }
  }

  // 切换歌曲
  const switchTrack = async (track: Track) => {
    await playTrack(track)
  }

  // 切换播放列表面板显示/隐藏
  const togglePlaylist = () => {
    playlistOpen.value = !playlistOpen.value
  }

  return {
    isPlaying,
    currentTrack,
    playlist,
    playlistOpen,
    heights,
    lyrics,
    currentLyricIndex,
    currentLyricText,
    toggle,
    switchTrack,
    togglePlaylist,
  }
}