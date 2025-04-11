import { CreateModulePage } from '@noggin/pages/CreateModule'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/module/create')({
  component: CreateModulePage,
})
