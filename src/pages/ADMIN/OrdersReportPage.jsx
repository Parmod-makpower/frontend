import { useState } from "react";
import API from "../../api/axios";
import MobilePageHeader from "../../components/MobilePageHeader";

export default function OrdersReportPage() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState("ss");

    const downloadReport = async () => {
        if (!fromDate || !toDate) {
            alert("Please select dates");
            return;
        }

        try {
            setLoading(true);

            const response = await API.get(
                `/download-orders-report/?from_date=${fromDate}&to_date=${toDate}&report_type=${reportType}`,
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;

            link.setAttribute(
                "download",
                `Orders_Report_${fromDate}_to_${toDate}.xlsx`
            );

            document.body.appendChild(link);

            link.click();

            link.remove();
        } catch (error) {
            console.error(error);
            alert("Download failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 pb-20">
            <MobilePageHeader title="Orders Report" />

            <div className="pt-[70px] max-w-md mx-auto">
                <div className="bg-white rounded-xl shadow p-4 space-y-4">

                    <div>
                        <label className="text-sm font-medium">
                            From Date
                        </label>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) =>
                                setFromDate(e.target.value)
                            }
                            className="w-full border rounded p-2 mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            To Date
                        </label>

                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) =>
                                setToDate(e.target.value)
                            }
                            className="w-full border rounded p-2 mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">
                            Report Type
                        </label>

                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full border rounded p-2 mt-1"
                        >
                            <option value="ss">SS Orders</option>
                            <option value="crm">CRM Verified Orders</option>
                        </select>
                    </div>
                    <button
                        onClick={downloadReport}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg"
                    >
                        {loading
                            ? "Generating..."
                            : "Download Excel"}
                    </button>
                </div>
            </div>
        </div>
    );
}