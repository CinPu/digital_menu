
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import AdminSidebar from '../components/layout/AdminSidebar'
import AdminHeader from '../components/layout/AdminHeader'

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">

      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">

        {/* Mobile Header */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>

          <span className="font-bold text-slate-900">
            QR Menu Admin
          </span>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <AdminHeader />
        </div>

        <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  )
}
