import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import type { FileStatus,UploadedFile } from '../types/dasboardHome'
import { ACCEPTED_EXTENSIONS,MAX_FILE_SIZE } from '../consts/fileFormants'



const railItems: { label: string; icon: ReactNode; active?: boolean }[] = [
  { label: 'Dashboard', icon: <GridIcon />, active: true },
  { label: 'Transcripciones', icon: <WaveIcon /> },
  { label: 'Proyectos', icon: <FolderIcon /> },
  { label: 'Ajustes', icon: <SettingsIcon /> },
]

const stats = [
  { label: 'Archivos', value: '128', hint: '+12 esta semana', icon: <FileIcon /> },
  { label: 'Minutos procesados', value: '1.284', hint: '+8,3% vs. mes pasado', icon: <ClockIcon /> },
  { label: 'Transcripciones', value: '94', hint: '6 en cola', icon: <WaveIcon /> },
  { label: 'Precisión media', value: '98,2%', hint: 'Whisper large-v3', icon: <SparkIcon /> },
]

const recentTranscriptions = [
  { name: 'Entrevista_producto.mp3', duration: '12:48', status: 'completado' as FileStatus, date: 'Hoy' },
  { name: 'Reunión_sprint_14.wav', duration: '34:02', status: 'procesando' as FileStatus, date: 'Hace 5 min' },
  { name: 'Podcast_episodio_07.m4a', duration: '48:15', status: 'completado' as FileStatus, date: 'Ayer' },
  { name: 'Nota_voz_cliente.ogg', duration: '02:31', status: 'error' as FileStatus, date: 'Hace 2 días' },
  { name: 'Clase_historia.mp3', duration: '56:20', status: 'completado' as FileStatus, date: 'Hace 3 días' },
]

const statusStyles: Record<FileStatus, string> = {
  listo: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
  procesando: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  completado: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  error: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
}

const statusLabels: Record<FileStatus, string> = {
  listo: 'Listo',
  procesando: 'Procesando',
  completado: 'Completado',
  error: 'Error',
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

function getExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

function isAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/') || file.type.startsWith('video/')) return true
  return ACCEPTED_EXTENSIONS.includes(getExtension(file.name))
}

export default function DashboardHome() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const filesRef = useRef<UploadedFile[]>([])

  useEffect(() => {
    filesRef.current = files
  }, [files])

  useEffect(() => {
    return () => {
      filesRef.current.forEach((file) => {
        if (file.url) URL.revokeObjectURL(file.url)
      })
    }
  }, [])

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const next: UploadedFile[] = []
    const rejected: string[] = []

    Array.from(incoming).forEach((file) => {
      if (!isAudioFile(file)) {
        rejected.push(`${file.name} (formato no soportado)`)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        rejected.push(`${file.name} (supera 200 MB)`)
        return
      }
      next.push({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        name: file.name,
        size: file.size,
        type: file.type || `audio/${getExtension(file.name)}`,
        url: URL.createObjectURL(file),
        status: 'listo',
      })
    })

    if (next.length > 0) {
      setFiles((prev) => [...prev, ...next])
    }
    setError(rejected.length > 0 ? `No se añadieron: ${rejected.join(', ')}` : null)
  }, [])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files)
    event.target.value = ''
  }

  const openFileDialog = () => inputRef.current?.click()

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dragDepth.current += 1
    setIsDragging(true)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setIsDragging(false)
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dragDepth.current = 0
    setIsDragging(false)
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files)
  }

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((file) => file.id === id)
      if (target?.url) URL.revokeObjectURL(target.url)
      return prev.filter((file) => file.id !== id)
    })
    if (playingId === id) setPlayingId(null)
  }

  const clearAll = () => {
    files.forEach((file) => {
      if (file.url) URL.revokeObjectURL(file.url)
    })
    setFiles([])
    setPlayingId(null)
  }

  const totalSize = useMemo(() => files.reduce((acc, file) => acc + file.size, 0), [files])
  const playingFile = useMemo(() => files.find((file) => file.id === playingId), [files, playingId])

  return (
    <div className="relative flex min-h-screen bg-[#0a0612] text-slate-100 antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-violet-600/25 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-600/15 blur-[120px]" />
      </div>

      <Sidebar />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-violet-300/80">Panel de control</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Hola de nuevo, <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">transcriptor</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Sube tus audios y conviértelos en texto en segundos. Arrastra, suelta o abre tus archivos desde el navegador.
              </p>
            </div>
            <button
              type="button"
              onClick={openFileDialog}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0612]"
            >
              <UploadIcon className="h-4 w-4" />
              Subir archivo
            </button>
          </header>

          <StatsGrid />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="xl:col-span-2">
              <UploadCard
                files={files}
                isDragging={isDragging}
                error={error}
                totalSize={totalSize}
                playingId={playingId}
                inputRef={inputRef}
                onOpen={openFileDialog}
                onInputChange={handleInputChange}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemove={removeFile}
                onClearAll={clearAll}
                onTogglePlay={(id) => setPlayingId((current) => (current === id ? null : id))}
              />
            </section>

            <section className="xl:col-span-1">
              <RecentList />
            </section>
          </div>
        </main>

        {playingFile?.url && (
          <audio
            key={playingFile.id}
            src={playingFile.url}
            autoPlay
            onEnded={() => setPlayingId(null)}
            className="hidden"
          />
        )}

        <footer className="border-t border-white/5 px-4 py-6 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          VoxTranscribe · Transcripción inteligente con Whisper
        </footer>
      </div>
    </div>
  )
}

