import { Mod } from '@noggin/types/module-types'
import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../../pages/Module'

export const Route = createFileRoute('/module/view/$libraryId/$moduleId')({
    component: ModuleViewRoot,
    loader: async ({ params }): Promise<Mod> => {
        return await window.api.modules.readModuleBySlug(params.libraryId, params.moduleId)
    },
})

// Root component to handle path params and load data
function ModuleViewRoot() {
    const moduleData = Route.useLoaderData() // Use the loaded data

    return <ModulePage module={moduleData} /> // Pass the entire Mod object
}
