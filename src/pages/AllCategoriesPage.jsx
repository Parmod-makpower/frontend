// 📁 src/pages/AllCategoriesPage.jsx

import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

import MobilePageHeader from "../components/MobilePageHeader";
import categories from "../data/categoryData";

/* =========================================================
   CATEGORY CARD
========================================================= */

const CategoryCard = memo(function CategoryCard({ category, onClick }) {
  const hasSubcategories =
    Array.isArray(category.subcategories) &&
    category.subcategories.length > 0;

  return (
    <button
      type="button"
      onClick={() => onClick(category)}
      className="
        group
        relative
        w-full
        overflow-hidden
        rounded-2xl
        bg-white
        border border-gray-100
        text-left
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        active:scale-[0.97]
        focus:outline-none
      "
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={category.image}
          alt={category.label}
          loading="lazy"
          decoding="async"
          draggable="false"
          className="
            block
            w-full
            aspect-square
            object-cover
            transition-transform
            duration-500
            ease-out
            group-hover:scale-105
          "
        />

        {/* Arrow */}
        <span
          className="
            absolute
            right-2.5
            top-2.5
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            bg-white/95
            text-gray-500
            shadow-sm
            transition-all
            duration-300
            group-hover:bg-[#fc250c]
            group-hover:text-white
          "
        >
          <FaArrowRight className="text-[9px]" />
        </span>

        {/* Subcategory badge */}
        {hasSubcategories && (
          <span
            className="
              absolute
              left-2.5
              top-2.5
              rounded-full
              bg-white/95
              px-2
              py-1
              text-[8px]
              font-bold
              uppercase
              tracking-wide
              text-[#fc250c]
              shadow-sm
            "
          >
            More
          </span>
        )}
      </div>

      {/* TITLE */}
      <div className="px-3 py-3 sm:px-3.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2">
          <h2
            title={category.label}
            className="
              min-w-0
              flex-1
              truncate
              text-[12px]
              font-bold
              text-gray-800
              transition-colors
              duration-200
              group-hover:text-[#fc250c]
              sm:text-sm
              md:text-[15px]
            "
          >
            {category.label}
          </h2>

          <span
            className="
              h-1.5
              w-1.5
              flex-shrink-0
              rounded-full
              bg-[#fc250c]
              opacity-30
              transition-all
              duration-200
              group-hover:opacity-100
            "
          />
        </div>

        <p className="mt-1 text-[9px] font-medium text-gray-400 sm:text-[10px]">
          {hasSubcategories ? "View collection" : "View products"}
        </p>
      </div>
    </button>
  );
});

/* =========================================================
   PAGE
========================================================= */

export default function AllCategoriesPage() {
  const navigate = useNavigate();

  const handleCategoryClick = useCallback(
    (cat) => {
      if (
        Array.isArray(cat.subcategories) &&
        cat.subcategories.length > 0
      ) {
        navigate(
          `/category/${encodeURIComponent(cat.keyword)}/subcategories`
        );
      } else {
        navigate(`/category/${encodeURIComponent(cat.keyword)}`);
      }
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* MOBILE HEADER */}
      <MobilePageHeader title="All Categories" />

      <main className="px-3 pt-[64px] sm:px-5 sm:pt-5 md:px-7 lg:px-10">
        {/* PAGE TITLE */}
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-7">
          <div className="flex items-center gap-2.5">
            <span
              className="
                h-8
                w-1
                flex-shrink-0
                rounded-full
                bg-gradient-to-b
                from-[#fc250c]
                to-[#ff7a00]
              "
            />

            <div>
              <h1
                className="
                  text-lg
                  font-extrabold
                  tracking-tight
                  text-gray-800
                  sm:text-2xl
                "
              >
                Categories
              </h1>

              <p className="mt-0.5 text-[9px] font-medium text-gray-400 sm:text-[10px]">
                Explore our product categories
              </p>
            </div>
          </div>

          {/* CATEGORY COUNT */}
          <div
            className="
              flex
              flex-shrink-0
              items-center
              gap-1.5
              rounded-full
              border
              border-gray-100
              bg-white
              px-3
              py-1.5
              shadow-sm
            "
          >
            <span className="text-xs font-extrabold text-[#fc250c]">
              {categories.length}
            </span>

            <span className="text-[8px] font-bold uppercase text-gray-400">
              Categories
            </span>
          </div>
        </div>

        {/* CATEGORY GRID */}
        <section
          className="
            grid
            grid-cols-3
            gap-3
            sm:grid-cols-3
            sm:gap-4
            md:grid-cols-4
            md:gap-5
            lg:grid-cols-5
            xl:grid-cols-6
          "
        >
          {categories.map((cat) => (
            <CategoryCard
              key={`${cat.label}-${cat.keyword}`}
              category={cat}
              onClick={handleCategoryClick}
            />
          ))}
        </section>

        {/* BOTTOM BRAND */}
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-gray-200" />

            <span
              className="
                text-[8px]
                font-extrabold
                tracking-[0.3em]
                text-gray-300
              "
            >
              MAKPOWER
            </span>

            <span className="h-px w-8 bg-gray-200" />
          </div>
        </div>
      </main>
    </div>
  );
}