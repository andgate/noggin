/**
 * @module use-generative
 *
 * This module provides React hooks and context for managing stateful generator functions
 * that produce a series of state updates over time. It's useful for handling iterative
 * or streaming computations that update UI state progressively.
 *
 * Key exports:
 * - `useGenerative`: Hook to access the current generative context
 * - `GenerativeContext`: Context providing the generative function and state
 * - `GenerativeProvider`: Provider component to wrap components needing access
 *
 * The module enables:
 * - Running generator functions that yield intermediate state updates
 * - Tracking running state and errors during generation
 * - Providing generator context to child components
 * - Type-safe access to generator input and state types
 *
 * Example usage:
 * ```tsx
 * function MyComponent() {
 *   const { invoke, isRunning, state } = useGenerative<Input, State>();
 *   // Use the generative context...
 * }
 * ```
 */

import { createContext, useCallback, useContext, useState } from 'react'

/**
 * A stateful generator function type that accepts an AbortSignal.
 * This is a generator function that takes some input configuration `I` when invoked,
 * and yields a series of updated drafts of a state `S` until completion.
 */
export type AbortableGenerativeFunction<TInput, TState> = (
    input: TInput,
    signal?: AbortSignal
) => AsyncGenerator<TState, TState, TState>

/**
 * A context that provides a generative function.
 */
export interface GenerativeContext<TInput, TState> {
    invoke: (input: TInput) => unknown
    state: TState
    setState: (setter: (state: TState) => TState) => void
    isRunning: boolean
    error?: Error
    abort: () => unknown
    _hasProvider: boolean
}

// The default generative context.
const GenerativeContext = createContext<GenerativeContext<any, any>>({
    invoke: function* () {},
    state: {},
    setState: () => {},
    isRunning: false,
    abort: () => {},
    _hasProvider: false,
})

/**
 * Hook for accessing the generative context.
 */
export function useGenerative<I, S>(): GenerativeContext<I, S> {
    const context = useContext(GenerativeContext)
    if (!context || !context._hasProvider) {
        throw new Error('useGenerative must be used within a GenerativeProvider')
    }
    return context
}

/**
 * Props for the `GenerativeProvider` component.
 */
export interface GenerativeProviderProps<I, S> {
    // The generative function that will be invoked with the input configuration.
    generativeFunction: AbortableGenerativeFunction<I, S>
    // The children of this provider.
    children: React.ReactNode
    // The abort signal to use for aborting the generative function.
    signal?: AbortSignal
}

/**
 * Provider component for a generative function.
 */
export function GenerativeProvider<I, S>({
    generativeFunction,
    children,
}: GenerativeProviderProps<I, S>): React.ReactElement {
    const [isRunning, setIsRunning] = useState(false)
    const [error, setError] = useState<Error>()
    const [state, setState] = useState<Partial<S>>({})

    const invoke = useCallback(
        async (input: I) => {
            setIsRunning(true)
            setError(undefined)
            try {
                const generator = generativeFunction(input)
                let result: IteratorResult<S, S> = { done: false, value: {} as S }
                while (
                    // Generator has not completed
                    !result.done
                ) {
                    if (result) {
                        // Get the next value
                        result = await generator.next(result.value)

                        // Update state with the latest value, if any
                        if (result.value) {
                            setState(result.value)
                        }
                    }
                }
            } catch (e) {
                setError(e instanceof Error ? e : new Error(String(e)))
            } finally {
                setIsRunning(false)
            }
        },
        [generativeFunction, setState, setError]
    )

    return (
        <GenerativeContext.Provider
            value={{
                invoke,
                state,
                setState,
                isRunning,
                error,
                abort: () => {},
                _hasProvider: true,
            }}
        >
            {children}
        </GenerativeContext.Provider>
    )
}
