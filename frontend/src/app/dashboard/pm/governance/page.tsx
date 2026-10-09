import GovernanceWorkspace from '@/components/dashboard/redesign/GovernanceWorkspace'

export default async function GovernancePage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
    const { projectId } = await searchParams
    return <GovernanceWorkspace projectId={projectId} />
}
