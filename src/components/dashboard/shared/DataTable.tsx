// DataTable Component - Sortable/filterable table
"use client"

import { useState } from 'react'
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
    key: keyof T | string
    label: string
    sortable?: boolean
    render?: (value: any, row: T) => React.ReactNode
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    pageSize?: number
    searchable?: boolean
    searchKeys?: string[]
    emptyMessage?: string
    onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    pageSize = 10,
    searchable = true,
    searchKeys = [],
    emptyMessage = 'No data available',
    onRowClick,
}: DataTableProps<T>) {
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
    const [page, setPage] = useState(0)

    // Filter
    const filteredData = search
        ? data.filter((row) =>
            searchKeys.some((key) =>
                String(row[key] || '').toLowerCase().includes(search.toLowerCase())
            )
        )
        : data

    // Sort
    const sortedData = sortKey
        ? [...filteredData].sort((a, b) => {
            const aVal = a[sortKey]
            const bVal = b[sortKey]
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
            return 0
        })
        : filteredData

    // Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize)
    const paginatedData = sortedData.slice(page * pageSize, (page + 1) * pageSize)

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Search */}
            {searchable && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 max-w-sm">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setPage(0)
                            }}
                            className="bg-transparent border-none outline-none ml-2 w-full text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    onClick={() => col.sortable && handleSort(String(col.key))}
                                    className={`px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300 ${col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && sortKey === col.key && (
                                            sortDir === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, i) => (
                                <tr
                                    key={i}
                                    onClick={() => onRowClick?.(row)}
                                    className={`border-t border-slate-100 dark:border-slate-700 ${onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50' : ''
                                        }`}
                                >
                                    {columns.map((col) => (
                                        <td key={String(col.key)} className="px-4 py-3 text-sm">
                                            {col.render
                                                ? col.render(row[col.key as keyof T], row)
                                                : String(row[col.key as keyof T] || '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, sortedData.length)} of {sortedData.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 0}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages - 1}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
