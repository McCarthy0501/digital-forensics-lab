import {
  ClockIcon,
  FileIcon,
  FolderIcon,
  GridIcon,
  SettingsIcon,
  SparkIcon,
  WaveIcon,
} from '../components/icons'
import type { FileStatus, NavItem, RecentTranscription, Stat } from '../types/dashboardHome'

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: GridIcon, active: true },
  { label: 'Transcripciones', icon: WaveIcon },
 
]

export const STATS: Stat[] = [
  { label: 'Archivos', value: '128', hint: '+12 esta semana', icon: FileIcon },
  { label: 'Minutos procesados', value: '1.284', hint: '+8,3% vs. mes pasado', icon: ClockIcon },
  { label: 'Transcripciones', value: '94', hint: '6 en cola', icon: WaveIcon },
  { label: 'Precisión media', value: '98,2%', hint: 'Whisper large-v3', icon: SparkIcon },
]

export const RECENT_TRANSCRIPTIONS: RecentTranscription[] = [
  { name: 'Entrevista_producto.mp3', duration: '12:48', status: 'completado', date: 'Hoy' },
  { name: 'Reunión_sprint_14.wav', duration: '34:02', status: 'procesando', date: 'Hace 5 min' },
  { name: 'Podcast_episodio_07.m4a', duration: '48:15', status: 'completado', date: 'Ayer' },
  { name: 'Nota_voz_cliente.ogg', duration: '02:31', status: 'error', date: 'Hace 2 días' },
  { name: 'Clase_historia.mp3', duration: '56:20', status: 'completado', date: 'Hace 3 días' },
]

export const STATUS_STYLES: Record<FileStatus, string> = {
  listo: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
  procesando: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  completado: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  error: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
}

export const STATUS_LABELS: Record<FileStatus, string> = {
  listo: 'Listo',
  procesando: 'Procesando',
  completado: 'Completado',
  error: 'Error',
}
