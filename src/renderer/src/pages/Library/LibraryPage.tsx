import { Stack, Text, Title } from '@mantine/core'
import type { Library } from '@noggin/types/library-types'
import type { ModuleOverview } from '@noggin/types/module-types'

interface LibraryPageProps {
    library: Library
    modules: ModuleOverview[]
}

export function LibraryPage({ library, modules }: LibraryPageProps) {
    const libraryModules = modules.filter((module) => module.librarySlug === library.metadata.slug)

    return (
        <Stack p="md">
            <Title order={2}>{library.metadata.name}</Title>
            <Text c="dimmed">{library.metadata.description}</Text>

            <Title order={3} mt="xl">
                Modules
            </Title>
            <Stack>
                {libraryModules.map((module) => (
                    <Text key={module.slug}>{module.displayName}</Text>
                ))}
                {libraryModules.length === 0 && <Text c="dimmed">No modules in this library</Text>}
            </Stack>
        </Stack>
    )
}
