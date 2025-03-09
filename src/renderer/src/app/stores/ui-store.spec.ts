import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useUiStore } from './ui-store'

describe('useUiStore', () => {
    // Use beforeEach to get a fresh instance of the store before each test
    beforeEach(() => {
        // This resets the store
        act(() => {
            useUiStore.setState({
                explorerCollapsed: false,
                settingsOpen: false,
            })
        })
    })

    describe('initial state', () => {
        it('should initialize with explorerCollapsed as false', () => {
            const state = useUiStore.getState()
            expect(state.explorerCollapsed).toBe(false)
        })

        it('should initialize with settingsOpen as false', () => {
            const state = useUiStore.getState()
            expect(state.settingsOpen).toBe(false)
        })
    })

    describe('toggleExplorer', () => {
        it('should toggle explorerCollapsed from false to true', () => {
            act(() => {
                useUiStore.getState().toggleExplorer()
            })

            const state = useUiStore.getState()
            expect(state.explorerCollapsed).toBe(true)
        })

        it('should toggle explorerCollapsed from true to false', () => {
            // First set to true
            act(() => {
                useUiStore.setState({ explorerCollapsed: true })
            })

            // Then toggle
            act(() => {
                useUiStore.getState().toggleExplorer()
            })

            const state = useUiStore.getState()
            expect(state.explorerCollapsed).toBe(false)
        })
    })

    describe('toggleSettings', () => {
        it('should toggle settingsOpen from false to true', () => {
            act(() => {
                useUiStore.getState().toggleSettings()
            })

            const state = useUiStore.getState()
            expect(state.settingsOpen).toBe(true)
        })

        it('should toggle settingsOpen from true to false', () => {
            // First set to true
            act(() => {
                useUiStore.setState({ settingsOpen: true })
            })

            // Then toggle
            act(() => {
                useUiStore.getState().toggleSettings()
            })

            const state = useUiStore.getState()
            expect(state.settingsOpen).toBe(false)
        })
    })
})
