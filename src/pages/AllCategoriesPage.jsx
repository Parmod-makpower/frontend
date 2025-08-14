// src/pages/AllCategoriesPage.jsx

import MobilePageHeader from "../components/MobilePageHeader";
import categories from "../data/categoryData";
import { useNavigate } from "react-router-dom";

export default function AllCategoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <MobilePageHeader title="All Categories"/>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-[60px] sm:pt-0">
        {categories.map((cat) => (
          <div
            key={cat.label}
            onClick={() =>
              navigate(`/category/${encodeURIComponent(cat.keyword)}`)
            }
            className="cursor-pointer flex flex-col items-center p-3 rounded-lg transition duration-300 hover:-translate-y-2 group"
          >
            <div className="overflow-hidden rounded-lg">
              <img
                src={cat.image}
                alt={cat.label}
                className="w-20 h-20 md:w-28 md:h-28 lg:w-35 lg:h-35 object-cover rounded-lg transform group-hover:scale-160 transition duration-300"
              />
            </div>
            <span className="mt-2 text-sm md:text-base font-medium text-gray-700 text-center group-hover:text-[var(--primary-color)] transition">
              {cat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
