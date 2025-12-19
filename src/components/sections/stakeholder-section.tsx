// Stakeholder Logos Section
"use client"

import Image from "next/image"
import { motion } from "framer-motion"

const stakeholders = [
    {
        name: "DFCCIL",
        logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhPlkJZ7iQL5kF_fM4xHk_MHM5pdeNMjrYtQwVF8ZTW4AqTnJ5khsmtNZvk0oUxFwqspvJcO6JQr4TedxzxLh1n6Vc6NBef3-drxcnJ-T5uwC500weaq5kH-6oXLzfCq4-n4FDaQfyHyHEj/s1200/dfccil.png",
        full: "Dedicated Freight Corridor Corporation of India"
    },
    {
        name: "RVNL",
        logo: "https://static.tnn.in/thumb/msid-110432616,thumbsize-122646,width-1280,height-720,resizemode-75/110432616.jpg",
        full: "Rail Vikas Nigam Limited"
    },
    {
        name: "L&T",
        logo: "https://currentaffairs.adda247.com/wp-content/uploads/2020/04/09143937/larsen-toubro-vector-logo.png",
        full: "Larsen & Toubro"
    },
    {
        name: "NHAI",
        logo: "https://indiashippingnews.com/wp-content/uploads/2023/02/NHAI.webp",
        full: "National Highways Authority of India"
    },
    {
        name: "Tata Projects",
        logo: "https://tse4.mm.bing.net/th/id/OIP.h69hnJHHzK4NiwpJrRogNAAAAA?cb=ucfimg2&ucfimg=1&w=335&h=235&rs=1&pid=ImgDetMain&o=7&rm=3",
        full: "Tata Projects Limited"
    },
]

export function StakeholderSection() {
    return (
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Trusted by Leading Infrastructure Organizations
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Powering coordination across major national infrastructure corridors
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {stakeholders.map((stakeholder, index) => (
                        <motion.div
                            key={stakeholder.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="relative h-24 mb-4 flex items-center justify-center">
                                <Image
                                    src={stakeholder.logo}
                                    alt={stakeholder.full}
                                    width={150}
                                    height={80}
                                    className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                    {stakeholder.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {stakeholder.full}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-6 py-3 rounded-full">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            ✓ Verified Infrastructure Partners
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
