import { z } from 'zod'

export const libraryMetadataSchema = z.object({
    name: z.string(),
    description: z.string(),
    createdAt: z.number(),
    slug: z.string(),
})

export const librarySchema = z.object({
    path: z.string(),
    metadata: libraryMetadataSchema,
})

export type LibraryMetadata = z.infer<typeof libraryMetadataSchema>
export type Library = z.infer<typeof librarySchema>

// For the library selection/creation UI
export const libraryFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string(),
    path: z.string().min(1, 'Path is required'),
})

export type LibraryForm = z.infer<typeof libraryFormSchema>
