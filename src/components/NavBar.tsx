"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navLinks = [
  { name: "Overview", href: "/overview" },
  { name: "Regions", href: "/regions" },
  { name: "Departments", href: "/departments" },
  { name: "Cities", href: "/cities" },
]

const NavBar = () => {
  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 lg:px-12">

        <Link href="/overview" className="flex items-center gap-2">
          <img
            src="/icon/city-svgrepo-com.svg"
            alt="Logo"
            className="h-8 w-8"
          />
          <h1 className="border-l pl-3 text-lg font-semibold text-gray-700">
            Localities Management
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-64">
             <SheetHeader>
                <SheetTitle className="hidden">Navigation Menu</SheetTitle>
            </SheetHeader>

            <nav className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  )
}

export default NavBar
