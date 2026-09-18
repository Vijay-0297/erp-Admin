import { useMemo, useState } from 'react'
import { Pencil, ListPlus } from 'lucide-react'
import { getSalesReturnItems } from '../../api/salesReturnItemApi'
import { getSalesReturns } from '../../api/salesReturnApi'
import { getProducts } from '../../api/productApi'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import SalesReturnItemFormModal from './SalesReturnItemFormModal.jsx'
import { formatCurrency } from '../../utils/formatters'

export default function SalesReturnItemsListPage() {
  const { data: items, isLoading, error, refetch } = useApi(getSalesReturnItems, [])
  const { data: salesReturns } = useApi(getSalesReturns, [])
  const { data: products } = useApi(getProducts, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, item: null })

  const salesReturnById = useMemo(() => {
    const map = {}
    ;(salesReturns || []).forEach((salesReturn) => (map[salesReturn.id] = salesReturn))
    return map
  }, [salesReturns])

  const productById = useMemo(() => {
    const map = {}
    ;(products || []).forEach((product) => (map[product.id] = product))
    return map
  }, [products])

  const filteredItems = useMemo(() => {
    if (!items) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return items

    return items.filter((item) => {
      const salesReturn = salesReturnById[item.salesReturnId]
      const product = productById[item.productId]

      return [salesReturn?.id, product?.productName, product?.sku].some((field) =>
        String(field ?? '').toLowerCase().includes(q)
      )
    })
  }, [items, debouncedSearch, salesReturnById, productById])

  const columns = [
    {
      key: 'salesReturnId',
      header: 'Sales Return',
      render: (row) => `Return #${row.salesReturnId}`,
    },
    {
      key: 'productId',
      header: 'Product',
      render: (row) => productById[row.productId]?.productName || `#${row.productId}`,
    },
    { key: 'quantity', header: 'Quantity', sortable: true },
    { key: 'price', header: 'Unit Price', sortable: true, render: (row) => formatCurrency(row.price) },
    {
      key: 'lineTotal',
      header: 'Line Total',
      render: (row) => formatCurrency(Number(row.quantity) * Number(row.price)),
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
        title="Sales Return Items"
        description="Track each returned product line against a sales return record."
        actions={
          <Button icon={ListPlus} onClick={() => setFormState({ isOpen: true, item: null })}>
            Add Item
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by return, product or SKU…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredItems}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No sales return items found"
        emptyDescription={search ? 'Try a different search term.' : 'Add a returned product line to get started.'}
      />

      <SalesReturnItemFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, item: null })}
        onSaved={refetch}
        item={formState.item}
        salesReturns={salesReturns}
        products={products}
      />
    </div>
  )
}
