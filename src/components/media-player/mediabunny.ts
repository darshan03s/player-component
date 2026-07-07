'use client'

import {
  ALL_FORMATS,
  BlobSource,
  Input,
  InputAudioTrack,
  InputTrack,
  MetadataTags,
  Rotation
} from 'mediabunny'

export type InputFileData = {
  audioTracks: InputAudioTrack[]
  duration: number
  format: {
    name: string
    mimeType: string
  }
  metadataTags: MetadataTags
  mimeType: string
  size: number | null
}

export type TrackData = Awaited<ReturnType<typeof getTrackData>> & {
  codedHeight?: number
  codedWidth?: number
  colorSpace?: VideoColorSpaceInit
  displayHeight?: number
  displayWidth?: number
  rotation?: Rotation
  frameRate?: number
  sampleRate?: number
  channels?: number
}

function getInput(file: File) {
  return new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file)
  })
}

export async function getFileData(file: File): Promise<InputFileData> {
  const input = getInput(file)

  let data = {}

  const [audioTracks, duration, format, metadataTags, mimeType, size] = await Promise.all([
    input.getAudioTracks(),
    input.getDurationFromMetadata(),
    input.getFormat(),
    input.getMetadataTags(),
    input.getMimeType(),
    input.source.getSizeOrNull()
  ])

  data = {
    audioTracks,
    duration,
    format: { name: format.name, mimeType: format.mimeType },
    metadataTags,
    mimeType,
    size
  }

  return data as InputFileData
}

export async function getTrackData(track: InputTrack) {
  const codec = await track.getCodec()
  const codecParamString = await track.getCodecParameterString()
  const disposition = await track.getDisposition()
  const duration = await track.getDurationFromMetadata()
  const lang = await track.getLanguageCode()
  const isAudio = track.isAudioTrack()
  const isVideo = track.isVideoTrack()
  const stats = await track.computePacketStats(100)
  const averageBitrate = stats.averageBitrate
  let trackData = {
    id: track.id,
    type: track.type,
    averageBitrate,
    codec,
    codecParamString,
    disposition,
    duration,
    lang,
    isAudio,
    isVideo
  }

  if (track.isVideoTrack()) {
    const codedHeight = await track.getCodedHeight()
    const codedWidth = await track.getCodedWidth()
    const colorSpace = await track.getColorSpace()
    const displayHeight = await track.getDisplayHeight()
    const displayWidth = await track.getDisplayWidth()
    const rotation = await track.getRotation()
    const frameRate = stats.averagePacketRate
    const videoData = {
      codedHeight,
      codedWidth,
      colorSpace,
      displayHeight,
      displayWidth,
      rotation,
      frameRate,
      averageBitrate
    }

    trackData = { ...trackData, ...videoData }
  } else if (track.isAudioTrack()) {
    const sampleRate = await track.getSampleRate()
    const channels = await track.getNumberOfChannels()
    const audioData = { sampleRate, channels }

    trackData = { ...trackData, ...audioData }
  }

  return trackData
}

export async function getTracksData(file: File) {
  const input = getInput(file)
  const tracks = await input.getTracks()

  const tracksData = []

  for (const track of tracks) {
    const trackData = await getTrackData(track)
    tracksData.push(trackData)
  }

  return tracksData
}
