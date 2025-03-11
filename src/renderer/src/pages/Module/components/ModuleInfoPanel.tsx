import { Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { Mod } from '@noggin/types/module-types'
import { formatDate } from '@renderer/app/common/format'
import { ModuleSubmissionsTable } from './ModuleSubmissionsTable'

type ModuleInfoPanelProps = {
    module: Mod
}

export function ModuleInfoPanel({ module }: ModuleInfoPanelProps) {
    const truncatedTextStyle = {
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis' as const,
        maxWidth: '100%',
    }

    return (
        <Stack
            id="module-info-panel"
            gap="md"
            style={{ height: '100%', width: '100%', maxWidth: '100%' }}
        >
            <Title order={3}>{module.metadata.title}</Title>

            <Tooltip label={module.metadata.path} openDelay={800} position="bottom" withinPortal>
                <Text id="module-path" style={truncatedTextStyle}>
                    {module.metadata.path}
                </Text>
            </Tooltip>

            {/* Module Overview */}
            <Stack id="module-overview" gap="xs">
                <Text fw={500}>Overview:</Text>
                <Text>{module.metadata.overview}</Text>
            </Stack>

            {/* Module Stats */}
            <div id="module-stats">
                <Group>
                    <Text c="dimmed">Created:</Text>
                    <Text>{formatDate(`${module.metadata.createdAt}`)}</Text>
                </Group>
                <Group>
                    <Text c="dimmed">Last Updated:</Text>
                    <Text>{formatDate(`${module.metadata.updatedAt}`)}</Text>
                </Group>
                <Group>
                    <Text c="dimmed">Quiz Count:</Text>
                    <Text>{module.quizzes.length}</Text>
                </Group>
            </div>

            {/* Spaced Repetition Stats */}
            {module.stats && (
                <Stack id="spaced-repetition-stats" gap="xs">
                    <Text fw={500}>Learning Progress:</Text>
                    <Group>
                        <Text c="dimmed">Current Box:</Text>
                        <Text>{module.stats.currentBox}/5</Text>
                    </Group>
                    <Group>
                        <Text c="dimmed">Last Reviewed:</Text>
                        <Text>{formatDate(module.stats.lastReviewDate)}</Text>
                    </Group>
                    <Group>
                        <Text c="dimmed">Next Review Due:</Text>
                        <Text>{formatDate(module.stats.nextDueDate)}</Text>
                    </Group>
                </Stack>
            )}

            {/* Source Files */}
            <Stack id="source-files-section" gap="xs" style={{ width: '100%' }}>
                <Text fw={500}>Source Files:</Text>
                <div
                    id="source-files-list"
                    style={{
                        maxHeight: '150px',
                        overflow: 'auto',
                        width: '100%',
                    }}
                >
                    {module.sources.map((source, index) => (
                        <Tooltip
                            key={index}
                            label={source}
                            openDelay={800}
                            position="bottom"
                            withinPortal
                        >
                            <Text size="sm" style={truncatedTextStyle}>
                                {source}
                            </Text>
                        </Tooltip>
                    ))}
                </div>
            </Stack>

            {/* Submissions */}
            <Stack id="submissions-section" gap="xs" style={{ width: '100%' }}>
                <Text fw={500}>Recent Submissions:</Text>
                <div
                    id="submissions-list"
                    style={{
                        maxHeight: '200px',
                        overflow: 'auto',
                        width: '100%',
                    }}
                >
                    <ModuleSubmissionsTable module={module} />
                </div>
            </Stack>
        </Stack>
    )
}
