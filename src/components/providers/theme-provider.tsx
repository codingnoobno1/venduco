// Theme Provider using next-themes
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ComponentProps, ReactNode } from "react"

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
