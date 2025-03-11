import { Accordion, Stack } from '@mantine/core'
import { useUiStore } from '@renderer/app/stores/ui-store'
import { ModuleDetails } from '@renderer/components/ModuleDetails'
import { ModuleExplorer } from '@renderer/components/ModuleExplorer'

export function LeftSidepane() {
    const { explorerCollapsed, selectedModule } = useUiStore()

    if (explorerCollapsed) {
        return null
    }

    return (
        <Stack style={{ height: '100%', width: '100%' }} gap={0}>
            <Accordion
                multiple
                defaultValue={['MODULE EXPLORER']}
                variant="filled"
                radius={0}
                styles={{
                    content: { padding: 0 },
                    control: {
                        padding: '10px 16px',
                        fontWeight: 600,
                        backgroundColor: 'var(--mantine-color-dark-6)',
                    },
                    item: {
                        borderRadius: 0,
                        border: 'none',
                        overflow: 'hidden',
                    },
                    chevron: {
                        color: 'var(--mantine-color-gray-5)',
                    },
                    label: {
                        fontFamily: 'var(--mantine-font-family-monospace)',
                        fontSize: '0.9rem',
                        letterSpacing: '0.03em',
                    },
                }}
            >
                <Accordion.Item value="MODULE EXPLORER">
                    <Accordion.Control>MODULE EXPLORER</Accordion.Control>
                    <Accordion.Panel>
                        <ModuleExplorer />
                    </Accordion.Panel>
                </Accordion.Item>

                {selectedModule && (
                    <Accordion.Item value="MODULE DETAILS">
                        <Accordion.Control>MODULE DETAILS</Accordion.Control>
                        <Accordion.Panel>
                            <ModuleDetails module={selectedModule} />
                        </Accordion.Panel>
                    </Accordion.Item>
                )}
            </Accordion>
        </Stack>
    )
}
