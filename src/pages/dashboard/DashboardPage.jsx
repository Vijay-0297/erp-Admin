import { useEffect, useState } from 'react'
import { Users, Boxes, UserRound, PackageX, TrendingUp, ShoppingCart } from 'lucide-react'
import { getUsers } from '../../api/userApi'
import { getProducts } from '../../api/productApi'
import { getCustomers } from '../../api/customerApi'
import { getPurchases } from '../../api/purchaseApi'
import { getSales } from '../../api/salesApi'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Skeleton } from '../../components/common/Skeleton.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import Badge from '../../components/common/Badge.jsx'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

// Tailwind can't see dynamically interpolated class names at build time
// (its JIT scanner needs literal strings), so tones are resolved from a
// static lookup rather than template-literal class construction.
const TONE_CLASSES = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
}

const StatCard = ({ icon: Icon, label, value, isLoading, tone = 'brand' }) => (
  <div className="card flex items-center gap-4 p-5">
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}>
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-1.5 h-6 w-16" />
      ) : (
        <p className="mt-0.5 text-2xl font-semibold text-ink-900">{value}</p>
      )}
    </div>
  </div>
)

function AreaLineChart({ sales, purchases }) {
  const chartData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (5 - index))

    const salesTotal = (sales || []).reduce((sum, item) => {
      const txnDate = new Date(item.saleDate || item.createdAt)
      if (txnDate.toDateString() === date.toDateString()) {
        return sum + Number(item.totalAmount || 0)
      }
      return sum
    }, 0)

    const purchasesTotal = (purchases || []).reduce((sum, item) => {
      const txnDate = new Date(item.purchaseDateTime || item.createdAt)
      if (txnDate.toDateString() === date.toDateString()) {
        return sum + Number(item.totalAmount || 0)
      }
      return sum
    }, 0)

    return {
      label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date),
      sales: salesTotal,
      purchases: purchasesTotal,
    }
  })

  const width = 620
  const height = 250
  const padding = 30
  const chartHeight = height - padding * 2
  const chartWidth = width - padding * 2
  const maxValue = Math.max(1, ...chartData.flatMap((item) => [item.sales, item.purchases]))

  const buildPath = (key) => {
    const points = chartData.map((item, index) => {
      const x = padding + (chartWidth / Math.max(chartData.length - 1, 1)) * index
      const y = height - padding - (item[key] / maxValue) * chartHeight
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    return points.join(' ')
  }

  const salesPath = buildPath('sales')
  const purchasesPath = buildPath('purchases')

  const salesAreaPath = `${salesPath} L ${padding + chartWidth} ${height - padding} L ${padding} ${height - padding} Z`
  const purchasesAreaPath = `${purchasesPath} L ${padding + chartWidth} ${height - padding} L ${padding} ${height - padding} Z`

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink-800">Monthly Sales</h2>
          <p className="text-xs text-ink-500">Sales and purchases trend</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Sales
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Purchases
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const y = padding + chartHeight * step
          return (
            <line
              key={step}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="#E5E7EB"
              strokeDasharray="4 6"
            />
          )
        })}

        <path d={salesAreaPath} fill="rgba(59, 130, 246, 0.12)" />
        <path d={purchasesAreaPath} fill="rgba(16, 185, 129, 0.08)" />

        <path d={salesPath} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={purchasesPath} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {chartData.map((item, index) => {
          const x = padding + (chartWidth / Math.max(chartData.length - 1, 1)) * index
          return (
            <g key={item.label}>
              <line x1={x} x2={x} y1={height - padding} y2={height - padding + 6} stroke="#94A3B8" />
              <text x={x} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748B">
                {item.label.split(' ')[0]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function DonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = 72
  const circum = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-semibold text-ink-800">Support Requests</h2>

      <div className="flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="h-44 w-44">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="30" />
          {data.map((item) => {
            const dash = (item.value / total) * circum
            const circle = (
              <circle
                key={item.label}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="30"
                strokeDasharray={`${dash} ${circum - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />
            )
            offset += dash
            return circle
          })}
        </svg>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs text-ink-600">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
            <span className="font-medium text-ink-700">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [state, setState] = useState({
    isLoading: true,
    error: null,
    users: [],
    products: [],
    customers: [],
    purchases: [],
    sales: [],
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState((s) => ({ ...s, isLoading: true, error: null }))
      try {
        const [usersRes, productsRes, customersRes, purchasesRes, salesRes] = await Promise.all([
          getUsers(),
          getProducts(),
          getCustomers(),
          getPurchases(),
          getSales(),
        ])
        if (cancelled) return
        setState({
          isLoading: false,
          error: null,
          users: usersRes.data || [],
          products: productsRes.data || [],
          customers: customersRes.data || [],
          purchases: purchasesRes.data || [],
          sales: salesRes.data || [],
        })
      } catch (err) {
        if (cancelled) return
        setState((s) => ({ ...s, isLoading: false, error: err }))
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const { isLoading, error, users, products, customers, purchases, sales } = state

  const totalInventory = products.reduce((sum, p) => sum + (Number(p.stockQuantity) || 0), 0)
  const lowStockProducts = products.filter(
    (p) => Number(p.stockQuantity) <= Number(p.minimumStock ?? 0)
  )

  const recentTransactions = [
    ...purchases.map((p) => ({
      id: `purchase-${p.id}`,
      type: 'Purchase',
      reference: p.invoiceNumber,
      amount: p.totalAmount,
      status: p.paymentStatus,
      date: p.purchaseDateTime,
    })),
    ...sales.map((s) => ({
      id: `sale-${s.id}`,
      type: 'Sale',
      reference: s.invoiceNumber,
      amount: s.totalAmount,
      status: s.paymentStatus,
      date: s.saleDate || s.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 8)

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Overview of your ERP data" />
        <ErrorState
          message={error.message}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="A snapshot of what's happening across your business" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={users.length} isLoading={isLoading} />
        <StatCard icon={Boxes} label="Total Products" value={products.length} isLoading={isLoading} />
        <StatCard icon={UserRound} label="Total Customers" value={customers.length} isLoading={isLoading} />
        <StatCard
          icon={TrendingUp}
          label="Total Inventory Units"
          value={totalInventory}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
        <AreaLineChart sales={sales} purchases={purchases} />
        <DonutChart
          data={[
            { label: 'Open', value: 12, color: '#3B82F6' },
            { label: 'Resolved', value: 8, color: '#10B981' },
            { label: 'Pending', value: 5, color: '#F59E0B' },
          ]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-800">Recent Transactions</h2>
            <ShoppingCart size={16} className="text-ink-400" />
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-ink-50">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-800">
                      {t.type} · {t.reference || '—'}
                    </p>
                    <p className="text-xs text-ink-400">{formatDateTime(t.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-ink-700">{formatCurrency(t.amount)}</span>
                    {t.status && <Badge>{t.status}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-800">Low Stock Products</h2>
            <PackageX size={16} className="text-amber-500" />
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">All products are well stocked.</p>
          ) : (
            <div className="divide-y divide-ink-50">
              {lowStockProducts.slice(0, 8).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">{p.productName}</p>
                    <p className="text-xs text-ink-400">SKU: {p.sku}</p>
                  </div>
                  <Badge tone="warning">{p.stockQuantity} left</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
