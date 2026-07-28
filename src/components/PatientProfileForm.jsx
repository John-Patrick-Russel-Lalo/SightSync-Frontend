import React, { useState, useEffect } from "react";

const API_BASE = `${import.meta.env.VITE_API_URL}`;

export default function PatientProfileForm() {
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    bloodType: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLocked = editCount >= 1;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/patients`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const resData = await response.json();

      if (response.ok && resData.data) {
        const p = resData.data;

        setEditCount(p.profile_edit_count || 0);

        setFormData({
          dateOfBirth: p.date_of_birth ? p.date_of_birth.split("T")[0] : "",
          gender: p.gender || "",
          phoneNumber: p.phone_number || "",
          bloodType: p.blood_type || "",
          emergencyContactName: p.emergency_contact_name || "",
          emergencyContactPhone: p.emergency_contact_phone || "",
          insuranceProvider: p.insurance_provider || "",
          insurancePolicyNumber: p.insurance_policy_number || "",
        });
      }
    } catch (err) {
      setError("Failed to fetch profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/patients/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Failed to save profile.");
      }

      setSuccess("Profile submitted successfully! Your one-time edit has been used.");

      if (resData.data) {
        setEditCount(resData.data.profile_edit_count);
      } else {
        setEditCount((prev) => prev + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Reusable Tailwind classes for high-contrast inputs
  const inputStyles =
    "w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-800 disabled:border-slate-200 disabled:cursor-not-allowed disabled:font-medium";

  const labelStyles = "block text-xs font-semibold text-slate-800 mb-1.5";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[350px]">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 bg-white rounded-xl shadow-md border border-slate-200 p-6 md:p-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isLocked ? "Patient Medical Profile" : "Complete Patient Profile"}
          </h2>
          <p className="text-xs font-medium text-slate-600 mt-1">
            {isLocked
              ? "Your 1-time profile edit has been used. Contact support or an admin for edits."
              : "Notice: You are allowed to edit and save this medical profile ONCE."}
          </p>
        </div>

        {isLocked && (
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Profile Locked
          </span>
        )}
      </div>

      {/* Lock Notice */}
      {isLocked && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-amber-950 text-sm">
          <p className="font-bold text-amber-900">Profile Saved & Locked</p>
          <p className="text-xs text-amber-900/90 mt-0.5">
            You have used your 1 edit limit (Edit Count: {editCount}). To update your medical details, please reach out to an administrator.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-950 text-sm">
          <p className="font-bold text-red-900">Action Failed</p>
          <p className="text-xs text-red-900/90 mt-0.5">{error}</p>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-emerald-950 text-sm">
          <p className="font-bold text-emerald-900">Success</p>
          <p className="text-xs text-emerald-900/90 mt-0.5">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic & Contact Information */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Personal & Contact Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelStyles}>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                required
                disabled={isLocked}
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="09123456789"
                className={inputStyles}
              />
            </div>

            <div>
              <label className={labelStyles}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                disabled={isLocked}
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={inputStyles}
              />
            </div>

            <div>
              <label className={labelStyles}>Gender</label>
              <select
                name="gender"
                required
                disabled={isLocked}
                value={formData.gender}
                onChange={handleChange}
                className={inputStyles}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Medical & Emergency Contact */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Medical & Emergency
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelStyles}>Blood Type</label>
              <select
                name="bloodType"
                disabled={isLocked}
                value={formData.bloodType}
                onChange={handleChange}
                className={inputStyles}
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className={labelStyles}>Emergency Contact Name</label>
              <input
                type="text"
                name="emergencyContactName"
                disabled={isLocked}
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Full Name"
                className={inputStyles}
              />
            </div>

            <div>
              <label className={labelStyles}>Emergency Contact Phone</label>
              <input
                type="tel"
                name="emergencyContactPhone"
                disabled={isLocked}
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="09123456789"
                className={inputStyles}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Insurance Details */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Insurance Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyles}>Insurance Provider</label>
              <input
                type="text"
                name="insuranceProvider"
                disabled={isLocked}
                value={formData.insuranceProvider}
                onChange={handleChange}
                placeholder="e.g. PhilHealth, Maxicare"
                className={inputStyles}
              />
            </div>

            <div>
              <label className={labelStyles}>Insurance Policy Number</label>
              <input
                type="text"
                name="insurancePolicyNumber"
                disabled={isLocked}
                value={formData.insurancePolicyNumber}
                onChange={handleChange}
                placeholder="Policy / Member ID"
                className={inputStyles}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isLocked && (
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-lg shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving Profile..." : "Save Profile Details (1-Time Edit)"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}