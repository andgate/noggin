/* Storage Limitations (for gemini-2.5-pro):
 *
 * Images:
 *   - Maximum images per prompt: 3,000
 *   - Maximum image size: 7 MB
 *   - Supported MIME types: image/png, image/jpeg, image/webp
 *
 * Documents:
 *   - Maximum number of files per prompt: 3,000
 *   - Maximum number of pages per file: 1,000
 *   - Maximum file size per file: 50 MB
 *   - Supported MIME types: application/pdf, text/plain
 *
 * Video:
 *   - Maximum video length (with audio): Approximately 45 minutes
 *   - Maximum video length (without audio): Approximately 1 hour
 *   - Maximum number of videos per prompt: 10
 *   - Supported MIME types: video/x-flv, video/quicktime, video/mpeg, video/mpegs, video/mpgs, video/mpg, video/mp4, video/webm, video/wmv, video/3gpp
 *
 * Audio:
 *   - Maximum audio length per prompt: Approximately 8.4 hours, or up to 1 million tokens
 *   - Maximum number of audio files per prompt: 1
 *   - Speech understanding for: Audio summarization, transcription, and translation
 *   - Supported MIME types: audio/x-aac, audio/flac, audio/mp3, audio/m4a, audio/mpeg, audio/mpga, audio/mp4, audio/opus, audio/pcm, audio/wav, audio/webm
 */

const MIME_TYPE_MAP: { [key: string]: string } = {
  // Images (image/png, image/jpeg, image/webp)
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',

  // Documents (application/pdf, text/plain)
  pdf: 'application/pdf',
  txt: 'text/plain',

  // Video (video/x-flv, video/quicktime, video/mpeg, video/mp4, video/webm, video/wmv, video/3gpp)
  flv: 'video/x-flv',
  mov: 'video/quicktime',
  mpeg: 'video/mpeg', // Covers video/mpeg, video/mpegs, video/mpgs, video/mpg
  mp4: 'video/mp4', // Primary association for .mp4
  webm: 'video/webm', // Primary association for .webm
  wmv: 'video/wmv',
  '3gp': 'video/3gpp',
  '3gpp': 'video/3gpp',

  // Audio (audio/x-aac, audio/flac, audio/mp3, audio/m4a, audio/mpeg, audio/mpga, audio/opus, audio/pcm, audio/wav)
  // Note: audio/mp4 and audio/webm are in the spec but map to video extensions by default.
  aac: 'audio/x-aac', // Spec uses x-aac
  flac: 'audio/flac',
  mp3: 'audio/mp3',
  m4a: 'audio/m4a', // Audio-only MP4
  mpga: 'audio/mpeg', // Covers audio/mpeg, audio/mpga
  opus: 'audio/opus',
  pcm: 'audio/pcm', // Raw audio, using .pcm extension
  wav: 'audio/wav',
} as const

export function getMimeType(filepath: string): string {
  const extension = filepath.split('.').pop()?.toLowerCase() || ''

  // Check if the extension is in the MIME_TYPE_MAP
  if (!(extension in MIME_TYPE_MAP)) {
    console.warn(`Unsupported file extension: ${extension}`)
    return 'text/plain' // Default to text/plain for unsupported types
  }

  return MIME_TYPE_MAP[extension]
}
