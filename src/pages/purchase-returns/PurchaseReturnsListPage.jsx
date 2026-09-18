import { useMemo, useState } from 'react'
import { RotateCcw, Pencil, Trash2 } from 'lucide-react'
import { getPurchaseReturns, deletePurchaseReturn } from '../../api/purchaseReturnApi'
import { getPurchases } from '../../api/purchaseApi'
import { getSuppliers } from '../../api/supplierApi'
import { useApi, useMutation } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import PurchaseReturnFormModal from './PurchaseReturnFormModal.jsx'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function PurchaseReturnsListPage() {
  const { data: purchaseReturns, isLoading, error, refetch } = useApi(getPurchaseReturns, [])
  const { data: purchases } = useApi(getPurchases, [])
  const { data: suppliers } = useApi(getSuppliers, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, purchaseReturn: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { mutate: runDelete, isSubmitting: isDeleting } = useMutation(deletePurchaseReturn)

  const supplierNameById = useMemo(() => {
    const map = {}
    ;(suppliers || []).forEach((supplier) => (map[supplier.id] = supplier.supplierName))
    return map
  }, [suppliers])

  const invoiceByPurchaseId = useMemo(() => {
    const map = {}
    ;(purchases || []).forEach((purchase) => (map[purchase.id] = purchase.invoiceNumber))
    return map
  }, [purchases])

  const filteredPurchaseReturns = useMemo(() => {
    if (!purchaseReturns) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return purchaseReturns

    return purchaseReturns.filter((row) => {
      const invoice = invoiceByPurchaseId[row.purchaseId] || ''
      const supplier = supplierNameById[row.supplierId] || ''
      const text = `${invoice} ${supplier} ${row.notes || ''}`.toLowerCase()
      return text.includes(q)
    })
  }, [purchaseReturns, debouncedSearch, supplierNameById, invoiceByPurchaseId])

  const handleDelete = async () => {
    try {
      await runDelete(deleteTarget.id)
      toast.success('Purchase return deleted')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to delete purchase return')
    }
  }

  const columns = [
    { key: 'purchaseId', header: 'Purchase', render: (row) => invoiceByPurchaseId[row.purchaseId] || `#${row.purchaseId}` },
    { key: 'supplierId', header: 'Supplier', render: (row) => supplierNameById[row.supplierId] || '—' },
    { key: 'totalAmount', header: 'Amount', sortable: true, render: (row) => formatCurrency(row.totalAmount) },
    { key: 'notes', header: 'Notes', render: (row) => row.notes || '—' },
    { key: 'createdAt', header: 'Date', render: (row) => formatDateTime(row.createdAt || row.returnDate) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setFormState({ isOpen: true, purchaseReturn: row })}>
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
        title="Purchase Returns"
        description="Track supplier returns and refund adjustments for purchases."
        actions={
          <Button icon={RotateCcw} onClick={() => setFormState({ isOpen: true, purchaseReturn: null })}>
            New Return
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by purchase, supplier or notes…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredPurchaseReturns}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No purchase returns found"
        emptyDescription={search ? 'Try a different search term.' : 'Create your first purchase return.'}
      />

      <PurchaseReturnFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, purchaseReturn: null })}
        onSaved={refetch}
        purchases={purchases}
        suppliers={suppliers}
        purchaseReturn={formState.purchaseReturn}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
        title="Delete purchase return"
        description={deleteTarget ? `Delete this return for invoice "${invoiceByPurchaseId[deleteTarget.purchaseId] || '#' + deleteTarget.purchaseId}"?` : ''}
        confirmLabel="Delete"
      />
    </div>
  )
}
