'use client'

import {
  Image as ImageIcon,
  Info,
  Maximize,
  Music,
  Pause,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { memo } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDuration } from './utils'
import { PlayerProvider, usePlayerStaticContext, usePlayerPlaybackContext } from './provider'
import { InfoModal } from './info-modal'

type PlayerProps = {
  file: File
  showHTMLControls?: boolean
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

const Poster = memo(function Poster() {
  const { posterUrl } = usePlayerStaticContext()

  if (!posterUrl) return null

  return (
    <img
      data-posterimage
      width={100}
      height={100}
      src={posterUrl}
      alt="Poster"
      className="absolute inset-0 h-full w-full"
    />
  )
})

const Video = memo(function Video() {
  const { videoRef, showHTMLControls, posterUrl, videoUrl, setIsPlaying, type, playPause } =
    usePlayerStaticContext()

  return (
    <CardContent className="p-0 relative aspect-video min-w-120 w-120" onClick={playPause}>
      {type === 'audio' && !posterUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-b from-primary/10 to-transparent">
          <Music className="size-14 text-primary" />
        </div>
      )}
      <video
        data-video
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
      className={cn(
        'flex min-w-0 w-full flex-col gap-2 overflow-hidden border-none relative',
        posterUrl ? 'bg-black/30 backdrop-blur-md' : 'bg-background',
        !posterUrl ? '**:data-time:text-foreground' : '**:data-time:text-white',
        '**:data-playpause:text-primary-foreground **:data-playpause:bg-primary/80',
        '**:data-controls-right:text-primary-foreground **:data-controls-right:bg-primary/80',
        !posterUrl ? '**:data-filename:text-foreground' : '**:data-filename:text-white',
        "**:data-[slot='slider-track']:bg-primary/30 **:data-[slot='slider-track']:cursor-pointer",
        "**:data-[slot='slider-range']:bg-primary/80"
      )}
    >
      <Controls />
      <ProgressBar />
      <FileName />
    </CardFooter>
  )
})

const Controls = () => {
  const { playPause, handleMute, handleMaximize, handleCapture, type } = usePlayerStaticContext()
  const { currentTime, duration, isPlaying, isMuted } = usePlayerPlaybackContext()

  const rightControls = [
    {
      id: 'mute',
      icon: isMuted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />,
      onClick: handleMute
    },
    {
      id: 'maximize',
      icon: <Maximize className="size-3" />,
      onClick: handleMaximize
    },
    {
      id: 'capture',
      icon: <ImageIcon className="size-3" />,
      onClick: handleCapture
    },
    {
      id: 'info',
      icon: <Info className="size-3" />
    }
  ]

  return (
    <div className="text-xs font-sans w-full grid grid-cols-3">
      <span data-time className="flex items-center">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </span>
      <span className="flex items-center justify-center">
        <Button data-playpause size="icon-xs" onClick={playPause}>
          {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
        </Button>
      </span>
      <div className="flex items-center justify-end gap-2">
        {rightControls.map((control) => {
          if (control.id === 'info') {
            return (
              <InfoModal key={control.id}>
                <Button data-controls-right size="icon-xs">
                  <Info className="size-3" />
                </Button>
              </InfoModal>
            )
          }
          if (type === 'audio' && control.id === 'capture') {
            return null
          }
          return (
            <Button key={control.id} data-controls-right size="icon-xs" onClick={control.onClick}>
              {control.icon}
            </Button>
          )
        })}
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
      className="flex-1 w-full"
    />
  )
}

const FileName = memo(function FileName() {
  const { fileData, file } = usePlayerStaticContext()

  const fileName = fileData.metadataTags.title || file.name

  return (
    <span data-filename className="min-w-0 w-full truncate text-xs text-center" title={fileName}>
      {fileName}
    </span>
  )
})

export default Player
