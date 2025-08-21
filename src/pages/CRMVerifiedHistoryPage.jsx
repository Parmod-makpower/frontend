import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVerifiedOrders } from '../hooks/useVerifiedOrders'


export default function CRMVerifiedHistoryPage() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState('ALL')
    const [q, setQ] = useState('')
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')


    const { data, isLoading, isFetching, isError } = useVerifiedOrders({ page, pageSize: 20, status, q, start_date: start, end_date: end })



    const results = data?.results || []
    const count = data?.count || 0
    const totalPages = useMemo(() => Math.max(1, Math.ceil(count / 20)), [count])

    return (
        <div className="p-4 sm:p-6">
            <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b mb-4">
                <h2 className="text-xl font-semibold py-3">CRM Verified Orders — History</h2>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pb-3">
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔎 Search Party / Order ID" className="border rounded-xl p-2" />
                    <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded-xl p-2">
                        <option value="ALL">All Status</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="DISPATCH">Dispatch</option>
                        <option value="DELIVERED">Delivered</option>
                    </select>
                    <input type="date" value={start} onChange={e => setStart(e.target.value)} className="border rounded-xl p-2" />
                    <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border rounded-xl p-2" />
                    <button onClick={() => setPage(1)} className="rounded-2xl px-4 py-2 bg-black text-white">Apply</button>
                </div>
            </div>

            {isError && <div className="text-red-600">Loading failed. Try again.</div>}


            <div className="overflow-x-auto border rounded-2xl shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left">Order ID</th>
                            <th className="p-3 text-left">Party</th>
                            <th className="p-3 text-left">SS User</th>
                            <th className="p-3 text-left">CRM</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Verified At</th>
                            <th className="p-3 text-right">Total</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading || !results.length ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i} className="animate-pulse border-t">
                                    <td className="p-3" colSpan={8}><div className="h-5 bg-gray-200 rounded" /></td>
                                </tr>
                            ))
                        ) : (
                            results.map(row => (
                                <tr key={row.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3 font-medium">{row.order_id}</td>
                                    <td className="p-3">{row.ss_party_name}</td>
                                    <td className="p-3">{row.ss_user_name}</td>
                                    <td className="p-3">{row.crm_name}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                row.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    row.status === 'DISPATCH' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-purple-100 text-purple-700'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="p-3">{new Date(row.verified_at).toLocaleString()}</td>
                                    <td className="p-3 text-right">₹{Number(row.total_amount).toFixed(2)}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => navigate(`/crm/verified/${row.id}`)} className="px-3 py-1 rounded-xl border">View</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between mt-4 gap-2">
                <div className="text-sm text-gray-600">Page {page} / {totalPages} {isFetching && <span className="ml-2">(refreshing…)</span>}</div>
                <div className="flex gap-2">
                    <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded-xl border disabled:opacity-50">Prev</button>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-xl border disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    )
}