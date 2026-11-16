
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  QrCode,
  Settings,
  Store,
  X,
} from 'lucide-react'

const menuLinks = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Categories', path: '/admin/categories', icon: Tags },
  { label: 'Menu Items', path: '/admin/menu-items', icon: UtensilsCrossed },
  { label: 'QR Code', path: '/admin/qr-code', icon: QrCode },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({
  mobileOpen = false,
  onClose,
}: AdminSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white">
              <Store size={21} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">QR Menu</h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <SidebarNavigation onClose={onClose} />

        <SidebarFooter />
      </aside>
    </>
  )
}

function SidebarContent() {
  return (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="rounded-xl bg-slate-900 p-2 text-white">
          <Store size={21} />
        </div>
        <div>
          <h1 className="font-bold text-slate-900">QR Menu</h1>
          <p className="text-xs text-slate-400">Management System</p>
        </div>
      </div>

      <SidebarNavigation />
      <SidebarFooter />
    </>
  )
}

function SidebarNavigation({ onClose }: { onClose?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Menu
      </p>

      {menuLinks.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin/dashboard'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <Icon size={19} />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

function SidebarFooter() {
  return (
    <div className="border-t border-slate-100 p-4">
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-xs font-medium text-slate-700">Digital Menu</p>
        <p className="mt-1 text-xs text-slate-400">Version 1.0.0</p>
      </div>
    </div>
  )
}
