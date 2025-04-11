const MIME_TYPE_MAP = {
    // Documents
    pdf: 'application/pdf',
    txt: 'text/plain',
    md: 'text/md',
    html: 'text/html',
    csv: 'text/csv',
    rtf: 'text/rtf',
    xml: 'text/xml',

    // Code
    js: 'application/javascript',
    py: 'application/x-python',
    css: 'text/css',

    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',

    // Audio
    wav: 'audio/wav',
    mp3: 'audio/mp3',
    aiff: 'audio/aiff',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
} as const

export function getMimeType(filepath: string): string {
    const extension = filepath.split('.').pop()?.toLowerCase() || ''
    return MIME_TYPE_MAP[extension as keyof typeof MIME_TYPE_MAP] || 'application/octet-stream'
}
