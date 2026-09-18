import { useMemo, useState } from 'react'
import { Plus, ClipboardList } from 'lucide-react'
import { getStockMovements } from '../../api/stockMovementApi'
import { getProducts } from '../../api/productApi'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import StockMovementFormModal from './StockMovementFormModal.jsx'
import { formatCurrency } from '../../utils/formatters'

export default function StockMovementsListPage() {
  const { data: items, isLoading, error, refetch } = useApi(getStockMovements, [])
  const { data: products } = useApi(getProducts, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, item: null })

  const productById = useMemo(() => {
    const map = {}
    ;(products || []).forEach((p) => (map[p.id] = p))
    return map
  }, [products])

  const filteredItems = useMemo(() => {
    if (!items) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return items

    return items.filter((it) => {
      const p = productById[it.productId]
      return [p?.productName, p?.sku, it.movementType, it.referenceId].some((f) => String(f ?? '').toLowerCase().includes(q))
    })
  }, [items, debouncedSearch, productById])

  const columns = [
    { key: 'productId', header: 'Product', render: (row) => productById[row.productId]?.productName || `#${row.productId}` },
    { key: 'movementType', header: 'Type' },
    { key: 'quantity', header: 'Quantity', sortable: true },
    { key: 'referenceId', header: 'Reference' },
    { key: 'notes', header: 'Notes', render: (row) => row.notes || '-' },
  ]

  return (
    <div>
      <PageHeader
        title="Stock Movements"
        description="Record and review stock movements across products."
        actions={<Button icon={Plus} onClick={() => setFormState({ isOpen: true, item: null })}>Record</Button>}
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by product, SKU, type or ref…" />
      </div>

      <DataTable columns={columns} rows={filteredItems} isLoading={isLoading} error={error} onRetry={refetch} emptyTitle="No stock movements found" />

      <StockMovementFormModal isOpen={formState.isOpen} onClose={() => setFormState({ isOpen: false, item: null })} onSaved={refetch} products={products} item={formState.item} />
    </div>
  )
}
