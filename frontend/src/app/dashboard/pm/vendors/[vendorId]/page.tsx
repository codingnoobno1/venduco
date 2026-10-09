import VendorProfileWorkspace from '@/components/dashboard/redesign/VendorProfileWorkspace'

export default async function VendorProfilePage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = await params
    return <VendorProfileWorkspace vendorId={vendorId} />
}
