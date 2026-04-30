// 📁 src/pages/SubCategoryPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import categories from "../data/categoryData";
import MobilePageHeader from "../components/MobilePageHeader";
import { useCachedProducts } from "../hooks/useCachedProducts";

export default function SubCategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const { data: products = [] } = useCachedProducts();

  const mainCategory = categories.find(
    (c) => c.keyword === decodeURIComponent(category)
  );

  if (!mainCategory || !mainCategory.subcategories?.length) {
    return <div>No Subcategories Found</div>;
  }

  // ✅ 🔥 Perfect Mapping (IMPORTANT)
  const subCategoryProductMap = {
    "Bodyguard": 10001,
    "Super X": 10002,
    "UV Glass": 10003,
    "Meibo Glass": 10004,
    "Soldier Glass": 10005,
  };

  // ✅ Get product by subcategory
  const getProductForSub = (subLabel) => {
    const productId = subCategoryProductMap[subLabel];
    if (!productId) return null;

    return products.find(
      (p) => Number(p.product_id) === Number(productId)
    );
  };

  const handleSubCategoryClick = (sub) => {
    const keyword = sub.keyword.toUpperCase();

    if (keyword.includes("BATTERY") || keyword.includes("POLYMER")) {
      navigate(`/batteries/${encodeURIComponent(sub.keyword)}`);
    } else if (keyword.includes("TEMPERED")) {
      navigate(`/tempered/${encodeURIComponent(sub.keyword)}`);
    } else {
      navigate(`/category/${encodeURIComponent(sub.keyword)}`);
    }
  };

  return (
    <div className="p-4 pb-20">
      <MobilePageHeader title={mainCategory.label} />

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:pt-0 pt-[60px]">
        {mainCategory.subcategories.map((sub) => {
          const product = getProductForSub(sub.label);

          return (
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

              <span className="text-center mt-2 text-sm">
                {sub.label}
              </span>

              {/* ✅ 🔥 Exact price mapping */}
              {product && (
                <div className="text-xs text-gray-600 mt-1">
                  ₹ {product.price}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}