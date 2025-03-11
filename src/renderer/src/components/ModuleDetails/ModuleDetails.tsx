import { Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { Mod } from '@noggin/types/module-types'
import { formatDate } from '@renderer/app/common/format'
import { IconFile } from '@tabler/icons-react'

type ModuleDetailsProps = {
    module: Mod
}

export function ModuleDetails({ module }: ModuleDetailsProps) {
    const truncatedTextStyle = {
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis' as const,
        maxWidth: '100%',
    }

    // Map box numbers to natural language mastery levels
    const getMasteryLevel = (boxNumber: number) => {
        const levels = {
            1: 'Beginner',
            2: 'Learning',
            3: 'Familiar',
            4: 'Confident',
            5: 'Mastered',
        }
        return levels[boxNumber as keyof typeof levels] || 'Unknown'
    }

    return (
        <Stack
            id="module-details"
            gap="md"
            p="md"
            style={{ height: '100%', width: '100%', maxWidth: '100%' }}
        >
            <Title order={4}>{module.metadata.title}</Title>

            {/* Module Stats */}
            <Stack id="module-stats" gap="xs">
                <Text fw={500}>Module Info</Text>
                <Group gap="xs">
                    <Text size="sm" c="dimmed">
                        Created:
                    </Text>
                    <Text size="sm">{formatDate(`${module.metadata.createdAt}`)}</Text>
                </Group>
                <Group gap="xs">
                    <Text size="sm" c="dimmed">
                        Last Updated:
                    </Text>
                    <Text size="sm">{formatDate(`${module.metadata.updatedAt}`)}</Text>
                </Group>
                <Group gap="xs">
                    <Text size="sm" c="dimmed">
                        Quiz Count:
                    </Text>
                    <Text size="sm">{module.quizzes.length}</Text>
                </Group>
            </Stack>

            {/* Spaced Repetition Stats */}
            {module.stats && (
                <Stack id="learning-progress" gap="xs">
                    <Text fw={500}>Learning Progress</Text>
                    <Group gap="xs">
                        <Text size="sm" c="dimmed">
                            Mastery Level:
                        </Text>
                        <Text size="sm">{getMasteryLevel(module.stats.currentBox)}</Text>
                    </Group>
                    <Group gap="xs">
                        <Text size="sm" c="dimmed">
                            Box:
                        </Text>
                        <Text size="sm">{module.stats.currentBox}/5</Text>
                    </Group>
                    <Group gap="xs">
                        <Text size="sm" c="dimmed">
                            Last Reviewed:
                        </Text>
                        <Text size="sm">{formatDate(module.stats.lastReviewDate)}</Text>
                    </Group>
                    <Group gap="xs">
                        <Text size="sm" c="dimmed">
                            Next Review:
                        </Text>
                        <Text size="sm">{formatDate(module.stats.nextDueDate)}</Text>
                    </Group>
                </Stack>
            )}

            {/* Source Files */}
            <Stack id="source-files" gap="xs">
                <Text fw={500}>Source Files</Text>
                <div
                    style={{
                        maxHeight: '200px',
                        overflow: 'auto',
                        width: '100%',
                    }}
                >
                    {module.sources.map((source, index) => (
                        <Tooltip
                            key={index}
                            label={source}
                            openDelay={500}
                            position="right"
                            withinPortal
                        >
                            <Group gap="xs" style={{ alignItems: 'center' }}>
                                <IconFile size={14} />
                                <Text size="sm" style={truncatedTextStyle}>
                                    {source}
                                </Text>
                            </Group>
                        </Tooltip>
                    ))}
                </div>
            </Stack>
        </Stack>
    )
}
