/**
 * A service for managing collections of learning modules ("modkits").
 *
 * Modkits are directories that organize multiple mods. Each modkit:
 * - Has a unique ID and name
 * - Contains multiple mod files in its directory structure
 * - Tracks creation and update timestamps
 * - Maintains a count of contained mods
 *
 * The service provides functions to:
 * - List all available modkits
 * - Add new modkits to the system
 * - Load complete modkit data including all contained mods
 */

import { ModKitOverview, Modkit } from '@noggin/types/mod-types'
import path from 'path'
import { findMods, loadMod } from './mod-service'
import { store } from './store-service'

export async function listModkits(): Promise<ModKitOverview[]> {
    try {
        const modkits = store.get('modkits')
        return modkits || []
    } catch (error) {
        console.error('Failed to load modkits:', error)
        return []
    }
}

export async function addModkit(modkitPath: string): Promise<ModKitOverview> {
    const modPaths = await findMods(modkitPath)
    const newModkit: ModKitOverview = {
        id: path.basename(modkitPath),
        name: path.basename(modkitPath),
        path: modkitPath,
        modCount: modPaths.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    try {
        const existingModkits = await listModkits()
        const updatedModkits = [...existingModkits, newModkit]
        store.set('modkits', updatedModkits)
        return newModkit
    } catch (error) {
        console.error('Failed to add modkit:', error)
        throw new Error('Failed to add modkit to storage')
    }
}

export async function loadModkit(modkitPath: string): Promise<Modkit> {
    const modPaths = await findMods(modkitPath)
    const mods = await Promise.all(modPaths.map((file) => loadMod(file)))

    return {
        id: path.basename(modkitPath),
        name: path.basename(modkitPath),
        path: modkitPath,
        mods,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
}

export async function deleteModkit(modkitPath: string): Promise<void> {
    const existingModkits = await listModkits()
    const updatedModkits = existingModkits.filter((modkit) => modkit.path !== modkitPath)
    store.set('modkits', updatedModkits)
}
