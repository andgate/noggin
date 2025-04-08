import { v6 as uuidv6 } from 'uuid' // Changed import to v6
import { z } from 'zod'

export const librarySchema = z.object({
    path: z.string(),
    name: z.string(),
    description: z.string(),
    id: z.string(),
    createdAt: z.number(),
})

export type Library = z.infer<typeof librarySchema>

// For the library selection/creation UI
export const libraryFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string(),
    path: z.string().min(1, 'Path is required'),
})

export type LibraryForm = z.infer<typeof libraryFormSchema>

export function createLibrary(path: string, name: string, description: string): Library {
    return librarySchema.parse({
        path,
        name,
        description,
        id: uuidv6(),
        createdAt: Date.now(),
    })
}
