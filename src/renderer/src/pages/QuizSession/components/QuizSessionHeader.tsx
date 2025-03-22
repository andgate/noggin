import { ActionIcon, Group, Text, Title, Tooltip } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'

interface QuizSessionHeaderProps {
    title: string
    onExit: () => void
}

export function QuizSessionHeader({ title, onExit }: QuizSessionHeaderProps) {
    return (
        <Group
            h={40}
            px="md"
            py={5}
            justify="space-between"
            bg="var(--mantine-color-dark-6)"
            style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
        >
            <Group gap="xs">
                <Tooltip label="Exit quiz" position="right">
                    <ActionIcon
                        variant="filled"
                        onClick={onExit}
                        size="sm"
                        color="red"
                        aria-label="Exit quiz"
                    >
                        <IconArrowLeft size={14} />
                    </ActionIcon>
                </Tooltip>

                <Title order={4} style={{ lineHeight: 1 }}>
                    {title}
                </Title>

                <Text size="xs" c="dimmed" style={{ marginLeft: '1rem' }}>
                    (In progress - Exit with caution)
                </Text>
            </Group>

            {/* Empty Group to maintain the space-between layout */}
            <Group gap="xs"></Group>
        </Group>
    )
}
