import { useState } from "react";
import { createSSUser, updateSSUser } from "../../auth/useSS";
import UserForm from "../../components/UserForm";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function CRMSSFormPage() {
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
      party_name: "",
      dob: "",
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
        await updateSSUser(form.id, payload);
        toast.success("User updated successfully");
      } else {
        await createSSUser(payload);
        toast.success("User added successfully");
      }
      navigate("/crm-ss/list");
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/crm-ss/list")}
        className="flex items-center gap-2 mb-4 text-blue-600"
      >
        <FaArrowLeft /> Back to List
      </button>
      <h2 className="text-xl font-bold mb-4">{form.id ? "Edit User" : "Add New User"}</h2>
      <UserForm
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
