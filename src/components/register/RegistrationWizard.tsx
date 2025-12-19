// Registration Wizard - Wrapper with Context Provider
"use client"

import { RegistrationProvider } from "@/context/RegistrationContext"
import { RegistrationWizardContent } from "./RegistrationWizardContent"

export function RegistrationWizard() {
    return (
        <RegistrationProvider>
            <RegistrationWizardContent />
        </RegistrationProvider>
    )
}
