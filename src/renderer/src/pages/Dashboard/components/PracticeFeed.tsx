import { ActionIcon, Button, Card, Group, SimpleGrid, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Mod } from '@noggin/types/module-types'
import { useModule } from '@renderer/app/hooks/use-module'
import { IconHistory, IconPlayerPlay, IconPlus, IconTrash } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export function PracticeFeed() {
    const { getDueModules, removeModule } = useModule()
    const [modules, setModules] = useState<Mod[]>([])
    const [_isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const fetchModules = async () => {
        setIsLoading(true)
        try {
            const mods = await getDueModules()
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

    const handleModuleClick = (moduleId: string, libraryId: string) => {
        if (!libraryId) {
            notifications.show({
                title: 'Error',
                message: 'Library ID is required for navigation',
                color: 'red',
            })
            return
        }

        navigate({
            to: '/module/view/$libraryId/$moduleId',
            params: { libraryId, moduleId },
        })
    }

    const handleStartQuiz = async (moduleId: string, libraryId: string) => {
        if (!libraryId) {
            notifications.show({
                title: 'Error',
                message: 'Library ID is required for navigation',
                color: 'red',
            })
            return
        }

        try {
            const quiz = await window.api.modules.getLatestModuleQuiz(libraryId, moduleId)
            navigate({
                to: '/quiz/session/$libraryId/$moduleId/$quizId',
                params: { libraryId, moduleId, quizId: quiz.id },
            })
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'No quizzes available for this module',
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
                <Card
                    key={mod.id}
                    shadow="sm"
                    padding="md"
                    radius="md"
                    withBorder
                    style={{
                        width: '280px',
                        height: '180px',
                        cursor: 'pointer',
                    }}
                    onClick={() => handleModuleClick(mod.id, mod.metadata.libraryId)}
                >
                    <Group justify="space-between" mb="xs">
                        <Text fw={500} size="sm" truncate>
                            {mod.metadata.title}
                        </Text>
                    </Group>

                    <Group gap={8} mb="md">
                        <Text size="xs" c="dimmed">
                            Created {new Date(mod.metadata.createdAt).toLocaleDateString()}
                        </Text>
                    </Group>

                    <Group justify="space-between" mt="auto">
                        <Button
                            variant="light"
                            size="xs"
                            leftSection={<IconPlayerPlay size={14} />}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleStartQuiz(mod.id, mod.metadata.libraryId)
                            }}
                            title="Start the most recent quiz for this module"
                        >
                            Start Quiz
                        </Button>
                        <Group gap={8}>
                            <ActionIcon variant="subtle" size="md" title="Generate New Quiz">
                                <IconPlus size={18} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" size="md" title="Review Submissions">
                                <IconHistory size={18} />
                            </ActionIcon>
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                size="md"
                                title="Delete Module"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    const confirmed = window.confirm(
                                        'Are you sure you want to delete this module?'
                                    )
                                    if (confirmed) handleDeleteMod(mod.id)
                                }}
                            >
                                <IconTrash size={18} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Card>
            ))}
        </SimpleGrid>
    )
}
