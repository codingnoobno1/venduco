// Global 404 Not Found Page
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center px-6">
                <div className="mb-8">
                    <span className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        404
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Page Not Found
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
