import { NotFound } from '@renderer/components/NotFound'
import { UserSettingsPage } from '@renderer/pages/UserSettingsPage'
import { createFileRoute, ErrorComponent, ErrorComponentProps } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
    errorComponent: SettingsErrorComponent,
    component: RouteComponent,
    notFoundComponent: () => {
        return <NotFound>Settings not found</NotFound>
    },
})

export function SettingsErrorComponent({ error }: ErrorComponentProps) {
    return <ErrorComponent error={error} />
}

function RouteComponent() {
    return <UserSettingsPage />
}
