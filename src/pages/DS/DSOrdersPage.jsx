import { useMyLatestOrders } from "../../hooks/DS/useDSLatestOrders";
import MobilePageHeader from "../../components/MobilePageHeader";
import { FaBoxOpen, FaRupeeSign } from "react-icons/fa";
import DSOrderPDFButton from "../../components/pdf/DSOrderPDFButton";

export default function DSOrdersPage() {
  const { data, isLoading } = useMyLatestOrders();

  if (isLoading) {
    return (
      <div className="flex justify-center mt-20">
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="max-w-4xl mx-auto px-3 pb-20">
      <MobilePageHeader title="My Orders " />

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 mt-10 pt-[60px] sm:pt-0">
          No orders found
        </p>
      ) : (
        <div className="space-y-5 mt-6 pt-[60px] sm:pt-0">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded shadow border p-4"
            >
              {/* Order Header */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    {order.order_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <DSOrderPDFButton order={order} />
              </div>

              {/* Items */}
              <div className="mt-3 border-t pt-3 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-700">
                        {item.product_name}
                        {item.is_scheme_item && (
                          <span className="ml-2 text-green-600 text-xs">
                            (Free)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-gray-700">
                      <FaRupeeSign className="text-xs" />
                      {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-end mt-3 border-t pt-2">
                <p className="font-semibold text-gray-800 flex items-center gap-1">
                  <FaBoxOpen />
                  Total: ₹{order.total_amount}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
