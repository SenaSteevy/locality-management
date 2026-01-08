"use client"

import { useEffect, useMemo, useState } from "react"
import { LocalitiesToolbar } from "./LocalitiesToolbar"
import { LocalitiesTable } from "./LocalitiesTable"
import { LocalitiesPagination } from "./LocalitiesPagination"
import { Locality } from "@/types/locality"
import { createLocalityObject, formatLocalities } from "@/lib/locality-utils"
import { Button } from "../ui/button"
import { CheckCircle, RotateCcw } from "lucide-react"
import { ConfirmationDialog } from "../ui/confirmDialog"
import { EditableFields } from "@/types/FormattedLocality"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { motion, AnimatePresence } from "framer-motion";
import { OverviewStats } from "./OverviewStats"

interface LocalitiesTableContainerProps {
  filterType?: 1 | 2 | 3; // Optional filter by locality type
}

export const LocalitiesTableContainer = ({ filterType }: LocalitiesTableContainerProps) => {
  const [rawData, setRawData] = useState<Locality[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selected, setSelected] = useState<number[]>([])

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isSingleDeleteModalOpen, setIsSingleDeleteModalOpen] = useState(false)
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null)
  const [isSingleDeleting, setIsSingleDeleting] = useState(false)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const showSuccessAlert = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 3500)
  }

  // 1. Logic to filter raw data based on the page type
  const displayData = useMemo(() => {
    if (!filterType) return rawData;
    return rawData.filter(item => item.RegionStructureTypeId === filterType);
  }, [rawData, filterType]);

  const handleAddLocality = async (
    type: number,
    payload: { name: string; code: string; parentId?: number | null }
  ) => {
    setLoading(true);
    setError(null);

    try {

      const newLocality = createLocalityObject(
        type,
        payload.name,
        payload.parentId ?? null,
        payload.code,
        payload.code // Using code as CodeNumber for simplicity
      );

      const res = await fetch("/api/localities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocality),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create locality");
      }

      showSuccessAlert(`${payload.name} created successfully.`);
      setRefreshKey(prev => prev + 1); // This triggers your useEffect to re-fetch data
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred while adding.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocality = async (id: number, updatedData: any) => {

    const originalLocality = rawData.find(l => l.Id === id);

    if (!originalLocality) {
      setError("Could not find the original locality to update.");
      return;
    }
    
    try {
      const res = await fetch(`/api/localities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const status = res.status;
        let errorMessage = `Update failed (HTTP ${status}).`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message ? `Error ${status}: ${errorData.message}` : errorMessage;
        } catch { /* Fallback */ }
        throw new Error(errorMessage);
      }

      // Success: Trigger data refresh to update the table immediately
      showSuccessAlert(`${updatedData.Name} updated successfully.`);
      setRefreshKey(prev => prev + 1);

    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred during saving the locality.");
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Single Delete Handlers ---
  const handleSingleDelete = (id: number) => {
    setItemToDeleteId(id);
    setIsSingleDeleteModalOpen(true);
  }

  const confirmSingleDelete = async () => {
    if (itemToDeleteId === null) return;

    setIsSingleDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/localities/${itemToDeleteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const status = res.status;
        let errorMessage = `Single deletion failed (HTTP ${status}).`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message ? `Error ${status}: ${errorData.message}` : errorMessage;
        } catch { /* Fallback */ }
        throw new Error(errorMessage);
      }

      // Success
      showSuccessAlert(`Deletion of ${itemToDeleteName} successful.`);
      setIsSingleDeleteModalOpen(false); // Close dialog
      // Remove the deleted ID from the selected list if it was selected
      setSelected(prev => prev.filter(id => id !== itemToDeleteId));
      setItemToDeleteId(null);
      setRefreshKey(prev => prev + 1); // Trigger data refresh

    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred during single deletion.");
    } finally {
      setIsSingleDeleting(false);
    }
  };

  // Find the name of the item being deleted for the dialog message
  const itemToDeleteName = useMemo(() => {
    if (itemToDeleteId === null) return 'this locality';
    const item = rawData.find(l => l.Id === itemToDeleteId);
    return item ? `${item.Name} (${item.Code})` : 'this locality';
  }, [itemToDeleteId, rawData]);

  // Handler containing the actual DELETE API call
  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/localities/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });

      if (!res.ok) {
        const status = res.status;
        let errorMessage = `Bulk deletion failed (HTTP ${status}).`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message ? `Error ${status}: ${errorData.message}` : errorMessage;
        } catch {
          // Fallback
        }
        throw new Error(errorMessage);
      }

      // Success
      setIsBulkDeleteModalOpen(false);
      setSelected([]);
      setRefreshKey(prev => prev + 1);

    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred during bulk deletion.");
    } finally {
      setIsDeleting(false);
      setIsBulkDeleteModalOpen(false);

    }
  };

  const handleBulkDelete = () => {
    if (selected.length > 0) {
      setIsBulkDeleteModalOpen(true)
    }
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null) // Clear previous errors
      const res = await fetch("/api/localities")

      if (!res.ok) {
        const status = res.status;
        let errorMessage = `API Request Failed (HTTP ${status}).`;

        try {
          const errorData = await res.json();

          if (status === 500) {
            errorMessage = `Server Error (500): Could not connect to the database or retrieve data.`;
          } else if (status === 400) {
            errorMessage = `Bad Request (400): ${errorData.message || 'Invalid parameters supplied.'}`;
          } else if (errorData.message) {
            errorMessage = `Error ${status}: ${errorData.message}`;
          }
        } catch {
          errorMessage = `API Request Failed (HTTP ${status}). Check server logs.`;
        }
        throw new Error(errorMessage);
      }

      const json: Locality[] = await res.json()
      setRawData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred during loading.")
    }
    finally {
      setLoading(false)
    }
  }
  // Fetch raw data ONCE
  useEffect(() => {
    fetchAll()
  }, [])

  // Effect to trigger data fetching
  useEffect(() => {
    fetchAll()
  }, [refreshKey])

  // Handler to force a refresh/retry
  const handleRetry = () => {
    setRefreshKey((prev) => prev + 1)
  }

  type SortKey = "City" | "Department" | "Region" | "Code";
  type SortDirection = "asc" | "desc";
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({
    key: "Code",
    direction: "asc",
  });

  // 1. Format the raw database objects into flat table rows
  const formatted = useMemo(
    () => formatLocalities(displayData),
    [rawData]
  );

  // 2. Filter based on the search input
  const filtered = useMemo(() => {
    if (!search) return formatted;
    const q = search.toLowerCase();
    return formatted.filter(
      (l) =>
        l.City.toLowerCase().includes(q) ||
        l.Department.toLowerCase().includes(q) ||
        l.Region.toLowerCase().includes(q) ||
        l.Code.includes(q)
    );
  }, [formatted, search]);

  // 3. Sort the entire filtered list before cutting it into pages
  const sorted = useMemo(() => {
    if (!sortConfig) return filtered;

    return [...filtered].sort((a, b) => {
      const aValue = (a[sortConfig.key] || "").toString().toLowerCase();
      const bValue = (b[sortConfig.key] || "").toString().toLowerCase();

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortConfig]);

  // 4. Finally, paginate the sorted results
  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return sorted.slice(start, start + limit);
  }, [sorted, page, limit]);

  // Reset to page 1 when searching or changing page size
  useEffect(() => setPage(1), [search, limit]);

  return (
    <div>
      {successMessage && (
        <AnimatePresence>
          {successMessage && (
            <motion.div
              key="success-alert" // Key is REQUIRED for AnimatePresence to track the component
              initial={{ opacity: 0, y: 50, scale: 0.9 }} // Start slightly invisible, lower, and smaller
              animate={{ opacity: 1, y: 0, scale: 1 }}     // Fade in and move to final position
              exit={{ opacity: 0, y: 50, scale: 0.9 }}      // Fade out and move away
              transition={{ duration: 0.3 }} // Animation speed

              // The Alert component itself remains positioned
              className="fixed bottom-4 right-4 z-50 w-auto min-w-75"
            >
              <Alert
                className="w-full border-green-500 bg-green-50"
                variant="default"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  {successMessage}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {error && (
        <div className="flex justify-between mb-4 p-4 border border-red-300 bg-red-50 text-red-700 rounded">
          <span>{error}</span>
          <Button variant="outline" className="hover:cursor-pointer" onClick={handleRetry} > <RotateCcw />Refresh</Button>
        </div>
      )}

      <LocalitiesToolbar
        search={search}
        selectedCount={selected.length}
        onSearchChange={setSearch}
        onBulkDelete={handleBulkDelete}
        rawData={rawData}
        onAdd={handleAddLocality}
        onRefresh={() => setRefreshKey(prev => prev + 1)}
      />

      <LocalitiesTable
        rawData={rawData}
        data={paginated}
        loading={loading}
        selected={selected}
        sortConfig={sortConfig}
        onSort={(key) => {
          setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc"
          }));
        }}
        onSelectChange={setSelected}
        onSingleDelete={handleSingleDelete}
        onSaveEdit={handleSaveLocality} />

      <LocalitiesPagination
        total={filtered.length}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <OverviewStats rawData={displayData} />

      <ConfirmationDialog
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}

        // Props specific to bulk delete action
        title="Confirm Bulk Deletion"
        description={
          <>
            You are about to permanently delete
            <span className="font-bold text-red-400"> {selected.length} </span>
            selected localities. This action cannot be undone. Please confirm to proceed.
          </>
        }
        onConfirm={confirmBulkDelete}
        isPending={isDeleting}
        confirmText={`Delete ${selected.length} Items`}
        confirmVariant="destructive"
      />

      <ConfirmationDialog
        open={isSingleDeleteModalOpen}
        onOpenChange={setIsSingleDeleteModalOpen}
        title="Confirm Locality Deletion"
        description={
          <>
            Are you sure you want to permanently delete
            <span className="font-bold text-red-400"> {itemToDeleteName}</span>?
            This action cannot be undone.
          </>
        }
        onConfirm={confirmSingleDelete}
        isPending={isSingleDeleting}
        confirmText="Delete Locality"
        confirmVariant="destructive"
      />

    </div>
  )
}
