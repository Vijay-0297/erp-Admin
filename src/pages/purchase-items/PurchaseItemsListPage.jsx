import { useMemo, useState } from 'react'
import { Pencil, ListPlus } from 'lucide-react'
import { getPurchaseItems } from '../../api/purchaseItemApi'
import { getPurchases } from '../../api/purchaseApi'
import { getProducts } from '../../api/productApi'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import PurchaseItemFormModal from './PurchaseItemFormModal.jsx'
import { formatCurrency } from '../../utils/formatters'

export default function PurchaseItemsListPage() {
  const { data: items, isLoading, error, refetch } = useApi(getPurchaseItems, [])
  const { data: purchases } = useApi(getPurchases, [])
  const { data: products } = useApi(getProducts, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, item: null })

  const purchaseById = useMemo(() => {
    const map = {}
    ;(purchases || []).forEach((p) => (map[p.id] = p))
    return map
  }, [purchases])

  const productById = useMemo(() => {
    const map = {}
    ;(products || []).forEach((p) => (map[p.id] = p))
    return map
  }, [products])

  const filteredItems = useMemo(() => {
    if (!items) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => {
      const purchase = purchaseById[i.purchaseId]
      const product = productById[i.productId]
      return [purchase?.invoiceNumber, product?.productName, product?.sku].some((f) =>
        f?.toLowerCase().includes(q)
      )
    })
  }, [items, debouncedSearch, purchaseById, productById])

  const columns = [
    {
      key: 'purchaseId',
      header: 'Purchase Invoice',
      render: (row) => purchaseById[row.purchaseId]?.invoiceNumber || `#${row.purchaseId}`,
    },
    {
      key: 'productId',
      header: 'Product',
      render: (row) => productById[row.productId]?.productName || `#${row.productId}`,
    },
    { key: 'quantity', header: 'Quantity', sortable: true },
    { key: 'purchasePrice', header: 'Unit Price', sortable: true, render: (row) => formatCurrency(row.purchasePrice) },
    {
      key: 'lineTotal',
      header: 'Line Total',
      render: (row) => formatCurrency(Number(row.quantity) * Number(row.purchasePrice)),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setFormState({ isOpen: true, item: row })}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Purchase Items"
        description="Line items recorded against each purchase invoice."
        actions={
          <Button icon={ListPlus} onClick={() => setFormState({ isOpen: true, item: null })}>
            Add Item
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by invoice, product or SKU…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredItems}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No purchase items found"
        emptyDescription={search ? 'Try a different search term.' : 'Add a line item to a purchase to get started.'}
      />

      <PurchaseItemFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, item: null })}
        onSaved={refetch}
        item={formState.item}
        purchases={purchases}
        products={products}
      />
    </div>
  )
}
