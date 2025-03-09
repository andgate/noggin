import { act } from '@testing-library/react'
import { afterEach } from 'vitest'
import * as zustand from 'zustand'

const { create: actualCreate } = zustand

// A variable to hold reset functions for all stores declared
const storeResetFns = new Set<() => void>()

// When creating a store, we get its initial state and create a reset function
export const create = ((createState) => {
    const store = actualCreate(createState)
    const initialState = store.getState()

    // Add the reset function to our set
    storeResetFns.add(() => {
        store.setState(initialState, true)
    })

    return store
}) as typeof zustand.create

// Reset all stores after each test run
afterEach(() => {
    act(() => {
        storeResetFns.forEach((resetFn) => {
            resetFn()
        })
    })
})
