import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Trash2, PackagePlus } from 'lucide-react'
import { getProducts, deleteProduct } from '../../api/productApi'
import { getCategories } from '../../api/categoryApi'
import { useApi, useMutation } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import ProductFormModal from './ProductFormModal.jsx'
import { formatCurrency } from '../../utils/formatters'

export default function ProductsListPage() {
  const { data: products, isLoading, error, refetch } = useApi(getProducts, [])
  const { data: categories } = useApi(getCategories, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, product: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { mutate: runDelete, isSubmitting: isDeleting } = useMutation(deleteProduct)

  const categoryNameById = useMemo(() => {
    const map = {}
    ;(categories || []).forEach((c) => (map[c.id] = c.categoryName))
    return map
  }, [categories])

  const filteredProducts = useMemo(() => {
    if (!products) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => [p.productName, p.sku, p.barcode].some((f) => f?.toLowerCase().includes(q)))
  }, [products, debouncedSearch])

  const handleDelete = async () => {
    try {
      await runDelete(deleteTarget.id)
      toast.success('Product deleted')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to delete product')
    }
  }

  const columns = [
    { key: 'productName', header: 'Product', sortable: true },
    { key: 'sku', header: 'SKU', sortable: true },
    {
      key: 'categoryId',
      header: 'Category',
      render: (row) => categoryNameById[row.categoryId] || '—',
    },
    { key: 'sellingPrice', header: 'Price', sortable: true, render: (row) => formatCurrency(row.sellingPrice) },
    {
      key: 'stockQuantity',
      header: 'Stock',
      sortable: true,
      render: (row) => {
        const low = Number(row.stockQuantity) <= Number(row.minimumStock ?? 0)
        return <Badge tone={low ? 'warning' : 'success'}>{row.stockQuantity} {row.unit}</Badge>
      },
    },
    { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setFormState({ isOpen: true, product: row })}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog and stock levels."
        actions={
          <Button icon={PackagePlus} onClick={() => setFormState({ isOpen: true, product: null })}>
            New Product
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, SKU or barcode…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredProducts}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No products found"
        emptyDescription={search ? 'Try a different search term.' : 'Add your first product to get started.'}
      />

      <ProductFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, product: null })}
        onSaved={refetch}
        product={formState.product}
        categories={categories}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
        title="Delete product"
        description={deleteTarget ? `Delete "${deleteTarget.productName}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
      />
    </div>
  )
}
