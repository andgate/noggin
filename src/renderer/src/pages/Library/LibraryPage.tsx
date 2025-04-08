import { Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import type { Library } from '@noggin/types/library-types'
import type { ModuleOverview } from '@noggin/types/module-types'
import { AppHeader, HeaderAction } from '@renderer/components/layout/AppHeader'
import { useNavigate } from '@tanstack/react-router'

interface LibraryPageProps {
    library: Library
    modules: ModuleOverview[]
}

export function LibraryPage({ library, modules }: LibraryPageProps) {
    const libraryModules = modules.filter((module) => module.librarySlug === library.slug)
    const navigate = useNavigate()

    // Define which header actions to enable
    const headerActions: HeaderAction[] = ['explorer', 'settings']

    const handleModuleClick = (moduleId: string, libraryId: string) => {
        navigate({
            to: '/module/view/$libraryId/$moduleId',
            params: { libraryId, moduleId },
        })
    }

    return (
        <>
            <AppHeader title={library.name} actions={headerActions} />

            <Stack p="md">
                <Title order={2}>{library.name}</Title>
                <Text c="dimmed">{library.description}</Text>

                <Title order={3} mt="xl">
                    Modules
                </Title>

                {libraryModules.length > 0 ? (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}>
                        {libraryModules.map((module) => (
                            <Card
                                key={module.id}
                                shadow="sm"
                                padding="md"
                                radius="md"
                                withBorder
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleModuleClick(module.id, module.librarySlug)}
                            >
                                <Group justify="space-between" mb="xs">
                                    <Text fw={500} size="sm" truncate>
                                        {module.displayName}
                                    </Text>
                                </Group>
                            </Card>
                        ))}
                    </SimpleGrid>
                ) : (
                    <Text c="dimmed">No modules in this library</Text>
                )}
            </Stack>
        </>
    )
}
