import { useMemo } from "react";
import Fuse from "fuse.js";
import { useDebounce } from "./useDebounce"; // नया helper hook

export default function useFuseSearch(data, searchTerm, options = {}) {
  const debouncedTerm = useDebounce(searchTerm, 200); // 200ms delay

  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: ["product_name", "sub_category", "sale_names"],
      threshold: 0.3,
      ...options,
    });
  }, [data, options]);

  const results = useMemo(() => {
    return debouncedTerm
      ? fuse.search(debouncedTerm).map((r) => r.item)
      : [];
  }, [fuse, debouncedTerm]);

  return results;
}
