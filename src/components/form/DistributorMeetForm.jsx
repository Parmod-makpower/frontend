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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await submitMeetForm(form);
            alert("Submitted Successfully!");
            setForm({
                business_name: "",
                person_name: "",
                phone: "",
                district: "",
            });
        } catch (err) {
            alert("Error submitting form");
        }
    };

    return (
        <div className="min-h-screen p-0 m-0 flex items-center justify-center sm:bg-gradient-to-b from-white to-red-50 p-0 sm:p-4">
            <div className="w-full max-w-sm bg-white shado rounded p-6 sm:border border-red-300">

                <div className="flex justify-center mb-3">
                    <img src={logo} className="h-10 object-contain drop-shadow-[0_4px_10px_rgba(255,90,90,0.4)]" />
                </div>

                <div className="overflow-hidden whitespace-nowrap mb-4">
                    <p
                        className="text-red-600 font-semibold text-sm inline-block"
                        style={{ animation: "scrollText 12s linear infinite" }}
                    >
                        Welcome to Raebareli Distributor Meet 2025 • Please fill your details carefully • Contact team available on venue •
                    </p>
                </div>


                <p className="text-center text-gray-600 text-sm mb-6">
                    Raebareli Distributor Meet 2025
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="text-gray-700 font-medium text-sm">Business Name</label>
                        <input
                            type="text"
                            name="business_name"
                            value={form.business_name}
                            onChange={handleChange}
                            placeholder="Enter Business Name"
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none bg-white"
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
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none bg-white"
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
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none bg-white"
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 font-medium text-sm">District</label>
                        <input
                            type="text"
                            name="district"
                            value={form.district}
                            onChange={handleChange}
                            placeholder="Enter District"
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none bg-white"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-[0_4px_15px_rgba(255,100,100,0.4)] transition cursor-pointer"
                    >
                        Submit
                    </button>

                </form>
            </div>
        </div>
    );
}
