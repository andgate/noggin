import { Library } from '@noggin/types/library-types'
import { z } from 'zod'

export const libraryMetadataSchema = z.object({
    name: z.string(),
    description: z.string(),
    id: z.string(),
    createdAt: z.number(),
})

export type LibraryMetadata = z.infer<typeof libraryMetadataSchema>

export function extractLibraryMetadata(library: Library): LibraryMetadata {
    return libraryMetadataSchema.parse({
        name: library.name,
        description: library.description,
        id: library.id,
        createdAt: library.createdAt,
    })
}
