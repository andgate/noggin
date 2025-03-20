import { Stack } from '@mantine/core'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { ModuleExplorer } from '@renderer/components/ModuleExplorer'

export function LeftSidepane() {
    const { explorerCollapsed } = useUiStore()

    if (explorerCollapsed) {
        return null
    }

    return (
        <Stack style={{ height: '100%', width: '100%' }} gap={0}>
            <ModuleExplorer />
        </Stack>
    )
}
