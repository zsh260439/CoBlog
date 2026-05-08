import { ref } from 'vue'

export interface Track {
  id: number
  title: string
  artist: string
}

const playlist: Track[] = [
  { id: 1, title: '星河漫步', artist: '夜空下的钢琴' },
  { id: 2, title: '夜的钢琴曲', artist: '石进' },
  { id: 3, title: '海边的卡夫卡', artist: '椎名林檎' },
  { id: 4, title: '云的彼端', artist: '天门' },
  { id: 5, title: '四月是你的谎言', artist: '横山克' },
]

const isPlaying = ref(false)
const currentTrack = ref<Track>(playlist[0])
const playlistOpen = ref(false)
const heights = ref([0.3, 0.3, 0.3, 0.3, 0.3])

let intervalId: ReturnType<typeof setInterval> | null = null

const randomHeights = () =>
  Array.from({ length: 5 }, () => Math.random() * 0.9 + 0.2)

export function useMusicPlayer() {
  const toggle = () => {
    if (isPlaying.value) {
      isPlaying.value = false
      if (intervalId) clearInterval(intervalId)
      intervalId = null
      heights.value = [0.3, 0.3, 0.3, 0.3, 0.3]
    } else {
      isPlaying.value = true
      heights.value = randomHeights()
      intervalId = setInterval(() => {
        heights.value = randomHeights()
      }, 100)
    }
  }

  const switchTrack = (track: Track) => {
    currentTrack.value = track
    if (!isPlaying.value) {
      isPlaying.value = true
    }
    heights.value = randomHeights()
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(() => {
      heights.value = randomHeights()
    }, 100)
  }

  const togglePlaylist = () => {
    playlistOpen.value = !playlistOpen.value
  }

  return {
    isPlaying,
    currentTrack,
    playlist,
    playlistOpen,
    heights,
    toggle,
    switchTrack,
    togglePlaylist,
  }
}
