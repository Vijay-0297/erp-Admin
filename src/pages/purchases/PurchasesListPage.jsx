import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Trash2, ShoppingCart } from 'lucide-react'
import { getPurchases, deletePurchase } from '../../api/purchaseApi'
import { getSuppliers } from '../../api/supplierApi'
import { useApi, useMutation } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import PurchaseFormModal from './PurchaseFormModal.jsx'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function PurchasesListPage() {
  const { data: purchases, isLoading, error, refetch } = useApi(getPurchases, [])
  const { data: suppliers } = useApi(getSuppliers, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, purchase: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { mutate: runDelete, isSubmitting: isDeleting } = useMutation(deletePurchase)

  const supplierNameById = useMemo(() => {
    const map = {}
    ;(suppliers || []).forEach((s) => (map[s.id] = s.supplierName))
    return map
  }, [suppliers])

  const filteredPurchases = useMemo(() => {
    if (!purchases) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return purchases
    return purchases.filter((p) => p.invoiceNumber?.toLowerCase().includes(q))
  }, [purchases, debouncedSearch])

  const handleDelete = async () => {
    try {
      await runDelete(deleteTarget.id)
      toast.success('Purchase deleted')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to delete purchase')
    }
  }

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice', sortable: true },
    { key: 'supplierId', header: 'Supplier', render: (row) => supplierNameById[row.supplierId] || '—' },
    { key: 'purchaseDateTime', header: 'Date', render: (row) => formatDateTime(row.purchaseDateTime) },
    { key: 'totalAmount', header: 'Amount', sortable: true, render: (row) => formatCurrency(row.totalAmount) },
    { key: 'paymentStatus', header: 'Payment', render: (row) => <Badge>{row.paymentStatus}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setFormState({ isOpen: true, purchase: row })}>
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
        title="Purchases"
        description="Track inventory purchases from your suppliers."
        actions={
          <Button icon={ShoppingCart} onClick={() => setFormState({ isOpen: true, purchase: null })}>
            New Purchase
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by invoice number…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredPurchases}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No purchases found"
        emptyDescription={search ? 'Try a different search term.' : 'Record your first purchase to get started.'}
      />

      <PurchaseFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, purchase: null })}
        onSaved={refetch}
        purchase={formState.purchase}
        suppliers={suppliers}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
        title="Delete purchase"
        description={deleteTarget ? `Delete invoice "${deleteTarget.invoiceNumber}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
      />
    </div>
  )
}
