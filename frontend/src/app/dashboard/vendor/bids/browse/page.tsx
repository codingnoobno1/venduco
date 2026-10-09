// Browsing and bidding now live in the partner portal.
import { redirect } from 'next/navigation'

export default function BrowseProjectsPage() {
    redirect('/partner/tenders')
}
