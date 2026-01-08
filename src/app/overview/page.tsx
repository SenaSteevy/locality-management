import { LocalitiesTableContainer } from "@/components/overview/LocalitiesTableContainer"
import { OverviewStats } from "@/components/overview/OverviewStats"

export default function Overview() {
  return (
    <div className="w-full py-14 px-[10%] max-sm:py-8 max-sm:px-4">
      <h2 className="text-2xl font-bold mb-6">General Overview</h2>
      <LocalitiesTableContainer />
    </div>
  )
}
