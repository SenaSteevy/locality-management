import { LocalitiesTableContainer } from "@/components/overview/LocalitiesTableContainer"

export default function RegionsPage() {
  return (
    <div className="w-full py-14 px-[10%] max-sm:py-8 max-sm:px-4">
      <h2 className="text-2xl font-bold mb-6">Regions Management</h2>
      <LocalitiesTableContainer filterType={1} />
    </div>
  )
}