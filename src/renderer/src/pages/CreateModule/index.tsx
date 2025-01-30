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
import { useModule } from '@renderer/app/hooks/use-module'
import { useNavigate } from '@tanstack/react-router'
import * as path from 'path'
import { useCallback, useState } from 'react'
import { LibrarySelector } from './components/LibrarySelector'
import { SourceSelectionView } from './components/SourceSelectionView'
import { useModuleGenerator } from './hooks/use-module-generator'

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
    const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null)

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

            <LibrarySelector
                onSelect={setSelectedLibrary}
                selectedPath={selectedLibrary || undefined}
            />

            <Group justify="flex-end" mt="xl">
                <Button variant="subtle" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={() => onSave(selectedLibrary)} disabled={!selectedLibrary}>
                    Save Module
                </Button>
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
        async (libraryPath: string, moduleData: GeneratedModule) => {
            const moduleSlug = moduleData.slug
            const fullModPath = path.join(libraryPath, moduleSlug)

            const now = new Date().toISOString()

            // Create module metadata
            const metadata = {
                title: moduleData.title,
                slug: moduleSlug,
                overview: moduleData.overview,
                createdAt: now,
                updatedAt: now,
            }

            // Create the initial module structure
            const mod: Mod = {
                id: `${moduleData.slug}-${now}`,
                path: fullModPath,
                metadata,
                sources: [], // Start with empty sources
                quizzes: [],
                submissions: [],
            }

            // Write module data first
            await moduleService.writeModuleData(libraryPath, mod)

            // Then copy each source file and update the metadata
            const sourcePaths = await Promise.all(
                moduleData.sources.map((file) => moduleService.writeModuleSource(fullModPath, file))
            )

            // Update module with new source paths
            mod.sources = sourcePaths
            await moduleService.writeModuleData(libraryPath, mod)
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

    const handleSave = async (selectedPath: string) => {
        if (!generatedData) return

        try {
            await saveModule(selectedPath, generatedData)
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
