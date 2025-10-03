// 📁 src/pages/SubCategoryPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import categories from "../data/categoryData";
import MobilePageHeader from "../components/MobilePageHeader";

export default function SubCategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const mainCategory = categories.find(
    (c) => c.keyword === decodeURIComponent(category)
  );

  if (!mainCategory || !mainCategory.subcategories?.length) {
    return <div>No Subcategories Found</div>;
  }

  const handleSubCategoryClick = (sub) => {
    // Agar subcategory keyword me TEMPERED ho → /tempered/keyword
    if (sub.keyword.toUpperCase().includes("TEMPERED")) {
      navigate(`/tempered/${encodeURIComponent(sub.keyword)}`);
    } else {
      navigate(`/category/${encodeURIComponent(sub.keyword)}`);
    }
  };

  return (
    <div className="p-4 pb-20">
      <MobilePageHeader title={mainCategory.label} />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:pt-0 pt-[60px]">
        {mainCategory.subcategories.map((sub) => (
          <div
            key={sub.label}
            onClick={() => handleSubCategoryClick(sub)}
            className="cursor-pointer flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 shadow"
          >
            <img
              src={sub.image}
              alt={sub.label}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <span className="text-center mt-2 text-sm">{sub.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
