"use client"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { ShieldCheck, Zap, Globe, BarChart3, Users, Lock } from "lucide-react"

const items = [
  {
    title: "Security First",
    description: "Enterprise-grade security for your documents and financial data.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />,
    icon: <Lock className="h-4 w-4 text-blue-500" />,
  },
  {
    title: "Real-time Analytics",
    description: "Monitor your bidding performance with live dashboards.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20" />,
    icon: <BarChart3 className="h-4 w-4 text-purple-500" />,
  },
  {
    title: "Verified Network",
    description: "Connect with thousands of pre-vetted vendors and laborers.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20" />,
    icon: <Users className="h-4 w-4 text-green-500" />,
  },
  {
    title: "Instant Verification",
    description: "Automated KYC and document checks for faster onboarding.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20" />,
    icon: <Zap className="h-4 w-4 text-orange-500" />,
  },
  {
    title: "Compliance Ready",
    description: "Ensuring all bids and projects meet regulatory standards.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-800/20" />,
    icon: <ShieldCheck className="h-4 w-4 text-slate-500" />,
  },
  {
    title: "Pan-India Reach",
    description: "Access projects and resources across the entire country.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20" />,
    icon: <Globe className="h-4 w-4 text-indigo-500" />,
  },
]

export function TrustSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Built for <span className="text-blue-600">Reliability</span></h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Venduco combines cutting-edge technology with deep industry expertise to provide a trustworthy platform for infrastructure projects.
          </p>
        </div>
        <BentoGrid>
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={i === 3 || i === 6 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}
