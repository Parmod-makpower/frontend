export default function EditQuantityModal({
  show,
  setShow,
  editingItem,
  editQty,
  setEditQty,
  handleEditQuantity,
}) {
  if (!show) return null;

  return (
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
            onClick={() => setShow(false)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleEditQuantity(editingItem.id, editQty);
              setShow(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
