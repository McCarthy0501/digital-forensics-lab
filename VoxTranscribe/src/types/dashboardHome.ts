import type { ComponentType } from 'react'

export type FileStatus = 'listo' | 'procesando' | 'completado' | 'error'

export type UploadedFile = {
  id: string
  name: string
  size: number
  type: string
  url: string | null
  status: FileStatus
}

export type IconProps = { className?: string }

export type IconComponent = ComponentType<IconProps>

export type NavItem = {
  label: string
  icon: IconComponent
  active?: boolean
}

export type Stat = {
  label: string
  value: string
  hint: string
  icon: IconComponent
}

export type RecentTranscription = {
  name: string
  duration: string
  status: FileStatus
  date: string
}
