"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, ArrowUpDown, Edit, Loader2, MoreVertical, Save, Trash2, X } from "lucide-react"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar"
import { useMemo, useState } from "react"
import { FormattedLocality } from "@/types/FormattedLocality"
import { Locality } from "@/types/locality"
import { getDeptList, getRegionList, findDeptByCity, findRegionByDept, createLocalityObject } from "@/lib/locality-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"

interface LocalitiesTableProps {
  data: FormattedLocality[];
  rawData: Locality[];
  loading: boolean;
  selected: number[];
  sortConfig: { key: SortKey; direction: SortDirection } | null;
  onSort: (key: SortKey) => void;
  onSelectChange: (newSelection: number[]) => void;
  onSingleDelete: (id: number) => void;
  onSaveEdit: (id: number, updatedData: any) => void;
}

type SortKey = "City" | "Department" | "Region" | "Code";
type SortDirection = "asc" | "desc";

interface EditState {
  id: number;
  type: number; // 1: Region, 2: Dept, 3: City
  regionId: string;
  deptId: string;
  nameValue: string; // Harmonized name
}

export const LocalitiesTable = ({
  data,
  rawData,
  loading,
  selected,
  sortConfig,
  onSort,
  onSelectChange,
  onSingleDelete,
  onSaveEdit,
}: LocalitiesTableProps) => {

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);

  const regions = useMemo(() => getRegionList(rawData), [rawData]);


  const departments = useMemo(() => {
    return editState?.regionId ? getDeptList(rawData, Number(editState.regionId)) : [];
  }, [editState?.regionId, rawData]);
  
  const getSortIcon = (key: SortKey) => {
    if (sortConfig?.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc' ?
      <ArrowUp className="ml-2 h-4 w-4 text-primary" /> :
      <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const handleEdit = (row: FormattedLocality) => {
    const rawItem = rawData.find(r => r.Id === row.Id);
    if (!rawItem) return;

    const type = rawItem.RegionStructureTypeId;
    let regionId = "";
    let deptId = "";

    if (type === 2) {
      const parentReg = findRegionByDept(rawData, rawItem.Id);
      regionId = parentReg?.Id.toString() || "";
    } else if (type === 3) {
      const parentDept = findDeptByCity(rawData, rawItem.Id);
      deptId = parentDept?.Id.toString() || "";
      const parentReg = parentDept ? findRegionByDept(rawData, parentDept.Id) : null;
      regionId = parentReg?.Id.toString() || "";
    }

    setEditingId(row.Id);
    setEditState({
      id: row.Id,
      type,
      regionId,
      deptId,
      nameValue: rawItem.Name // Use nameValue consistently
    });
  };

  const handleSave = () => {
    if (!editState) return;

    // Find the original raw item to preserve Code and CodeNumber
    const originalItem = rawData.find(r => r.Id === editState.id);
    if (!originalItem) return;

    // Determine the Parent ID
    // Type 1 (Region): null
    // Type 2 (Dept): Region ID
    // Type 3 (City): Dept ID
    let parentId: number | null = null;
    if (editState.type === 2) {
      parentId = editState.regionId ? Number(editState.regionId) : null;
    } else if (editState.type === 3) {
      parentId = editState.deptId ? Number(editState.deptId) : null;
    }

    // Use the utility to create a complete Locality object
    const updatedLocality = createLocalityObject(
      editState.type,
      editState.nameValue,
      parentId,
      originalItem.Code,
      originalItem.CodeNumber
    );

    // Explicitly ensure the ID remains consistent with the one being edited
    const finalPayload = {
      ...updatedLocality,
      Id: editState.id
    };

    console.log("PUT Request Body:", finalPayload);

    // Trigger the save handler
    onSaveEdit(editState.id, finalPayload);

    // Reset state
    setEditingId(null);
    setEditState(null);
  };

  // Selection Logic
  const allIdsToSelect = data.map((l: any) => l.Id);
  const allSelected = allIdsToSelect.length > 0 && allIdsToSelect.every((id: number) => selected.includes(id));
  const someSelected = allIdsToSelect.some((id: number) => selected.includes(id)) && !allSelected;

  const toggle = (id: number) => {
    onSelectChange(
      selected.includes(id)
        ? selected.filter((i: number) => i !== id)
        : [...selected, id]
    )
  }

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const newSelection = Array.from(new Set([...selected, ...allIdsToSelect]));
      onSelectChange(newSelection);
    } else {
      const newSelection = selected.filter((id: number) => !allIdsToSelect.includes(id));
      onSelectChange(newSelection);
    }
  };

  const getTypeBadge = (typeId: number) => {
    switch (typeId) {
      case 1:
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">REGION</span>;
      case 2:
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">DEPT</span>;
      case 3:
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">CITY</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">UNKNOWN</span>;
    }
  };

  if (loading) return <div className="flex items-center justify-center p-6"><Loader2 className="mr-2 animate-spin" /> Loading...</div>;
  if (!data.length) return <div className="p-10 text-center border rounded-lg">No results found</div>;

  return (
    <div className="border rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12.5">
              <Checkbox checked={allSelected ? true : someSelected ? 'indeterminate' : false} onCheckedChange={handleToggleAll} />
            </TableHead>
            <TableHead className="w-32">
              <div className="flex items-center">Type</div>
            </TableHead>
            <TableHead onClick={() => onSort('Code')} className="cursor-pointer">
              <div className="flex items-center">Code {getSortIcon('Code')}</div>
            </TableHead>
            <TableHead onClick={() => onSort('Region')} className="cursor-pointer">
              <div className="flex items-center">Region {getSortIcon('Region')}</div>
            </TableHead>
            <TableHead onClick={() => onSort('Department')} className="cursor-pointer">
              <div className="flex items-center">Department {getSortIcon('Department')}</div>
            </TableHead>
            <TableHead onClick={() => onSort('City')} className="cursor-pointer">
              <div className="flex items-center">City {getSortIcon('City')}</div>
            </TableHead>
            <TableHead className="w-25"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row: FormattedLocality) => {
            const isEditing = row.Id === editingId;
            // Narrowing type: if isEditing is true AND editState is not null
            const activeEdit = isEditing && editState ? editState : null;

            return (
              <TableRow key={row.Id}>
                <TableCell>
                  <Checkbox className="hover:cursor-pointer" checked={selected.includes(row.Id)} onCheckedChange={() => toggle(row.Id)} disabled={isEditing} />
                </TableCell>
                {/* TYPE COLUMN */}
                <TableCell>
                  {getTypeBadge(row.typeId)}
                </TableCell>

                {/* CODE COLUMN */}
                <TableCell className="font-medium">{row.Code}</TableCell>


                {/* REGION COLUMN */}
                <TableCell>
                  {activeEdit ? (
                    activeEdit.type === 1 ? (
                      <Input
                        className="h-8 text-xs"
                        value={activeEdit.nameValue}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setEditState(prev => prev ? { ...prev, nameValue: newVal } : null);
                        }}
                      />
                    ) : (
                      <Select value={activeEdit.regionId} onValueChange={(v) => setEditState({ ...activeEdit, regionId: v, deptId: "" })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Region" /></SelectTrigger>
                        <SelectContent>
                          {regions.map(r => <SelectItem key={r.Id} value={r.Id.toString()}>{r.Name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )
                  ) : row.Region}
                </TableCell>

                {/* DEPARTMENT COLUMN */}
                <TableCell>
                  {activeEdit ? (
                    activeEdit.type === 2 ? (
                      <Input
                        className="h-8 text-xs"
                        value={activeEdit.nameValue}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setEditState(prev => prev ? { ...prev, nameValue: newVal } : null);
                        }}
                      />
                    ) : activeEdit.type === 3 ? (
                      <Select value={activeEdit.deptId} disabled={!activeEdit.regionId} onValueChange={(v) => setEditState({ ...activeEdit, deptId: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Dept" /></SelectTrigger>
                        <SelectContent>
                          {departments.length > 0 ? (
                            departments.map(d => <SelectItem key={d.Id} value={d.Id.toString()}>{d.Name}</SelectItem>)
                          ) : (
                            <SelectItem value="none" disabled>No Depts Found</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : null
                  ) : row.Department}
                </TableCell>

                {/* CITY COLUMN */}
                <TableCell>
                  {activeEdit ? (
                    activeEdit.type === 3 ? (
                      <Input
                        className="h-8 text-xs"
                        value={activeEdit.nameValue}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setEditState(prev => prev ? { ...prev, nameValue: newVal } : null);
                        }}
                      />
                    ) : null
                  ) : row.City}
                </TableCell>

                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setEditingId(null); setEditState(null); }}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button className="bg-blue-500 h-8 w-8 text-white" size="icon" onClick={handleSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Menubar className="h-8 w-8 p-0 border-none bg-transparent">
                      <MenubarMenu>
                        <MenubarTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:cursor-pointer"><MoreVertical className="h-4 w-4" /></Button>
                        </MenubarTrigger>
                        <MenubarContent align="end">
                          <MenubarItem onClick={() => handleEdit(row)}><Edit className="mr-2 h-4 w-4" /> Edit</MenubarItem>
                          <MenubarItem onClick={() => onSingleDelete(row.Id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</MenubarItem>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  )
}