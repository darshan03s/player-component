'use client'

import { Image as ImageIcon, Info, Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { Card, CardContent, CardFooter } from './ui/card'
import { getFileData, InputFileData } from '@/lib/mediabunny'
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Slider } from './ui/slider'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'

function formatBytes(bytes: number) {
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

function formatDuration(duration: number): string {
  const totalSeconds = Math.floor(duration)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  if (minutes > 0) {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

type PlayerProps = {
  file: File
  showHTMLControls?: boolean
}

type PlaybackState = {
  progress: number
  duration: number
  currentTime: number
  isPlaying: boolean
  isMuted: boolean
}

type PlayerStaticContextType = {
  file: File
  fileData: InputFileData
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
}

const PlayerStaticContext = createContext<PlayerStaticContextType | undefined>(undefined)

const PlayerPlaybackContext = createContext<PlaybackState | undefined>(undefined)

const PlayerProvider = ({
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

  const handleCapture = useCallback(() => {
    const video = videoRef.current
    if (!video) return
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

  const staticValue = useMemo<PlayerStaticContextType | null>(() => {
    if (!fileData) return null
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
      handleCapture
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
    handleCapture
  ])

  if (!staticValue) return null

  return (
    <PlayerStaticContext.Provider value={staticValue}>
      <PlayerPlaybackContext.Provider value={playback}>{children}</PlayerPlaybackContext.Provider>
    </PlayerStaticContext.Provider>
  )
}

const Player = ({ file, showHTMLControls }: PlayerProps) => {
  return (
    <Card className="w-120 max-w-full gap-0 p-0 relative overflow-hidden">
      <PlayerProvider file={file} showHTMLControls={showHTMLControls}>
        <Poster />
        <Video />
        <PlayerFooter />
      </PlayerProvider>
    </Card>
  )
}

const usePlayerStaticContext = () => {
  const context = useContext(PlayerStaticContext)
  if (!context) {
    throw new Error('usePlayerStaticContext must be used within a PlayerProvider')
  }
  return context
}

const usePlayerPlaybackContext = () => {
  const context = useContext(PlayerPlaybackContext)
  if (!context) {
    throw new Error('usePlayerPlaybackContext must be used within a PlayerProvider')
  }
  return context
}

const Poster = memo(function Poster() {
  const { posterUrl } = usePlayerStaticContext()

  if (!posterUrl) return null

  return (
    <img
      width={100}
      height={100}
      src={posterUrl}
      alt="Poster"
      className="absolute inset-0 h-full w-full"
    />
  )
})

const Video = memo(function Video() {
  const { videoRef, showHTMLControls, posterUrl, videoUrl, setIsPlaying } = usePlayerStaticContext()

  return (
    <CardContent className="p-0 relative aspect-video min-w-120 w-120">
      <video
        ref={videoRef}
        controls={showHTMLControls}
        poster={posterUrl}
        src={videoUrl}
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </CardContent>
  )
})

const PlayerFooter = memo(function PlayerFooter() {
  const { posterUrl } = usePlayerStaticContext()

  return (
    <CardFooter
      className={`flex min-w-0 w-full flex-col gap-2 overflow-hidden border-none relative ${posterUrl ? 'bg-black/50 backdrop-blur-md' : 'bg-black/90 dark:bg-black/50'}`}
    >
      <Controls />
      <ProgressBar />
      <FileName />
    </CardFooter>
  )
})

const Controls = () => {
  const { playPause, handleMute, handleMaximize, handleCapture } = usePlayerStaticContext()
  const { currentTime, duration, isPlaying, isMuted } = usePlayerPlaybackContext()

  return (
    <div className="text-xs font-sans w-full grid grid-cols-3">
      <span className="flex items-center text-white">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </span>
      <span className="flex items-center justify-center">
        <Button size="icon-xs" onClick={playPause} className="text-black bg-white/80">
          {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
        </Button>
      </span>
      <div className="flex items-center justify-end gap-2">
        <Button size="icon-xs" onClick={handleMute} className="text-black bg-white/80">
          {isMuted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
        </Button>
        <Button size="icon-xs" onClick={handleMaximize} className="text-black bg-white/80">
          <Maximize className="size-3" />
        </Button>
        <Button size="icon-xs" onClick={handleCapture} className="text-black bg-white/80">
          <ImageIcon className="size-3" />
        </Button>
        <InfoModal />
      </div>
    </div>
  )
}

const ProgressBar = () => {
  const { sliderOnValueChange } = usePlayerStaticContext()
  const { progress } = usePlayerPlaybackContext()

  return (
    <Slider
      value={[progress]}
      max={100}
      onValueChange={sliderOnValueChange}
      className="flex-1 w-full **:data-[slot='slider-track']:bg-white/50 **:data-[slot='slider-range']:bg-white/50 **:data-[slot='slider-track']:cursor-pointer"
    />
  )
}

const FileName = memo(function FileName() {
  const { file } = usePlayerStaticContext()

  return (
    <span className="min-w-0 w-full truncate text-xs text-white/80 text-center" title={file.name}>
      {file.name}
    </span>
  )
})

const InfoModal = memo(function InfoModal() {
  const { file, fileData } = usePlayerStaticContext()

  const hoverCardContentMap = {
    'Last modified': new Date(file.lastModified).toLocaleDateString(),
    Size: formatBytes(file.size),
    Format: fileData.format.name,
    'MIME Type': fileData.format.mimeType,
    Duration: formatDuration(fileData.duration),
    Artist: fileData.metadataTags.artist,
    Album: fileData.metadataTags.album,
    'Total tracks': fileData.metadataTags.tracksTotal,
    Genre: fileData.metadataTags.genre
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon-xs" className="text-black bg-white/80">
          <Info className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Info</DialogTitle>
          <DialogDescription>Metadata about the file</DialogDescription>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          <span>
            {Object.entries(hoverCardContentMap).map(
              ([key, value]) =>
                value && (
                  <Item variant="default" size="xs" key={key}>
                    <ItemContent>
                      <ItemTitle className="font-semibold text-sm">{key}</ItemTitle>
                      <ItemDescription className="text-xs">{value}</ItemDescription>
                    </ItemContent>
                  </Item>
                )
            )}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
})

export default Player
