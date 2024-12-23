import { createFileRoute } from '@tanstack/react-router'
import { CreateModulePage } from '../../pages/CreateModulePage'

export const Route = createFileRoute('/module/create')({
    component: CreateModulePage,
})
