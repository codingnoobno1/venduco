// Global Loading Page
import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center">
                <Loader2 size={48} className="mx-auto animate-spin text-blue-600" />
                <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
            </div>
        </div>
    )
}
