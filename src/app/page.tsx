// Complete Modern Landing Page WITHOUT Material Design components
"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { ModernHero } from "@/components/sections/modern-hero"
import { InfiniteProjectCarousel } from "@/components/animated/infinite-carousel"
import { AnimatedStats } from "@/components/animated/animated-stats"
import { TenderGraph } from "@/components/animated/tender-graph"
import { BiddingSystemShowcase } from "@/components/animated/bidding-system"
import { StakeholderSection } from "@/components/sections/stakeholder-section"
import { Navbar } from "@/components/portfolio/navbar"
import { Footer } from "@/components/portfolio/footer"

export default function ModernLandingPage() {
  return (
    <div className="min-h-screen">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section - New animated hero */}
      <ModernHero />

      {/* Stakeholder Logos - DFCCIL, RVNL, L&T, NHAI, Tata */}
      <StakeholderSection />

      {/* Infinite Project Carousel */}
      <section className="py-16">
        <InfiniteProjectCarousel />
      </section>

      {/* Animated Statistics */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Platform Performance
        </h2>
        <AnimatedStats />
      </section>

      {/* Tender Growth Graph */}
      <section className="container mx-auto px-4 py-16">
        <TenderGraph />
      </section>

      {/* Bidding System */}
      <section className="container mx-auto px-4 py-16">
        <BiddingSystemShowcase />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
