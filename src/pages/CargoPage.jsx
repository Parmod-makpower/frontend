import { useCargoDetails } from "../hooks/CRM/useCargoDetails";
import { useRef } from "react";
import * as XLSX from "xlsx";
import API from "../api/axios";
import { Upload, Download, FileSpreadsheet } from "lucide-react";

export default function CargoPage() {
  const { data = [], isLoading, isError } = useCargoDetails();
  const fileInputRef = useRef();

  // ✅ Download Template
  const handleDownloadTemplate = () => {
    const template = [
      {
        party_name: "",
        cargo_name: "",
        parcel_size: "",
        cargo_location: "",
        mobile_number: "",
      },
    ];

    const sheet = XLSX.utils.json_to_sheet(template);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Template");

    XLSX.writeFile(book, "cargo_template.xlsx");
  };

  // ✅ Upload click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // ✅ Upload logic
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      try {
        const res = await API.post("/cargo/bulk-upload/", jsonData);

        const { created, updated, errors } = res.data;

        let message = `✅ Upload Done\n\n`;
        message += `🆕 Created: ${created}\n`;
        message += `🔄 Updated: ${updated}\n`;

        if (errors.length > 0) {
          message += `\n❌ Errors:\n${errors.join("\n")}`;
        }

        alert(message);
        window.location.reload();

      } catch (err) {
        alert("Upload failed!");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 🔢 Stats
  const total = data.length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        <div className="animate-pulse text-lg">Loading cargo data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500 text-center">
        Failed to load cargo data
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* 🔷 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Cargo Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage and upload cargo details easily
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            <Download size={16} />
            Template
          </button>

          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            <Upload size={16} />
            Upload
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls"
            hidden
          />
        </div>
      </div>


      {/* 🔷 TABLE */}
      <div className="bg-white border rounded shadow-sm overflow-hidden">

        <div className="px-4 py-3 border-b text-sm font-medium text-gray-600 flex items-center gap-2">
          <FileSpreadsheet size={16} />
          Cargo Records
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">

            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="p-1 border-r text-center">Party Name</th>
                <th className="p-1 border-r text-center">Cargo</th>
                <th className="p-1 border-r text-center">Parcel</th>
                <th className="p-1 border-r text-center">Location</th>
                <th className="p-1 text-center">Mobile</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-1 text-center border-r font-medium text-gray-800">
                      {item.party_name  || "-"}
                    </td> 
                    <td className="p-1 text-center border-r">{item.cargo_name}</td>
                    <td className="p-1 text-center border-r">{item.parcel_size}</td>
                    <td className="p-1 text-center border-r">{item.cargo_location}</td>
                    <td className="p-1 text-center">{item.mobile_number}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <FileSpreadsheet size={40} />
                      <p className="mt-2">No cargo data found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}