// src/renderer/src/components/ModuleExplorer.tsx
import {
    ActionIcon,
    Button,
    Group,
    Paper,
    ScrollArea,
    Stack,
    Text,
    Transition,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
    IconChevronLeft,
    IconChevronRight,
    IconFolder,
    IconList,
    IconNotes,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

// Helper functions
const openFolder = async (path: string) => {
    try {
        await window.electron.shell.openPath(path)
    } catch (error) {
        notifications.show({
            title: 'Error',
            message: 'Failed to open folder',
            color: 'red',
        })
    }
}

// Module item component
function ModuleItem({
    path,
    name,
    isExpanded,
    onSelect,
}: {
    path: string
    name: string
    isExpanded: boolean
    onSelect: () => void
}) {
    return (
        <Stack gap="xs">
            <Button variant="subtle" justify="start" onClick={onSelect} fullWidth>
                {name}
            </Button>

            {isExpanded && (
                <Group ml="md" gap="xs">
                    <Button
                        variant="light"
                        size="xs"
                        leftSection={<IconFolder size={16} />}
                        onClick={() => openFolder(path)}
                    >
                        Open Folder
                    </Button>
                    <Button
                        variant="light"
                        size="xs"
                        leftSection={<IconList size={16} />}
                        onClick={() => console.log('View quizzes')}
                    >
                        Quizzes
                    </Button>
                    <Button
                        variant="light"
                        size="xs"
                        leftSection={<IconNotes size={16} />}
                        onClick={() => console.log('View submissions')}
                    >
                        Submissions
                    </Button>
                </Group>
            )}
        </Stack>
    )
}

export function ModuleExplorer() {
    const [isOpen, { toggle }] = useDisclosure(true)
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

    // Fetch module paths
    const { data: modulePaths = [] } = useQuery({
        queryKey: ['modulePaths'],
        queryFn: () => window.api.modules.getRegisteredPaths(),
    })

    return (
        <Group align="start" gap={0}>
            <ActionIcon
                variant="light"
                size="lg"
                onClick={toggle}
                aria-label="Toggle module explorer"
            >
                {isOpen ? <IconChevronLeft /> : <IconChevronRight />}
            </ActionIcon>

            <Transition mounted={isOpen} transition="slide-right">
                {(styles) => (
                    <Paper style={styles} w={300} h="100vh" p="md" withBorder>
                        <Stack gap="md">
                            <Text fw={500} size="lg">
                                Module Explorer
                            </Text>

                            <ScrollArea h="calc(100vh - 100px)">
                                <Stack gap="sm">
                                    {modulePaths.map((path) => (
                                        <ModuleItem
                                            key={path}
                                            path={path}
                                            name={path.split('/').pop() || path}
                                            isExpanded={selectedModuleId === path}
                                            onSelect={() =>
                                                setSelectedModuleId(
                                                    selectedModuleId === path ? null : path
                                                )
                                            }
                                        />
                                    ))}
                                </Stack>
                            </ScrollArea>
                        </Stack>
                    </Paper>
                )}
            </Transition>
        </Group>
    )
}
