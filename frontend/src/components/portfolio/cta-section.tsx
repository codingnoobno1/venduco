// CTA Section Component
"use client"

import * as React from "react"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface CTASectionProps {
    title: string
    description: string
    primaryCTA?: { text: string; href: string }
    secondaryCTA?: { text: string; href: string }
}

export function CTASection({
    title,
    description,
    primaryCTA,
    secondaryCTA
}: CTASectionProps) {
    return (
        <Section variant="gradient">
            <Container maxWidth="lg" className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                    {title}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    {primaryCTA && (
                        <Button
                            asChild
                            size="lg"
                            fullWidth
                            className="bg-white text-blue-900 hover:bg-blue-50"
                        >
                            <a href={primaryCTA.href}>
                                {primaryCTA.text}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </a>
                        </Button>
                    )}
                    {secondaryCTA && (
                        <Button
                            asChild
                            size="lg"
                            fullWidth
                            variant="outline"
                            className="border-white text-white hover:bg-blue-800"
                        >
                            <a href={secondaryCTA.href}>{secondaryCTA.text}</a>
                        </Button>
                    )}
                </div>
            </Container>
        </Section>
    )
}
