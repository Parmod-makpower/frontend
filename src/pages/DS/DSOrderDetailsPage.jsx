import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axios";
import { IoChevronBack } from "react-icons/io5";

export default function DSOrderDetailsPage() {
    const { order_id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [order_id]);

    const fetchOrderDetails = async () => {
        try {
            const res = await API.get(`/ds/order-details/${order_id}/`  );
            setOrder(res.data);
        } catch (err) {
            console.error(err);
            alert("Order details load nahi ho paayi");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p className="p-4 text-sm">Loading order details...</p>;
    }

    if (!order) {
        return <p className="p-4 text-red-500">Order not found</p>;
    }

    return (
        <div className="p-4 space-y-4">
            {/* HEADER */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => window.history.back()}
                    className="text-xl"
                >
                    <IoChevronBack />
                </button>
                <h2 className="text-lg font-semibold">
                    Order Details – {order.order_id}
                </h2>
            </div>

            {/* ORDER INFO */}
            <div className="bg-white border rounded p-3 text-sm grid grid-cols-2 gap-3">
                <div>
                    <b>Party:</b> {order.ds_party_name}
                </div>
               
                <div>
                    <b>Total Amount:</b> ₹{order.total_amount}
                </div>
                <div>
                    <b>Date:</b>{" "}
                    {new Date(order.created_at).toLocaleString("en-IN")}
                </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="border rounded overflow-hidden">
                <table className="w-full text-sm border">
                    <thead className="bg-blue-100">
                        <tr>
                            <th className="border p-1">#</th>
                            <th className="border p-1">Product</th>
                            <th className="border p-1">Qty</th>
                            <th className="border p-1">Price</th>
                           
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, i) => (
                            <tr key={item.id} className="text-center">
                                <td className="border">{i + 1}</td>
                                <td className="border text-left px-2">
                                    {item.product_name}
                                </td>
                                <td className="border">{item.quantity}</td>
                                <td className="border">
                                    ₹{item.price}
                                </td>
                               
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
