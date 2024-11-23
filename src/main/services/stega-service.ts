// src/main/services/stego-service.ts
import { createReadStream, createWriteStream } from 'fs'
import { PNG } from 'pngjs'

const IMAGE_SIZE = 1024

const createEmptyPNG = () => new PNG({ width: IMAGE_SIZE, height: IMAGE_SIZE })

const embedBufferIntoImage = (buffer: Buffer, png: PNG): PNG => {
    const result = new PNG({ width: png.width, height: png.height })
    result.data = Buffer.from(png.data)

    for (let i = 0; i < buffer.length && i < result.data.length - 2; i += 3) {
        result.data[i] = buffer[i % buffer.length]
        result.data[i + 1] = buffer[(i + 1) % buffer.length]
        result.data[i + 2] = buffer[(i + 2) % buffer.length]
    }

    return result
}

const writePNGToFile = (png: PNG, outputPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        png.pack().pipe(createWriteStream(outputPath)).on('finish', resolve).on('error', reject)
    })
}

export const embedData = async (data: string, outputPath: string): Promise<void> => {
    const png = createEmptyPNG()
    const buffer = Buffer.from(data)
    const embeddedPng = embedBufferIntoImage(buffer, png)
    return writePNGToFile(embeddedPng, outputPath)
}

const extractBufferFromPNG = (png: PNG): Buffer => {
    const data: number[] = []
    for (let i = 0; i < png.data.length - 2; i += 3) {
        data.push(png.data[i], png.data[i + 1], png.data[i + 2])
    }
    return Buffer.from(data)
}

const readPNGFromFile = (filePath: string): Promise<PNG> => {
    return new Promise((resolve, reject) => {
        createReadStream(filePath)
            .pipe(new PNG())
            .on('parsed', (png: PNG) => resolve(png))
            .on('error', reject)
    })
}

export const extractData = async (filePath: string): Promise<string> => {
    const png = await readPNGFromFile(filePath)
    const buffer = extractBufferFromPNG(png)
    return buffer.toString()
}
