"use client"
import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export const ShinyButton = ({ children, className, ...props }: ShinyButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300",
        "rounded-[10px] border border-white/20 bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]",
        "hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] dark:bg-slate-900/50",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        initial={{ left: "-100%" }}
        animate={{ left: "200%" }}
        transition={{
          repeat: Infinity,
          repeatType: "mirror",
          duration: 3,
          ease: "linear",
        }}
        className="absolute top-0 h-full w-[50%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
      />
    </motion.button>
  )
}
