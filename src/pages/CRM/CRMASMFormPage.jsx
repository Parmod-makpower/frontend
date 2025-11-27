// src/pages/crm/CRMASMFormPage.jsx
import { useState } from "react";
import { createASMUser, updateASMUser } from "../../auth/useASM";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import AsmForm from "../../components/ASM/AsmForm";

export default function CRMASMFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData || null;

  const [form, setForm] = useState(
    editData || {
      id: null,
      name: "",
      mobile: "",
      password: "",
      email: "",      
    }
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const extractErrors = (err) => {
    const response = err.response?.data;
    if (!response) return { non_field_errors: ["Something went wrong."] };
    const formatted = {};
    for (let key in response) {
      formatted[key] = Array.isArray(response[key]) ? response[key] : [String(response[key])];
    }
    return formatted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      let payload = { ...form };
      if (!payload.password?.trim()) delete payload.password;
      if (form.id) {
        await updateASMUser(form.id, payload);
        toast.success("ASM updated successfully");
      } else {
        await createASMUser(payload);
        toast.success("ASM added successfully");
      }
      navigate("/crm-asm/list");
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/crm-asm/list")}
        className="flex items-center gap-2 mb-4 text-blue-600"
      >
        <FaArrowLeft /> Back to List
      </button>
      <h2 className="text-xl font-bold mb-4">{form.id ? "Edit ASM" : "Add New ASM"}</h2>
      <AsmForm
        form={form}
        errors={errors}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isEditMode={Boolean(form.id)}
      />
    </div>
  );
}
