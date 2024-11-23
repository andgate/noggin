/**
 * A service for managing individual learning modules ("mods").
 *
 * Mods are stored as PNG files with embedded JSON data containing:
 * - Content sources (PDFs, text, or URLs)
 * - Tests with questions
 * - Student submissions and grades
 *
 * The service provides functions to:
 * - Find mod files within a directory (recursively)
 * - Load mod data from PNG files
 * - Save mod data by embedding it into PNG files
 */
import { Mod } from '@noggin/types/mod-types'
import { glob } from 'glob'
import path from 'path'
import * as stega from './stega-service'

export async function findMods(dirPath: string): Promise<string[]> {
    return glob('**/*.mod.png', {
        cwd: dirPath,
        absolute: true,
    })
}

export async function loadMod(modPath: string): Promise<Mod> {
    const data = await stega.extractData(modPath)
    return JSON.parse(data) as Mod
}

export async function saveMod(modkitPath: string, mod: Mod): Promise<void> {
    const modPath = path.join(modkitPath, `${mod.id}.png`)
    await stega.embedData(JSON.stringify(mod), modPath)
}
