import CorridorWorkspace from '@/components/dashboard/redesign/CorridorWorkspace'

export default async function CorridorPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params
    return <CorridorWorkspace projectId={projectId} />
}
