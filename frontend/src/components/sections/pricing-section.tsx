"use client"
import { Check } from "lucide-react"
import { ShinyButton } from "@/components/ui/shiny-button"

const tiers = [
  {
    name: "Starter",
    price: "0",
    description: "Perfect for independent laborers and small contractors.",
    features: ["Access to basic tenders", "Single user dashboard", "Mobile notifications", "Standard support"],
  },
  {
    name: "Pro",
    price: "2,499",
    description: "Ideal for growing vendors and medium-sized firms.",
    features: [
      "Priority bid submission",
      "Advanced analytics",
      "Up to 5 team members",
      "Document vault storage",
      "Email & Chat support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Advanced solutions for large infrastructure companies.",
    features: [
      "Custom API integration",
      "Dedicated account manager",
      "Unlimited team members",
      "Private tender portal",
      "24/7 Phone support",
    ],
  },
]

export function PricingSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Simple, Transparent <span className="text-blue-600">Pricing</span></h2>
          <p className="text-slate-600 dark:text-slate-400">Choose the plan that best fits your business needs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl bg-white dark:bg-slate-800 border ${
                tier.popular ? "border-blue-500 shadow-xl scale-105 z-10" : "border-slate-200 dark:border-slate-700 shadow-sm"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-slate-500">{tier.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹{tier.price}</span>
                {tier.price !== "Custom" && <span className="text-slate-500 text-sm ml-1">/month</span>}
              </div>
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <ShinyButton className={`w-full ${tier.popular ? "bg-blue-600" : "bg-slate-900"}`}>
                {tier.price === "Custom" ? "Contact Us" : "Get Started"}
              </ShinyButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
