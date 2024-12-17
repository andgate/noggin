import {
    Button,
    Divider,
    Group,
    LoadingOverlay,
    Modal,
    Stack,
    Text,
    TextInput,
    Textarea,
    rem,
} from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { notifications } from '@mantine/notifications'
import { IconFile, IconUpload, IconX } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { formatFileSize } from '../common/format'
import { useModule } from '../hooks/use-module'
import { useModuleGenerator } from '../hooks/use-module-generator'

// Step type to track wizard progress
type WizardStep = 'select' | 'generate' | 'review'

// Generated module data structure
type GeneratedModule = {
    title: string
    overview: string
    slug: string
    sources: File[]
}

// Add utility function for filename truncation
const truncateFilename = (filename: string, maxLength: number = 30) => {
    if (filename.length <= maxLength) return filename
    const start = filename.slice(0, maxLength / 2)
    const end = filename.slice(-maxLength / 2)
    return `${start}...${end}`
}

// New subcomponents for the file list
function FileList({
    files,
    onRemove,
    style,
}: {
    files: File[]
    onRemove: (index: number) => void
    style?: React.CSSProperties
}) {
    return (
        <Stack gap="xs" style={style}>
            <Text size="sm" fw={500} c="blue">
                Selected Materials:
            </Text>
            {files.map((file, index) => (
                <Stack key={index} gap={2}>
                    <Group wrap="nowrap" justify="space-between">
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                            <Text
                                size="sm"
                                style={{
                                    wordBreak: 'break-word',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                                title={file.name}
                            >
                                {truncateFilename(file.name)}
                            </Text>
                            <Text size="xs" c="blue.5">
                                ({formatFileSize(file.size)})
                            </Text>
                        </Stack>
                        <DeleteButton onClick={() => onRemove(index)} />
                    </Group>
                    {index < files.length - 1 && <Divider />}
                </Stack>
            ))}
        </Stack>
    )
}

function DeleteButton({ onClick }: { onClick: () => void }) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <IconX
            size={14}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                color: isHovered ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-gray-6)',
                cursor: 'pointer',
            }}
        />
    )
}

// Step components
function SelectStep({
    files,
    onAddFiles,
    onRemoveFile,
    onGenerate,
    onClose,
    isLoading,
}: {
    files: File[]
    onAddFiles: (newFiles: File[]) => void
    onRemoveFile: (index: number) => void
    onGenerate: () => void
    onClose: () => void
    isLoading: boolean
}) {
    return (
        <Stack gap="xl">
            <Group align="flex-start" grow>
                <Stack
                    style={{
                        flex: 1,
                        alignSelf: 'stretch',
                        minWidth: rem(450),
                        width: rem(450),
                        maxWidth: rem(450),
                        maxHeight: '30vh',
                        minHeight: '30vh',
                        height: '30vh',
                    }}
                >
                    <Dropzone
                        onDrop={(newFiles) => onAddFiles(newFiles as File[])}
                        accept={{
                            'application/pdf': ['.pdf'],
                            'text/plain': ['.txt'],
                        }}
                        style={{
                            flex: 1,
                            borderStyle: 'dotted',
                            borderWidth: '2px',
                            borderRadius: 'var(--mantine-radius-md)',
                            borderColor: 'var(--mantine-color-dark-4)',
                        }}
                    >
                        <Group
                            justify="center"
                            gap="xl"
                            mih={220}
                            style={{ pointerEvents: 'none' }}
                        >
                            <Dropzone.Accept>
                                <IconUpload
                                    style={{
                                        width: rem(52),
                                        height: rem(52),
                                        color: 'var(--mantine-color-blue-6)',
                                    }}
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    style={{
                                        width: rem(52),
                                        height: rem(52),
                                        color: 'var(--mantine-color-red-6)',
                                    }}
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconFile
                                    style={{
                                        width: rem(52),
                                        height: rem(52),
                                        color: 'var(--mantine-color-dimmed)',
                                    }}
                                    stroke={1.5}
                                />
                            </Dropzone.Idle>

                            <div>
                                <Text size="xl" inline>
                                    Drag files here or click to select
                                </Text>
                                <Text size="sm" c="dimmed" inline mt={7}>
                                    PDF and TXT files up to 10MB each
                                </Text>
                            </div>
                        </Group>
                    </Dropzone>
                </Stack>
                {files.length > 0 && (
                    <FileList
                        files={files}
                        onRemove={onRemoveFile}
                        style={{
                            flex: 1,
                            maxHeight: '30vh',
                            minHeight: '30vh',
                            height: '30vh',
                            overflowY: 'auto',
                        }}
                    />
                )}
            </Group>
            <Group justify="flex-end" mt="xl">
                <Button variant="subtle" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={onGenerate} loading={isLoading} disabled={files.length === 0}>
                    Generate
                </Button>
            </Group>
        </Stack>
    )
}

