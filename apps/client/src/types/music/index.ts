// 单行歌词结构：时间（秒）+ 歌词文本
export interface LyricLine {
  time: number
  text: string
}

// 歌曲曲目结构
export interface Track {
  id: number
  title: string
  artist: string
  src: string      // 音频地址
  lrcSrc: string   // 歌词地址
}