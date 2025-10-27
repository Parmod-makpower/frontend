import { useNavigate } from "react-router-dom";
import MobilePageHeader from "../../components/MobilePageHeader";
import { useCRMOrders } from "../../hooks/useCRMOrders";

export default function SSPendingOrders() {
    const navigate = useNavigate();
    const { data: orders = [], isLoading, isFetching } = useCRMOrders();

    if (isLoading) return <p className="p-4">Loading orders...</p>;

    return (
        <div className="p-2 pb-20">
            <MobilePageHeader title="My Orders" />
            {isFetching && (
                <p className="text-center text-sm text-gray-400 mt-2">
                    🔄 Updating orders...
                </p>
            )}

            <div className="border rounded shadow-sm pt-[60px] sm:pt-0 ">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className=" bg-gray-100 text-gray-900 text-sm font-semibold">
                        <tr>
                            <th className="p-3 border">Order ID</th>
                            <th className="p-3 border">Party Name</th>
                            <th className="p-3 border">CRM Name</th>
                            <th className="p-3 border">Date</th>

                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.length === 0 ? (
                            <p className="text-gray-500 text-center">No orders found.</p>
                        ) : (
                            orders.map((order) => (
                                <tr
                                    key={order.id}
                                    onClick={() =>
                                        navigate(`/admin/pending-orders/${order.id}`, {
                                            state: { order: order },
                                        })
                                    }
                                    className="border-t hover:bg-gray-50 relative cursor-pointer hover:bg-yellow-100"
                                >
                                    <td className="p-3 border font-medium">{order.order_id}</td>
                                    <td className="p-3 border">{order.ss_party_name}</td>
                                    <td className="p-3 border">{order.crm_name}</td>
                                    <td className="p-3 border"> {new Date(order.created_at).toLocaleString()}</td>

                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

        </div>
    );
}
