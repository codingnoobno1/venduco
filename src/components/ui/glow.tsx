import { cn } from "@/lib/utils"

interface GlowProps {
  className?: string
  color?: string
}

export function Glow({ className, color = "blue" }: GlowProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/20",
    purple: "bg-purple-500/20",
    orange: "bg-orange-500/20",
    green: "bg-green-500/20",
  }

  return (
    <div
      className={cn(
        "absolute -z-10 blur-[100px] rounded-full",
        colorMap[color] || colorMap.blue,
        className
      )}
    />
  )
}
