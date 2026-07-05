'use client'

import { Image as ImageIcon, Info, Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { Card, CardContent, CardFooter } from './ui/card'
import { getFileData, InputFileData } from '@/lib/mediabunny'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import Image from 'next/image'

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
  showHTMLControls?: boolean
}

const Player = ({ file, showHTMLControls }: PlayerProps) => {
  const [fileData, setFileData] = useState<InputFileData | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const videoUrl = useMemo(() => {
    return URL.createObjectURL(file)
  }, [file])

  const image = fileData?.metadataTags.images?.[0]

  const posterUrl = useMemo(() => {
    if (!image) return undefined

    return URL.createObjectURL(
      new Blob([new Uint8Array(image.data)], {
        type: image.mimeType
      })
    )
  }, [image])

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

  function handleInfo() {}

  return (
    <Card className="w-120 max-w-full gap-0 p-0 relative overflow-hidden">
      {posterUrl && (
        <Image
          width={100}
          height={100}
          src={posterUrl}
          alt="Poster"
          className="absolute inset-0 h-full w-full"
        />
      )}
      <CardContent className="p-0 relative">
        <div className="aspect-video min-w-120 w-120">
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
        </div>
      </CardContent>
      <CardFooter className="flex min-w-0 w-full flex-col gap-2 overflow-hidden border-none relative bg-background/10 backdrop-blur-md">
        <div className="text-xs font-sans w-full grid grid-cols-3">
          <span className="flex items-center">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
          <span className="flex items-center justify-center">
            <Button variant="default" size="icon-xs" onClick={playPause}>
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
            <InfoModal file={file} fileData={fileData}>
              <Button variant="outline" size="icon-xs" onClick={handleInfo}>
                <Info className="size-3" />
              </Button>
            </InfoModal>
          </div>
        </div>
        <Slider
          value={[progress]}
          max={100}
          onValueChange={sliderOnValueChange}
          className="flex-1 w-full"
        />
        <span
          className="min-w-0 w-full truncate text-xs text-muted-foreground text-center"
          title={file.name}
        >
          {file.name}
        </span>
      </CardFooter>
    </Card>
  )
}

function InfoModal({
  children,
  file,
  fileData
}: {
  children: React.ReactNode
  file: File
  fileData: InputFileData
}) {
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
      <DialogTrigger asChild>{children}</DialogTrigger>
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
}

export default Player
