import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Trash2, Truck } from 'lucide-react'
import { getSuppliers, deleteSupplier } from '../../api/supplierApi'
import { useApi, useMutation } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import SupplierFormModal from './SupplierFormModal.jsx'

export default function SuppliersListPage() {
  const { data: suppliers, isLoading, error, refetch } = useApi(getSuppliers, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, supplier: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { mutate: runDelete, isSubmitting: isDeleting } = useMutation(deleteSupplier)

  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return suppliers
    return suppliers.filter((s) =>
      [s.supplierName, s.contactPerson, s.email, s.phone].some((f) => f?.toLowerCase().includes(q))
    )
  }, [suppliers, debouncedSearch])

  const handleDelete = async () => {
    try {
      await runDelete(deleteTarget.id)
      toast.success('Supplier deleted')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to delete supplier')
    }
  }

  const columns = [
    { key: 'supplierName', header: 'Supplier', sortable: true },
    { key: 'contactPerson', header: 'Contact Person' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setFormState({ isOpen: true, supplier: row })}>
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
        title="Suppliers"
        description="Manage the suppliers you purchase inventory from."
        actions={
          <Button icon={Truck} onClick={() => setFormState({ isOpen: true, supplier: null })}>
            New Supplier
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search suppliers…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredSuppliers}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No suppliers found"
        emptyDescription={search ? 'Try a different search term.' : 'Add your first supplier to get started.'}
      />

      <SupplierFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, supplier: null })}
        onSaved={refetch}
        supplier={formState.supplier}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
        title="Delete supplier"
        description={deleteTarget ? `Delete "${deleteTarget.supplierName}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
      />
    </div>
  )
}
