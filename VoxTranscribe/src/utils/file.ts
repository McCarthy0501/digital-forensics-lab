import { ACCEPTED_EXTENSIONS } from '../consts/fileFormats'

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export function getExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

export function isAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/') || file.type.startsWith('video/')) return true
  return ACCEPTED_EXTENSIONS.includes(getExtension(file.name))
}
