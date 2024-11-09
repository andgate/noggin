import { NotFound } from '@renderer/components/NotFound'
import { UserSettingsPage } from '@renderer/pages/UserSettingsPage'
import { getUserSettings } from '@renderer/services/user-settings-service'
import { createFileRoute, ErrorComponent, ErrorComponentProps } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
    loader: () => getUserSettings(),
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
    const settings = Route.useLoaderData()
    return <UserSettingsPage settings={settings} />
}
