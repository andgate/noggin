import { ensureDir } from '@noggin/shared/fs-extra'
import * as fs from 'fs/promises'
import * as path from 'path'
import { LibraryMetadata, libraryMetadataSchema } from './types'

export async function writeLibraryMetadataFile(
    libraryPath: string,
    metadata: LibraryMetadata
): Promise<void> {
    const normalizedPath = path.normalize(libraryPath).replace(/\\/g, '/')
    // Ensure the library directory exists
    await ensureDir(normalizedPath)

    const libPath = path.join(normalizedPath, '.lib').replace(/\\/g, '/')
    await ensureDir(libPath)

    const metadataPath = path.join(normalizedPath, '.lib', 'meta.json').replace(/\\/g, '/')

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), { encoding: 'utf-8' })
}

export async function readLibraryMetadataFile(libraryPath: string): Promise<LibraryMetadata> {
    const metadataPath = path.join(libraryPath, '.lib', 'meta.json')
    const rawData = await fs.readFile(metadataPath, 'utf-8')
    const jsonData = JSON.parse(rawData)
    return libraryMetadataSchema.parse(jsonData)
}
