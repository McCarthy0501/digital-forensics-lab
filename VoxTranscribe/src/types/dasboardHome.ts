export type FileStatus = 'listo' | 'procesando' | 'completado' | 'error'
export type UploadedFile = {
  id: string
  name: string
  size: number
  type: string
  url: string | null
  status: FileStatus
}
