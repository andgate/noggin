import { Stack, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { DirectoryPicker } from '@renderer/components/DirectoryPicker'
import { useModkit } from '@renderer/hooks/use-mod-kit'
import { useNavigate } from '@tanstack/react-router'

export default function ModKitLoaderPage() {
    const { setModkit } = useModkit()
    const navigate = useNavigate()

    const handleModkitLoad = async (path: string) => {
        try {
            await window.api.modkit.add(path)
            const modkit = await window.api.modkit.load(path)
            await window.api.store.set('activeModkitId', modkit.id)
            setModkit(modkit)
            navigate({ to: '/' })
            notifications.show({
                title: 'Success',
                message: 'Modkit loaded successfully',
                color: 'green',
            })
        } catch (error) {
            console.error('Failed to load modkit:', error)
            notifications.show({
                title: 'Error',
                message: 'Failed to load modkit',
                color: 'red',
            })
        }
    }

    return (
        <Stack p="md">
            <Title order={2}>Load Modkit</Title>
            <DirectoryPicker onSelect={handleModkitLoad} />
        </Stack>
    )
}
