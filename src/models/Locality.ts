import mongoose from 'mongoose';


export interface ILocality extends mongoose.Document {
ChildrenRegionStructures: any | null;
Code: string;
CodeNumber: string;
CreatedBy: any | null;
CreatedDate: Date;
Deleted: boolean;
Id: number;
IsDeletablePermanently: boolean;
ModifiedBy: any | null;
ModifiedDate: Date;
Name: string;
NistCode: string | null;
ParentRegionStructure: any | null;
ParentRegionStructureId: number | null;
RegionStructureType: any | null;
RegionStructureTypeId: number;
Translations: any[];
}


const LocalitySchema = new mongoose.Schema<ILocality>({
ChildrenRegionStructures: { type: mongoose.Schema.Types.Mixed, default: null },
Code: { type: String, required: true, unique: true },
CodeNumber: { type: String, required: true, unique: true },
CreatedBy: { type: mongoose.Schema.Types.Mixed, default: null },
CreatedDate: { type: Date, default: new Date('0001-01-01T00:00:00') },
Deleted: { type: Boolean, default: false },
Id: { type: Number, required: true, unique: true },
IsDeletablePermanently: { type: Boolean, default: false },
ModifiedBy: { type: mongoose.Schema.Types.Mixed, default: null },
ModifiedDate: { type: Date, default: new Date('0001-01-01T00:00:00') },
Name: { type: String, required: true },
NistCode: { type: String, default: null },
ParentRegionStructure: { type: mongoose.Schema.Types.Mixed, default: null },
ParentRegionStructureId: { type: Number, default: null },
RegionStructureType: { type: mongoose.Schema.Types.Mixed, default: null },
RegionStructureTypeId: { type: Number, default: 3 },
Translations: { type: mongoose.Schema.Types.Mixed, default: [] }
});


export default mongoose.models.Locality || mongoose.model<ILocality>('Locality', LocalitySchema);