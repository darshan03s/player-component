export function formatBytes(bytes: number) {
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

export function formatDuration(duration: number): string {
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

export const VIDEO_EXTENSIONS = [
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.webm',
  '.flv',
  '.wmv',
  '.mpeg',
  '.mpg',
  '.3gp'
]

export const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', 'm4a']

export function getType(file: File) {
  const extension = file.name.split('.').pop()
  if (extension && VIDEO_EXTENSIONS.includes(extension)) {
    return 'video'
  }
  if (extension && AUDIO_EXTENSIONS.includes(extension)) {
    return 'audio'
  }
  return 'unknown'
}

export function formatBitrate(bps: number): string {
  if (bps >= 1_000_000) {
    return `${(bps / 1_000_000).toFixed(2)} Mbps`
  }

  if (bps >= 1_000) {
    return `${(bps / 1_000).toFixed(0)} kbps`
  }

  return `${bps.toFixed(0)} bps`
}

export function truncateTo2Decimals(num: number): number {
  return Math.trunc(num * 100) / 100
}
