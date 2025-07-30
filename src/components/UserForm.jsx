// components/UserForm.jsx

import React from "react";

export default function UserForm({
  form,
  errors,
  loading,
  onChange,
  onSubmit,
  isEditMode,
  onOpenChangePassword,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-2 gap-4 mb-6 max-w-3xl"
      noValidate
    >
      <div>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Name"
          className="border p-2 rounded w-full"
          required
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name[0]}</p>}
      </div>

      <div>
        <input
          name="mobile"
          value={form.mobile}
          onChange={onChange}
          placeholder="Mobile"
          className="border p-2 rounded w-full"
          required
        />
        {errors.mobile && (
          <p className="text-red-600 text-sm">{errors.mobile[0]}</p>
        )}
      </div>

      {!isEditMode && (
        <div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            className="border p-2 rounded w-full"
            required
          />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password[0]}</p>
          )}
        </div>
      )}

      <div>
        <input
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          className="border p-2 rounded w-full"
          required
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email[0]}</p>}
      </div>

      <div>
        <input
          name="party_name"
          value={form.party_name}
          onChange={onChange}
          placeholder="Party Name"
          className="border p-2 rounded w-full"
          required
        />
        {errors.party_name && (
          <p className="text-red-600 text-sm">{errors.party_name[0]}</p>
        )}
      </div>

      <div>
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

      <div className="col-span-2">
        <button
          type="submit"
          className={`w-full px-4 py-2 rounded text-white ${
            isEditMode ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={loading}
        >
          {loading ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update" : "Add"}
        </button>

        {isEditMode && (
          <button
            type="button"
            onClick={onOpenChangePassword}
            className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Change Password
          </button>
        )}
      </div>
    </form>
  );
}
