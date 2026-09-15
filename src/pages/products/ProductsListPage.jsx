import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Trash2, PackagePlus } from 'lucide-react'
import { getProducts, deleteProduct } from '../../api/productApi'
import { useApi, useMutation } from '../../hooks/useApi'
import { useCategories } from '../../context/CategoriesContext'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import ProductFormModal from './ProductFormModal.jsx'
import { formatCurrency } from '../../utils/formatters'
import {
  getProductId,
  getCategoryId,
  resolveProductCategoryName,
  normalizeProduct,
  normalizeCategory,
} from '../../utils/productUtils'

export default function ProductsListPage() {
  const { data: products, isLoading, error, refetch } = useApi(getProducts, [])

  const { data: categories, isLoading: isCategoriesLoading } = useApi(getCategories, [])

  const { categories } = useCategories()

  

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, product: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { mutate: runDelete, isSubmitting: isDeleting } = useMutation(deleteProduct)


  const mergedCategories = useMemo(() => {
    try {
      const localCategories = JSON.parse(localStorage.getItem('local_categories') || '[]')
      const serverCategories = Array.isArray(categories) ? categories : []
      const ids = new Set(serverCategories.map((c) => String(getCategoryId(c))))
      const localOnly = localCategories.filter((c) => !ids.has(String(getCategoryId(c))))
      return [...serverCategories, ...localOnly].map(normalizeCategory)
    } catch {
      return (Array.isArray(categories) ? categories : []).map(normalizeCategory)
    }

  const categoryNameById = useMemo(() => {
    const map = {}
    ;(categories || []).forEach((category) => {
      // The backend may expose the primary key as either `id` or `categoryId`.
      // Normalizing it also handles number/string ID differences.
      const categoryId = category.id ?? category.categoryId
      if (categoryId != null) map[String(categoryId)] = category.categoryName
    })
    return map

  }, [categories])

  const mergedProducts = useMemo(() => {
    try {
      const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]')
      const serverProducts = Array.isArray(products) ? products : []
      const ids = new Set(serverProducts.map((p) => String(getProductId(p))))
      const skus = new Set(serverProducts.map((p) => p.sku).filter(Boolean))

      // Keep only local products that don't collide with existing server products
      const localOnly = localProducts.filter(
        (p) => !ids.has(String(getProductId(p))) && (!p.sku || !skus.has(p.sku))
      )
      return [...serverProducts, ...localOnly].map(normalizeProduct)
    } catch {
      return (Array.isArray(products) ? products : []).map(normalizeProduct)
    }
  }, [products])

  const filteredProducts = useMemo(() => {

    if (!mergedProducts) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return mergedProducts
    return mergedProducts.filter((p) =>
      [p.productName, p.sku, p.barcode].some((f) => f?.toLowerCase().includes(q))
    )
  }, [mergedProducts, debouncedSearch])

  const handleDelete = async () => {
    try {
      const productId = getProductId(deleteTarget)
      if (!productId) {
        throw new Error('Product ID missing. Unable to delete.')
      }
      await runDelete(productId)

    // Merge any locally saved products (offline fallback) so they appear in the list
    const localSaved = (() => {
      try {
        return JSON.parse(localStorage.getItem('local_products') || '[]')
      } catch (e) {
        return []
      }
    })()

    const merged = (products || []).concat(
      (localSaved || []).filter((lp) => !(products || []).some((p) => p.id === lp.id))
    )
    if (!merged) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return merged
    return merged.filter((p) => [p.productName, p.sku, p.barcode].some((f) => f?.toLowerCase().includes(q)))
  } [products, debouncedSearch])

  const handleDelete = async () => {
    try {
      const id = deleteTarget?.id

      // If this is a locally-saved (offline) product, remove it from localStorage
      if (typeof id === 'string' && id.startsWith('local-')) {
        try {
          const saved = JSON.parse(localStorage.getItem('local_products') || '[]')
          const filtered = (saved || []).filter((p) => p.id !== id)
          localStorage.setItem('local_products', JSON.stringify(filtered))
          toast.success('Local product deleted')
          setDeleteTarget(null)
          refetch()
          return
        } catch (localErr) {
          toast.error(localErr?.message || 'Failed to delete local product')
          return
        }
      }

      await runDelete(id)

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

      sortable: true,
      render: (row) => resolveProductCategoryName(row, mergedCategories) || '—',

      render: (row) => categoryNameById[String(row.categoryId)] || '—',

    },
    { key: 'sellingPrice', header: 'Price', sortable: true, render: (row) => formatCurrency(row.sellingPrice) },
    {
      key: 'stockQuantity',
      header: 'Stock',
      sortable: true,
      render: (row) => {
        const low = Number(row.stockQuantity) <= Number(row.minimumStock ?? 0)
        return (
          <Badge tone={low ? 'warning' : 'success'}>
            {row.stockQuantity} {row.unit}
          </Badge>
        )
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
        rowKey="id"
      />

      <ProductFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, product: null })}
        onSaved={refetch}
        product={formState.product}
        categories={mergedCategories}
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
