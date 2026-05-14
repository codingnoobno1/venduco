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
import { HowItWorks } from "@/components/sections/how-it-works"
import { TrustSection } from "@/components/sections/trust-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { FaqSection } from "@/components/sections/faq-section"

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

      {/* Trust & Features Bento Grid - NEW */}
      <TrustSection />

      {/* Infinite Project Carousel */}
      <section className="py-16">
        <InfiniteProjectCarousel />
      </section>

      {/* How it Works - NEW */}
      <HowItWorks />

      {/* Animated Statistics */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Platform Performance
        </h2>
        <AnimatedStats />
      </section>

      {/* Testimonials - NEW */}
      <TestimonialsSection />

      {/* Tender Growth Graph */}
      <section className="container mx-auto px-4 py-16">
        <TenderGraph />
      </section>

      {/* Pricing - NEW */}
      <PricingSection />

      {/* Bidding System */}
      <section className="container mx-auto px-4 py-16">
        <BiddingSystemShowcase />
      </section>

      {/* FAQ - NEW */}
      <FaqSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}

