import { getFileData, InputFileData } from './mediabunny'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getType } from './utils'

type PlaybackState = {
  progress: number
  duration: number
  currentTime: number
  isPlaying: boolean
  isMuted: boolean
}

type PlayerStaticContextType = {
  file: File
  fileData: InputFileData | null
  videoRef: React.RefObject<HTMLVideoElement | null>
  posterUrl: string | undefined
  videoUrl: string | undefined
  showHTMLControls: boolean | undefined
  setIsPlaying: (isPlaying: boolean) => void
  setIsMuted: (isMuted: boolean) => void
  sliderOnValueChange: (value: number[]) => void
  playPause: () => void
  handleMute: () => void
  handleMaximize: () => void
  handleCapture: () => void
  handleRewind: () => void
  handleFastForward: () => void
  type: 'video' | 'audio' | 'unknown'
}

const PlayerStaticContext = createContext<PlayerStaticContextType | undefined>(undefined)

const PlayerPlaybackContext = createContext<PlaybackState | undefined>(undefined)

export const PlayerProvider = ({
  children,
  file,
  showHTMLControls
}: {
  children: React.ReactNode
  file: File
  showHTMLControls: boolean | undefined
}) => {
  const [fileData, setFileData] = useState<InputFileData | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [playback, setPlayback] = useState<PlaybackState>({
    progress: 0,
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    isMuted: false
  })
  const [videoUrl, setVideoUrl] = useState<string>()
  const [posterUrl, setPosterUrl] = useState<string>()
  const type = getType(file)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setVideoUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  const image = fileData?.metadataTags.images?.[0]

  useEffect(() => {
    if (!image) {
      setPosterUrl(undefined)
      return
    }

    const url = URL.createObjectURL(
      new Blob([new Uint8Array(image.data)], {
        type: image.mimeType
      })
    )

    setPosterUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [image])

  useEffect(() => {
    getFileData(file).then(setFileData)
  }, [file])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const syncDuration = () => {
      if (Number.isFinite(video.duration)) {
        setPlayback((prev) => ({ ...prev, duration: video.duration }))
      }
    }
    const handleTimeUpdate = () => {
      setPlayback((prev) => ({
        ...prev,
        currentTime: video.currentTime,
        progress: Number.isFinite(video.duration)
          ? (video.currentTime / video.duration) * 100
          : prev.progress
      }))
    }
    syncDuration()
    video.addEventListener('loadedmetadata', syncDuration)
    video.addEventListener('durationchange', syncDuration)
    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      video.removeEventListener('loadedmetadata', syncDuration)
      video.removeEventListener('durationchange', syncDuration)
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [fileData])

  const setIsPlaying = useCallback((isPlaying: boolean) => {
    setPlayback((prev) => ({ ...prev, isPlaying }))
  }, [])

  const setIsMuted = useCallback((isMuted: boolean) => {
    setPlayback((prev) => ({ ...prev, isMuted }))
  }, [])

  const sliderOnValueChange = useCallback((val: number[]) => {
    setPlayback((prev) => ({ ...prev, progress: val[0] }))
    const video = videoRef.current
    if (!video) return
    video.currentTime = (val[0] / 100) * video.duration
  }, [])

  const playPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
    } else {
      video.pause()
    }
  }, [])

  const handleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setPlayback((prev) => ({ ...prev, isMuted: video.muted }))
  }, [])

  const handleMaximize = useCallback(() => {
    videoRef.current?.requestFullscreen()
  }, [])

  const handleRewind = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime -= 10
  }, [])

  const handleFastForward = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime += 10
  }, [])

  const handleCapture = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const image = canvas.toDataURL()
    const link = document.createElement('a')
    link.href = image
    link.download = 'frame_' + file.name.split('.').slice(0, -1).join('.') + '.png'
    link.target = '_blank'
    link.click()
    link.remove()
  }, [file.name])

  const staticValue = useMemo<PlayerStaticContextType>(() => {
    return {
      file,
      fileData,
      videoRef,
      showHTMLControls,
      posterUrl,
      videoUrl,
      setIsPlaying,
      setIsMuted,
      sliderOnValueChange,
      playPause,
      handleMute,
      handleMaximize,
      handleCapture,
      handleRewind,
      handleFastForward,
      type
    }
  }, [
    file,
    fileData,
    showHTMLControls,
    posterUrl,
    videoUrl,
    setIsPlaying,
    setIsMuted,
    sliderOnValueChange,
    playPause,
    handleMute,
    handleMaximize,
    handleCapture,
    handleRewind,
    handleFastForward,
    type
  ])

  return (
    <PlayerStaticContext.Provider value={staticValue}>
      <PlayerPlaybackContext.Provider value={playback}>{children}</PlayerPlaybackContext.Provider>
    </PlayerStaticContext.Provider>
  )
}

export const usePlayerStaticContext = () => {
  const context = useContext(PlayerStaticContext)
  if (!context) {
    throw new Error('usePlayerStaticContext must be used within a PlayerProvider')
  }
  return context
}

export const usePlayerPlaybackContext = () => {
  const context = useContext(PlayerPlaybackContext)
  if (!context) {
    throw new Error('usePlayerPlaybackContext must be used within a PlayerProvider')
  }
  return context
}
