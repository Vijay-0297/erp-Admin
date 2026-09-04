import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Trash2, UserRoundPlus } from 'lucide-react'
import { getCustomers, deleteCustomer } from '../../api/customerApi'
import { useApi, useMutation } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import CustomerFormModal from './CustomerFormModal.jsx'

export default function CustomersListPage() {
  const { data: customers, isLoading, error, refetch } = useApi(getCustomers, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, customer: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { mutate: runDelete, isSubmitting: isDeleting } = useMutation(deleteCustomer)

  const filteredCustomers = useMemo(() => {
    if (!customers) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => [c.customerName, c.email, c.phone].some((f) => f?.toLowerCase().includes(q)))
  }, [customers, debouncedSearch])

  const handleDelete = async () => {
    try {
      await runDelete(deleteTarget.id)
      toast.success('Customer deleted')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer')
    }
  }

  const columns = [
    { key: 'customerName', header: 'Customer', sortable: true },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'address', header: 'Address' },
    { key: 'status', header: 'Status', render: (row) => (row.status ? <Badge>{row.status}</Badge> : '—') },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setFormState({ isOpen: true, customer: row })}>
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
        title="Customers"
        description="Manage the customers you sell to."
        actions={
          <Button icon={UserRoundPlus} onClick={() => setFormState({ isOpen: true, customer: null })}>
            New Customer
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search customers…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredCustomers}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No customers found"
        emptyDescription={search ? 'Try a different search term.' : 'Add your first customer to get started.'}
      />

      <CustomerFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, customer: null })}
        onSaved={refetch}
        customer={formState.customer}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
        title="Delete customer"
        description={deleteTarget ? `Delete "${deleteTarget.customerName}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
      />
    </div>
  )
}
