import { createTheme, MantineThemeOverride } from '@mantine/core'

/** Our mantine theme override */
export const theme: MantineThemeOverride = createTheme({
    // Using a custom purple color scheme as the primary color
    primaryColor: 'purple',

    // Using smaller radius values for sharper corners as requested
    defaultRadius: 'sm',
    radius: {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
    },

    // Custom colors and enhancements
    colors: {
        // Custom purple color palette
        purple: [
            '#f3e8fd', // 0: Lightest
            '#e4cffc', // 1
            '#d0b0f8', // 2
            '#bc93f5', // 3
            '#a678f0', // 4
            '#9161ea', // 5
            '#7d4cdb', // 6: Primary shade
            '#6938c4', // 7
            '#5726a7', // 8
            '#451a88', // 9: Darkest
        ],

        // Better dark mode background shades
        dark: [
            '#C1C2C5', // 0: Lightest
            '#A6A7AB', // 1
            '#909296', // 2
            '#5C5F66', // 3
            '#373A40', // 4
            '#2C2E33', // 5: Card headers in dark mode
            '#25262B', // 6: Inputs, selects
            '#1A1B1E', // 7: Main card/app background
            '#141517', // 8: Page background
            '#101113', // 9: Darkest (dropdown hover)
        ],
    },

    // Enhanced shadows for better depth perception
    shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.2)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.25)',
        md: '0 3px 5px rgba(0, 0, 0, 0.3)',
        lg: '0 8px 12px rgba(0, 0, 0, 0.35)',
        xl: '0 12px 16px rgba(0, 0, 0, 0.4)',
    },

    // Default component styles
    components: {
        Card: {
            defaultProps: {
                shadow: 'sm',
                withBorder: true,
                radius: 'sm',
            },
        },
        Button: {
            defaultProps: {
                radius: 'sm',
            },
        },
    },

    // Improved default font
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    headings: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: '600',
    },
})
