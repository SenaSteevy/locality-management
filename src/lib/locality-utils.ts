
import { FormattedLocality } from "@/types/FormattedLocality";
import { Locality } from "@/types/locality"

export function formatLocalities(
   data: Locality[]
): FormattedLocality[] {

   // 1. Index all localities by ID
   const byId = new Map<number, Locality>()
   data.forEach((l) => byId.set(l.Id, l))

  // Helper function to find the Region parent (Type 1) of any locality
  const findRegionParent = (locality: Locality | undefined | null): Locality | null => {
      if (!locality || !locality.ParentRegionStructureId) return null;
      
      let current = locality;
      // Traverse up the hierarchy until Type 1 (Region) is found or no parent exists
      while (current.ParentRegionStructureId) {
          const parent = byId.get(current.ParentRegionStructureId);
          if (!parent) return null; // Parent not found in data
          
          if (parent.RegionStructureTypeId === 1) {
              return parent; // Found the Region
          }
          current = parent; // Move up to the next level (e.g., Department)
      }
      return null;
  }
  
  // Helper function to find the Department parent (Type 2) of a City (Type 3)
  const findDepartmentParent = (locality: Locality | undefined | null): Locality | null => {
      if (!locality || !locality.ParentRegionStructureId) return null;

      const parent = byId.get(locality.ParentRegionStructureId);

      // If the parent exists and is a Department (Type 2), return it.
      if (parent?.RegionStructureTypeId === 2) {
          return parent;
      }
      
      return null;
  }
  
   return data.map((locality) => {
      const type = locality.RegionStructureTypeId;
      
      let regionName = '--';
      let departmentName = '--';
      let cityName = '--';

      // --- 1. Resolve Region Name (Type 1) ---
      if (type === 1) {
          regionName = locality.Name; // It is the Region
      } else {
          const region = findRegionParent(locality);
          regionName = region?.Name ?? '--';
      }

      // --- 2. Resolve Department Name (Type 2) ---
      if (type === 2) {
          departmentName = locality.Name; // It is the Department
      } else if (type === 3) {
          const department = findDepartmentParent(locality);
          departmentName = department?.Name ?? '--';
      }
      // Note: Regions (Type 1) will correctly keep departmentName as '--'

      // --- 3. Resolve City Name (Type 3) ---
      if (type === 3) {
          cityName = locality.Name; // It is the City
      }

      return {
        Id: locality.Id,
        Code: locality.Code,
        City: cityName,
        Department: departmentName,
        Region: regionName,
        typeId: type
    }
     })
    // Optional sorting for display (1=Region, 2=Department, 3=City)
    .sort((a, b) => {
        const aType = data.find(l => l.Id === a.Id)?.RegionStructureTypeId || 4;
        const bType = data.find(l => l.Id === b.Id)?.RegionStructureTypeId || 4;
        
        if (aType !== bType) {
            return aType - bType; // Sorts 1, 2, then 3
        }
        return a.Code.localeCompare(b.Code); 
    });
}

// Get all Regions (Type 1)
export const getRegionList = (data: Locality[]) => 
  data.filter(l => l.RegionStructureTypeId === 1);

// Get Departments (Type 2). Optionally filter by a specific Region ID.
export const getDeptList = (data: Locality[], regionId?: number | null) => {
  const depts = data.filter(l => l.RegionStructureTypeId === 2);
  if (regionId) {
    return depts.filter(d => d.ParentRegionStructureId === regionId);
  }
  return depts;
};

// Get Cities (Type 3). Optionally filter by a specific Department ID.
export const getCityList = (data: Locality[], deptId?: number | null) => {
  const cities = data.filter(l => l.RegionStructureTypeId === 3);
  if (deptId) {
    return cities.filter(c => c.ParentRegionStructureId === deptId);
  }
  return cities;
};

// Find the parent Department of a City
export const findDeptByCity = (data: Locality[], cityId: number) => {
  const city = data.find(l => l.Id === cityId);
  if (!city || !city.ParentRegionStructureId) return null;
  return data.find(l => l.Id === city.ParentRegionStructureId) || null;
};

// Find the parent Region of a Department
export const findRegionByDept = (data: Locality[], deptId: number) => {
  const dept = data.find(l => l.Id === deptId);
  if (!dept || !dept.ParentRegionStructureId) return null;
  return data.find(l => l.Id === dept.ParentRegionStructureId) || null;
};

export const getNextCode = (data: Locality[]): string => {
  if (!data || data.length === 0) return "1";

  const numericCodes = data
    .map((l) => parseInt(l.Code))
    .filter((code) => !isNaN(code));

  if (numericCodes.length === 0) return "1";

  const maxCode = Math.max(...numericCodes);
  return (maxCode + 1).toString();
};

export const getNextCodeNumber = (data: Locality[]): string => {
  if (!data || data.length === 0) return "1";

  const numericCodes = data
    .map((l) => parseInt(l.CodeNumber))
    .filter((codeNumber) => !isNaN(codeNumber));

  if (numericCodes.length === 0) return "1";

  const maxCode = Math.max(...numericCodes);
  return (maxCode + 1).toString();
};

export const createLocalityObject = (
  typeId: number,
  name: string,
  parentId: number | null,
  nextCode: string,
  nextCodeNumber : string
): Locality => {

  return {
    Id: parseInt(nextCode, 10),
    Code: nextCode,
    CodeNumber: nextCodeNumber,
    Name: name.toUpperCase().trim(),
    ParentRegionStructureId: parentId,
    RegionStructureTypeId: typeId,
    ChildrenRegionStructures: null,
    CreatedBy: null,
    CreatedDate: "0001-01-01T00:00:00",
    Deleted: false,
    IsDeletablePermanently: false,
    ModifiedBy: null,
    ModifiedDate: "0001-01-01T00:00:00",
    NistCode: nextCodeNumber, // Assuming NistCode is same as CodeNumber
    ParentRegionStructure: null,
    RegionStructureType: null,
    Translations: []
  };
};