import { useState } from "react";
import {
  useCargoDetails,
  useAddCargo,
  useUpdateCargo,
  useDeleteCargo,
} from "../../hooks/useCargoDetails";
import { useCachedSSUsers } from "../../auth/useSS";
import { Loader2, Trash2, Edit3 } from "lucide-react";
import API from "../../api/axios";

export default function CargoDetailsPage() {
  const { data: cargos, isLoading } = useCargoDetails();
  const { data: users = [], isLoading: userLoading } = useCachedSSUsers();

  const addCargo = useAddCargo();
  const updateCargo = useUpdateCargo();
  const deleteCargo = useDeleteCargo();

  const [formData, setFormData] = useState({
    id: null,
    user: "",
    cargo_name: "",
    cargo_mobile_number: "",
    cargo_location: "",
    parcel_size: "",
  });

  const handleSubmit = (e) => {
  e.preventDefault();

  // 🧠 Prevent duplicate cargo for same user (frontend check)
  const existing = cargos?.find((c) => c.user === parseInt(formData.user));
  if (!formData.id && existing) {
    alert("Cargo details already exist for this user.");
    return;
  }

  if (formData.id) {
    updateCargo.mutate(formData, { onSuccess: () => resetForm() });
  } else {
    addCargo.mutate(formData, { onSuccess: () => resetForm() });
  }
};


  const resetForm = () => {
    setFormData({
      id: null,
      user: "",
      cargo_name: "",
      cargo_mobile_number: "",
      cargo_location: "",
      parcel_size: "",
    });
  };

  const handleEdit = (cargo) => {
    setFormData({
      id: cargo.id,
      user: cargo.user, // user id set karega
      cargo_name: cargo.cargo_name,
      cargo_mobile_number: cargo.cargo_mobile_number,
      cargo_location: cargo.cargo_location,
      parcel_size: cargo.parcel_size,
    });
  };

  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleDownloadTemplate = async () => {
    try {
      const res = await API.get("cargo-details/download-template/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "CargoDetailsTemplate.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Template download failed!");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("कृपया पहले फ़ाइल चुनें।");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus("Uploading...");
      const res = await API.post("cargo-details/upload-excel/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus(`✅ Upload Done — Created: ${res.data.results.created}, Updated: ${res.data.results.updated}, Skipped: ${res.data.results.skipped}`);
    } catch (err) {
      setUploadStatus("❌ Upload failed!");
    }
  };

  if (isLoading || userLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Cargo Details Management</h2>
      {/* Excel Upload/Download Section */}
      <div className="mt-6 bg-white p-4 rounded shadow flex items-center gap-4">
        <button
          onClick={handleDownloadTemplate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📥 Download Excel Template
        </button>

        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded"
        />

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          📤 Upload Excel
        </button>
      </div>

      {uploadStatus && (
        <p className="mt-2 text-sm text-gray-700">{uploadStatus}</p>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-white p-4 rounded shadow"
      >
        {/* 👤 User Dropdown */}
        <select
          value={formData.user}
          onChange={(e) => setFormData({ ...formData, user: e.target.value })}
          className="border p-2 rounded"
          required
        >
          <option value="">Select User</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.party_name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Cargo Name"
          value={formData.cargo_name}
          onChange={(e) =>
            setFormData({ ...formData, cargo_name: e.target.value })
          }
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Mobile Number"
          value={formData.cargo_mobile_number}
          onChange={(e) =>
            setFormData({ ...formData, cargo_mobile_number: e.target.value })
          }
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Location"
          value={formData.cargo_location}
          onChange={(e) =>
            setFormData({ ...formData, cargo_location: e.target.value })
          }
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Parcel Size"
          value={formData.parcel_size}
          onChange={(e) =>
            setFormData({ ...formData, parcel_size: e.target.value })
          }
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {formData.id ? "Update Cargo" : "Add Cargo"}
        </button>
      </form>

      {/* Table */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b font-semibold">
              <th className="p-2 text-left">S.N</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Mobile</th>
              <th className="p-2 text-left">Location</th>
              <th className="p-2 text-left">Parcel Size</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cargos?.map((cargo, index) => (
              <tr key={cargo.id} className="border-b hover:bg-gray-50">
                 <td className="p-2">{index + 1}</td>
                <td className="p-2">{cargo.user_name || "—"}</td>
                <td className="p-2">{cargo.cargo_name}</td>
                <td className="p-2">{cargo.cargo_mobile_number}</td>
                <td className="p-2">{cargo.cargo_location}</td>
                <td className="p-2">{cargo.parcel_size}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(cargo)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => deleteCargo.mutate(cargo.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
