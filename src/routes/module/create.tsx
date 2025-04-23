import { CreateModulePage } from '@/features/create-module/CreateModule'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/module/create')({
  component: CreateModulePage,
})
