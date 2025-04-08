import { Button, Group, Loader, Modal, Paper, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
    Library,
    LibraryForm,
    createLibrary,
    libraryFormSchema,
} from '@noggin/types/library-types'
import { useDeleteLibrary } from '@renderer/app/hooks/library/use-delete-library'
import { useReadAllLibraries } from '@renderer/app/hooks/library/use-read-all-libraries'
import { useSaveLibrary } from '@renderer/app/hooks/library/use-save-library'
import { DirectoryPicker } from '@renderer/components/DirectoryPicker'
import { IconTrash } from '@tabler/icons-react'

export function RegisteredLibraryList() {
    const { data: libraries = [], isLoading } = useReadAllLibraries()
    const saveLibraryMutation = useSaveLibrary()
    const deleteLibraryMutation = useDeleteLibrary()
    const [opened, { open, close }] = useDisclosure(false)

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

    const handleCreateLibrary = (values: LibraryForm) => {
        const newLibrary: Library = createLibrary(values.path, values.name, values.description)

        saveLibraryMutation.mutate(newLibrary, {
            onSuccess: () => {
                notifications.show({
                    title: 'Library Added',
                    message: `Library "${values.name}" has been added successfully`,
                    color: 'green',
                })
                form.reset()
                close()
            },
            onError: (error: any) => {
                notifications.show({
                    title: 'Failed to Add Library',
                    message: error.message || 'An unknown error occurred',
                    color: 'red',
                })
            },
        })
    }

    const handleRemoveLibrary = (libraryId: string) => {
        deleteLibraryMutation.mutate(libraryId, {
            onSuccess: () => {
                notifications.show({ title: 'Library Removed', color: 'blue', message: 'Library removed successfully' })
            },
            onError: (error: any) => {
                notifications.show({ title: 'Failed to Remove Library', color: 'red', message: error.message || 'An unknown error occurred' })
            },
        })
    }

    if (isLoading) {
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

            {libraries.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="md">
                    No libraries registered yet
                </Text>
            ) : (
                libraries.map((library) => (
                    <Paper key={library.id} withBorder p="xs">
                        <Group justify="space-between">
                            <Stack gap={2}>
                                <Text size="sm" fw={500}>
                                    {library.name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {library.path}
                                </Text>
                            </Stack>
                            <Button
                                variant="subtle"
                                color="red"
                                size="xs"
                                onClick={() => handleRemoveLibrary(library.id)}
                                loading={deleteLibraryMutation.isPending && deleteLibraryMutation.variables === library.id}
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
                            <Button type="submit" loading={saveLibraryMutation.isPending}>Create Library</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Stack>
    )
}
