import { Mod } from '@noggin/types/module-types'
import { useEffect, useState } from 'react'
import { useModule } from '../hooks/use-module'

// Component to display a single module card
function ModuleCard({ mod }: { mod: Mod }) {
    return (
        <div className="module-card">
            <h3>{mod.name}</h3>
            <div className="status-indicators">{/* Render status indicators here */}</div>
            <button onClick={() => startQuiz(mod)}>Start Quiz</button>
            <button onClick={() => reviewSubmissions(mod)}>Review Submissions</button>
        </div>
    )
}

// Function to start a quiz
function startQuiz(mod: Mod) {
    console.log(`Starting quiz for module: ${mod.name}`)
    // Implement quiz start logic
}

// Function to review submissions
function reviewSubmissions(mod: Mod) {
    console.log(`Reviewing submissions for module: ${mod.name}`)
    // Implement review logic
}

// Main PracticeFeed component
export function PracticeFeed() {
    const { getRegisteredPaths, readModuleData } = useModule()
    const [modules, setModules] = useState<Mod[]>([])

    useEffect(() => {
        async function fetchModules() {
            const paths = await getRegisteredPaths()
            const mods = await Promise.all(paths.map(readModuleData))
            setModules(mods)
        }
        fetchModules()
    }, [getRegisteredPaths, readModuleData])

    return (
        <div className="practice-feed">
            <h2>Practice Feed</h2>
            <button onClick={createModule}>+</button>
            <div className="module-list">
                {modules.map((mod) => (
                    <ModuleCard key={mod.id} mod={mod} />
                ))}
            </div>
        </div>
    )
}

// Function to create a new module
function createModule() {
    console.log('Creating a new module')
    // Implement module creation logic
}
