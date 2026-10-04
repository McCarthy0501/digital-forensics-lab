


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