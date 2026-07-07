'use client'

import {
  EllipsisVertical,
  FastForward,
  Image as ImageIcon,
  Info,
  Maximize,
  Music,
  Pause,
  Play,
  Rewind,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { memo, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDuration } from './utils'
import { PlayerProvider, usePlayerStaticContext, usePlayerPlaybackContext } from './provider'
import { InfoModal } from './info-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

type MediaPlayerProps = {
  file: File
  showHTMLControls?: boolean
}

export const MediaPlayer = ({ file, showHTMLControls }: MediaPlayerProps) => {
  return (
    <PlayerProvider file={file} showHTMLControls={showHTMLControls}>
      <PlayerMain />
    </PlayerProvider>
  )
}

const PlayerMain = () => {
  const { fileData } = usePlayerStaticContext()

  return (
    <Card className="w-86 md:w-120 h-71 md:h-90 max-w-full gap-0 p-0 relative overflow-hidden">
      {!fileData ? (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      ) : (
        <>
          <Poster />
          <Video />
          <PlayerFooter />
        </>
      )}
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
    <CardContent className="p-0 relative aspect-video" onClick={playPause}>
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
        !posterUrl
          ? '**:data-seek:bg-muted **:data-seek:text-muted-foreground'
          : '**:data-seek:bg-primary/20 **:data-seek:text-primary-foreground',
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
  const { playPause, handleMute, handleCapture, type, handleRewind, handleFastForward } =
    usePlayerStaticContext()
  const { currentTime, duration, isPlaying, isMuted } = usePlayerPlaybackContext()

  const rightControls = [
    {
      id: 'mute',
      icon: isMuted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />,
      onClick: handleMute,
      title: 'Mute/Unmute'
    },
    {
      id: 'capture',
      icon: <ImageIcon className="size-3" />,
      onClick: handleCapture,
      title: 'Capture frame'
    }
  ]

  return (
    <div className="text-xs font-sans w-full grid grid-cols-3">
      <span data-time className="flex items-center">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </span>
      <span className="flex items-center justify-center gap-2">
        <Button data-seek title="Rewind" size="icon-xs" onClick={handleRewind}>
          <Rewind className="size-3" />
        </Button>
        <Button data-playpause size="icon-xs" onClick={playPause} title="Play/Pause">
          {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
        </Button>
        <Button data-seek title="Fast Forward" size="icon-xs" onClick={handleFastForward}>
          <FastForward className="size-3" />
        </Button>
      </span>
      <div className="flex items-center justify-end gap-2">
        {rightControls.map((control) => {
          if (type === 'audio' && control.id === 'capture') {
            return null
          }
          return (
            <Button
              key={control.id}
              data-controls-right
              size="icon-xs"
              onClick={control.onClick}
              title={control.title}
              className={`${control.id === 'capture' && 'hidden md:inline-flex'}`}
            >
              {control.icon}
            </Button>
          )
        })}
        <MoreControls>
          <Button data-controls-right size="icon-xs" title="More controls">
            <EllipsisVertical className="size-3" />
          </Button>
        </MoreControls>
      </div>
    </div>
  )
}

const MoreControls = ({ children }: { children: React.ReactNode }) => {
  const { handleMaximize, handleCapture } = usePlayerStaticContext()
  const [infoOpen, setInfoOpen] = useState(false)

  const moreControls = [
    {
      id: 'info',
      icon: <Info className="size-3" />,
      label: 'Info',
      title: 'Show info'
    },
    {
      id: 'capture',
      icon: <ImageIcon className="size-3" />,
      onClick: handleCapture,
      label: 'Capture',
      title: 'Capture frame'
    },
    {
      id: 'maximize',
      icon: <Maximize className="size-3" />,
      onClick: handleMaximize,
      label: 'Maximize',
      title: 'Maximize player'
    }
  ]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="p-2">
          <DropdownMenuGroup className="space-y-1">
            {moreControls.map((control) => {
              if (control.id === 'info') {
                return (
                  <DropdownMenuItem
                    key={control.id}
                    className="text-xs cursor-pointer"
                    onSelect={() => setInfoOpen(true)}
                    title={control.title}
                  >
                    {control.icon} {control.label}
                  </DropdownMenuItem>
                )
              }
              return (
                <DropdownMenuItem
                  key={control.id}
                  className={`text-xs cursor-pointer ${control.id === 'capture' && 'inline-flex md:hidden'}`}
                  onClick={control.onClick}
                  title={control.title}
                >
                  {control.icon} {control.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <InfoModal open={infoOpen} onOpenChange={setInfoOpen} />
    </>
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

  const fileName = fileData?.metadataTags.title || file.name

  return (
    <span data-filename className="min-w-0 w-full truncate text-xs text-center" title={fileName}>
      {fileName}
    </span>
  )
})
