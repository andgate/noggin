import '@testing-library/jest-dom'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useMemo } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { GenerativeProvider, useGenerative } from './use-generative'

async function* mockGenerator({}) {
    yield { message: 'hello world 1' }
    yield { message: 'hello world 2' }
    yield { message: 'hello world 3' }

    return { message: 'done' }
}

const InnerChildTestComponent = () => {
    const { state, invoke } = useGenerative<{}, { message: string }>()
    const message = useMemo(() => state.message, [state.message])
    return (
        <>
            <button onClick={() => invoke({})}>Generate</button>
            <p data-testid="result">{`${message}`}</p>
        </>
    )
}

const EmptyTestComponent = () => {
    return (
        <GenerativeProvider generativeFunction={mockGenerator}>
            <InnerChildTestComponent />
        </GenerativeProvider>
    )
}

// Define types for our Fibonacci generator
interface FibInput {
    limit: number
}

interface FibState {
    current: number
    next: number
    sequence: number[]
}

// Create Fibonacci generator function
async function* fibGenerator(
    input: FibInput
): AsyncGenerator<Partial<FibState>, Partial<FibState>, Partial<FibState>> {
    let current = 0
    let next = 1
    const sequence: number[] = [current]

    while (sequence.length < input.limit) {
        yield {
            current,
            next,
            sequence: [...sequence],
        }

        const sum = current + next
        current = next
        next = sum
        sequence.push(current)
    }

    return {
        current,
        next,
        sequence,
    }
}

const InnerFibTestComponent = () => {
    const { state, invoke } = useGenerative<FibInput, FibState>()
    return (
        <>
            <button onClick={() => invoke({ limit: 5 })}>Generate</button>
            <div data-testid="result">
                <div>Current: {state.current}</div>
                <div>Next: {state.next}</div>
                <div>Sequence: {state.sequence?.join(', ')}</div>
            </div>
        </>
    )
}

const FibTestComponent = () => {
    return (
        <GenerativeProvider generativeFunction={fibGenerator}>
            <InnerFibTestComponent />
        </GenerativeProvider>
    )
}

describe('useGenerative', () => {
    // runs a cleanup after each test case
    afterEach(() => {
        cleanup()
    })

    it('should create empty test component', async () => {
        render(<EmptyTestComponent />)
        expect(screen.getByText('Generate')).toBeVisible()
    })

    it('should run empty test component', async () => {
        // Arrange
        render(<EmptyTestComponent />)

        // Act
        fireEvent.click(screen.getByText('Generate'))
        await screen.findByText('done')

        // Assert
        expect(screen.getByText('done')).toBeVisible()
    })

    it('should throw error when used outside provider', () => {
        // Test direct hook usage without provider
        expect(() => {
            render(<InnerChildTestComponent />)
        }).toThrow('useGenerative must be used within a GenerativeProvider')
    })

    describe('Fibonacci Generator', () => {
        it('should generate fibonacci sequence', async () => {
            // Arrange
            render(<FibTestComponent />)

            // Initial state check
            expect(screen.getByText('Generate')).toBeVisible()

            // Start generation
            await act(async () => {
                fireEvent.click(screen.getByText('Generate'))
            })

            // Wait for the sequence to complete and check multiple values
            await screen.findByText(/Sequence:.*0, 1, 1, 2, 3/i)

            // Check specific values
            expect(screen.getByText(/Current: 3/)).toBeVisible()
            expect(screen.getByText(/Next: 5/)).toBeVisible()
        })
    })
})
