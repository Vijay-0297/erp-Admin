import { useMemo, useState } from 'react'
import { Receipt } from 'lucide-react'
import { getSales } from '../../api/salesApi'
import { getCustomers } from '../../api/customerApi'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import SaleFormModal from './SaleFormModal.jsx'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function SalesListPage() {
  const { data: sales, isLoading, error, refetch } = useApi(getSales, [])
  const { data: customers } = useApi(getCustomers, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const customerNameById = useMemo(() => {
    const map = {}
    ;(customers || []).forEach((c) => (map[c.id] = c.customerName))
    return map
  }, [customers])

  const filteredSales = useMemo(() => {
    if (!sales) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return sales
    return sales.filter((s) => s.invoiceNumber?.toLowerCase().includes(q))
  }, [sales, debouncedSearch])

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice', sortable: true },
    { key: 'customerId', header: 'Customer', render: (row) => customerNameById[row.customerId] || '—' },
    { key: 'totalAmount', header: 'Amount', sortable: true, render: (row) => formatCurrency(row.totalAmount) },
    { key: 'paymentStatus', header: 'Payment', render: (row) => <Badge>{row.paymentStatus}</Badge> },
    { key: 'saleDate', header: 'Date', render: (row) => formatDateTime(row.saleDate || row.createdAt) },
  ]

  return (
    <div>
      <PageHeader
        title="Sales"
        description="Record and review sales made to customers."
        actions={
          <Button icon={Receipt} onClick={() => setIsFormOpen(true)}>
            Record Sale
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by invoice number…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredSales}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No sales found"
        emptyDescription={search ? 'Try a different search term.' : 'Record your first sale to get started.'}
      />

      <SaleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={refetch}
        customers={customers}
      />
    </div>
  )
}
