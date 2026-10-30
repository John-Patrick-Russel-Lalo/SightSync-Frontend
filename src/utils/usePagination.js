import { useState } from "react";

export function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageItems = items.slice(startIndex, endIndex);

  return {
    page: currentPage,
    pageCount,
    pageItems,
    startIndex,
    endIndex,
    total,
    setPage,
    reset: () => setPage(1),
  };
}
