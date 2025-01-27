export function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function formatDate(input: string | number): string {
    console.log('formatDate input:', input, typeof input)

    const date = typeof input === 'number' ? new Date(input) : new Date(input)

    console.log('created date object:', date, 'isValid:', !isNaN(date.getTime()))

    if (isNaN(date.getTime())) {
        console.log('throwing error for invalid date')
        throw new Error('Invalid date')
    }

    const result = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    })

    console.log('formatted result:', result)
    return result
}
