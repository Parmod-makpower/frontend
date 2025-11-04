import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft, FiEdit, FiTrash2 } from "react-icons/fi";
import { useState, useMemo } from "react";
import DispatchPDF from "../../components/DispatchPDF";
import MobilePageHeader from "../../components/MobilePageHeader";
import { punchOrderToSheet } from "../../api/punchApi";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import ConfirmModal from "../../components/ConfirmModal";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";


function Table({ title, items, setEditingItem, setEditQty, setShowEditModal, order, user, handleDeleteItem }) {
  return (
    <div className="border rounded shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-blue-100 border font-semibold">
        <span>{title}</span>
      </div>
      <div className="overflow-x-auto select-none">
        <table className="min-w-full text-sm text-left text-gray-700 border">
          <thead className="bg-gray-200 text-gray-900 text-sm font-semibold">
            <tr>
              <th className="p-3 border">S.No</th>
              <th className="p-3 border">Category</th>
              <th className="p-3 border">Product</th>
              <th className="p-3 border">Qty</th>
              <th className="p-3 border">Carton</th>
              <th className="p-3 border">Price</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">SS-Stock</th>
              <th className="p-3 border">Stock</th>
              {!order.punched && (<th className="p-3 border">Action</th>)}

            </tr>
          </thead>
          <tbody>
            {items?.length ? (
              <>
                {items.map((r, idx) => {
                  const qty = Number(r.quantity) || 0;
                  const price = Number(r.price) || 0;
                  const ssStock = Number(r.ss_virtual_stock) || 0;
                  const stock = Number(r.virtual_stock) || 0;

                  const total =
                    ssStock > 0 || (ssStock <= 0 && stock > 0)
                      ? (qty * price).toFixed(1)
                      : (0).toFixed(1);

                  return (
                    <tr
                      key={idx}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 border text-center">{idx + 1}</td>
                      <td className="p-3 border">{r.sub_category}</td>
                      <td className="p-3 border">{r.product_name}</td>
                      <td className="p-3 border bg-yellow-100">{r.quantity}</td>
                      <td className="p-3 border">{r.cartoon_size ?? "-"}</td>
                      <td className="p-3 border">₹{price.toFixed(1)}</td>
                      <td className="p-3 border bg-blue-100">₹{total}</td>
                      <td className="p-3 border bg-red-100">{ssStock}</td>
                      <td className="p-3 border bg-red-200">{stock || "0"}</td>
                      {!order.punched && (<td className="p-3 border text-center">
                        <div className="flex justify-around">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(r);
                              setEditQty(r.quantity);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 rounded hover:bg-blue-600 hover:text-white flex items-center border px-2 cursor-pointer"
                          >
                            <FiEdit className="me-2" />  Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(r.id);
                            }}
                            className="flex  cursor-pointer items-center gap-2 text-red-600 border border-red-600 rounded-md px-2  hover:bg-red-600 hover:text-white transition-all duration-150 "
                          >
                            <FiTrash2  /> Delete
                          </button>
                        </div>
                      </td>)}
                      {user?.role === "ADMIN" && (<td className="p-3 border bg-red-200">{r.id}</td>)}
                    </tr>
                  );
                })}

                <tr className="bg-blue-100 font-semibold">
                  <td colSpan={6} className="p-3 border text-right">
                    Estimate Total
                  </td>
                  <td colSpan={3} className="p-3 border">
                    ₹
                    {items
                      .reduce((sum, item) => {
                        const qty = Number(item.quantity) || 0;
                        const price = Number(item.price) || 0;
                        const ssStock = Number(item.ss_virtual_stock) || 0;
                        const stock = Number(item.virtual_stock) || 0;
                        if (ssStock > 0 || (ssStock <= 0 && stock > 0)) {
                          return sum + qty * price;
                        }
                        return sum;
                      }, 0)
                      .toFixed(1)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="p-3 text-gray-500" colSpan={9}>
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CRMVerifiedDetailsPage() {
  const { user } = useAuth();

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const order = location.state?.order;

  const crmMapping = {
    "Ankita Dhingra": "AD-AP",
    "Prince Gupta": "PG-AP",
    "Ajit Mishra": "AM-AP",
    "Harish Sharma": "HS-AP",
    "Simran Khanna": "SK-AP",
    "Rahul Kumar": "RK-AP",
    "Vivek Sharma": "VS-AP",
    "Aarti Singh": "AS-AP",
    "Kanak Maurya": "KM-AP",
  };

  const orderCode = crmMapping[order?.crm_name]
    ? `${crmMapping[order.crm_name]}${order.id}`
    : `${order?.crm_name} ${order?.id}`;

  const { data: allProducts = [] } = useCachedProducts();

  const enrichedItems = useMemo(() => {
    const merged = order.items.map((item) => {
      const found = allProducts.find((p) => p.product_id === item.product);
      return {
        ...item,
        virtual_stock: found?.virtual_stock ?? null,
        cartoon_size: found?.cartoon_size ?? "-",
        sub_category: found?.sub_category ?? "-",
        rack_no: found?.rack_no ?? "-",
      };
    });
    return merged.sort((a, b) =>
      (a.sub_category || "").toLowerCase().localeCompare(
        (b.sub_category || "").toLowerCase()
      )
    );
  }, [order.items, allProducts]);

  const handleDownloadPDF = () => {
    DispatchPDF(order, enrichedItems, remarks, orderCode);
  };

  const handleOrderPunch = () => {
    if (!order?.items?.length) {
      alert("No items to punch!");
      return;
    }
    setIsModalOpen(true);
  };

  const confirmOrderPunch = async () => {
    if (!order?.items?.length) return;

    setLoading(true);
    setIsModalOpen(false);

    try {
      const data = await punchOrderToSheet(order);
      if (data.success) {
        handleDownloadPDF();
        setTimeout(() => {
          navigate("/all/orders-history");
        }, 500);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while punching order");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct || !newQty) {
      alert("Please select a product and enter quantity.");
      return;
    }

    try {
      const res = await API.post(`/crm/verified/${order.id}/add-item/`, {
        product_id: newProduct,
        quantity: newQty,
        price: newPrice || 0,
      });

      alert(res.data.message);
      navigate("/all/orders-history/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to add product.");
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredProducts = allProducts.filter((p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditQuantity = async (itemId, newQty) => {
    if (!newQty || isNaN(newQty)) {
      alert("Invalid quantity!");
      return;
    }
    try {
      const res = await API.post(`/crm/verified/item/${itemId}/update/`, {
        quantity: newQty,
      });
      alert(res.data.message);
      navigate("/all/orders-history/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update quantity.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await API.delete(`/crm/verified/item/${itemId}/delete/`);
      alert(res.data.message);
      navigate(0); // reload current page
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete item.");
    }
  };


  if (!order) {
    return (
      <div className="p-6 text-red-600">
        No order data provided. Please go back.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 pb-20">
      <ConfirmModal
        isOpen={isModalOpen}
        title="Confirm Order Punch"
        message="Are you sure you want to punch this order? This order will be sent to the backend."
        confirmText="Confirm"
        cancelText="Cancel"
        confirmColor="bg-blue-600 hover:bg-blue-700"
        loading={loading}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={confirmOrderPunch}
      />

      <MobilePageHeader title={order.order_id} />

      <div className="hidden sm:flex items-center justify-between w-full ">
        <div className="font-semibold border rounded bg-gray-200 px-4 p-2">
          {orderCode}
        </div>
        <div className="flex gap-2">
          {order.punched && (
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1 px-3 py-1 rounded border bg-orange-600 text-white hover:bg-orange-700 transition cursor-pointer"
            >
              Dispatch PDF
            </button>
          )}

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1 rounded border hover:bg-gray-200 transition cursor-pointer"
          >
            <FiArrowLeft /> Back
          </button>
        </div>
      </div>

      {/* ✅ Table */}
      <div className="grid grid-cols-1 gap-4">

        <Table
          title="CRM — Verified Items"
          items={enrichedItems}
          setEditingItem={setEditingItem}
          setEditQty={setEditQty}
          setShowEditModal={setShowEditModal}
          handleDeleteItem={handleDeleteItem}
          order={order}
          user={user}
        />
        {!order.punched && (<div className="flex justify-end mb-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-1 cursor-pointer rounded shadow hover:bg-green-700"
          >
            Add Product
          </button>
        </div>)}
        {user?.role === "ADMIN" && (<div className="flex justify-end mb-2">
          <button onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-1 cursor-pointer rounded shadow hover:bg-green-700"
          > Add Product
          </button>
        </div>)}

      </div>

      {/* ✅ Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Product to Order</h2>

            {/* ✅ Searchable Product Selector */}
            <div className="mb-3 relative">
              <input
                type="text"
                placeholder="Search product..."
                className="w-full border rounded p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
              />

              {/* Dropdown List */}
              {dropdownOpen && (
                <div className="absolute z-50 bg-white border rounded w-full max-h-60 overflow-y-auto shadow-lg">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <div
                        key={p.product_id}
                        onClick={() => {
                          setNewProduct(p.product_id);
                          setNewPrice(p.price || 0);
                          setSearchTerm(p.product_name);
                          setDropdownOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {p.product_name}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-400">No product found</div>
                  )}
                </div>
              )}
            </div>



            <input
              type="number"
              placeholder="Quantity"
              className="w-full border rounded p-2 mb-3"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
            />

            <input
              type="number"
              placeholder="Price"
              className="w-full border rounded p-2 mb-4 bg-gray-100"
              value={newPrice}
              readOnly
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="remarks"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Remarks
        </label>
        <textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          placeholder="Enter remarks (optional)"
        />
      </div>

      <button
        onClick={handleOrderPunch}
        disabled={order.punched || loading}
        className={`px-6 py-2 rounded-lg shadow transition ${order.punched || loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          }`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 mr-2 inline-block text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            Processing...
          </>
        ) : order.punched ? (
          "Already Punched"
        ) : (
          "Order Punch"
        )}
      </button>
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-bold mb-4">
              Edit Quantity for {editingItem?.product_name}
            </h2>

            <input
              type="number"
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleEditQuantity(editingItem.id, editQty);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
