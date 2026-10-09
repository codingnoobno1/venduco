import SectionsWorkspace from '@/components/dashboard/redesign/SectionsWorkspace'

export default async function SectionsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params
    return <SectionsWorkspace projectId={projectId} />
}
