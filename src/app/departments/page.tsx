import { LocalitiesTableContainer } from "@/components/overview/LocalitiesTableContainer"

export default function DepartmentsPage() {
  return (
    <div className="w-full py-14 px-[10%] max-sm:py-8 max-sm:px-4">
      <h2 className="text-2xl font-bold mb-6">Departments Management</h2>
      <LocalitiesTableContainer filterType={2} />
    </div>
  )
}