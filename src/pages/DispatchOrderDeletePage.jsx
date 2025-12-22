// pages/DispatchOrderDeletePage.jsx
import { useDeleteAllDispatchOrders } from "../hooks/useDispatchOrders";

export default function DispatchOrderDeletePage() {
  const { mutate, isPending } = useDeleteAllDispatchOrders();

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      "⚠️ क्या आप वाकई सभी Dispatch Orders delete करना चाहते हैं?\n(लगभग 10,000 entries)"
    );

    if (!confirmDelete) return;

    mutate(undefined, {
      onSuccess: (data) => {
        alert(`✅ ${data.deleted_count} entries delete हो गई`);
      },
      onError: () => {
        alert("❌ Delete failed, कृपया दोबारा try करें");
      },
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dispatch Orders Cleanup</h2>

      <button
        onClick={handleDelete}
        disabled={isPending}
        style={{
          backgroundColor: "red",
          color: "white",
          padding: "12px 20px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? "Deleting..." : "🗑️ Delete All Dispatch Orders"}
      </button>
    </div>
  );
}
