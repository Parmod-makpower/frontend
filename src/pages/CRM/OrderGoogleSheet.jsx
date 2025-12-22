import { useState, useEffect, useRef } from "react";
import { all_active_inactive_product } from "../../hooks/all_active_inactive_product";
import { useSelectedProducts } from "../../hooks/useSelectedProducts";
/* ---------------------------------------------
   Excel / Google Sheet style Product Cell
--------------------------------------------- */
function SheetProductCell({ products, value, onSelect, onPaste }) {

  const [term, setTerm] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef(null);

  /* ✅ FIX: value change hote hi input update */
  useEffect(() => {
    setTerm(value || "");
  }, [value]);

  const filtered = products
    .filter(p =>
      p.product_name.toLowerCase().includes(term.toLowerCase())
    )
    .slice(0, 10);

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

  const select = p => {
    onSelect(p);
    setTerm(p.product_name);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <input
        value={term}
        onChange={e => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKey}
        onPaste={onPaste}
        className="w-full px-2 text-center border border-transparent focus:border-blue-500 focus:outline-none rounded-none"
      />


      {open && filtered.length > 0 && (
        <div className="absolute z-30 bg-white border shadow w-full max-h-48 overflow-auto">
          {filtered.map((p, i) => (
            <div
              key={p.id ?? p.product_id}
              onClick={() => select(p)}
              className={`px-2 py-1 text-center cursor-pointer ${i === highlight ? "bg-orange-100" : ""
                }`}
            >
              {p.product_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------
   Main Page
--------------------------------------------- */

export default function OrderGoogleSheet() {
  const { data: allProducts = [] } = all_active_inactive_product();

  const [selectedSS, setSelectedSS] = useState("");
  const [selectedSSName, setSelectedSSName] = useState("");

  const {
    selectedProducts,
    setSelectedProducts,
  } = useSelectedProducts();

  /* ---------- 50 blank rows ---------- */
  const EMPTY_ROWS = Array.from({ length: 50 }, () => ({
    id: null,
    product_name: "",
    cartoon_size: "",
    quantity: "",
    price: 0,
    virtual_stock: 0,
  }));

  const [rows, setRows] = useState(EMPTY_ROWS);

  /* ---------- Load from LocalStorage ---------- */
  useEffect(() => {
    const savedSS = localStorage.getItem("crm_selected_ss");
    const savedSSName = localStorage.getItem("crm_selected_ss_name");
    const savedProducts = localStorage.getItem("crm_selected_products");

    if (savedSS) setSelectedSS(savedSS);
    if (savedSSName) setSelectedSSName(savedSSName);

    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        setSelectedProducts(parsed);

        const filledRows = [...EMPTY_ROWS];
        parsed.forEach((p, i) => {
          filledRows[i] = { ...p };
        });
        setRows(filledRows);
      } catch {
        localStorage.removeItem("crm_selected_products");
      }
    }
  }, []);

  /* ---------- Sync LocalStorage ---------- */
  useEffect(() => {
    localStorage.setItem("crm_selected_ss", selectedSS || "");
    localStorage.setItem("crm_selected_ss_name", selectedSSName || "");
    localStorage.setItem(
      "crm_selected_products",
      JSON.stringify(selectedProducts || [])
    );
  }, [selectedSS, selectedSSName, selectedProducts]);
  /* ---------- SYNC rows → selectedProducts ---------- */
  useEffect(() => {
    const validProducts = rows
      .filter(r => r.id && Number(r.quantity) > 0)
      .map(r => ({
        id: r.id,
        product_name: r.product_name,
        cartoon_size: r.cartoon_size,
        quantity: Number(r.quantity),
        price: r.price || 0,
        virtual_stock: r.virtual_stock || 0,
      }));

    setSelectedProducts(validProducts);
  }, [rows, setSelectedProducts]);


  /* ---------- Product select (auto-fill row) ---------- */
  const handleRowProductSelect = (index, product) => {
    const updated = [...rows];

    updated[index] = {
      id: product.id ?? product.product_id,
      product_name: product.product_name,
      cartoon_size: product.cartoon_size,
      quantity: 1,
      price: product.price || 0,
      virtual_stock: product.virtual_stock || 0,
    };

    setRows(updated);
  };


  /* ---------- Quantity change ---------- */
  const handleQtyChange = (index, value) => {
    const numeric = value.replace(/\D/g, "");
    const updated = [...rows];
    updated[index].quantity = numeric;
    setRows(updated);
  };

  /* ---------- MULTI CELL PASTE (Excel / Sheet) ---------- */
  const handlePaste = (startRowIndex, e) => {
    e.preventDefault();

    const text = e.clipboardData.getData("text/plain");
    if (!text) return;

    const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
    if (lines.length === 0) return;

    const updated = [...rows];

    lines.forEach((line, rowOffset) => {
      const cols = line.split("\t"); // tab separated
      const rowIndex = startRowIndex + rowOffset;

      if (!updated[rowIndex]) return;

      const productName = cols[0]?.trim() || "";
      const qty = cols[1]?.trim() || "";

      // product find by name
      const product = allProducts.find(p =>
        p.product_name.toLowerCase() === productName.toLowerCase()
      );

      if (product) {
        updated[rowIndex] = {
          id: product.id ?? product.product_id,
          product_name: product.product_name,
          cartoon_size: product.cartoon_size,
          quantity: qty || 1,
          price: product.price || 0,
          virtual_stock: product.virtual_stock || 0,
        };
      } else {
        // agar product match na mile tab sirf naam paste ho
        updated[rowIndex].product_name = productName;
        updated[rowIndex].quantity = qty;
      }
    });

    setRows(updated);
  };


  /* ---------- Currency ---------- */
  const formatCurrency = v =>
    v == null || v == "" || isNaN(v) ? "--" : Number(v).toFixed(1);

  /* ---------- UI ---------- */
  return (
    <div className="mx-auto px-3 pb-24 ">

      <table className="min-w-full text-sm border-collapse">
        <thead className="bg-orange-100">
          <tr>
            <th className="border p-2 bg-blue-100"></th>
            <th className="border p-2">Product</th>
            <th className="border p-2 text-center">Qty</th>
            <th className="border p-2 text-center">Cartoon</th>
            <th className="border p-2 text-center">Stock</th>
            <th className="border p-2 text-center">Price</th>
            <th className="border p-2 text-center">Total</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-green-50">
              <td className="border text-center w-10">
                {idx + 1}
              </td>

              <td className="border ">
                <SheetProductCell
                  products={allProducts}
                  value={row.product_name}
                  onSelect={p => handleRowProductSelect(idx, p)}
                  onPaste={e => handlePaste(idx, e)}
                />

              </td>

              <td className="border w-25 text-center">
                <input
                  className="w-25 text-center border border-transparent focus:border-blue-500 focus:outline-none rounded-none"
                  value={row.quantity}
                  onChange={e => handleQtyChange(idx, e.target.value)}
                />
              </td>

              <td className="border px-2 text-center">
                {row.cartoon_size || "--"}
              </td>

              <td className="border px-2 text-center">
                {row.virtual_stock || "--"}
              </td>

              <td className="border px-2 text-center">
                {formatCurrency(row.price)}
              </td>

              <td className="border px-2 text-center">
                {formatCurrency(
                  (row.price || 0) * (row.quantity || 0)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
}
