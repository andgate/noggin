import { createFileRoute } from '@tanstack/react-router'
import ModkitLoaderPage from '../pages/ModKitLoaderPage'

export const Route = createFileRoute('/modkit-loader')({
    component: RouteComponent,
})

function RouteComponent() {
    return <ModkitLoaderPage />
}
