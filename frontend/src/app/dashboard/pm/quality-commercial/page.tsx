import QualityCommercialWorkspace from '@/components/dashboard/redesign/QualityCommercialWorkspace'

export default async function QualityCommercialPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
    const { projectId } = await searchParams
    return <QualityCommercialWorkspace projectId={projectId || 'current'} />
}
