import { Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Mod } from '@noggin/types/module-types'
import { ModuleExplorer } from '@renderer/components/ModuleExplorer'
import { useModule } from '@renderer/hooks/use-module'
import { IconEdit, IconPlayerPlay, IconTrash } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import React from 'react'

// TODO: Add search functionality for mods
// TODO: Implement mod categories/tags
// TODO: Add bulk operations support
// TODO: Consider adding mod templates
// TODO: Add SSR prefetching for initial mod list
// TODO: Add loading skeletons for mod cards during client-side updates
// TODO: Implement optimistic updates for delete operations
// TODO: Add error recovery UI for failed mod loading
// TODO: Add retry mechanism for failed operations
const DashboardPage: React.FC = () => {
    const navigate = useNavigate({ from: '/' })
    const { readModuleData, removeModule, getRegisteredPaths } = useModule()
    const queryClient = useQueryClient()

    const { data: modules, isLoading } = useQuery({
        queryKey: ['modules'],
        queryFn: async () => {
            const paths = await getRegisteredPaths()
            return Promise.all(paths.map((path) => readModuleData(path)))
        },
    })

    if (isLoading) {
        return null
    }

    const deleteMutation = useMutation({
        mutationFn: async (modId: string) => {
            const mod = modules?.find((m) => m.id === modId)
            if (!mod) throw new Error('Mod not found')
            await removeModule(mod.path)
        },
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Mod deleted successfully',
                color: 'green',
            })
            queryClient.invalidateQueries({ queryKey: ['modules'] })
        },
        onError: () => {
            notifications.show({
                title: 'Error',
                message: 'Failed to delete mod',
                color: 'red',
            })
        },
    })

    const handleStartMod = (modId?: string) => {
        if (!modId) return
        console.log('Start mod:', modId)
    }

    const handleViewMod = (modId?: string) => {
        if (!modId) return
        console.log('View mod:', modId)
    }

    const handleDeleteMod = (modId?: string) => {
        if (!modId) return
        deleteMutation.mutate(modId)
    }

    return (
        <Group align="start" gap={0}>
            <ModuleExplorer />

            <Stack p="md" style={{ flex: 1 }}>
                <Group justify="space-between" align="center">
                    <Title order={2}>Modules</Title>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
                    {modules?.map((mod: Mod) => (
                        <Card key={mod.id} shadow="sm" padding="lg" radius="md" withBorder>
                            <Card.Section p="md">
                                <Text fw={500} size="lg">
                                    {mod.name}
                                </Text>
                                <Stack gap="xs" mt="sm">
                                    <Text size="sm">{mod.quizzes.length} Quizzes</Text>
                                    <Text size="sm">
                                        Created: {new Date(mod.createdAt).toLocaleDateString()}
                                    </Text>
                                </Stack>
                            </Card.Section>

                            <Group justify="space-between" mt="md">
                                <Button
                                    variant="light"
                                    leftSection={<IconPlayerPlay size={16} />}
                                    onClick={() => handleStartMod(mod.id)}
                                >
                                    Start
                                </Button>
                                <Button
                                    variant="light"
                                    leftSection={<IconEdit size={16} />}
                                    onClick={() => handleViewMod(mod.id)}
                                >
                                    View
                                </Button>
                                <Button
                                    variant="light"
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                    onClick={() => {
                                        const confirmed = window.confirm(
                                            'Are you sure you want to delete this mod? This action cannot be undone.'
                                        )
                                        if (confirmed) {
                                            handleDeleteMod(mod.id)
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                            </Group>
                        </Card>
                    ))}
                </SimpleGrid>
            </Stack>
        </Group>
    )
}

export default DashboardPage
