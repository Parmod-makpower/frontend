import { useState, useMemo, useEffect, useRef } from "react";
import { useNotInStockReport } from "../../hooks/CRM/useNotInStockReport";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import { FileText } from "lucide-react";
import generateNotInStockPDF from "../../components/pdf/NotInStockPDF";

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
        .filter(o => o.toLowerCase().includes(term.toLowerCase()))
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
    const [item, setItem] = useState(savedFilters.item || "");
    const [fromDate, setFromDate] = useState(savedFilters.fromDate || "");
    const [toDate, setToDate] = useState(savedFilters.toDate || "");
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleRow = id => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

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
            _item: row.product || "",
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

    const itemOptions = useMemo(
        () => [...new Set(data.map(d => d.product).filter(Boolean))],
        [data]
    );

    useEffect(() => {
        localStorage.setItem(
            FILTER_KEY,
            JSON.stringify({ party, orderNo, item, fromDate, toDate })
        );
    }, [party, orderNo, item, fromDate, toDate]);

    /* table filter */
    const filteredData = useMemo(() => {
        return normalizedData.filter(row => {
            if (party && row._party !== party) return false;
            if (orderNo && row._order !== orderNo) return false;
            if (item && row._item !== item) return false;
            if (fromDate && row._date < new Date(fromDate)) return false;
            if (toDate && row._date > new Date(toDate)) return false;
            return true;
        });
    }, [normalizedData, party, orderNo, item, fromDate, toDate]);

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
                    <div className="h-[74vh] overflow-y-auto">
                        <table className="w-full border text-sm text-center">
                            <thead className="bg-blue-100 border sticky top-0">
                                <tr>
                                    <th className="border">#</th>
                                    <th className="border">Date</th>
                                    <th className="border">Order</th>
                                    <th className="border">Party</th>
                                    <th className="border">Item</th>
                                    <th className="border">Qty</th>
                                    <th className="border bg-red-200">Stock</th>
                                    <th className="border">Balance</th>
                                    <th className="border">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredData.length > 0 &&
                                                filteredData.every(r => selectedIds.includes(r.id))
                                            }
                                            onChange={e =>
                                                setSelectedIds(
                                                    e.target.checked ? filteredData.map(r => r.id) : []
                                                )
                                            }
                                        />
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredData.map((r, i) => (
                                    <tr
                                        key={r.id}
                                        className={`${selectedIds.includes(r.id)
                                                ? "bg-yellow-200"
                                                : i % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-green-50"
                                            }`}
                                    >
                                        <td className="border">{i + 1}</td>
                                        <td className="border">{formatDate(r.date)}</td>
                                        <td className="border">{r.order_no}</td>
                                        <td className="border">{r.party_name}</td>
                                        <td className="border max-w-[120px]">{r.product}</td>
                                        <td className="border">{r.original_quantity}</td>
                                        <td className="border bg-red-200">
                                            {productStockMap[r.product?.trim().toLowerCase()] ?? 0}
                                        </td>
                                        <td className="border">{r.balance_qty}</td>
                                        <td className="border">
                                            <input
                                            className="cursor-pointer"
                                                type="checkbox"
                                                checked={selectedIds.includes(r.id)}
                                                onChange={() => toggleRow(r.id)}
                                            />
                                        </td>
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
                    <div className="border p-4 bg-gray-50 space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-semibold text-sm">Filters</h3>

                            <FileText
                                className={`w-5 h-5 cursor-pointer ${selectedIds.length === 0
                                        ? "text-gray-300"
                                        : "text-red-600 hover:scale-110"
                                    }`}
                                onClick={() => {
                                    if (selectedIds.length === 0)
                                        return alert("Please select at least one row");

                                    generateNotInStockPDF(
                                        filteredData.filter(r => selectedIds.includes(r.id)),
                                        productStockMap
                                    );
                                }}
                            />
                        </div>

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
                            <label className="text-xs">Item Name</label>
                            <AutocompleteInput
                                options={itemOptions}
                                value={item}
                                onSelect={setItem}
                                placeholder="Type item name..."
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
                                setItem("");
                                setFromDate("");
                                setToDate("");
                                localStorage.removeItem(FILTER_KEY);
                            }}
                            className="w-full bg-red-500 text-white text-sm py-1 rounded"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
