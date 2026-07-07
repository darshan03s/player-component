import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { getTracksData, TrackData } from './mediabunny'
import { memo, useEffect, useState } from 'react'
import { formatBitrate, formatBytes, formatDuration, truncateTo2Decimals } from './utils'
import { usePlayerStaticContext } from './provider'

function TrackInfoField({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <Item>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{value}</ItemDescription>
      </ItemContent>
    </Item>
  )
}

function getTrackInfoFields(track: TrackData) {
  const fields: { title: string; value: React.ReactNode }[] = [
    {
      title: 'Average bitrate',
      value: track.averageBitrate ? formatBitrate(track.averageBitrate) : 'N/A'
    },
    { title: 'Codec', value: track.codec ?? 'N/A' },
    { title: 'Codec string', value: track.codecParamString ?? 'N/A' },
    { title: 'Language', value: track.lang ?? 'N/A' }
  ]

  if (track.isVideo) {
    fields.push(
      {
        title: 'Frame rate',
        value: track.frameRate ? truncateTo2Decimals(track.frameRate) : 'N/A'
      },
      { title: 'Coded height', value: track.codedHeight ?? 'N/A' },
      { title: 'Coded width', value: track.codedWidth ?? 'N/A' },
      { title: 'Display height', value: track.displayHeight ?? 'N/A' },
      { title: 'Display width', value: track.displayWidth ?? 'N/A' }
    )
  }

  if (track.isAudio) {
    fields.push(
      { title: 'Sample rate', value: track.sampleRate ?? 'N/A' },
      { title: 'Channels', value: track.channels ?? 'N/A' }
    )
  }

  return fields
}

export const InfoModal = memo(function InfoModal({ children }: { children: React.ReactNode }) {
  const { file, fileData } = usePlayerStaticContext()
  const [tracksData, setTracksData] = useState<TrackData[]>([])

  useEffect(() => {
    getTracksData(file).then((tracksData) => {
      setTracksData(tracksData)
    })
  }, [file])

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
          <div className="grid grid-cols-2 gap-2">
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
          </div>
          <Item size="xs" className="p-0">
            <ItemContent>
              <div className="space-y-4">
                {tracksData.map((track) => (
                  <Item
                    key={track.id}
                    variant="default"
                    className='**:data-[slot="item-title"]:text-xs **:data-[slot="item-description"]:text-xs bg-muted'
                  >
                    <ItemContent>
                      <ItemTitle className="capitalize bg-primary text-primary-foreground p-1 px-2 rounded-full text-[10px]!">
                        {track.type}
                      </ItemTitle>
                      <div className="grid grid-cols-2 gap-2">
                        {getTrackInfoFields(track).map((field) => (
                          <TrackInfoField
                            key={field.title}
                            title={field.title}
                            value={field.value}
                          />
                        ))}
                      </div>
                    </ItemContent>
                  </Item>
                ))}
              </div>
            </ItemContent>
          </Item>
        </div>
      </DialogContent>
    </Dialog>
  )
})
