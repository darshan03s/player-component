'use client'

import { Image as ImageIcon, Info, Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import { getFileData, InputFileData } from '@/lib/mediabunny'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Slider } from './ui/slider'
import { Button } from './ui/button'

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

interface PlayerProps {
  file: File
  showOverlayControls: boolean
}

const Player = ({ file, showOverlayControls }: PlayerProps) => {
  const videoUrl = useMemo(() => {
    return URL.createObjectURL(file)
  }, [file])
  const [fileData, setFileData] = useState<InputFileData | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    getFileData(file).then(setFileData)
  }, [file])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const syncDuration = () => {
      if (Number.isFinite(video.duration)) {
        setDuration(video.duration)
      }
    }
    const handleTimeUpdate = () => {
      if (Number.isFinite(video.duration)) {
        setProgress((video.currentTime / video.duration) * 100)
      }
      setCurrentTime(video.currentTime)
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

  if (!fileData) return null

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

  const image = fileData.metadataTags.images?.[0]

  const posterUrl = image
    ? URL.createObjectURL(
        new Blob([new Uint8Array(image.data)], {
          type: image.mimeType
        })
      )
    : undefined

  function sliderOnValueChange(val: number[]) {
    setProgress(val[0])
    if (!videoRef.current) return
    videoRef.current.currentTime = (val[0] / 100) * videoRef.current.duration
    videoRef.current?.play()
  }

  function playPause() {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  function handleMute() {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  function handleMaximize() {
    if (!videoRef.current) return
    videoRef.current.requestFullscreen()
  }

  function handleCapture() {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    const image = canvas.toDataURL()
    const link = document.createElement('a')
    link.href = image
    link.download = 'frame_' + file.name.split('.').slice(0, -1).join('.') + '.png'
    link.target = '_blank'
    link.click()
    link.remove()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div></div>
        <CardTitle className="text-center line-clamp-2">{file.name}</CardTitle>
        <HoverCard>
          <HoverCardTrigger className="cursor-pointer hover:opacity-80 transition-opacity duration-200">
            <Info className="size-4" />
          </HoverCardTrigger>
          <HoverCardContent side="bottom" className="w-48">
            <div className="flex flex-col gap-2 text-xs">
              {Object.entries(hoverCardContentMap).map(([key, value]) =>
                value ? (
                  <div key={key}>
                    <span className="font-semibold">{key} : </span>
                    <span>{value}</span>
                  </div>
                ) : null
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </CardHeader>
      <CardContent>
        <video
          ref={videoRef}
          controls={showOverlayControls}
          poster={posterUrl}
          src={videoUrl}
          className="aspect-video min-w-100 w-100 rounded-md bg-transparent outline"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="text-xs font-sans w-full grid grid-cols-3">
          <span className="flex items-center">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
          <span className="flex items-center justify-center">
            <Button variant="outline" size="icon-xs" onClick={playPause}>
              {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
            </Button>
          </span>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="icon-xs" onClick={handleMute}>
              {isMuted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
            </Button>
            <Button variant="outline" size="icon-xs" onClick={handleMaximize}>
              <Maximize className="size-3" />
            </Button>
            <Button variant="outline" size="icon-xs" onClick={handleCapture}>
              <ImageIcon className="size-3" />
            </Button>
          </div>
        </div>
        <Slider
          value={[progress]}
          max={100}
          onValueChange={sliderOnValueChange}
          className="flex-1 w-full"
        />
      </CardFooter>
    </Card>
  )
}

export default Player
