"use client"
import { motion } from "framer-motion"
import { Search, UserCheck, FileText, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Discover Opportunities",
    description: "Browse verified infrastructure tenders and projects from top government and private organizations.",
    color: "blue",
  },
  {
    icon: UserCheck,
    title: "Quick Registration",
    description: "Onboard in minutes with automated document verification and KYC processes.",
    color: "purple",
  },
  {
    icon: FileText,
    title: "Submit Bids",
    description: "Use our intelligent bidding engine to submit competitive and compliant proposals.",
    color: "orange",
  },
  {
    icon: CheckCircle,
    title: "Track & Win",
    description: "Monitor bid status in real-time and manage project execution from a single dashboard.",
    color: "green",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Streamlined Execution <span className="text-blue-600">Workflow</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From discovery to delivery, Venduco simplifies every step of the infrastructure procurement process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-lg bg-${step.color}-100 dark:bg-${step.color}-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <step.icon className={`w-6 h-6 text-${step.color}-600 dark:text-${step.color}-400`} />
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
