import {
    Button,
    Group,
    LoadingOverlay,
    rem,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { SimpleFile } from '@noggin/types/electron-types'
import { Mod } from '@noggin/types/module-types'
import { SourceSelectionView } from '@renderer/components/create-module/SourceSelectionView'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { useModule } from '../hooks/use-module'
import { useModuleGenerator } from '../hooks/use-module-generator'

type WizardStep = 'select' | 'generate' | 'review'
type GeneratedModule = {
    title: string
    overview: string
    slug: string
    sources: SimpleFile[]
}

export function ProcessingView() {
    return (
        <Stack align="center" gap="md" py="xl" style={{ flex: 1 }}>
            <LoadingOverlay visible={true} />
            <Text>Analyzing content...</Text>
        </Stack>
    )
}

export function ReviewView({ data, onDataChange, onBack, onSave }) {
    return (
        <Stack gap="md" style={{ maxWidth: rem(600), margin: '0 auto' }}>
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
                autosize
                maxRows={10}
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

export function CreateModulePage() {
    const navigate = useNavigate()
    const [step, setStep] = useState<WizardStep>('select')
    const [files, setFiles] = useState<SimpleFile[]>([])
    const [generatedData, setGeneratedData] = useState<GeneratedModule | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const moduleService = useModule()
    const { analyzeContent } = useModuleGenerator()

    const saveModule = useCallback(
        async (modulePath: string, moduleData: GeneratedModule) => {
            const metadata: Mod = {
                id: crypto.randomUUID(),
                name: moduleData.title,
                path: `${modulePath}/${moduleData.slug}`,
                sources: moduleData.sources.map((file) => file.path),
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

            const analysis = await analyzeContent(files)
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
            const modulePath = await window.api.filesystem.showDirectoryPicker()
            if (!modulePath) return

            await saveModule(modulePath[0].path, generatedData)
            notifications.show({
                title: 'Module Created',
                message: `Module "${generatedData.title}" has been created successfully`,
                color: 'green',
            })
            handleClose()
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

    const handleClose = () => {
        navigate({ to: '/' })
    }

    return (
        <Stack h="100vh">
            <Group px="md" py="xs" justify="space-between" bg="var(--mantine-color-dark-6)">
                <Title order={4}>Create New Module</Title>
                <Button variant="subtle" onClick={handleClose}>
                    Back to Dashboard
                </Button>
            </Group>

            <Stack p="md" style={{ flex: 1 }}>
                {step === 'select' && (
                    <SourceSelectionView
                        files={files}
                        onAddFiles={(newFiles) => setFiles([...files, ...newFiles])}
                        onRemoveFile={handleRemoveFile}
                        onGenerate={handleGenerate}
                        onClose={handleClose}
                        isLoading={isLoading}
                    />
                )}
                {step === 'generate' && <ProcessingView />}
                {step === 'review' && generatedData && (
                    <ReviewView
                        data={generatedData}
                        onDataChange={handleDataChange}
                        onBack={() => setStep('select')}
                        onSave={handleSave}
                    />
                )}
            </Stack>
        </Stack>
    )
}
