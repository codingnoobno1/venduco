// React Native Paper Provider for Material Design
"use client"

import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper'
import { useTheme as useNextTheme } from 'next-themes'

const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#2563eb',
        secondary: '#3b82f6',
        tertiary: '#60a5fa',
    },
}

const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#3b82f6',
        secondary: '#60a5fa',
        tertiary: '#93c5fd',
    },
}

export function MaterialProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useNextTheme()
    const paperTheme = theme === 'dark' ? darkTheme : lightTheme

    return <PaperProvider theme={paperTheme}>{children}</PaperProvider>
}
