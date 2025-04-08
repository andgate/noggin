import { Button, Group, Modal, Stack, Text, TextInput, Textarea } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
    Library,
    LibraryForm,
    createLibrary,
    libraryFormSchema,
} from '@noggin/types/library-types'
import { useSaveLibrary } from '@renderer/app/hooks/library/use-save-library' // Import the new hook
import { DirectoryPicker } from './DirectoryPicker'

interface CreateLibraryModalProps {
    opened: boolean
    onClose: () => void
    onCreated: (librarySlug: string) => void // Pass slug instead of path
}

export function CreateLibraryModal({ opened, onClose, onCreated }: CreateLibraryModalProps) {
    const saveLibraryMutation = useSaveLibrary() // Use the mutation hook

    const form = useForm<LibraryForm>({
        initialValues: {
            name: '',
            description: '',
            path: '',
        },
        validate: zodResolver(libraryFormSchema),
    })

    const handleSubmit = async (values: LibraryForm) => {
        // Create the library object using the utility function
        const newLibrary: Library = createLibrary(
            values.path,
            values.name,
            values.description
        )

        saveLibraryMutation.mutate(newLibrary, {
            onSuccess: () => {
                notifications.show({
                    title: 'Library Created',
                    message: `Library "${values.name}" has been created successfully`,
                    color: 'green',
                })
                onCreated(newLibrary.slug) // Pass the slug
                onClose()
                form.reset() // Reset form on success
            },
            onError: (error: any) => {
                notifications.show({
                    title: 'Creation Failed',
                    message: error.message || 'Failed to create library',
                    color: 'red',
                })
            },
        })
    }

    return (
        <Modal opened={opened} onClose={onClose} title="Create New Library">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Library Name"
                        placeholder="My Learning Library"
                        required
                        {...form.getInputProps('name')}
                    />

                    <Textarea
                        label="Description"
                        placeholder="A brief description of this library"
                        {...form.getInputProps('description')}
                    />

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>
                            Library Location
                        </Text>
                        <DirectoryPicker onSelect={(path) => form.setFieldValue('path', path)} />
                        {form.values.path && (
                            <Text size="sm" c="dimmed">
                                Selected: {form.values.path}
                            </Text>
                        )}
                    </Stack>

                    <Group justify="flex-end" mt="xl">
                        <Button variant="subtle" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={saveLibraryMutation.isPending}>
                            {' '}
                            {/* Add loading state */}
                            Create Library
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}
