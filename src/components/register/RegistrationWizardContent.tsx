// Updated Registration Wizard with Context API
"use client"

import { useRegistration } from "@/context/RegistrationContext"
import { RegistrationLayout } from "./layout/RegistrationLayout"
import { Step1AccountCreation } from "./steps/Step1AccountCreation"
import { Step2ProfileSetup } from "./steps/Step2ProfileSetup"
import { VendorDetails } from "./steps/VendorDetails"
import { ProjectManagerDetails } from "./steps/ProjectManagerDetails"
import { SupervisorDetails } from "./steps/SupervisorDetails"
import { Step4DocumentUpload } from "./steps/Step4DocumentUpload"
import { Step5VerificationPending } from "./steps/Step5VerificationPending"

const steps = [
    { number: 1, title: "Account", description: "Login details" },
    { number: 2, title: "Profile", description: "Basic info" },
    { number: 3, title: "Details", description: "Role-specific" },
    { number: 4, title: "Documents", description: "Optional" },
    { number: 5, title: "Review", description: "Pending" },
]

export function RegistrationWizardContent() {
    const {
        data, currentStep, loading, error,
        updateData, submitStep1, submitStep2, submitStep3,
        submitForVerification, setStep, clearError,
    } = useRegistration()

    const handleStep1Next = async () => {
        await submitStep1()
    }

    const handleStep2Next = async () => {
        await submitStep2()
    }

    const handleStep3Next = async () => {
        await submitStep3()
    }

    const handleDocumentSubmit = async () => {
        await submitForVerification()
    }

    const renderStep = () => {
        // Show error if any
        if (error) {
            return (
                <div className="text-center p-8">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl p-6 mb-6">
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                    <button
                        onClick={clearError}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            )
        }

        switch (currentStep) {
            case 1:
                return (
                    <Step1AccountCreation
                        data={data}
                        onUpdate={updateData}
                        onNext={handleStep1Next}
                    />
                )

            case 2:
                return (
                    <Step2ProfileSetup
                        data={data}
                        onUpdate={updateData}
                        onNext={handleStep2Next}
                        onBack={() => setStep(1)}
                    />
                )

            case 3:
                switch (data.requestedRole) {
                    case "VENDOR":
                    case "COMPANY_REP":
                        return (
                            <VendorDetails
                                data={data}
                                onUpdate={updateData}
                                onNext={handleStep3Next}
                                onBack={() => setStep(2)}
                            />
                        )
                    case "PROJECT_MANAGER":
                        return (
                            <ProjectManagerDetails
                                data={data}
                                onUpdate={updateData}
                                onNext={handleStep3Next}
                                onBack={() => setStep(2)}
                            />
                        )
                    case "SUPERVISOR":
                        return (
                            <SupervisorDetails
                                data={data}
                                onUpdate={updateData}
                                onNext={handleStep3Next}
                                onBack={() => setStep(2)}
                            />
                        )
                    default:
                        return (
                            <VendorDetails
                                data={data}
                                onUpdate={updateData}
                                onNext={handleStep3Next}
                                onBack={() => setStep(2)}
                            />
                        )
                }

            case 4:
                return (
                    <Step4DocumentUpload
                        data={{ documents: data.documents }}
                        requestedRole={data.requestedRole}
                        onUpdate={(docs) => updateData({ documents: docs })}
                        onNext={handleDocumentSubmit}
                        onBack={() => setStep(3)}
                    />
                )

            case 5:
                return (
                    <Step5VerificationPending
                        userEmail={data.email}
                        userName={data.name}
                    />
                )

            default:
                return null
        }
    }

    return (
        <RegistrationLayout
            currentStep={currentStep}
            totalSteps={5}
            steps={steps}
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Processing...</p>
                </div>
            ) : (
                renderStep()
            )}
        </RegistrationLayout>
    )
}
