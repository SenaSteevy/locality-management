
import { Button } from "@/components/ui/button" // Assuming this is available
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

// Interface for type safety (optional, but recommended)
interface LocalitiesPaginationProps {
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export const LocalitiesPagination = ({
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: LocalitiesPaginationProps) => {
  const totalPages = Math.ceil(total / limit)

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-between items-center mt-4">
      {/* Limit Selection */}
      <select
        value={limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className="border px-2 py-1 rounded text-sm"
      >
        {[10, 20, 50, 100].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      {/* Pagination Controls */}
      <div className="flex gap-1 items-center">
        {/* 1. Go to First Page */}
        <Button
          variant="outline"
          size="icon"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* 2. Go to Previous Page */}
        <Button
          variant="outline"
          size="icon"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 3. Current Page Status */}
        <span className="px-3 text-sm font-medium">
          Page {page} of {totalPages}
        </span>

        {/* 4. Go to Next Page */}
        <Button
          variant="outline"
          size="icon"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* 5. Go to Last Page */}
        <Button
          variant="outline"
          size="icon"
          disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}