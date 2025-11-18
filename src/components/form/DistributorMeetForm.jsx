import { useState } from "react";
import { submitMeetForm } from "../../api/punchApi";
import logo from "../../assets/images/logo.png";

export default function DistributorMeetForm() {
    const [form, setForm] = useState({
        business_name: "",
        person_name: "",
        phone: "",
        district: "",
    });

    const [loading, setLoading] = useState(false);
    const [thankYouOpen, setThankYouOpen] = useState(false);
    const [submittedName, setSubmittedName] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await submitMeetForm(form);

            setSubmittedName(form.person_name);
            setThankYouOpen(true);

            setForm({
                business_name: "",
                person_name: "",
                phone: "",
                district: "",
            });

        } catch (err) {
            alert("Error submitting form");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center sm:bg-gradient-to-b from-white to-red-50 p-0 sm:p-4 relative">
            
            {/* 🔥 FULL SCREEN LOADER OVERLAY */}
            {loading && (
                <div className="fixed inset-0 bg-blac bg-opacity-40 flex items-center justify-center z-50">
                    <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Thank You Modal */}
            {thankYouOpen && (
                <div className="fixed inset-0 bg-gradient-to-b from-white to-red-50 bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded border border-red-300 shadow-xl p-8 max-w-sm w-full text-center">

                        <h2 className="text-2xl font-bold text-red-600 mb-2">Thank You!</h2>
                        <p className="text-gray-700">
                            Dear <span className="font-semibold">{submittedName}</span>,  
                            <br />Your details have been submitted successfully.
                        </p>

                        <button
                            onClick={() => setThankYouOpen(false)}
                            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full max-w-sm bg-white rounded p-6 sm:border border-red-300 relative">

                <div className="flex justify-center mb-3">
                    <img
                        src={logo}
                        className="h-10 object-contain drop-shadow-[0_4px_10px_rgba(255,90,90,0.4)]"
                    />
                </div>

                <div className="overflow-hidden whitespace-nowrap mb-4">
                    <p
                        className="text-red-600 font-semibold text-sm inline-block"
                        style={{ animation: "scrollText 12s linear infinite" }}
                    >
                        Welcome to Raebareli Distributor Meet 2025 • Please fill your details carefully •
                    </p>
                </div>

                <p className="text-center text-gray-600 text-sm mb-6">
                    Raebareli Distributor Meet 2025
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="text-gray-700 font-medium text-sm">
                            Business Name
                        </label>
                        <input
                            type="text"
                            name="business_name"
                            value={form.business_name}
                            onChange={handleChange}
                            placeholder="Enter Business Name"
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400"
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 font-medium text-sm">
                            Person Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            name="person_name"
                            value={form.person_name}
                            onChange={handleChange}
                            placeholder="Enter Your Name"
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400"
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 font-medium text-sm">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            maxLength={10}
                            type="number"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="10-digit Phone Number"
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400"
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 font-medium text-sm">
                            District
                        </label>
                        <input
                            type="text"
                            name="district"
                            value={form.district}
                            onChange={handleChange}
                            placeholder="Enter District"
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Submit"
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}
