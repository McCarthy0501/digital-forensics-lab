export const ACCEPTED_EXTENSIONS = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'webm', 'flac', 'mp4', 'mov']

export const MAX_FILE_SIZE = 200 * 1024 * 1024

export const FILE_ACCEPT_ATTRIBUTE = ['audio/*', 'video/*', ...ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`)].join(',')
