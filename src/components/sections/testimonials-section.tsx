"use client"
import { Marquee } from "@/components/ui/marquee"
import { cn } from "@/lib/utils"

const reviews = [
  {
    name: "Rajesh Kumar",
    username: "@rajesh_infra",
    body: "Venduco has revolutionized how we find and bid on tenders. The automated document verification saved us weeks of manual work.",
    img: "https://avatar.vercel.sh/rajesh",
  },
  {
    name: "Amit Sharma",
    username: "@sharma_construct",
    body: "The analytics tools are incredible. We can finally track our bidding success rate and optimize our proposals.",
    img: "https://avatar.vercel.sh/amit",
  },
  {
    name: "Priya Singh",
    username: "@priya_v",
    body: "As a laborer, I found it hard to find consistent work. Venduco connected me with verified vendors within days.",
    img: "https://avatar.vercel.sh/priya",
  },
  {
    name: "Vikram Mehta",
    username: "@vikram_m",
    body: "The bidding engine is a game-changer. It ensures our bids are always compliant with tender requirements.",
    img: "https://avatar.vercel.sh/vikram",
  },
  {
    name: "Sanjay Gupta",
    username: "@gupta_infra",
    body: "Integration with GeM and other portals makes it a one-stop-shop for infrastructure projects.",
    img: "https://avatar.vercel.sh/sanjay",
  },
]

const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2))
const secondRow = reviews.slice(Math.ceil(reviews.length / 2))

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string
  name: string
  username: string
  body: string
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-slate-950/[.1] bg-slate-950/[.01] hover:bg-slate-950/[.05]",
        "dark:border-slate-50/[.1] dark:bg-slate-50/[.10] dark:hover:bg-slate-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  )
}

export function TestimonialsSection() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4 mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by <span className="text-blue-600">Thousands</span></h2>
        <p className="text-slate-600 dark:text-slate-400">Join the growing community of infrastructure professionals.</p>
      </div>
      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg">
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-slate-950"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-slate-950"></div>
      </div>
    </section>
  )
}
