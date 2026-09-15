import { useMemo, useState } from 'react'
import { Pencil, ListPlus } from 'lucide-react'
import { getSalesItems } from '../../api/salesItemApi'
import { getSales } from '../../api/salesApi'
import { getProducts } from '../../api/productApi'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import SalesItemFormModal from './SalesItemFormModal.jsx'
import { formatCurrency } from '../../utils/formatters'

export default function SalesItemsListPage() {
  const { data: items, isLoading, error, refetch } = useApi(getSalesItems, [])
  const { data: sales } = useApi(getSales, [])
  const { data: products } = useApi(getProducts, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, item: null })

  const saleById = useMemo(() => {
    const map = {}
    ;(sales || []).forEach((sale) => (map[sale.id] = sale))
    return map
  }, [sales])

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
      const sale = saleById[item.saleId]
      const product = productById[item.productId]

      return [sale?.invoiceNumber, product?.productName, product?.sku].some((field) =>
        field?.toLowerCase().includes(q)
      )
    })
  }, [items, debouncedSearch, saleById, productById])

  const columns = [
    {
      key: 'saleId',
      header: 'Sale Invoice',
      render: (row) => saleById[row.saleId]?.invoiceNumber || `#${row.saleId}`,
    },
    {
      key: 'productId',
      header: 'Product',
      render: (row) => productById[row.productId]?.productName || `#${row.productId}`,
    },
    { key: 'quantity', header: 'Quantity', sortable: true },
    { key: 'sellingPrice', header: 'Unit Price', sortable: true, render: (row) => formatCurrency(row.sellingPrice) },
    {
      key: 'lineTotal',
      header: 'Line Total',
      render: (row) => formatCurrency(Number(row.quantity) * Number(row.sellingPrice)),
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
        title="Sales Items"
        description="Track each product line within every sales invoice."
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
        emptyTitle="No sales items found"
        emptyDescription={search ? 'Try a different search term.' : 'Add a line item to a sale to get started.'}
      />

      <SalesItemFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, item: null })}
        onSaved={refetch}
        item={formState.item}
        sales={sales}
        products={products}
      />
    </div>
  )
}
