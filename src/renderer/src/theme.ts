import { createTheme, MantineThemeOverride } from '@mantine/core'

/** Our mantine theme override */
export const theme: MantineThemeOverride = createTheme({
    primaryColor: 'green',
    colors: {
        green: [
            '#E3FCEF',
            '#BAF5D3',
            '#86E8B3',
            '#4FDA90',
            '#22C96C',
            '#00B96B',
            '#00934F',
            '#006D3B',
            '#004B28',
            '#002B17',
        ],
    },
})
