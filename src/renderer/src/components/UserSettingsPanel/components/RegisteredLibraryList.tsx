import { Button, Group, Loader, Modal, Paper, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { LibraryForm, libraryFormSchema, LibraryMetadata } from '@noggin/types/library-types'
import { useLibrary } from '@renderer/app/hooks/use-library'
import { useUserSettings } from '@renderer/app/hooks/use-user-settings'
import { DirectoryPicker } from '@renderer/components/DirectoryPicker'
import { IconTrash } from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

export function RegisteredLibraryList() {
    const { settings, setUserSettings, isLoadingUserSettings } = useUserSettings()
    const { registerLibrary, unregisterLibrary, createLibrary, readLibraryMetadata } = useLibrary()
    const [libraryMetadata, setLibraryMetadata] = useState<Record<string, LibraryMetadata>>({})
    const [opened, { open, close }] = useDisclosure(false)

    const libraryPaths = useMemo(() => settings?.libraryPaths || [], [settings])

    useEffect(() => {
        const loadLibraryMetadata = async () => {
            if (!libraryPaths.length) return

            const metadata: Record<string, LibraryMetadata> = {}
            for (const path of libraryPaths) {
                try {
                    const libMetadata = await readLibraryMetadata(path)
                    metadata[path] = libMetadata
                } catch (error) {
                    console.error(`Failed to load library metadata for ${path}:`, error)
                }
            }
            setLibraryMetadata(metadata)
        }

        loadLibraryMetadata()
    }, [libraryPaths, readLibraryMetadata])

    const form = useForm<LibraryForm>({
        initialValues: {
            name: '',
            description: '',
            path: '',
        },
        validate: (values) => {
            try {
                libraryFormSchema.parse(values)
                return {}
            } catch (error) {
                return { name: 'Name is required', path: 'Path is required' }
            }
        },
    })

    const handleCreateLibrary = useCallback(
        async (values: LibraryForm) => {
            try {
                await createLibrary(values.path, {
                    name: values.name,
                    description: values.description,
                    createdAt: new Date().toISOString(),
                    slug: values.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                })

                const updatedPaths = [...(settings?.libraryPaths || []), values.path]
                await registerLibrary(values.path)
                setUserSettings({
                    libraryPaths: updatedPaths,
                })

                form.reset()
                close()
            } catch (error) {
                console.error('Failed to create library:', error)
            }
        },
        [settings, registerLibrary, setUserSettings, createLibrary, close, form]
    )

    const handleRemoveLibrary = useCallback(
        async (libraryPath: string) => {
            try {
                await unregisterLibrary(libraryPath)
                const updatedPaths = (settings?.libraryPaths || []).filter(
                    (path) => path !== libraryPath
                )
                setUserSettings({
                    libraryPaths: updatedPaths,
                })
            } catch (error) {
                console.error('Failed to unregister library:', error)
            }
        },
        [settings, setUserSettings, unregisterLibrary]
    )

    if (isLoadingUserSettings) {
        return (
            <Stack align="center" py="md">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                    Loading libraries...
                </Text>
            </Stack>
        )
    }

    return (
        <Stack>
            <Text fw={500} size="sm">
                Registered Libraries
            </Text>

            {libraryPaths.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="md">
                    No libraries registered yet
                </Text>
            ) : (
                libraryPaths.map((path) => (
                    <Paper key={path} withBorder p="xs">
                        <Group justify="space-between">
                            <Stack gap={2}>
                                <Text size="sm" fw={500}>
                                    {libraryMetadata[path]?.name || 'Loading...'}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {path}
                                </Text>
                            </Stack>
                            <Button
                                variant="subtle"
                                color="red"
                                size="xs"
                                onClick={() => handleRemoveLibrary(path)}
                                leftSection={<IconTrash size={16} />}
                            >
                                Remove
                            </Button>
                        </Group>
                    </Paper>
                ))
            )}

            <Button onClick={open}>Add Library</Button>

            <Modal opened={opened} onClose={close} title="Create New Library">
                <form onSubmit={form.onSubmit(handleCreateLibrary)}>
                    <Stack>
                        <TextInput
                            label="Library Name"
                            placeholder="Enter library name"
                            required
                            {...form.getInputProps('name')}
                        />

                        <TextInput
                            label="Description"
                            placeholder="Enter library description (optional)"
                            {...form.getInputProps('description')}
                        />

                        <Text size="sm" fw={500}>
                            Select Library Location
                        </Text>
                        <DirectoryPicker onSelect={(path) => form.setFieldValue('path', path)} />
                        {form.errors.path && (
                            <Text size="xs" c="red">
                                {form.errors.path}
                            </Text>
                        )}

                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={close}>
                                Cancel
                            </Button>
                            <Button type="submit">Create Library</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Stack>
    )
}
