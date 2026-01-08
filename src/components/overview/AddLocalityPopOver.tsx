import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2 } from "lucide-react"
import { Locality } from "@/types/locality"
import { getDeptList, getNextCode, getRegionList } from "@/lib/locality-utils"


export function AddLocalityPopover({ rawData, onAdd }: { rawData: Locality[], onAdd: any }) {
    const [open, setOpen] = useState(false);
    const [selRegionId, setSelRegionId] = useState<string>("");
    const [selDeptId, setSelDeptId] = useState<string>("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    // Get options dynamically using your new utilities
    const regions = useMemo(() => getRegionList(rawData), [rawData]);

    const departments = useMemo(() => {
        return selRegionId ? getDeptList(rawData, Number(selRegionId)) : [];
    }, [selRegionId, rawData]);
    const nextCode = useMemo(() => getNextCode(rawData), [rawData]);


    const handleSave = async (type: number) => {
        let parentId = null;
        if (type === 2) parentId = Number(selRegionId);
        if (type === 3) parentId = Number(selDeptId);

        await onAdd(type, {
            name: name.toUpperCase(),
            code: nextCode,
            parentId
        });

        setOpen(false);
        setName("");
        setCode("");
        setSelRegionId("");
        setSelDeptId("");
    };

    return (
        <div>
            <Tabs defaultValue="region">
                <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="region" className="px-2">Region</TabsTrigger>
                    <TabsTrigger value="dept" className="px-2">Department</TabsTrigger>
                    <TabsTrigger value="city" className="px-2">City</TabsTrigger>
                </TabsList>
                {/* REGION TAB */}
                <TabsContent value="region">
                    <form action="#" className="space-y-3 pt-4">
                        <Label>Region Name</Label>
                        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                        <Button type="submit" className="w-full hover:cursor-pointer" onClick={() => handleSave(1)} disabled={name.trim() === ""}>Save Region</Button>
                    </form>
                </TabsContent>
                {/* DEPARTMENT TAB */}
                <TabsContent value="dept" >
                    <form action="#" className="space-y-3">
                        <Label>Select Region</Label>
                        <Select onValueChange={setSelRegionId} required>
                            <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
                            <SelectContent>
                                {regions.length > 0 ? (
                                    regions.map(r => <SelectItem key={r.Id} value={r.Id.toString()}>{r.Name}</SelectItem>)
                                ) : (
                                    <SelectItem value="none" disabled>No Regions found</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <Input placeholder="Dept Name" value={name} onChange={e => setName(e.target.value)} disabled={!selRegionId}/>
                        <Button type="submit" className="w-full hover:cursor-pointer" onClick={() => handleSave(2)} disabled={selRegionId === "" || name.trim() === ""}>Save Department</Button>
                    </form>
                </TabsContent>

                {/* CITY TAB */}
                <TabsContent value="city">
                    <form action="#" className="space-y-3">
                        <Label>Select Region & Department</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Select onValueChange={(v) => { setSelRegionId(v); setSelDeptId(""); }} required>
                                <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
                                <SelectContent>
                                    {regions.length > 0 ? (
                                        regions.map(r => <SelectItem key={r.Id} value={r.Id.toString()}>{r.Name}</SelectItem>)
                                    ) : (
                                        <SelectItem value="none" disabled>No Regions found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>

                            <Select value={selDeptId} onValueChange={setSelDeptId} disabled={!selRegionId} required> 
                                <SelectTrigger><SelectValue placeholder="Dept" /></SelectTrigger>
                                <SelectContent>
                                    {!selRegionId ? (
                                        <SelectItem value="none" disabled>Select a Region first</SelectItem>
                                    ) : departments.length > 0 ? (
                                        departments.map(d => <SelectItem key={d.Id} value={d.Id.toString()}>{d.Name}</SelectItem>)
                                    ) : (
                                        <SelectItem value="none" disabled>No Departments found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <Input placeholder="City Name" value={name} onChange={e => setName(e.target.value)} />
                        <Button type="submit" className="w-full hover:cursor-pointer" onClick={() => handleSave(3)} disabled={selRegionId === "" || selDeptId === "" || name.trim() === ""}>Save City</Button>
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    );
}