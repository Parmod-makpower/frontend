import { useMemo } from "react";
import Fuse from "fuse.js";

export default function useFuseSearch(data, searchTerm, options = {}) {
  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: ["product_name"], // Default keys
      threshold: 0.3,
      ...options,
    });
  }, [data, options]);

  const results = useMemo(() => {
    return searchTerm ? fuse.search(searchTerm).map((r) => r.item) : [];
  }, [fuse, searchTerm]);

  return results;
}
