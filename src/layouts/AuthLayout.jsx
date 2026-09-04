import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-ink-950 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 font-bold">
            N
          </div>
          <span className="text-lg font-semibold tracking-tight">Nexora ERP</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            Run inventory, purchases and sales from one clear view.
          </h1>
          <p className="mt-4 text-sm text-ink-400">
            Track stock levels, suppliers, and customer orders in real time — built for teams
            who need accuracy over guesswork.
          </p>
        </div>
        <p className="text-xs text-ink-500">© {new Date().getFullYear()} Nexora ERP</p>
      </div>
      <div className="flex w-full items-center justify-center bg-ink-50 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
