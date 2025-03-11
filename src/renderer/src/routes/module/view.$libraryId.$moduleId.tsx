import { Mod } from '@noggin/types/module-types'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ModulePage } from '../../pages/Module'

export const Route = createFileRoute('/module/view/$libraryId/$moduleId')({
    component: ModuleViewRoot,
    loader: async ({ params }): Promise<Mod> => {
        return await window.api.modules.readModuleById(params.libraryId, params.moduleId)
    },
})

// Root component to handle path params and load data
function ModuleViewRoot() {
    const moduleData = Route.useLoaderData() // Use the loaded data
    const setSelectedModule = useUiStore((state) => state.setSelectedModule)

    // Set selected module when component mounts, clear when unmounting
    useEffect(() => {
        setSelectedModule(moduleData)

        return () => {
            setSelectedModule(null)
        }
    }, [moduleData, setSelectedModule])

    return <ModulePage module={moduleData} /> // Pass the entire Mod object
}
