import { Card, CardContent } from "@/components/ui/card"
import { Locality } from "@/types/locality";

const Stat = ({ label, value }: { label: string; value: number }) => (
  <Card>
    <CardContent className="p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
)

export const OverviewStats = ({ rawData }: { rawData: Locality[] }) => {

  const regions = rawData.filter(l => l.RegionStructureTypeId === 1);
  const departments = rawData.filter(l => l.RegionStructureTypeId === 2);
  const cities = rawData.filter(l => l.RegionStructureTypeId === 3);
  return (
    <div className="grid grid-cols-3 gap-6 mt-10">
      <Stat label="Total Regions" value={regions.length} />
      <Stat label="Total Departments" value={departments.length} />
      <Stat label="Total Cities" value={cities.length} />
    </div>
  )
}