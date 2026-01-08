import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileUp, Import, Plus, Search, Trash } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { AddLocalityPopover } from "./AddLocalityPopOver"
import { ImportLocalityPopover } from "./ImportLocalityPopover"
import { Locality } from "@/types/locality"
import { useState } from "react"

interface Props {
  search: string
  selectedCount: number
  rawData: Locality[];
  onAdd: (type: number, data: any) => Promise<void>;
  onSearchChange: (v: string) => void
  onBulkDelete: () => void
  onRefresh: () => void 
}

export const LocalitiesToolbar = ({
  search,
  selectedCount,
  rawData,
  onSearchChange,
  onBulkDelete,
  onAdd,
  onRefresh
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = () => {
    if (rawData.length === 0) return;

    // 1. Clean the data by omitting MongoDB internal fields
    const cleanedData = rawData.map(({ _id, __v, ...rest }: any) => rest);

    // 2. Convert the cleaned array to a formatted JSON string
    const jsonString = JSON.stringify(cleanedData, null, 2);

    // 3. Create a Blob with the JSON data
    const blob = new Blob([jsonString], { type: "application/json" });

    // 4. Create a temporary anchor element to trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `localities_export_${timestamp}.json`;

    // 5. Trigger download and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
      <div className="flex gap-2">
        <div className="relative flex items-center">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search localities..."
            className="pr-10 w-64" />
          <Search className="absolute right-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>

        {selectedCount > 0 && (
          <Button variant="outline" className="text-red-700 hover:text-red-700 border-red-200 bg-red-50 hover:cursor-pointer" onClick={onBulkDelete}>
            <Trash className="h-4 w-4 mr-2" /> Delete ({selectedCount})
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {/* Import Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="hover:cursor-pointer">
              <Import className="h-4 w-4 mr-2" /> Import
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
             <ImportLocalityPopover rawData={rawData} onImportComplete={onRefresh} onClose={() => setIsOpen(false)}/>
          </PopoverContent>
        </Popover>

        <Button 
          variant="outline" 
          className="hover:cursor-pointer" 
          onClick={handleExport}
          disabled={rawData.length === 0}
        >
          <FileUp className="h-4 w-4 mr-2" /> Export
        </Button>

        {/* Add Locality Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button className="hover:cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> Add New
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <AddLocalityPopover rawData={rawData} onAdd={onAdd} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}