import AiTenderWorkspace from '@/components/dashboard/redesign/AiTenderWorkspace'

export default async function TenderProposalPage({ params }: { params: Promise<{ tenderId: string }> }) {
    const { tenderId } = await params
    return <AiTenderWorkspace tenderId={tenderId} />
}
