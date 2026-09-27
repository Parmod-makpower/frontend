// 📁 src/pages/AllCategoriesPage.jsx

import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import MobilePageHeader from "../components/MobilePageHeader";
import categories from "../data/categoryData";

/* =========================================================
   CATEGORY CARD
========================================================= */

const CategoryCard = memo(function CategoryCard({
  category,
  index,
  onClick,
}) {
  return (
    <div
      onClick={() => onClick(category)}
      className="
        category-card
        group
        cursor-pointer
        flex
        min-w-0
        flex-col
        items-center
        rounded-xl
        p-3
        sm:p-2
        transition-transform
        duration-300
        ease-out
        active:scale-[0.97]
        hover:-translate-y-1
      "
      style={{
        animationDelay: `${index * 35}ms`,
      }}
    >
      {/* IMAGE */}
      <div
        className="
          relative
          w-full
          aspect-square
          overflow-hidden
          rounded-xl
          bg-gray-100
          shadow-sm
          transition-shadow
          duration-300
          group-hover:shadow-md
        "
      >
        <img
          src={category.image}
          alt={category.label}
          loading={index < 6 ? "eager" : "lazy"}
          decoding="async"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            ease-out
            group-hover:scale-105
          "
        />
      </div>

      {/* TITLE */}
      <span
        className="
          mt-2
          w-full
          truncate
          px-1
          text-center
          text-[11px]
          font-medium
          leading-4
          text-gray-700
          transition-colors
          duration-200
          group-hover:text-[#fc250c]
          sm:text-xs
          md:text-sm
        "
      >
        {category.label}
      </span>
    </div>
  );
});

/* =========================================================
   PAGE
========================================================= */

export default function AllCategoriesPage() {
  const navigate = useNavigate();

  const handleCategoryClick = useCallback(
    (category) => {
      if (
        category.subcategories &&
        category.subcategories.length > 0
      ) {
        navigate(
          `/category/${encodeURIComponent(
            category.keyword
          )}/subcategories`
        );
      } else {
        navigate(
          `/category/${encodeURIComponent(category.keyword)}`
        );
      }
    },
    [navigate]
  );

  return (
    <>
      {/* =====================================================
          LIGHTWEIGHT PAGE ANIMATION
      ===================================================== */}

      <style>{`
        .category-card {
          opacity: 0;
          transform: translateY(8px);
          animation: categoryFadeIn 360ms
            cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        @keyframes categoryFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .category-card {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>

      <div className="px-3 pb-20 pt-4 sm:px-4">
        {/* HEADER */}
        <MobilePageHeader title="All Categories" />

        {/* CATEGORY GRID */}
        <div
          className="
            grid
            grid-cols-3
            gap-x-2
            gap-y-5
            pt-[60px]

            sm:grid-cols-4
            sm:gap-x-3
            sm:gap-y-6
            sm:pt-0

            md:grid-cols-5

            lg:grid-cols-6
            lg:gap-x-4
            lg:gap-y-7
          "
        >
          {categories.map((category, index) => (
            <CategoryCard
              key={category.label}
              category={category}
              index={index}
              onClick={handleCategoryClick}
            />
          ))}
        </div>
      </div>
    </>
  );
}