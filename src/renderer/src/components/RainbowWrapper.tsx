import { animated, useSpring } from '@react-spring/web'
import { useMemo } from 'react'

const gradientBg =
    'linear-gradient(90deg, #FF4D4D, #F9CB28, #4ADE80, #2DD4BF, #60A5FA, #A78BFA, #FF4D4D)'

const pastelGradientBg =
    'linear-gradient(90deg, #FFC0CB, #FFB6C1, #ADD8E6, #87CEFA, #98FB98, #FFC0CB)'

interface RainbowWrapperProps {
    children: React.ReactNode
    borderRadius?: number
    isPlaying?: boolean
    isVisible?: boolean
}

/**
 * A wrapper that adds a spinning gradient border animation.
 * Can wrap any React component or HTML element.
 * Animation and visibility are controlled by parent component.
 */
export function RainbowWrapper({
    children,
    borderRadius = 8,
    isPlaying = false,
    isVisible = false,
}: RainbowWrapperProps) {
    const animatedStyles = useSpring({
        from: {
            backgroundPosition: '0% 0',
        },
        to: {
            backgroundPosition: isVisible && isPlaying ? '200% 0' : '0% 0',
        },
        config: {
            duration: 700,
        },
        loop: true,
        reset: true,
    })

    const opacity = useMemo(() => (isVisible && isPlaying ? 1 : 0), [isVisible, isPlaying])

    return (
        <div
            style={{
                width: 'fit-content',
                height: 'fit-content',
                display: 'inline-block',
                position: 'relative',
            }}
        >
            <animated.div
                style={{
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    borderRadius,
                    border: '2px solid transparent',
                    backgroundImage: gradientBg,
                    backgroundSize: '200%',
                    ...animatedStyles,
                    opacity,
                    transition: 'opacity 0.2s',
                }}
            />
            {children}
        </div>
    )
}