function GenerateStep() {
    return (
        <Stack align="center" gap="md" py="xl">
            <LoadingOverlay visible={true} />
            <Text>Analyzing content...</Text>
        </Stack>
    )
}

function ReviewStep({
    data,
    onDataChange,
    onBack,
    onSave,
}: {
    data: GeneratedModule
    onDataChange: (updates: Partial<GeneratedModule>) => void
    onBack: () => void
    onSave: () => void
}) {
    return (
        <Stack gap="md">
            <TextInput
                label="Module Title"
                value={data.title}
                onChange={(e) => onDataChange({ title: e.target.value })}
            />
            <Textarea
                label="Overview"
                value={data.overview}
                onChange={(e) => onDataChange({ overview: e.target.value })}
                minRows={3}
            />
            <Text size="sm" c="dimmed">
                Module will be saved as: {data.slug}
            </Text>
            <Group justify="flex-end" mt="xl">
                <Button variant="subtle" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={onSave}>Save Module</Button>
            </Group>
        </Stack>
    )
}

// Main component with simplified render logic
export function NewModuleWizard({ opened, onClose }: { opened: boolean; onClose: () => void }) {
    const [step, setStep] = useState<WizardStep>('select')
    const [files, setFiles] = useState<File[]>([])
    const [generatedData, setGeneratedData] = useState<GeneratedModule | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const moduleService = useModule()
    const { analyzeContent } = useModuleGenerator()

    const saveModule = useCallback(
        async (modulePath: string, moduleData: GeneratedModule) => {
            const metadata = {
                id: crypto.randomUUID(),
                name: moduleData.title,
                path: `${modulePath}/${moduleData.slug}`,
                sources: moduleData.sources.map((f) => f.name),
                quizzes: [],
                submissions: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            await moduleService.registerModulePath(metadata.path)
            await moduleService.writeModuleData(metadata.path, metadata)
        },
        [moduleService]
    )

    const handleGenerate = async () => {
        try {
            setIsLoading(true)
            setStep('generate')

            // Analyze content with Gemini
            const analysis = await analyzeContent(files)

            // Create module data
            const data: GeneratedModule = {
                ...analysis,
                sources: files,
            }

            setGeneratedData(data)
            setStep('review')
        } catch (error: any) {
            notifications.show({
                title: 'Generation Failed',
                message: error.message || 'Failed to generate module',
                color: 'red',
            })
            setStep('select')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!generatedData) return

        try {
            const modulePath = await window.api.dialog.showDirectoryPicker()
            if (!modulePath) return

            await saveModule(modulePath, generatedData)
            notifications.show({
                title: 'Module Created',
                message: `Module "${generatedData.title}" has been created successfully`,
                color: 'green',
            })
            onClose()
        } catch (error: any) {
            notifications.show({
                title: 'Save Failed',
                message: error.message || 'Failed to save module',
                color: 'red',
            })
        }
    }

    const handleRemoveFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index))
    }

    const handleDataChange = (updates: Partial<GeneratedModule>) => {
        setGeneratedData((prev) => (prev ? { ...prev, ...updates } : null))
    }

    const renderStep = () => {
        switch (step) {
            case 'select':
                return (
                    <SelectStep
                        files={files}
                        onAddFiles={(newFiles) => setFiles([...files, ...newFiles])}
                        onRemoveFile={handleRemoveFile}
                        onGenerate={handleGenerate}
                        onClose={onClose}
                        isLoading={isLoading}
                    />
                )
            case 'generate':
                return <GenerateStep />
            case 'review':
                return generatedData ? (
                    <ReviewStep
                        data={generatedData}
                        onDataChange={handleDataChange}
                        onBack={() => setStep('select')}
                        onSave={handleSave}
                    />
                ) : null
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Create New Module"
            size="xl"
            closeOnClickOutside={false}
            styles={{
                body: {
                    maxHeight: '80vh',
                },
            }}
        >
            {renderStep()}
        </Modal>
    )
}
