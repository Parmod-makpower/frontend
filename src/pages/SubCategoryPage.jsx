import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import categories from "../data/categoryData";
import { useCachedProducts } from "../hooks/useCachedProducts";

import {
  FaChevronRight,
  FaBoxOpen,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import makpower_image from "../assets/images/makpower_image.webp";

export default function SubCategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const {
    data: products = [],
    isLoading,
  } = useCachedProducts();

  const [search, setSearch] = useState("");

  // =========================================================
  // FAST SCROLL RENDER
  // =========================================================

  const INITIAL_VISIBLE = 24;
  const LOAD_MORE = 24;

  const [visibleCount, setVisibleCount] =
    useState(INITIAL_VISIBLE);

  const loadMoreRef = useRef(null);

  // =========================================================
  // DECODE CATEGORY
  // =========================================================

  const decodedCategory =
    decodeURIComponent(category || "");

  // =========================================================
  // FIND MAIN CATEGORY
  // =========================================================

  const mainCategory = useMemo(() => {
    return categories.find(
      (c) =>
        String(c.keyword || "").toLowerCase() ===
        decodedCategory.toLowerCase()
    );
  }, [decodedCategory]);

  // =========================================================
  // EXISTING PRODUCT MAPPING
  // DO NOT CHANGE
  // =========================================================

  const subCategoryProductMap = {
    Bodyguard: 10001,
    "Super X": 10002,
    "UV Glass": 10003,
    "Meibo Glass": 10004,
    Soldier: 10005,
    "New Soldier": 10007,
  };

  // =========================================================
  // NORMALIZE
  // =========================================================

  const normalizeText = (value) =>
    String(value ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");

  // =========================================================
  // ACTIVE PRODUCT
  // =========================================================

  const isActiveProduct = (product) => {
    const value = product?.is_active;

    return (
      value === true ||
      value === 1 ||
      value === "1" ||
      String(value).toLowerCase() === "true"
    );
  };

  // =========================================================
  // GET NORMAL CATEGORY PRODUCT
  // =========================================================

  const getProductForSub = (subLabel) => {
    const productId =
      subCategoryProductMap[subLabel];

    if (!productId) return null;

    return products.find(
      (p) =>
        Number(p.product_id) ===
        Number(productId)
    );
  };

  // =========================================================
  // SPEAKER PRODUCTS
  //
  // ONLY ACTIVE SPEAKERS.
  //
  // IMPORTANT:
  // Inactive speaker is NOT shown here.
  //
  // Twister inactive case is handled separately below.
  // =========================================================

  const speakerProducts = useMemo(() => {
    if (!products?.length) {
      return [];
    }

    return products.filter(
      (product) =>
        isActiveProduct(product) &&
        normalizeText(
          product?.sub_category
        ) === "speaker"
    );
  }, [products]);

  // =========================================================
  // MODEL NAME
  // =========================================================

  const getModelName = (product) => {
    return String(
      product?.product_name ||
      product?.name ||
      product?.sale_name ||
      ""
    ).trim();
  };

  // =========================================================
  // MODEL VARIANTS
  //
  // SHARK SPEAKER
  // -> sharkspeaker
  // -> shark
  //
  // SP SOUND BREAKER
  // -> spsoundbreaker
  // -> soundbreaker
  // =========================================================

  const getModelVariants = (model) => {
    const normalized =
      normalizeText(model);

    if (!normalized) {
      return [];
    }

    const variants = new Set();

    variants.add(normalized);

    // Remove trailing SPEAKER
    const withoutSpeaker =
      normalized.replace(/speaker$/, "");

    if (
      withoutSpeaker &&
      withoutSpeaker !== normalized
    ) {
      variants.add(withoutSpeaker);
    }

    // Remove textual SP prefix
    const candidates = [
      normalized,
      withoutSpeaker,
    ];

    candidates.forEach((value) => {
      if (
        value.startsWith("sp") &&
        value.length > 2 &&
        !/\d/.test(
          value.slice(2)
        )
      ) {
        variants.add(
          value.slice(2)
        );
      }
    });

    return [...variants].filter(Boolean);
  };

  // =========================================================
  // SEARCHABLE PRODUCT TEXT
  // =========================================================

  const getProductSearchText = (product) => {
    return normalizeText(
      [
        product?.product_name,
        product?.name,
        product?.sale_name,
        product?.category,
        product?.sub_category,
        product?.product_type,
        product?.description,
      ]
        .filter(Boolean)
        .join(" ")
    );
  };

  // =========================================================
  // SPARE MARKERS
  // =========================================================

  const spareMarkers = [
    "pcb",
    "packing",
    "housing",
    "spare",
    "btpcb",
    "bluetoothpcb",
  ];

  // =========================================================
  // MATCH MODEL
  // =========================================================

  const matchesModel = (
    productText,
    modelVariants
  ) => {
    if (
      !productText ||
      !modelVariants.length
    ) {
      return false;
    }

    return modelVariants.some(
      (model) => {
        const index =
          productText.indexOf(model);

        if (index === -1) {
          return false;
        }

        // Numeric model protection
        //
        // SP15 -> SP151 ❌
        // SP15 -> SP152 ❌
        //

        const afterModel =
          productText[
          index + model.length
          ] || "";

        if (
          /\d$/.test(model) &&
          /\d/.test(afterModel)
        ) {
          return false;
        }

        const remaining =
          productText.slice(
            index + model.length
          );

        if (!remaining) {
          return false;
        }

        return spareMarkers.some(
          (marker) =>
            remaining.includes(marker)
        );
      }
    );
  };

  // =========================================================
  // ACTIVE SPARE PRODUCTS
  //
  // Search text is created ONCE.
  //
  // This keeps rendering/filtering fast.
  // =========================================================

  const activeSpareProducts = useMemo(() => {
    if (!products?.length) {
      return [];
    }

    return products
      .filter((product) => {
        if (!isActiveProduct(product)) {
          return false;
        }

        return (
          normalizeText(
            product?.sub_category
          ) !== "speaker"
        );
      })
      .map((product) => ({
        product,
        searchText:
          getProductSearchText(product),
      }))
      .filter(
        (item) => item.searchText
      );
  }, [products]);

  // =========================================================
  // BUILD NORMAL SPEAKER MODELS
  //
  // Speaker with ZERO spare:
  // HIDDEN
  //
  // Duplicate spare records:
  // KEPT
  // =========================================================

  const normalSpeakerModels = useMemo(() => {
    if (!speakerProducts.length) {
      return [];
    }

    return speakerProducts
      .map((speakerProduct) => {
        const modelName =
          getModelName(
            speakerProduct
          );

        if (!modelName) {
          return null;
        }

        const variants =
          getModelVariants(
            modelName
          );

        const spareProducts =
          activeSpareProducts
            .filter((item) =>
              matchesModel(
                item.searchText,
                variants
              )
            )
            .map(
              (item) =>
                item.product
            );

        // No spare = hide model
        if (
          spareProducts.length === 0
        ) {
          return null;
        }

        return {
          product: speakerProduct,
          modelName,
          spareProducts,
          productCount:
            spareProducts.length,
          isManualTwister: false,
        };
      })
      .filter(Boolean);
  }, [
    speakerProducts,
    activeSpareProducts,
  ]);

  // =========================================================
  // TWISTER SPECIAL FALLBACK
  //
  // IMPORTANT:
  //
  // ONLY FOR TWISTER.
  //
  // If active TWISTER speaker exists:
  // -> normal logic already handles it.
  //
  // If TWISTER speaker is inactive/missing:
  // -> find active Twister spare products.
  //
  // Example:
  //
  // Twister Speaker inactive
  //
  // TWISTER PCB active
  // TWISTER Packing active
  // TWISTER Housing active
  //
  // => Manual TWISTER card
  //
  // This does NOT affect any other speaker.
  // =========================================================

  const twisterFallbackModel =
    useMemo(() => {
      // ---------------------------------------------
      // Check if an ACTIVE Twister speaker already
      // exists.
      // ---------------------------------------------

      const activeTwisterSpeaker =
        speakerProducts.find(
          (product) => {
            const name =
              normalizeText(
                getModelName(product)
              );

            return (
              name === "twister" ||
              name === "twisterspeaker"
            );
          }
        );

      // ---------------------------------------------
      // If active Twister speaker exists,
      // normal speaker card handles it.
      // ---------------------------------------------

      if (activeTwisterSpeaker) {
        return null;
      }

      // ---------------------------------------------
      // Find active TWISTER spare products.
      //
      // IMPORTANT:
      // Only model name TWISTER is checked.
      //
      // So this special logic cannot affect
      // Shark / HT05 / Rhythm / etc.
      // ---------------------------------------------

      const twisterVariants = [
        "twister",
      ];

      const twisterSpareProducts =
        activeSpareProducts
          .filter((item) =>
            matchesModel(
              item.searchText,
              twisterVariants
            )
          )
          .map(
            (item) =>
              item.product
          );

      // ---------------------------------------------
      // No Twister spare = no manual card.
      // ---------------------------------------------

      if (
        twisterSpareProducts.length === 0
      ) {
        return null;
      }

      // ---------------------------------------------
      // Pick image from first spare if needed.
      // Main manual card does not require
      // speaker product to exist.
      // ---------------------------------------------

      const imageProduct =
        twisterSpareProducts.find(
          (product) =>
            String(
              product?.image || ""
            ).trim()
        ) ||
        twisterSpareProducts[0];

      return {
        product: imageProduct,
        modelName: "Twister",
        spareProducts:
          twisterSpareProducts,
        productCount:
          twisterSpareProducts.length,
        isManualTwister: true,
      };
    }, [
      speakerProducts,
      activeSpareProducts,
    ]);

  // =========================================================
  // FINAL SPEAKER MODELS
  //
  // Normal models +
  // Twister fallback ONLY when required.
  //
  // No spare-part total is calculated here.
  // =========================================================

  const speakerModels = useMemo(() => {
    const result = [
      ...normalSpeakerModels,
    ];

    if (twisterFallbackModel) {
      result.push(
        twisterFallbackModel
      );
    }

    // ✅ Alphabetical order: A → Z
    return result.sort((a, b) =>
      String(a.modelName || "").localeCompare(
        String(b.modelName || ""),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      )
    );
  }, [
    normalSpeakerModels,
    twisterFallbackModel,
  ]);

  // =========================================================
  // SEARCH SPEAKER MODELS
  // =========================================================

  const normalizedSearch =
    normalizeText(search);

  const visibleSpeakerModels =
    useMemo(() => {
      if (!normalizedSearch) {
        return speakerModels;
      }

      return speakerModels.filter(
        (item) =>
          normalizeText(
            item.modelName
          ).includes(
            normalizedSearch
          )
      );
    }, [
      speakerModels,
      normalizedSearch,
    ]);

  // =========================================================
  // RESET PAGINATION
  // =========================================================

  useEffect(() => {
    setVisibleCount(
      INITIAL_VISIBLE
    );
  }, [
    normalizedSearch,
    decodedCategory,
  ]);

  // =========================================================
  // FAST SCROLL LOAD
  //
  // IMPORTANT:
  // NO API CALL.
  //
  // Only more already-loaded cards are rendered.
  // =========================================================

  useEffect(() => {
    if (
      mainCategory?.type !==
      "spare-parts"
    ) {
      return;
    }

    const target =
      loadMoreRef.current;

    if (!target) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const first =
            entries[0];

          if (
            first.isIntersecting
          ) {
            setVisibleCount(
              (current) => {
                if (
                  current >=
                  visibleSpeakerModels.length
                ) {
                  return current;
                }

                return (
                  current +
                  LOAD_MORE
                );
              }
            );
          }
        },
        {
          rootMargin:
            "500px 0px",
        }
      );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [
    visibleSpeakerModels.length,
    mainCategory?.type,
  ]);

  // =========================================================
  // CURRENTLY RENDERED MODELS
  // =========================================================

  const renderedSpeakerModels =
    useMemo(() => {
      return visibleSpeakerModels.slice(
        0,
        visibleCount
      );
    }, [
      visibleSpeakerModels,
      visibleCount,
    ]);

  // =========================================================
  // PRODUCT IMAGE
  // =========================================================

  // const getProductImage = (
  //   product
  // ) => {
  //   if (!product) {
  //     return makpower_image;
  //   }

  //   const image = String(
  //     product?.image || ""
  //   ).trim();

  //   if (!image) {
  //     return makpower_image;
  //   }

  //   if (
  //     image.startsWith(
  //       "http://"
  //     ) ||
  //     image.startsWith(
  //       "https://"
  //     )
  //   ) {
  //     return image;
  //   }

  //   return `https://res.cloudinary.com/djyr368zj/${image}?f_auto,q_auto,w_400`;
  // };

  const getProductImage = (
    product,
    isManualTwister = false
  ) => {
    // =====================================================
    // TWISTER SPECIAL IMAGE
    // =====================================================

    if (isManualTwister) {
      return "https://res.cloudinary.com/djyr368zj/image/upload/v1757908154/eg8xi3afjpp5jnz01ola.png";
    }

    // =====================================================
    // EXISTING IMAGE LOGIC
    // =====================================================

    if (!product) {
      return makpower_image;
    }

    const image = String(
      product?.image || ""
    ).trim();

    if (!image) {
      return makpower_image;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `https://res.cloudinary.com/djyr368zj/${image}?f_auto,q_auto,w_400`;
  };

  // =========================================================
  // CLICK
  // =========================================================

  const handleSubCategoryClick = (
    sub
  ) => {
    const keyword =
      String(
        sub?.keyword || ""
      ).toUpperCase();

    // =======================================================
    // SPARE PARTS
    // =======================================================

    if (
      mainCategory?.type ===
      "spare-parts"
    ) {
      navigate(
        `/spare-parts/${encodeURIComponent(
          sub.modelName
        )}`
      );

      return;
    }

    // =======================================================
    // BATTERY / POLYMER
    // =======================================================

    if (
      keyword.includes(
        "BATTERY"
      ) ||
      keyword.includes(
        "POLYMER"
      )
    ) {
      navigate(
        `/batteries/${encodeURIComponent(
          sub.keyword
        )}`
      );

      return;
    }

    // =======================================================
    // TEMPERED
    // =======================================================

    if (
      keyword.includes(
        "TEMPERED"
      )
    ) {
      navigate(
        `/tempered/${encodeURIComponent(
          sub.keyword
        )}`
      );

      return;
    }

    // =======================================================
    // NORMAL CATEGORY
    // =======================================================

    navigate(
      `/category/${encodeURIComponent(
        sub.keyword
      )}`
    );
  };

  // =========================================================
  // NO CATEGORY
  // =========================================================

  if (
    !mainCategory ||
    !mainCategory.subcategories?.length
  ) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No Subcategories Found
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        min-h-screen
        bg-gray-50
        px-3
        sm:px-4
        pb-20
      "
    >
      <div
        className="
          pt-[20px]
          sm:pt-0
          mx-auto
        "
      >

        {/* =================================================
            SPARE PARTS HEADER
        ================================================= */}

        {mainCategory.type ===
          "spare-parts" && (
            <div className="mb-4">

              {/* SEARCH + MODEL COUNT */}

              <div
                className="
                flex
                items-center
                gap-2
              "
              >

                {/* SEARCH */}

                <div
                  className="
                  flex-1
                  relative
                  bg-white
                  border
                  border-gray-200
                  rounded-xl
                  shadow-sm
                  transition-all
                  duration-200
                  focus-within:border-blue-300
                  focus-within:ring-2
                  focus-within:ring-blue-100
                "
                >
                  <div
                    className="
                    flex
                    items-center
                    gap-2.5
                    px-3.5
                    py-2.5
                  "
                  >
                    <FaSearch
                      className="
                      text-gray-400
                      text-sm
                      flex-shrink-0
                    "
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search speaker model..."
                      className="
                      flex-1
                      min-w-0
                      bg-transparent
                      outline-none
                      text-xs
                      sm:text-sm
                      text-gray-700
                      placeholder:text-gray-400
                    "
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch("")
                        }
                        className="
                        w-6
                        h-6
                        rounded-full
                        flex
                        items-center
                        justify-center
                        text-gray-400
                        hover:text-gray-600
                        hover:bg-gray-100
                        transition-colors
                      "
                      >
                        <FaTimes className="text-[10px]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* MODEL COUNT
                  ONLY MODELS
                  NO SPARE PART TOTAL
              */}

                <div
                  className="
                  flex
                  items-center
                  gap-1.5
                  whitespace-nowrap
                  px-3
                  py-2.5
                  rounded-xl
                  bg-blue-50
                  border
                  border-blue-100
                "
                >
                  <FaBoxOpen
                    className="
                    text-blue-500
                    text-xs
                  "
                  />

                  <span
                    className="
                    text-[11px]
                    font-semibold
                    text-blue-700
                  "
                  >
                    {visibleSpeakerModels.length}
                  </span>

                  <span
                    className="
                    text-[10px]
                    text-blue-500
                    hidden
                    sm:inline
                  "
                  >
                    Models
                  </span>
                </div>
              </div>

              {/* SEARCH INFO */}

              {search && (
                <div
                  className="
                  flex
                  items-center
                  justify-between
                  px-1
                  mt-1.5
                "
                >
                  <span
                    className="
                    text-[10px]
                    text-gray-400
                  "
                  >
                    {visibleSpeakerModels.length}{" "}
                    model
                    {visibleSpeakerModels.length !==
                      1
                      ? "s"
                      : ""}{" "}
                    found
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="
                    text-[10px]
                    font-medium
                    text-blue-500
                    hover:text-blue-600
                  "
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

        {/* =================================================
            LOADING
        ================================================= */}

        {isLoading ? (
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-6
              xl:grid-cols-7
              gap-2
              sm:gap-3
            "
          >
            {Array.from({
              length: 14,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-xl
                  overflow-hidden
                  animate-pulse
                "
              >
                <div
                  className="
                    aspect-square
                    bg-gray-100
                  "
                />

                <div className="p-2.5 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : mainCategory.type ===
          "spare-parts" ? (

          /* =================================================
             DYNAMIC SPEAKER MODELS
          ================================================= */

          visibleSpeakerModels.length ===
            0 ? (

            <div
              className="
                bg-white
                border
                border-gray-200
                rounded-xl
                py-12
                px-4
                text-center
                animate-[fadeIn_.25s_ease-out]
              "
            >
              <FaSearch
                className="
                  mx-auto
                  text-gray-300
                  text-xl
                  mb-2.5
                "
              />

              <p
                className="
                  text-xs
                  font-medium
                  text-gray-600
                "
              >
                No speaker models found
              </p>

              <p
                className="
                  text-[10px]
                  text-gray-400
                  mt-1
                "
              >
                Try another speaker model name
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    mt-3
                    px-3
                    py-1.5
                    rounded-lg
                    bg-blue-50
                    text-[10px]
                    font-medium
                    text-blue-600
                    hover:bg-blue-100
                    transition-colors
                  "
                >
                  Show all models
                </button>
              )}
            </div>

          ) : (

            <>
              <div
                className="
                  grid
                  grid-cols-2
                  sm:grid-cols-3
                  md:grid-cols-4
                  lg:grid-cols-6
                  xl:grid-cols-7
                  gap-2
                  sm:gap-3
                "
              >

                {renderedSpeakerModels.map(
                  (
                    item,
                    index
                  ) => {

                    const modelProduct =
                      item.product;

                    const modelName =
                      item.modelName;

                    const productCount =
                      item.productCount;

                    const uniqueId =
                      item.isManualTwister
                        ? "manual-twister"
                        : (
                          modelProduct?.id ??
                          modelProduct?.product_id ??
                          `${modelName}-${index}`
                        );

                    return (
                      <div
                        key={uniqueId}
                        onClick={() =>
                          handleSubCategoryClick(
                            {
                              modelName,
                              keyword:
                                modelName,
                            }
                          )
                        }
                        className="
                          group
                          bg-white
                          border
                          border-gray-200
                          rounded-xl
                          overflow-hidden
                          cursor-pointer
                          opacity-0
                          animate-[cardIn_.35s_ease-out_forwards]
                          hover:border-blue-300
                          hover:shadow-lg
                          hover:-translate-y-0.5
                          active:scale-[0.98]
                          transition-all
                          duration-200
                        "
                        style={{
                          animationDelay: `${Math.min(
                            index * 25,
                            250
                          )}ms`,
                        }}
                      >

                        {/* =================================
                            IMAGE
                        ================================= */}

                        <div
                          className="
                            relative
                            w-full
                            aspect-square
                            bg-gray-50
                            flex
                            items-center
                            justify-center
                            overflow-hidden
                          "
                        >
                          <img
                            // src={getProductImage(
                            //   modelProduct
                            // )}
                            src={getProductImage(
                              modelProduct,
                              item.isManualTwister
                            )}
                            alt={modelName}
                            loading="lazy"
                            decoding="async"
                            className="
                              w-full
                              h-full
                              object-contain
                              p-3
                              transition-transform
                              duration-300
                              group-hover:scale-105
                            "
                            onError={(e) => {
                              e.currentTarget.onerror =
                                null;

                              e.currentTarget.src =
                                makpower_image;
                            }}
                          />
                        </div>

                        {/* =================================
                            DETAILS
                            
                            IMPORTANT:
                            Quantity/count ONLY ONE PLACE
                        ================================= */}

                        <div
                          className="
                            px-2.5
                            py-2
                            border-t
                            border-gray-100
                          "
                        >

                          {/* MODEL NAME */}

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-1
                            "
                          >
                            <h2
                              className="
                                text-[11px]
                                sm:text-xs
                                font-semibold
                                text-gray-800
                                truncate
                              "
                            >
                              {modelName}
                            </h2>

                            <FaChevronRight
                              className="
                                text-[9px]
                                text-gray-400
                                flex-shrink-0
                                transition-transform
                                duration-200
                                group-hover:translate-x-0.5
                                group-hover:text-blue-500
                              "
                            />
                          </div>

                          {/* =================================
                              SPARE COUNT — ONLY HERE
                          ================================= */}

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-1
                              mt-1
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                gap-1
                                min-w-0
                              "
                            >
                              <FaBoxOpen
                                className="
                                  text-[9px]
                                  text-blue-400
                                  flex-shrink-0
                                "
                              />

                              <span
                                className="
                                  text-[9px]
                                  text-gray-500
                                  truncate
                                "
                              >
                                Spare Parts
                              </span>
                            </div>

                            <span
                              className="
                                flex-shrink-0
                                px-1.5
                                py-0.5
                                rounded-md
                                bg-blue-50
                                text-[9px]
                                font-semibold
                                text-blue-600
                              "
                            >
                              {productCount}{" "}
                              {productCount ===
                                1
                                ? "Item"
                                : "Items"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* =================================================
                  SCROLL LOAD SENTINEL
              ================================================= */}

              {visibleCount <
                visibleSpeakerModels.length && (
                  <div
                    ref={loadMoreRef}
                    className="
                    flex
                    items-center
                    justify-center
                    py-6
                  "
                  >
                    <div
                      className="
                      flex
                      items-center
                      gap-2
                      text-[10px]
                      text-gray-400
                    "
                    >
                      <span
                        className="
                        w-3
                        h-3
                        rounded-full
                        border-2
                        border-gray-300
                        border-t-blue-500
                        animate-spin
                      "
                      />

                      Loading more models...
                    </div>
                  </div>
                )}

              {/* =================================================
                  ALL LOADED
              ================================================= */}

              {visibleCount >=
                visibleSpeakerModels.length &&
                visibleSpeakerModels.length >
                INITIAL_VISIBLE && (
                  <div
                    className="
                    text-center
                    py-5
                    text-[10px]
                    text-gray-400
                  "
                  >
                    All {visibleSpeakerModels.length}{" "}
                    models loaded
                  </div>
                )}
            </>
          )

        ) : (

          /* =================================================
             EXISTING NORMAL CATEGORY FLOW
          ================================================= */

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-6
              xl:grid-cols-7
              gap-2
              sm:gap-3
            "
          >
            {mainCategory.subcategories.map(
              (sub, index) => {

                const keyword =
                  String(
                    sub.keyword || ""
                  ).toUpperCase();

                const product =
                  getProductForSub(
                    sub.label
                  );

                return (
                  <div
                    key={sub.label}
                    onClick={() =>
                      handleSubCategoryClick(
                        sub
                      )
                    }
                    className="
                      group
                      bg-white
                      border
                      border-gray-200
                      rounded-xl
                      overflow-hidden
                      cursor-pointer
                      opacity-0
                      animate-[cardIn_.35s_ease-out_forwards]
                      hover:border-blue-300
                      hover:shadow-lg
                      hover:-translate-y-0.5
                      active:scale-[0.98]
                      transition-all
                      duration-200
                    "
                    style={{
                      animationDelay: `${Math.min(
                        index * 25,
                        250
                      )}ms`,
                    }}
                  >

                    {/* IMAGE */}

                    <div
                      className="
                        w-full
                        aspect-square
                        bg-gray-50
                        flex
                        items-center
                        justify-center
                        overflow-hidden
                      "
                    >
                      <img
                        src={
                          sub.image ||
                          makpower_image
                        }
                        alt={sub.label}
                        loading="lazy"
                        decoding="async"
                        className="
                          w-full
                          h-full
                          object-contain
                          p-3
                          transition-transform
                          duration-300
                          group-hover:scale-105
                        "
                        onError={(e) => {
                          e.currentTarget.onerror =
                            null;

                          e.currentTarget.src =
                            makpower_image;
                        }}
                      />
                    </div>

                    {/* DETAILS */}

                    <div
                      className="
                        px-2.5
                        py-2
                        border-t
                        border-gray-100
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-1
                        "
                      >
                        <h2
                          className="
                            text-[11px]
                            sm:text-xs
                            font-semibold
                            text-gray-800
                            truncate
                          "
                        >
                          {sub.label}
                        </h2>

                        <FaChevronRight
                          className="
                            text-[9px]
                            text-gray-400
                            flex-shrink-0
                            transition-transform
                            duration-200
                            group-hover:translate-x-0.5
                            group-hover:text-blue-500
                          "
                        />
                      </div>

                      {product && (
                        <div
                          className="
                            text-[10px]
                            text-gray-500
                            mt-1
                          "
                        >
                          ₹ {product.price}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>
        {`
          @keyframes cardIn {
            from {
              opacity: 0;
              transform: translateY(8px) scale(.985);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(4px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </div>
  );
}