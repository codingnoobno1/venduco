
function ServicesTab({ services, onChange }: any) {
    // Hardcoded for now, ideal to fetch from catalog
    const AVAILABLE_SERVICES = [
        { domain: 'Roads & Highways', types: ['Earthwork', 'Embankment', 'PQC Paving', 'DLC', 'Kerb Casting'] },
        { domain: 'Structures', types: ['Piling', 'Pier Cap', 'Girders', 'Deck Slab', 'Rebar Works'] },
        { domain: 'Tunnels', types: ['NATM', 'TBM Operations', 'Shotconcreting', 'Rock Bolting'] },
    ]

    const toggleService = (domain: string) => {
        const exists = services.find((s: any) => s.serviceDomain === domain)
        if (exists) {
            onChange(services.filter((s: any) => s.serviceDomain !== domain))
        } else {
            onChange([...services, {
                serviceDomain: domain,
                workTypes: [],
                executionMethod: { mode: 'MECHANIZED', constraints: [] }
            }])
        }
    }

    const toggleWorkType = (domain: string, type: string) => {
        onChange(services.map((s: any) => {
            if (s.serviceDomain !== domain) return s
            const hasType = s.workTypes.includes(type)
            return {
                ...s,
                workTypes: hasType ? s.workTypes.filter((t: string) => t !== type) : [...s.workTypes, type]
            }
        }))
    }

    const updateMethod = (domain: string, field: string, value: any) => {
        onChange(services.map((s: any) => {
            if (s.serviceDomain !== domain) return s
            return { ...s, executionMethod: { ...s.executionMethod, [field]: value } }
        }))
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-700">Service Offerings</h3>
            <p className="text-sm text-slate-500">Select what you are currently capable of executing.</p>

            <div className="grid grid-cols-1 gap-6">
                {AVAILABLE_SERVICES.map((svc) => {
                    const activeService = services.find((s: any) => s.serviceDomain === svc.domain)
                    const isSelected = !!activeService

                    return (
                        <div key={svc.domain} className={`border rounded-xl p-4 transition-all ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleService(svc.domain)}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-bold text-lg">{svc.domain}</span>
                            </div>

                            {isSelected && (
                                <div className="pl-8 space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {svc.types.map(type => (
                                            <label key={type} className="flex items-center gap-2 text-sm bg-white p-2 rounded border border-slate-200 hover:border-blue-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={activeService.workTypes?.includes(type)}
                                                    onChange={() => toggleWorkType(svc.domain, type)}
                                                    className="rounded border-slate-200 text-blue-600"
                                                />
                                                {type}
                                            </label>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 w-fit">
                                        <label className="text-xs font-bold uppercase text-slate-500">Execution Mode:</label>
                                        <select
                                            value={activeService.executionMethod?.mode || 'MECHANIZED'}
                                            onChange={(e) => updateMethod(svc.domain, 'mode', e.target.value)}
                                            className="bg-transparent font-bold text-sm text-blue-600 outline-none"
                                        >
                                            <option value="MANUAL">Manual Only</option>
                                            <option value="SEMI_MECH">Semi-Mechanized</option>
                                            <option value="MECHANIZED">Fully Mechanized</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
