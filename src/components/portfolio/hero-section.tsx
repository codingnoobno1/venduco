// Hero section for landing page (mobile-first)
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
    return (
        <Section variant="gradient" className="pt-20 sm:pt-24 pb-16 sm:pb-20">
            <Container maxWidth="xl">
                <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
                    {/* Headline - Mobile optimized font sizes */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl">
                        Integrated Project Coordination for{" "}
                        <span className="text-blue-300">National Infrastructure Corridors</span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl">
                        A centralized digital platform to manage vendors, supervisors, machinery,
                        materials, and daily work execution for large-scale railway and highway
                        infrastructure projects.
                    </p>

                    {/* Context Line */}
                    <p className="text-sm sm:text-base text-blue-200 max-w-2xl">
                        Designed for Dedicated Freight Corridors, Expressways, and EPC-led
                        construction projects involving multiple stakeholders.
                    </p>

                    {/* CTA Buttons - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto sm:justify-center mt-4">
                        <Button
                            asChild
                            size="lg"
                            fullWidth
                            className="bg-white text-blue-900 hover:bg-blue-50"
                        >
                            <Link href="/login">
                                Handle Project
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            fullWidth
                            className="border-white text-white hover:bg-blue-800"
                        >
                            <a href="#capabilities">
                                View Capabilities
                            </a>
                        </Button>
                    </div>

                    {/* Hero Image - Mobile optimized */}
                    <div className="mt-8 sm:mt-12 w-full max-w-5xl">
                        <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden border-2 border-blue-700 shadow-2xl">
                            <Image
                                src="https://www.railwaypro.com/wp/wp-content/uploads/2021/01/India-EDFC-1024x576.jpg"
                                alt="Eastern Dedicated Freight Corridor Infrastructure"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    )
}
