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
        h-10
        items-center
        gap-2
        rounded-xl
        border
        border-slate-300
        bg-white
        px-3.5
        text-[10px]
        font-bold
        text-slate-600

        shadow-[0_1px_4px_rgba(15,23,42,0.03)]

        cursor-pointer

        transition-all
        duration-150
        ease-out

        hover:border-red-200
        hover:bg-red-50
        hover:text-red-500
        hover:shadow-[0_3px_10px_rgba(239,68,68,0.08)]

        active:scale-[0.97]

        focus:outline-none
        focus:ring-2
        focus:ring-red-500/[0.08]
      "
    >
      <span
        className="
          flex
          h-6
          w-6
          items-center
          justify-center
          rounded-lg
          bg-slate-50
          text-slate-400

          transition-all
          duration-150

          group-hover:bg-red-100
          group-hover:text-red-500
        "
      >
        <ArrowLeft
          size={14}
          strokeWidth={2.4}
          className="
            transition-transform
            duration-150
            group-hover:-translate-x-0.5
          "
        />
      </span>

      <span>{label}</span>
    </button>
  );
}