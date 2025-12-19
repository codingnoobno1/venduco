// Step 5: Verification Pending Screen
"use client"

import { motion } from "framer-motion"
import { Clock, CheckCircle, Mail, Phone, FileCheck } from "lucide-react"
import Link from "next/link"

interface Step5Props {
    userEmail: string
    userName: string
}

export function Step5VerificationPending({ userEmail, userName }: Step5Props) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
        >
            {/* Animated Icon */}
            <div className="relative inline-block mb-8">
                <motion.div
                    className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Clock className="w-12 h-12 text-blue-600" />
                </motion.div>
                <motion.div
                    className="absolute -right-2 -top-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                >
                    <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Application Submitted Successfully!
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Thank you, <strong>{userName}</strong>. Your registration is now under verification.
            </p>

            {/* Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-8 max-w-md mx-auto"
            >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                    What happens next?
                </h3>

                <div className="space-y-4 text-left">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <FileCheck className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-medium text-slate-900 dark:text-white">Document Review</div>
                            <div className="text-sm text-slate-500">Our team will verify your documents</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <Phone className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <div className="font-medium text-slate-900 dark:text-white">Verification Call</div>
                            <div className="text-sm text-slate-500">We may call you for additional verification</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <div className="font-medium text-slate-900 dark:text-white">Email Notification</div>
                            <div className="text-sm text-slate-500">
                                You'll receive an email at <strong>{userEmail}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Timeline */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8 max-w-md mx-auto">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    ⏱️ <strong>Expected time:</strong> 24-48 hours (business days)
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-all"
                    >
                        Back to Home
                    </motion.button>
                </Link>
                <Link href="/login">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                    >
                        Check Status
                    </motion.button>
                </Link>
            </div>

            {/* Support */}
            <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
                Need help? Contact us at{" "}
                <a href="mailto:support@vendorconnect.com" className="text-blue-600 hover:underline">
                    support@vendorconnect.com
                </a>
            </p>
        </motion.div>
    )
}
