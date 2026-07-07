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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { cn } from '@/lib/utils'
import { formatBitrate, formatBytes, formatDuration, truncateTo2Decimals } from './utils'
import { PlayerProvider, usePlayerStaticContext, usePlayerPlaybackContext } from './provider'

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
  const { videoRef, showHTMLControls, posterUrl, videoUrl, setIsPlaying, type } =
    usePlayerStaticContext()

  return (
    <CardContent className="p-0 relative aspect-video min-w-120 w-120">
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
  const { playPause, handleMute, handleMaximize, handleCapture } = usePlayerStaticContext()
  const { currentTime, duration, isPlaying, isMuted } = usePlayerPlaybackContext()

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
        <Button data-controls-right size="icon-xs" onClick={handleMute}>
          {isMuted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
        </Button>
        <Button data-controls-right size="icon-xs" onClick={handleMaximize}>
          <Maximize className="size-3" />
        </Button>
        <Button data-controls-right size="icon-xs" onClick={handleCapture}>
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
      className="flex-1 w-full"
    />
  )
}

const FileName = memo(function FileName() {
  const { file } = usePlayerStaticContext()

  return (
    <span data-filename className="min-w-0 w-full truncate text-xs text-center" title={file.name}>
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
        <Button data-controls-right size="icon-xs">
          <Info className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Info</DialogTitle>
          <DialogDescription>Metadata about the file</DialogDescription>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          {Object.entries(hoverCardContentMap).map(
            ([key, value]) =>
              value && (
                <Item variant="default" size="xs" key={key}>
                  <ItemContent>
                    <ItemTitle className="font-semibold text-xs">{key}</ItemTitle>
                    <ItemDescription className="text-xs">{value}</ItemDescription>
                  </ItemContent>
                </Item>
              )
          )}
          <Item size="xs" className="p-0">
            <ItemContent>
              <div className="space-y-4">
                {fileData.tracksData.map((track) => {
                  return (
                    <Item
                      key={track.id}
                      variant={'default'}
                      className='**:data-[slot="item-title"]:text-xs **:data-[slot="item-description"]:text-xs bg-muted'
                    >
                      <ItemContent>
                        <ItemTitle className="capitalize bg-primary text-primary-foreground p-1 px-2 rounded-full text-[10px]!">
                          {track.type}
                        </ItemTitle>
                        <div className="grid grid-cols-2 gap-2">
                          <Item>
                            <ItemContent>
                              <ItemTitle>Average bitrate</ItemTitle>
                              <ItemDescription>
                                {track.averageBitrate ? formatBitrate(track.averageBitrate) : 'N/A'}
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                          <Item>
                            <ItemContent>
                              <ItemTitle>Codec</ItemTitle>
                              <ItemDescription>{track.codec ?? 'N/A'}</ItemDescription>
                            </ItemContent>
                          </Item>
                          <Item>
                            <ItemContent>
                              <ItemTitle>Codec string</ItemTitle>
                              <ItemDescription>{track.codecParamString ?? 'N/A'}</ItemDescription>
                            </ItemContent>
                          </Item>
                          <Item>
                            <ItemContent>
                              <ItemTitle>Language</ItemTitle>
                              <ItemDescription>{track.lang ?? 'N/A'}</ItemDescription>
                            </ItemContent>
                          </Item>
                          {track.isVideo && (
                            <>
                              <Item>
                                <ItemContent>
                                  <ItemTitle>Frame rate</ItemTitle>
                                  <ItemDescription>
                                    {track.frameRate ? truncateTo2Decimals(track.frameRate) : 'N/A'}
                                  </ItemDescription>
                                </ItemContent>
                              </Item>
                              <Item>
                                <ItemContent>
                                  <ItemTitle>Coded height</ItemTitle>
                                  <ItemDescription>{track.codedHeight ?? 'N/A'}</ItemDescription>
                                </ItemContent>
                              </Item>
                              <Item>
                                <ItemContent>
                                  <ItemTitle>Coded width</ItemTitle>
                                  <ItemDescription>{track.codedWidth ?? 'N/A'}</ItemDescription>
                                </ItemContent>
                              </Item>
                              <Item>
                                <ItemContent>
                                  <ItemTitle>Display height</ItemTitle>
                                  <ItemDescription>{track.displayHeight ?? 'N/A'}</ItemDescription>
                                </ItemContent>
                              </Item>
                              <Item>
                                <ItemContent>
                                  <ItemTitle>Display width</ItemTitle>
                                  <ItemDescription>{track.displayWidth ?? 'N/A'}</ItemDescription>
                                </ItemContent>
                              </Item>
                            </>
                          )}
                          {track.isAudio && (
                            <>
                              <Item>
                                <ItemContent>
                                  <ItemTitle>Sample rate</ItemTitle>
                                  <ItemDescription>{track.sampleRate ?? 'N/A'}</ItemDescription>
                                </ItemContent>
                              </Item>
                              <Item>
                                <ItemContent>
                                  <ItemTitle>Channels</ItemTitle>
                                  <ItemDescription>{track.channels ?? 'N/A'}</ItemDescription>
                                </ItemContent>
                              </Item>
                            </>
                          )}
                        </div>
                      </ItemContent>
                    </Item>
                  )
                })}
              </div>
            </ItemContent>
          </Item>
        </div>
      </DialogContent>
    </Dialog>
  )
})

export default Player