type UploadCardProps = {
  files: UploadedFile[]
  isDragging: boolean
  error: string | null
  totalSize: number
  playingId: string | null
  inputRef: RefObject<HTMLInputElement | null>
  onOpen: () => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onRemove: (id: string) => void
  onClearAll: () => void
  onTogglePlay: (id: string) => void
}

function UploadCard({
  files,
  isDragging,
  error,
  totalSize,
  playingId,
  inputRef,
  onOpen,
  onInputChange,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  onClearAll,
  onTogglePlay,
}: UploadCardProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Sube tu audio</h2>
          <p className="text-sm text-slate-400">Formatos: MP3, WAV, M4A, OGG, FLAC, WEBM · máx. 200 MB</p>
        </div>
        {files.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-rose-400/40 hover:text-rose-300"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Zona para subir archivos de audio"
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen()
          }
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
          isDragging
            ? 'scale-[1.01] border-violet-400 bg-violet-500/10 shadow-[0_0_50px_-10px_rgba(139,92,246,0.6)]'
            : 'border-white/15 bg-white/[0.02] hover:border-violet-400/50 hover:bg-violet-500/[0.06]'
        }`}
      >
        <div
          className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 ring-1 ring-white/10 transition-transform duration-300 ${
            isDragging ? 'scale-110' : 'group-hover:scale-105'
          }`}
        >
          <UploadIcon className="h-7 w-7 text-violet-200" />
        </div>

        {isDragging ? (
          <p className="text-lg font-semibold text-violet-200">Suelta tus archivos aquí</p>
        ) : (
          <>
            <p className="text-base font-semibold text-white">
              Arrastra tus archivos aquí o{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">búscalos</span>
            </p>
            <p className="mt-1 text-sm text-slate-400">o haz clic en cualquier parte de esta zona para abrirlos</p>
          </>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onOpen()
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/20"
        >
          <FolderIcon className="h-4 w-4" />
          Abrir explorador
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac"
          multiple
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-400">
            <span>
              {files.length} archivo{files.length > 1 ? 's' : ''} listo{files.length > 1 ? 's' : ''} para transcribir
            </span>
            <span>{formatBytes(totalSize)}</span>
          </div>
          <ul className="space-y-2.5">
            {files.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                isPlaying={playingId === file.id}
                onRemove={onRemove}
                onTogglePlay={onTogglePlay}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

type FileRowProps = {
  file: UploadedFile
  isPlaying: boolean
  onRemove: (id: string) => void
  onTogglePlay: (id: string) => void
}

function FileRow({ file, isPlaying, onRemove, onTogglePlay }: FileRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-violet-400/30 hover:bg-white/[0.05]">
      <button
        type="button"
        onClick={() => onTogglePlay(file.id)}
        aria-label={isPlaying ? `Detener ${file.name}` : `Reproducir ${file.name}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 text-violet-100 ring-1 ring-white/10 transition hover:scale-105"
      >
        {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{file.name}</p>
        <p className="mt-0.5 text-xs text-slate-400">
          {formatBytes(file.size)} · {getExtension(file.name).toUpperCase() || 'AUDIO'}
        </p>
      </div>

      <span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 sm:inline ${statusStyles[file.status]}`}>
        {statusLabels[file.status]}
      </span>

      <button
        type="button"
        onClick={() => onRemove(file.id)}
        aria-label={`Eliminar ${file.name}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </li>
  )
}

function RecentList() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Transcripciones recientes</h2>
        <button type="button" className="text-xs font-medium text-violet-300 transition hover:text-violet-200">
          Ver todas
        </button>
      </div>

      <ul className="space-y-1">
        {recentTranscriptions.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/[0.04]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-violet-200 ring-1 ring-white/10">
              <WaveIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">{item.name}</p>
              <p className="text-xs text-slate-500">
                {item.duration} · {item.date}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusStyles[item.status]}`}>
              {statusLabels[item.status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:border-violet-400/30 hover:bg-white/[0.05]"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 to-fuchsia-500/25 text-violet-200 ring-1 ring-white/10">
              {stat.icon}
            </span>
            <TrendIcon className="h-4 w-4 text-emerald-400/70" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-white">{stat.value}</p>
          <p className="text-sm text-slate-400">{stat.label}</p>
          <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
        </div>
      ))}
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="relative z-20 hidden w-64 shrink-0 flex-col border-r border-white/10 bg-white/[0.02] px-4 py-6 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-900/40">
          <WaveIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">VoxTranscribe</p>
          <p className="text-xs text-slate-400">Transcripción IA</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {railItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              item.active
                ? 'bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 text-white ring-1 ring-violet-400/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`}
          >
            <span className="h-4 w-4">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 p-4">
        <p className="text-sm font-semibold text-white">Plan Pro</p>
        <p className="mt-1 text-xs text-slate-300">Horas ilimitadas y exportación en SRT/VTT.</p>
        <button
          type="button"
          className="mt-3 w-full rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          Mejorar plan
        </button>
      </div>
    </aside>
  )
}

function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-white/10 bg-[#0a0612]/70 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
          <WaveIcon className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold text-white">VoxTranscribe</span>
      </div>

      <div className="relative ml-auto hidden w-full max-w-md sm:block">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          placeholder="Buscar transcripciones..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-3 sm:ml-0">
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/5"
        >
          <BellIcon className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-fuchsia-500" />
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
            TR
          </span>
          <span className="hidden text-sm font-medium text-slate-200 sm:inline">Usuario</span>
        </div>
      </div>
    </header>
  )
}

type IconProps = { className?: string }

function UploadIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  )
}

function WaveIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h2l2-7 3 16 3-11 2 5 1.5-3H21" />
    </svg>
  )
}

function GridIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function FolderIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.7 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.7a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.7a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.3 9v.09a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z" />
    </svg>
  )
}

function FileIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3v5h5" />
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    </svg>
  )
}

function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function SparkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  )
}

function PlayIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  )
}

function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function BellIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  )
}

function TrendIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M17 7h4v4" />
    </svg>
  )
}
