import { ActionIcon, Button, Card, Group, Menu, SimpleGrid, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Mod } from '@noggin/types/module-types'
import { useModule } from '@renderer/hooks/use-module'
import { IconDotsVertical, IconPlayerPlay, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

export function PracticeFeed() {
    const { getRegisteredPaths, readModuleData, removeModule } = useModule()
    const [modules, setModules] = useState<Mod[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchModules = async () => {
        setIsLoading(true)
        try {
            const paths = await getRegisteredPaths()
            const mods = await Promise.all(paths.map(readModuleData))
            setModules(mods)
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to load modules',
                color: 'red',
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchModules()
    }, [])

    const handleDeleteMod = async (modId?: string) => {
        if (!modId) return
        const mod = modules.find((m) => m.id === modId)
        if (!mod) return

        try {
            await removeModule(mod.path)
            await fetchModules()
            notifications.show({
                title: 'Success',
                message: 'Module deleted successfully',
                color: 'green',
            })
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to delete module',
                color: 'red',
            })
        }
    }

    return (
        <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            p="md"
            style={{ flex: 1, overflow: 'auto' }}
        >
            {modules?.map((mod: Mod) => (
                <Card key={mod.id} shadow="sm" padding="md" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text fw={500} size="sm" truncate>
                            {mod.name}
                        </Text>
                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <ActionIcon variant="subtle" size="sm">
                                    <IconDotsVertical size={16} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconTrash size={14} />}
                                    color="red"
                                    onClick={() => {
                                        const confirmed = window.confirm(
                                            'Are you sure you want to delete this module?'
                                        )
                                        if (confirmed) handleDeleteMod(mod.id)
                                    }}
                                >
                                    Delete
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>

                    <Text size="xs" c="dimmed" mb="md">
                        Created {new Date(mod.createdAt).toLocaleDateString()}
                    </Text>

                    <Group gap="xs">
                        <Button
                            variant="light"
                            size="xs"
                            leftSection={<IconPlayerPlay size={14} />}
                            fullWidth
                        >
                            Start Quiz
                        </Button>
                    </Group>
                </Card>
            ))}
        </SimpleGrid>
    )
}
