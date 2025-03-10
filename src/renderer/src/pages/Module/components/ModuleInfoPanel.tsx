import { Group, Stack, Text, Title } from '@mantine/core'
import { Mod } from '@noggin/types/module-types'
import { formatDate } from '@renderer/app/common/format'

type ModuleInfoPanelProps = {
    module: Mod
}

export function ModuleInfoPanel({ module }: ModuleInfoPanelProps) {
    return (
        <Stack
            id="module-info-panel"
            gap="md"
            style={{ height: '100%', maxWidth: '100%', overflowX: 'hidden' }}
        >
            <Title order={3}>Module Overview</Title>
            <Text id="module-path" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {module.metadata.path}
            </Text>

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
            </div>

            {/* Source Files */}
            <Stack id="source-files-section" gap="xs" style={{ width: '100%' }}>
                <Text fw={500}>Source Files:</Text>
                <div
                    id="source-files-list"
                    style={{
                        maxHeight: '150px',
                        overflow: 'auto',
                        overflowX: 'hidden',
                        width: '100%',
                    }}
                >
                    {module.sources.map((source, index) => (
                        <Text
                            key={index}
                            size="sm"
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                            {source}
                        </Text>
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
                        overflowX: 'hidden',
                        width: '100%',
                    }}
                >
                    {module.submissions.length === 0 ? (
                        <Text size="sm" c="dimmed">
                            No submissions yet
                        </Text>
                    ) : (
                        module.submissions.map((submission) => (
                            <Group
                                key={submission.attemptNumber}
                                style={{ flexWrap: 'wrap', width: '100%' }}
                            >
                                <Text
                                    size="sm"
                                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                >
                                    {submission.quizTitle}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    {formatDate(submission.completedAt)}
                                </Text>
                                {submission.grade && (
                                    <Text size="sm">Grade: {submission.grade}%</Text>
                                )}
                            </Group>
                        ))
                    )}
                </div>
            </Stack>
        </Stack>
    )
}
