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
import { Mod, ModuleMetadata } from '@noggin/types/module-types'
import { useModule } from '@renderer/app/hooks/use-module'
import { useReadAllLibraries } from '@renderer/app/hooks/library/use-read-all-libraries'
import { useNavigate } from '@tanstack/react-router'
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
    const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null)

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
                onSelect={setSelectedLibraryId}
                selectedId={selectedLibraryId || undefined}
            />

            <Group justify="flex-end" mt="xl">
                <Button variant="subtle" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={() => onSave(selectedLibraryId)} disabled={!selectedLibraryId}>
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
    const { data: allLibraries } = useReadAllLibraries()

    const saveModule = useCallback(
        async (libraryPath: string, libraryId: string, moduleData: GeneratedModule) => {
            try {
                console.log('Starting saveModule with:', { libraryPath, moduleData })

                const now = new Date().toISOString() // Keep full ISO for metadata
                console.log('ISO timestamp:', now)

                const timestamp = now
                    .replace(/[-:]/g, '') // Remove dashes and colons
                    .replace(/\.\d{3}/, '') // Remove milliseconds
                console.log('Formatted timestamp:', timestamp)

                const moduleId = `${moduleData.slug}-${timestamp}`
                console.log('Generated moduleId:', moduleId)

                // Generate the module ID with our utility function to see if there's any difference
                const utilModuleId = await window.api.modules.readModuleMetadata('dummy').then(
                    () => null,
                    async () => {
                        try {
                            // We need to dynamically import this to use it in the renderer
                            const { createModuleId } = await import('@noggin/shared/slug')
                            const id = createModuleId(moduleData.slug, now)
                            console.log('Module ID from utility function:', id)
                            return id
                        } catch (error) {
                            console.error('Error importing createModuleId:', error)
                            return null
                        }
                    }
                )

                if (utilModuleId && utilModuleId !== moduleId) {
                    console.warn('Module ID mismatch!', { moduleId, utilModuleId })
                }

                const fullModPath = await window.api.path.join(libraryPath, moduleId)
                console.log('Generated fullModPath:', fullModPath)

                // Create module metadata
                const metadata: ModuleMetadata = {
                    id: moduleId,
                    path: fullModPath,
                    title: moduleData.title,
                    slug: moduleData.slug,
                    overview: moduleData.overview,
                    createdAt: now,
                    updatedAt: now,
                    libraryId: libraryId,
                }

                // Create the initial module structure
                const mod: Mod = {
                    metadata,
                    stats: {
                        moduleId: `${moduleData.slug}-${timestamp}`,
                        currentBox: 1,
                        nextReviewDate: new Date().toISOString(),
                    },
                    sources: [],
                    quizzes: [],
                    submissions: [],
                }

                console.log('About to write module data to:', fullModPath)
                // Write module data first
                await moduleService.writeModuleData(fullModPath, mod)
                console.log('Module data written successfully')

                // Then copy each source file and update the metadata
                const sourcePaths = await Promise.all(
                    moduleData.sources.map((file) =>
                        moduleService.writeModuleSource(fullModPath, file)
                    )
                )

                // Update module with new source paths
                mod.sources = sourcePaths
                await moduleService.writeModuleData(fullModPath, mod)
            } catch (error) {
                console.error('Error in saveModule:', error)
                throw error
            }
        },
        [moduleService]
    )

    const handleGenerate = async () => {
        try {
            console.log(
                '📋 handleGenerate called with files:',
                files.map((f) => f.path)
            )
            setIsLoading(true)
            setStep('generate')

            console.log('📋 About to call analyzeContent')
            const analysis = await analyzeContent(files)
            console.log('📋 analyzeContent returned:', analysis)

            const data: GeneratedModule = {
                ...analysis,
                sources: files,
            }

            console.log('📋 Setting generatedData and moving to review step')
            setGeneratedData(data)
            setStep('review')
        } catch (error: any) {
            console.error('📋 Error in handleGenerate:', error)

            let errorMessage = error.message || 'Failed to generate module'
            let errorTitle = 'Generation Failed'

            // Check for common API key issues
            if (errorMessage.includes('API key')) {
                errorTitle = 'API Key Issue'
                errorMessage = `${errorMessage} Please check your API key in Settings.`
            } else if (errorMessage.includes('timed out')) {
                errorTitle = 'Request Timed Out'
                errorMessage =
                    'The AI request took too long to complete. Please try again with a smaller file or check your internet connection.'
            }

            notifications.show({
                title: errorTitle,
                message: errorMessage,
                color: 'red',
                autoClose: 8000, // Longer display time for error messages
            })
            setStep('select')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async (selectedLibraryId: string | null) => {
        console.log('📋 handleSave called with ID:', selectedLibraryId)
        if (!generatedData) {
            console.error('📋 No generatedData available!')
            return
        }
        if (!selectedLibraryId) {
            notifications.show({ title: 'Library Required', message: 'Please select a library.', color: 'yellow' })
            return
        }

        // Find the library details (including path) using the ID
        const selectedLibrary = allLibraries?.find(lib => lib.id === selectedLibraryId)
        if (!selectedLibrary) {
            notifications.show({ title: 'Error', message: `Could not find details for library: ${selectedLibraryId}`, color: 'red' })
            return
        }

        try {
            await saveModule(selectedLibrary.path, selectedLibraryId, generatedData)
            console.log('📋 saveModule completed successfully')

            notifications.show({
                title: 'Module Created',
                message: `Module "${generatedData.title}" has been created successfully`,
                color: 'green',
            })
            handleClose()
        } catch (error: any) {
            console.error('📋 Error in handleSave:', error)
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
