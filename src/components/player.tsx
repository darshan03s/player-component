'use client'

import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import { getFileData, InputFileData } from '@/lib/mediabunny'
import { useEffect, useState } from 'react'

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

  return seconds.toString()
}

interface PlayerProps {
  file: File
  showOverlayControls: boolean
}

const Player = ({ file, showOverlayControls }: PlayerProps) => {
  const videoUrl = URL.createObjectURL(file)
  const [fileData, setFileData] = useState<InputFileData | null>(null)

  useEffect(() => {
    getFileData(file).then(setFileData)
  }, [file])

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
          controls={showOverlayControls}
          poster={posterUrl}
          src={videoUrl}
          className="aspect-video min-w-100 w-100 rounded-md bg-transparent outline"
        />
      </CardContent>
    </Card>
  )
}

export default Player
