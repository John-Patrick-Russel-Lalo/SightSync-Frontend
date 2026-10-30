import { ChevronLeft, ChevronRight } from "lucide-react";

function buildPages(page, pageCount) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) pages.push("left-ellipsis");
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < pageCount - 1) pages.push("right-ellipsis");
  pages.push(pageCount);

  return pages;
}

export default function Pagination({
  page,
  pageCount,
  total,
  startIndex,
  endIndex,
  onPageChange,
  itemLabel = "items",
  className = "",
}) {
  if (total === 0) return null;

  const pages = buildPages(page, pageCount);
  const baseButton =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      className={`flex flex-col gap-3 border-t border-[#EBE3D8] bg-[#FAF7F2]/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="text-xs font-medium text-[#8B7562]">
        Showing <span className="text-[#3D2E28]">{startIndex + 1}–{endIndex}</span> of{" "}
        <span className="text-[#3D2E28]">{total}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`${baseButton} border-[#DCD0C0] bg-white text-[#5B4B41] hover:bg-[#F2EAE1]`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((entry) =>
          typeof entry === "number" ? (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={`${baseButton} ${
                entry === page
                  ? "border-[#8B1E42] bg-[#8B1E42] text-white"
                  : "border-[#DCD0C0] bg-white text-[#5B4B41] hover:bg-[#F2EAE1]"
              }`}
            >
              {entry}
            </button>
          ) : (
            <span key={entry} className="px-1 text-sm text-[#8B7562]">
              …
            </span>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className={`${baseButton} border-[#DCD0C0] bg-white text-[#5B4B41] hover:bg-[#F2EAE1]`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
