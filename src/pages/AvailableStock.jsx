import { useState, useMemo, useRef } from "react";
import useFuseSearch from "../hooks/useFuseSearch";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { FiDownload } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import makpower_image from "../assets/images/makpower_image.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ITEMS_PER_PAGE = 10;
const ROWS_PER_PDF_PAGE = 7; // ✅ PDF per page rows

export default function AvailableStock() {
  const { data: allProducts = [], isLoading } = useCachedProducts();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [stockFilter, setStockFilter] = useState("in");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const tableRef = useRef();

  // 🔍 Search filter
  const searchedProducts = useFuseSearch(allProducts, search, {
    keys: ["product_name", "sub_category", "product_id"],
    threshold: 0.3,
  });
  const productsToSearch = search ? searchedProducts : allProducts;

  // ❌ Hidden categories
  const hiddenCategories = [
    "BATTERY",
    "COPY",
    "GIFT ITEM",
    "Lamination",
    "OTHERS",
    "RDX",
    "RM",
    "TV",
    "STICKER",
    "POWERBANK & TWS",
    "SMART WATCH",
    "MAHAKUMBH",
    "LED LIGHT",
    "LED BULB",
    "GLASS CLEANER",
    "LAMINATION",
  ];

  const categories = useMemo(() => {
    return [...new Set(allProducts.map((p) => p.sub_category))].filter(
      (cat) =>
        !hiddenCategories.includes(cat) &&
        !(cat?.trim().toUpperCase().startsWith("Z"))
    );
  }, [allProducts]);

  // ✅ Apply filters
  const filteredProducts = useMemo(() => {
    let result = productsToSearch;

    if (stockFilter === "in") result = result.filter((p) => p.live_stock > 0);
    else if (stockFilter === "out") result = result.filter((p) => p.live_stock <= 0);

    if (selectedCategories.length > 0)
      result = result.filter((p) => selectedCategories.includes(p.sub_category));

    return result;
  }, [productsToSearch, stockFilter, selectedCategories]);

  // 📑 Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ✅ Category toggle
  const toggleCategory = (cat) => {
    setCurrentPage(1);
    if (selectedCategories.includes(cat))
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    else setSelectedCategories([...selectedCategories, cat]);
  };

  // 📥 PDF Download
  const handleDownloadPDF = async () => {
    const input = tableRef.current;
    if (!input) return;

    setIsDownloading(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4"); // landscape A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const marginX = 15;
      const marginY = 10;

      // Split filtered products into chunks of ROWS_PER_PDF_PAGE
      for (let i = 0; i < filteredProducts.length; i += ROWS_PER_PDF_PAGE) {
        const chunk = filteredProducts.slice(i, i + ROWS_PER_PDF_PAGE);

        // Create a temporary table
        const tempTable = document.createElement("table");
        tempTable.style.borderCollapse = "collapse";
        tempTable.style.width = "100%";
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        ["Product Name", "Category", "Image"].forEach((head) => {
          const th = document.createElement("th");
          th.innerText = head;
          th.style.border = "2px solid #000";
          th.style.paddingTop = "20px";
          th.style.paddingBottom = "20px";
          th.style.paddingLeft = "20px";
          th.style.paddingRight = "20px";
          th.style.fontSize = "50px";
          th.style.backgroundColor = "#f0f0f0";
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        tempTable.appendChild(thead);

        const tbody = document.createElement("tbody");
        chunk.forEach((prod) => {
          const tr = document.createElement("tr");



          const tdName = document.createElement("td");
          tdName.innerText = prod.product_name;
          tdName.style.border = "1px solid #000";

          tdName.style.fontSize = "40px";
          tdName.style.textAlign = "center";
          tdName.style.fontWeight = "bold";

          const tdCat = document.createElement("td");
          tdCat.innerText = prod.sub_category;
          tdCat.style.border = "1px solid #000";

          tdCat.style.fontSize = "40px";
          tdCat.style.textAlign = "center";
          tdCat.style.fontWeight = "bold";

          const tdImg = document.createElement("td");
          tdImg.style.border = "1px solid #000";
          tdImg.style.padding = "2px";
          tdImg.style.textAlign = "center";
          const img = document.createElement("img");
          img.src = prod?.image
            ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
            : makpower_image;
          img.style.width = "300px";
          img.style.height = "300px";
          img.style.objectFit = "contain";
          img.style.display = "inline-block";
          tdImg.appendChild(img);

          tr.appendChild(tdCat);
          tr.appendChild(tdName);
          tr.appendChild(tdImg);

          tbody.appendChild(tr);
        });

        tempTable.appendChild(tbody);
        document.body.appendChild(tempTable);

        const canvas = await html2canvas(tempTable, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        const imgWidth = pdfWidth - marginX * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", marginX, marginY, imgWidth, imgHeight);
        if (i + ROWS_PER_PDF_PAGE < filteredProducts.length) pdf.addPage();

        document.body.removeChild(tempTable);
      }

      pdf.save("available-stock.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF बनाते समय error आया, कृपया दोबारा कोशिश करें।");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 flex gap-4">
      {/* 📂 Left Side Filters */}
      <div className="w-68 border-r pr-4">
        <h2 className="font-semibold mb-2">Categories</h2>
        {categories.map((cat) => (
          <label
            key={cat}
            className="flex items-center gap-2 mb-1 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat)}
              onChange={() => toggleCategory(cat)}
            />
            <span>{cat}</span>
          </label>
        ))}
      </div>

      {/* 📊 Right Side Table */}
      <div className="flex-1">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row w-full justify-between gap-3 mb-4">
          <input
            type="text"
            placeholder="🔍 Search ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border p-2 rounded flex-1 min-w-[200px] shadow-sm focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border p-2 rounded shadow-sm"
            >
              <option value="in">In Stock</option>
              <option value="out">Out of Stock</option>
              <option value="all">All</option>
            </select>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded shadow cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <ImSpinner2 className="animate-spin text-lg" /> Preparing...
                </>
              ) : (
                <>
                  <FiDownload className="text-lg" /> Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table */}
        <div ref={tableRef} className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Category</th>
                <th className="px-4 py-2 border">Product Name</th>
                <th className="px-4 py-2 border">Image</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((prod) => (
                <tr key={prod.product_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border ">
                    {prod.sub_category}
                  </td>
                  <td className="px-4 py-2 border">
                    {prod.product_name}
                  </td>
                  <td className="px-4 py-2 border">
                    <img
                      src={
                        prod?.image
                          ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
                          : makpower_image
                      }
                      className="w-10 h-10 object-contain bg-gray-50 rounded-lg border self-center"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              ⬅️ Prev
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
