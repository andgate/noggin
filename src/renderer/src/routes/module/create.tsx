import { createFileRoute } from '@tanstack/react-router'
import { CreateModulePage } from '../../pages/CreateModule'

export const Route = createFileRoute('/module/create')({
    component: CreateModulePage,
})
