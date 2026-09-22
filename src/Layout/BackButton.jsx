import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({
  fallback = "/",
  label = "Back",
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    // Agar browser history available hai to previous page
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    // Direct URL open hone par fallback
    navigate(fallback);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      title={label}
      className="
        group
        inline-flex
        h-9
        items-center
        gap-2
        border
        border-slate-200
        bg-white
        px-3
        text-[11px]
        font-semibold
        text-slate-600
        shadow-sm
        transition-all
        duration-150
        hover:border-blue-200
        hover:bg-blue-50
        hover:text-[#1769ff]
        active:scale-[0.98]
      "
    >
      <ArrowLeft
        size={15}
        strokeWidth={2.2}
        className="
          transition-transform
          duration-150
          group-hover:-translate-x-0.5
        "
      />

      <span>{label}</span>
    </button>
  );
}