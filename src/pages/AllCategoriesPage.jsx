// 📁 src/pages/AllCategoriesPage.jsx

import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

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
  const hasSubcategories =
    Array.isArray(category.subcategories) &&
    category.subcategories.length > 0;

  return (
    <button
      type="button"
      onClick={() => onClick(category)}
      style={{
        animationDelay: `${Math.min(index * 35, 350)}ms`,
      }}
      className="
        category-card
        group
        relative
        w-full
        overflow-hidden
        rounded-xl
        bg-white
        border
        border-gray-100
        text-left
        shadow-[0_2px_10px_rgba(15,23,42,0.05)]
        outline-none
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:shadow-[0_8px_22px_rgba(15,23,42,0.10)]
        active:scale-[0.96]
        focus-visible:ring-2
        focus-visible:ring-[#fc250c]
        focus-visible:ring-offset-1
      "
    >
      {/* =================================================
          IMAGE
      ================================================= */}

      <div
        className="
          relative
          w-full
          aspect-square
          overflow-hidden
          bg-gray-50
        "
      >
        <img
          src={category.image}
          alt={category.label}
          loading="lazy"
          decoding="async"
          draggable="false"
          className="
            block
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            ease-[cubic-bezier(.22,1,.36,1)]
            group-hover:scale-[1.07]
          "
        />

        {/* Soft overlay */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/[0.10]
            via-transparent
            to-transparent
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />

        {/* =================================================
            TOP RIGHT ARROW
        ================================================= */}

        <span
          className="
            absolute
            right-1.5
            top-1.5
            flex
            h-4
            w-4
            items-center
            justify-center
            rounded-full
            bg-white/95
            text-gray-500
            shadow-sm
            backdrop-blur-sm
            transition-all
            duration-300
            group-hover:bg-[#fc250c]
            group-hover:text-white
            group-hover:rotate-[-5deg]
          "
        >
          <FaArrowRight className="text-[8px]" />
        </span>

        {/* =================================================
            SUBCATEGORY BADGE
        ================================================= */}

        {hasSubcategories && (
          <span
            className="
              absolute
              left-1.5
              top-1.5
              rounded-full
              bg-white/95
              px-1.5
              py-1
              text-[6px]
              font-extrabold
              uppercase
              tracking-wide
              text-[#fc250c]
              shadow-sm
              backdrop-blur-sm
            "
          >
            More
          </span>
        )}
      </div>

      {/* =================================================
          CATEGORY NAME
      ================================================= */}

      <div className="px-2 py-2 sm:px-3 sm:py-3">
        <div className="flex items-center gap-1.5">
          <h2
            title={category.label}
            className="
              min-w-0
              flex-1
              truncate
              text-[10px]
              font-bold
              leading-tight
              text-gray-800
              transition-colors
              duration-200
              group-hover:text-[#fc250c]
              sm:text-xs
              md:text-sm
            "
          >
            {category.label}
          </h2>

          <span
            className="
              h-1
              w-1
              flex-shrink-0
              rounded-full
              bg-[#fc250c]
              opacity-30
              transition-all
              duration-300
              group-hover:scale-125
              group-hover:opacity-100
            "
          />
        </div>

        <p
          className="
            mt-1
            truncate
            text-[7px]
            font-medium
            text-gray-400
            sm:text-[9px]
          "
        >
          {hasSubcategories
            ? "View collection"
            : "View products"}
        </p>
      </div>

      {/* Bottom animated line */}
      <span
        className="
          absolute
          bottom-0
          left-0
          h-[2px]
          w-0
          bg-gradient-to-r
          from-[#fc250c]
          to-[#ff7a00]
          transition-all
          duration-300
          group-hover:w-full
        "
      />
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
          `/category/${encodeURIComponent(
            cat.keyword
          )}/subcategories`
        );

        return;
      }

      navigate(
        `/category/${encodeURIComponent(cat.keyword)}`
      );
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* =================================================
          HEADER
      ================================================= */}

      <MobilePageHeader title="All Categories" />

      <main
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-2.5
          pt-[64px]
          pb-6
          sm:px-5
          sm:pt-5
          md:px-7
          lg:px-10
          xl:px-12
        "
      >
        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <div
          className="
            mb-4
            flex
            items-center
            justify-between
            gap-3
            sm:mb-6
          "
        >
          <div className="flex items-center gap-2">
            <span
              className="
                h-7
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
                  text-base
                  font-extrabold
                  tracking-tight
                  text-gray-800
                  sm:text-xl
                  md:text-2xl
                "
              >
                Categories
              </h1>

              <p
                className="
                  mt-0.5
                  text-[8px]
                  font-medium
                  text-gray-400
                  sm:text-[10px]
                "
              >
                Explore our product categories
              </p>
            </div>
          </div>

          {/* Category count */}

          <div
            className="
              flex
              flex-shrink-0
              items-center
              gap-1
              rounded-full
              border
              border-gray-100
              bg-white
              px-2.5
              py-1.5
              shadow-sm
              sm:px-3
            "
          >
            <span
              className="
                text-[11px]
                font-extrabold
                text-[#fc250c]
                sm:text-xs
              "
            >
              {categories.length}
            </span>

            <span
              className="
                text-[6px]
                font-bold
                uppercase
                text-gray-400
                sm:text-[8px]
              "
            >
              Categories
            </span>
          </div>
        </div>

        {/* =================================================
            CATEGORY GRID
            MOBILE = 3 COLUMNS
            TABLET = 4
            DESKTOP = 5 / 6
        ================================================= */}

        <section
          className="
            grid
            grid-cols-3
            gap-4
            sm:grid-cols-4
            sm:gap-4
            md:grid-cols-5
            md:gap-5
            lg:grid-cols-6
          "
        >
          {categories.map((cat, index) => (
            <CategoryCard
              key={`${cat.label}-${cat.keyword || index}`}
              category={cat}
              index={index}
              onClick={handleCategoryClick}
            />
          ))}
        </section>

        {/* =================================================
            BOTTOM BRAND
        ================================================= */}

        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <span className="h-px w-7 bg-gray-200" />

            <span
              className="
                text-[7px]
                font-extrabold
                tracking-[0.3em]
                text-gray-300
              "
            >
              MAKPOWER
            </span>

            <span className="h-px w-7 bg-gray-200" />
          </div>
        </div>
      </main>

      {/* =================================================
          SMOOTH HOME-PAGE STYLE ENTRANCE
      ================================================= */}

      <style>{`
        .category-card {
          opacity: 0;
          transform: translateY(10px) scale(0.985);
          animation: categoryCardIn 420ms
            cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
          will-change: transform, opacity;
        }

        @keyframes categoryCardIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
    </div>
  );
}