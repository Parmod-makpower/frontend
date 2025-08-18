// 📁 src/pages/UserSchemesPage.jsx
import { useSchemes } from "../hooks/useSchemes";
import { FaGift } from "react-icons/fa";
import { MdProductionQuantityLimits } from "react-icons/md";
import MobilePageHeader from "../components/MobilePageHeader";

export default function UserSchemesPage() {
  const { data: schemes = [], isLoading } = useSchemes();

  if (isLoading) return <div className="p-4">Loading schemes...</div>;

  return (
    <div className="p-6 pb-16">
      <MobilePageHeader title="Available Schemes" />

      <div className="pt-[60px] sm:pt-0">
        {schemes.length === 0 ? (
          <p className="text-gray-500 text-center">No schemes available.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {schemes.map((scheme) => (
              <div
                key={scheme.id}
                className="border hover:bg-gray-100 rounded transition bg-white p-5 flex flex-col justify-between"
              >
                {/* Created By */}
                <p className="text-xs text-gray-500 mb-2">
                  Created by: <span className="font-medium">{scheme.created_by}</span>
                </p>

                {/* Conditions */}
                <div className="mt-2">
                  <p className="font-semibold text-gray-700 flex items-center gap-1 mb-1">
                    🛒 Conditions:
                  </p>
                  <ul className="list-disc ml-6 text-sm text-gray-600 space-y-1">
                    {scheme.conditions.map((c) => (
                      <li key={c.id} className="flex items-center gap-1">
                        <MdProductionQuantityLimits className="text-gray-500" />
                        Buy {c.min_quantity} of{" "}
                        {c.product_name || `Product #${c.product}`}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rewards */}
                <div className="mt-4">
                  <p className="font-semibold text-gray-700 flex items-center gap-1 mb-1">
                    🎁 Rewards:
                  </p>
                  <ul className="list-disc ml-6 text-sm text-gray-600 space-y-1">
                    {scheme.rewards.map((r) => (
                      <li key={r.id} className="flex items-center gap-1">
                        <FaGift className="text-gray-500" />
                        Get {r.quantity} of{" "}
                        {r.product_name || `Product #${r.product}`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
