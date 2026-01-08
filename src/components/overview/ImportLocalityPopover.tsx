"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, Upload, AlertTriangle, ArrowRight } from "lucide-react"
import { Locality } from "@/types/locality"

interface ImportProps {
    rawData: Locality[];
    onImportComplete?: () => void;
    onClose?: () => void;
}

export function ImportLocalityPopover({ rawData, onImportComplete, onClose }: ImportProps) {
    const [file, setFile] = useState<File | null>(null);
    const [conflicts, setConflicts] = useState<{ old: Locality, new: any }[]>([]);
    const [pureNewData, setPureNewData] = useState<any[]>([]);
    const [step, setStep] = useState<'upload' | 'confirm' | 'resolving' | 'processing'>('upload');
    const [conflictIndex, setConflictIndex] = useState(0);
    const [resolvedData, setResolvedData] = useState<any[]>([]);

    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setStep('upload');
            setStatus('idle');
            setErrorMessage("");
        }
    };

    const handleUpdateAll = () => {
        // Take all the 'new' objects from the conflicts array
        const allResolvedConflicts = conflicts.map(c => c.new);
        // Combine them with the items that had no conflicts
        performFinalImport([...pureNewData, ...allResolvedConflicts]);
    };

    // Analyze file for conflicts by matching on Id or Code
    const analyzeFile = async () => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const jsonData = JSON.parse(e.target?.result as string);
                if (!Array.isArray(jsonData)) throw new Error("File must be a JSON array.");

                const foundConflicts: { old: Locality, new: any }[] = [];
                const newItems: any[] = [];

                jsonData.forEach((incoming: any) => {
                    const existing = rawData.find(r => r.Id === incoming.Id || r.Code === incoming.Code);
                    if (existing) {
                        foundConflicts.push({ old: existing, new: incoming });
                    } else {
                        newItems.push(incoming);
                    }
                });

                setConflicts(foundConflicts);
                setPureNewData(newItems);
                setStep(foundConflicts.length > 0 ? 'confirm' : 'processing');
                if (foundConflicts.length === 0) performFinalImport(newItems);

            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.message);
            }
        };
        reader.readAsText(file);
    };

    const resolveConflict = (decision: 'keep-old' | 'use-new') => {
        const currentConflict = conflicts[conflictIndex].new;
        const updatedResolved = [...resolvedData];

        if (decision === 'use-new') {
            updatedResolved.push(currentConflict);
        }

        if (conflictIndex < conflicts.length - 1) {
            setResolvedData(updatedResolved);
            setConflictIndex(prev => prev + 1);
        } else {
            // Last conflict resolved, move to final import
            performFinalImport([...pureNewData, ...updatedResolved]);
        }
    };

    const performFinalImport = async (dataToImport: any[]) => {
        setStep('processing');
        setStatus('uploading');
        const batchSize = 100;
        const total = dataToImport.length;

        try {
            for (let i = 0; i < total; i += batchSize) {
                const batch = dataToImport.slice(i, i + batchSize);
                const res = await fetch("/api/localities/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(batch),
                });

                if (!res.ok) {
                    const errRes = await res.json();
                    throw new Error(errRes.error || "Import failed");
                }

                setProgress(Math.round(((i + batch.length) / total) * 100));
            }
            setStatus('success');
            if (onImportComplete) onImportComplete();
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message);
        }
    };

    return (
        <div className="space-y-4 p-2">
            {step === 'upload' && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-semibold">Import Localities</h4>
                        <p className="text-[11px] text-muted-foreground">Upload your JSON file to begin analysis.</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-md border border-slate-800 my-2 overflow-x-auto">
                        <pre className="text-[9px] text-blue-300 font-mono">
                            {`{
  "ChildrenRegionStructures": null,         //default to null
  "Code": "1234",                           // string
  "CodeNumber": "92368",                    // string
  "CreatedBy": null,                        //default to null
  "CreatedDate": "0001-01-01T00:00:00",     //default to this value
  "Deleted": false,                         //default to false
  "Id": 21056,                              // number
  "IsDeletablePermanently": false,          //default to false
  "ModifiedBy": null,                       //default to null
  "ModifiedDate": "0001-01-01T00:00:00",    //default to this value
  "Name": "DOUALA",                         // string
  "NistCode": "null",                       // string
  "ParentRegionStructure": null,            //default to null
  "ParentRegionStructureId": 66,            // number or null
  "RegionStructureTypeId": 3,               // number (1=Region, 2=Department, 3=City)
  "Translations": []                        //default to empty array
}`}
                        </pre>
                    </div>

                    <Input type="file" accept=".json" onChange={handleFileChange} className="text-xs hover:cursor-pointer" />

                    <Button className="w-full hover:cursor-pointer" onClick={analyzeFile} disabled={!file}>
                        Analyze for Conflicts
                    </Button>
                </div>
            )}

            {step === 'confirm' && (
                <div className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Found <strong>{conflicts.length}</strong> potential duplicates.</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="flex-1 text-xs hover:cursor-pointer" onClick={() => performFinalImport(pureNewData)}>
                            Skip & Import New ({pureNewData.length})
                        </Button>
                        <Button className="flex-1 text-xs hover:cursor-pointer" onClick={() => setStep('resolving')}>
                            Manage Conflicts
                        </Button>

                        <Button
                            className="w-full text-[11px] h-9 bg-blue-600 hover:bg-blue-700 text-white hover:cursor-pointer"
                            onClick={handleUpdateAll}
                        >
                            <Upload className="mr-2 h-3.5 w-3.5" />
                            Update All ({conflicts.length} conflicts + {pureNewData.length} new)
                        </Button>
                    </div>
                </div>
            )}

            {step === 'resolving' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                        <span>Conflict {conflictIndex + 1} of {conflicts.length}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <div className="p-2 border rounded bg-slate-50">
                            <p className="text-[10px] font-bold text-slate-500 mb-1">CURRENT IN DATABASE</p>
                            <pre className="text-[9px] h-24 overflow-y-auto font-mono">
                                {JSON.stringify(conflicts[conflictIndex].old, null, 2)}
                            </pre>
                            <Button variant="outline" size="sm" className="w-full mt-2 h-7 text-[10px] hover:cursor-pointer" onClick={() => resolveConflict('keep-old')}>
                                Keep Original
                            </Button>
                        </div>
                        <div className="p-2 border border-blue-200 rounded bg-blue-50">
                            <p className="text-[10px] font-bold text-blue-600 mb-1">NEW FROM FILE</p>
                            <pre className="text-[9px] h-24 overflow-y-auto font-mono">
                                {JSON.stringify(conflicts[conflictIndex].new, null, 2)}
                            </pre>
                            <Button size="sm" className="w-full mt-2 h-7 text-[10px] hover:cursor-pointer" onClick={() => resolveConflict('use-new')}>
                                Update with New
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {(step === 'processing' || status !== 'idle') && (
                <div className="space-y-3 py-2">
                    {status === 'uploading' && (
                        <div className="space-y-2">
                            <Progress value={progress} className="h-2" />
                            <p className="text-center text-[11px] text-muted-foreground">{progress}% synchronized</p>
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="p-2 bg-green-50 text-green-700 rounded text-xs flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Import Successful
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="p-2 bg-red-50 text-red-700 rounded text-xs flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <p><strong>Error:</strong> {errorMessage}</p>
                        </div>
                    )}
                    {status === 'success' && (
                        <Button className="w-full hover:cursor-pointer" onClick={() => {
                            if (onClose) onClose();
                            setStep('upload');
                        }}>Finish</Button>
                    )}
                </div>
            )}
        </div>
    );
}