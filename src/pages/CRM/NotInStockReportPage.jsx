import { useState, useMemo, useEffect, useRef } from "react";
import { useNotInStockReport } from "../../hooks/CRM/useNotInStockReport";
import { useCachedProducts } from "../../hooks/useCachedProducts";

/* =======================
   🔽 AUTOCOMPLETE INPUT
======================= */
function AutocompleteInput({ options = [], value, onSelect, placeholder }) {
    const [term, setTerm] = useState(value || "");
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);
    const ref = useRef(null);

    /* value sync */
    useEffect(() => {
        setTerm(value || "");
    }, [value]);

    const filtered = options
        .filter(o =>
            o.toLowerCase().includes(term.toLowerCase())
        )
        .slice(0, 10);

    /* outside click close */
    useEffect(() => {
        const close = e => !ref.current?.contains(e.target) && setOpen(false);
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const handleKey = e => {
        if (!open) return;

        if (e.key === "ArrowDown")
            setHighlight(h => Math.min(h + 1, filtered.length - 1));

        if (e.key === "ArrowUp")
            setHighlight(h => Math.max(h - 1, 0));

        if (e.key === "Enter") {
            e.preventDefault();
            filtered[highlight] && select(filtered[highlight]);
        }
    };

    const select = val => {
        onSelect(val);
        setTerm(val);
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative">
            <input
                value={term}
                placeholder={placeholder}
                onChange={e => {
                    setTerm(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKey}
                className="w-full border px-2 py-1 text-sm rounded"
            />

            {open && filtered.length > 0 && (
                <div className="absolute z-30 bg-white border shadow w-full max-h-48 overflow-auto text-xs">
                    {filtered.map((o, i) => (
                        <div
                            key={o}
                            onClick={() => select(o)}
                            className={`px-2 py-1 cursor-pointer ${i === highlight ? "bg-orange-100" : ""
                                }`}
                        >
                            {o}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* =======================
   📄 PAGE COMPONENT
======================= */
export default function NotInStockReportPage() {
    const { data = [], isLoading, error } = useNotInStockReport();

    /* filters */
    const FILTER_KEY = "not_in_stock_filters";

    const savedFilters = JSON.parse(localStorage.getItem(FILTER_KEY) || "{}");

    const [party, setParty] = useState(savedFilters.party || "");
    const [orderNo, setOrderNo] = useState(savedFilters.orderNo || "");
    const [fromDate, setFromDate] = useState(savedFilters.fromDate || "");
    const [toDate, setToDate] = useState(savedFilters.toDate || "");

    const { data: products = [] } = useCachedProducts();
    const productStockMap = useMemo(() => {
        const map = {};
        products.forEach(p => {
            if (p.product_name) {
                map[p.product_name.trim().toLowerCase()] = p.virtual_stock ?? 0;
            }
        });
        return map;
    }, [products]);


    /* normalize */
    const normalizedData = useMemo(() => {
        return data.map(row => ({
            ...row,
            _party: row.party_name || "",
            _order: row.order_no || "",
            _date: row.date ? new Date(row.date) : null,
        }));
    }, [data]);

    /* dropdown options */
    const partyOptions = useMemo(
        () => [...new Set(data.map(d => d.party_name).filter(Boolean))],
        [data]
    );

    const orderOptions = useMemo(
        () => [...new Set(data.map(d => d.order_no).filter(Boolean))],
        [data]
    );

    useEffect(() => {
        const filters = {
            party,
            orderNo,
            fromDate,
            toDate,
        };

        localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
    }, [party, orderNo, fromDate, toDate]);


    /* table filter */
    const filteredData = useMemo(() => {
        return normalizedData.filter(row => {
            if (party && row._party !== party) return false;
            if (orderNo && row._order !== orderNo) return false;
            if (fromDate && row._date < new Date(fromDate)) return false;
            if (toDate && row._date > new Date(toDate)) return false;
            return true;
        });
    }, [normalizedData, party, orderNo, fromDate, toDate]);

    const formatDate = d => {
        if (!d) return "";
        const x = new Date(d);
        return `${String(x.getDate()).padStart(2, "0")}/${String(
            x.getMonth() + 1
        ).padStart(2, "0")}/${x.getFullYear()}`;
    };

    if (isLoading) return <p className="p-4 text-sm">Loading...</p>;
    if (error) return <p className="p-4 text-sm text-red-500">Error</p>;

    return (
        <div className="p-3 md:p-0">
            <div className="grid grid-cols-12 gap-4">
                {/* TABLE */}
                <div className="col-span-12 md:col-span-10">
                    <div className="borde h-[74vh] overflow-y-auto">
                        <table className="w-full border text-sm text-center">
                            <thead className="bg-blue-100 border sticky top-0">
                                <tr>
                                    <th className="border">#</th>
                                    <th className="border">Party</th>
                                    <th className="border">Order</th>
                                    <th className="border">Item</th>
                                    <th className="border">Qty</th>
                                    <th className="border bg-red-200">Stock</th>
                                    <th className="border">Date</th>
                                    <th className="border">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((r, i) => (
                                    <tr key={r.id} className="odd:bg-white even:bg-green-50">
                                        <td className="border">{i + 1}</td>
                                        <td className="border">{r.party_name}</td>
                                        <td className="border">{r.order_no}</td>
                                        <td className="border">{r.product}</td>
                                        <td className="border">{r.original_quantity}</td>
                                        <td className="border bg-red-200">{productStockMap[r.product?.trim().toLowerCase()] ?? 0}</td>
                                        <td className="border">{formatDate(r.date)}</td>
                                        <td className="border">{r.balance_qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-xs mt-2">
                        Showing <b>{filteredData.length}</b> of <b>{data.length}</b>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="col-span-12 md:col-span-2">
                    <div className="border rounde p-4 bg-gray-50 space-y-3">
                        <h3 className="font-semibold text-sm border-b pb-2">Filters</h3>

                        <div>
                            <label className="text-xs">Party Name</label>
                            <AutocompleteInput
                                options={partyOptions}
                                value={party}
                                onSelect={setParty}
                                placeholder="Type party name..."
                            />
                        </div>

                        <div>
                            <label className="text-xs">Order No</label>
                            <AutocompleteInput
                                options={orderOptions}
                                value={orderNo}
                                onSelect={setOrderNo}
                                placeholder="Type order no..."
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full border px-2 py-1 text-sm rounded"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full border px-2 py-1 text-sm rounded"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setParty("");
                                setOrderNo("");
                                setFromDate("");
                                setToDate("");
                                localStorage.removeItem(FILTER_KEY);
                            }}

                            className="w-full bg-red-500 text-white text-sm py-1 rounded cursor-pointer"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
