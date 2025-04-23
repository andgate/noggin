import { z } from 'zod'

export const moduleSourceSchema = z.object({
  id: z.string().uuid(),
  moduleId: z.string().uuid(),
  userId: z.string().uuid(),
  fileName: z.string(),
  storageObjectPath: z.string(),
  mimeType: z.string().nullable().default(null),
  sizeBytes: z.number().int().min(0).nullable().default(null),
  createdAt: z.string().datetime({ offset: true }),
})

export type ModuleSource = z.infer<typeof moduleSourceSchema>
