import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Boxes,
  Layers,
  Truck,
  UserRound,
  ShoppingCart,
  ClipboardList,
  Receipt,
  RotateCcw,
  X,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/products', label: 'Products', icon: Boxes },
      { to: '/categories', label: 'Categories', icon: Layers },
    ],
  },
  {
    label: 'Partners',
    items: [
      { to: '/suppliers', label: 'Suppliers', icon: Truck },
      { to: '/customers', label: 'Customers', icon: UserRound },
    ],
  },
  {
    label: 'Transactions',
    items: [
      { to: '/purchases', label: 'Purchases', icon: ShoppingCart },
      { to: '/purchase-items', label: 'Purchase Items', icon: ClipboardList },
      { to: '/sales', label: 'Sales', icon: Receipt },
      { to: '/sales-returns', label: 'Sales Returns', icon: RotateCcw },
      { to: '/sales-items', label: 'Sales Items', icon: ClipboardList },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/users', label: 'Users', icon: Users },
      { to: '/roles', label: 'Roles', icon: ShieldCheck },
    ],
  },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-ink-950 text-ink-200 transition-transform duration-200 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold text-white">
              N
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Nexora ERP</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-600/90 text-white'
                          : 'text-ink-300 hover:bg-white/5 hover:text-white'
                      )
                    }
                  >
                    <Icon size={17} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
