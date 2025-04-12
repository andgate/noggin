import { LoginPage } from '@noggin/pages/Login/LoginPage'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const loginSearchSchema = z.object({
  redirect: z.string().optional().catch('/'),
})

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => loginSearchSchema.parse(search),
  component: LoginPage,
})

export type LoginSearch = z.infer<typeof loginSearchSchema>
