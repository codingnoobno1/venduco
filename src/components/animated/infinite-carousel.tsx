// Infinite scrolling infrastructure projects carousel
"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface Project {
    name: string
    type: string
    image: string
}

const projects: Project[] = [
    { name: "Mumbai Metro Line 3", type: "Metro Rail", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800" },
    { name: "Delhi-Mumbai Bullet Train", type: "High Speed Rail", image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800" },
    { name: "Bangalore Airport T2", type: "Airport", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800" },
    { name: "Atal Tunnel Rohtang", type: "Highway Tunnel", image: "https://images.unsplash.com/photo-1464639351491-a172c2aa2911?w=800" },
    { name: "Ahmedabad-Mumbai HSR", type: "Bullet Train", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800" },
]

export function InfiniteProjectCarousel() {
    // Double the projects for seamless loop
    const allProjects = [...projects, ...projects]

    return (
        <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 py-8">
            <h3 className="text-center text-lg font-semibold text-slate-700 dark:text-slate-300 mb-6">
                🚀 Upcoming Infrastructure Projects
            </h3>

            <motion.div
                className="flex gap-6"
                animate={{
                    x: [0, -100 * projects.length]
                }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 30,
                        ease: "linear",
                    },
                }}
            >
                {allProjects.map((project, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                    >
                        <div className="relative h-48">
                            <Image
                                src={project.image}
                                alt={project.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                {project.type}
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-slate-900 dark:text-white">{project.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Bidding Open</p>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
