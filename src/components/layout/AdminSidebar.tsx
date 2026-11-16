
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  QrCode,
  Settings,
  Store,
} from 'lucide-react'

const menuLinks = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Categories',
    path: '/admin/categories',
    icon: Tags,
  },
  {
    label: 'Menu Items',
    path: '/admin/menu-items',
    icon: UtensilsCrossed,
  },
  {
    label: 'QR Code',
    path: '/admin/qr-code',
    icon: QrCode,
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: Settings,
  },
]

export default function AdminSidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="rounded-xl bg-slate-900 p-2 text-white">
          <Store size={21} />
        </div>

        <div>
          <h1 className="font-bold text-slate-900">
            QR Menu
          </h1>
          <p className="text-xs text-slate-400">
            Management System
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
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

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-700">
            Digital Menu
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  )
}
