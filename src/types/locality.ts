export interface Locality {
  Id: number
  Code: string
  CodeNumber: string
  Name: string
  RegionStructureTypeId: number // 1=Region, 2=Department, 3=City
  ParentRegionStructureId: number | null
  ChildrenRegionStructures: null,
  CreatedBy: null,
  CreatedDate: "0001-01-01T00:00:00",
  Deleted: false,
  IsDeletablePermanently: false,
  ModifiedBy: null,
  ModifiedDate: "0001-01-01T00:00:00",
  NistCode: string | null,
  ParentRegionStructure: null,
  RegionStructureType: null,
  Translations: []
}
