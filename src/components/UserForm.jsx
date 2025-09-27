import { FaUser, FaMobileAlt, FaLock, FaEnvelope, FaBuilding, FaBirthdayCake, FaSave } from "react-icons/fa";

export default function UserForm({
  form,
  errors,
  loading,
  onChange,
  onSubmit,
  isEditMode,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white shadow-md rounded-lg p-4"
      noValidate
    >
      {/* Name */}
      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-1">
          <FaUser /> Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Enter name"
          className="border p-2 rounded w-full"
          required
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name[0]}</p>}
      </div>

      {/* Mobile */}
      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-1">
          <FaMobileAlt /> Mobile
        </label>
        <input
          name="mobile"
          value={form.mobile}
          onChange={onChange}
          placeholder="Enter mobile"
          className="border p-2 rounded w-full"
          required
        />
        {errors.mobile && <p className="text-red-600 text-sm">{errors.mobile[0]}</p>}
      </div>

      {/* Password */}
      {!isEditMode && (
        <div>
          <label className="flex items-center gap-2 text-gray-700 mb-1">
            <FaLock /> Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Enter password"
            className="border p-2 rounded w-full"
            required
          />
          {errors.password && <p className="text-red-600 text-sm">{errors.password[0]}</p>}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-1">
          <FaEnvelope /> Email
        </label>
        <input
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Enter email"
          className="border p-2 rounded w-full"
          required
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email[0]}</p>}
      </div>

      {/* Party Name */}
      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-1">
          <FaBuilding /> Party Name
        </label>
        <input
          name="party_name"
          value={form.party_name}
          onChange={onChange}
          placeholder="Enter party name"
          className="border p-2 rounded w-full"
          required
        />
        {errors.party_name && <p className="text-red-600 text-sm">{errors.party_name[0]}</p>}
      </div>

      {/* DOB */}
      <div>
        <label className="flex items-center gap-2 text-gray-700 mb-1">
          <FaBirthdayCake /> Date of Birth
        </label>
        <input
          type="date"
          name="dob"
          value={form.dob}
          onChange={onChange}
          className="border p-2 rounded w-full"
          required
        />
        {errors.dob && <p className="text-red-600 text-sm">{errors.dob[0]}</p>}
      </div>

      {/* Submit Button */}
      <div className="md:col-span-2">
        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded text-white ${
            isEditMode ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={loading}
        >
          <FaSave />
          {loading ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
}
