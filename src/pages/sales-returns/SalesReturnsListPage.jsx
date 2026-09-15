import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { getSalesReturns } from '../../api/salesReturnApi'
import { getSales } from '../../api/salesApi'
import { getCustomers } from '../../api/customerApi'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import SalesReturnFormModal from './SalesReturnFormModal.jsx'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function SalesReturnsListPage() {
  const { data: salesReturns, isLoading, error, refetch } = useApi(getSalesReturns, [])
  const { data: sales } = useApi(getSales, [])
  const { data: customers } = useApi(getCustomers, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const customerNameById = useMemo(() => {
    const map = {}
    ;(customers || []).forEach((customer) => (map[customer.id] = customer.customerName))
    return map
  }, [customers])

  const invoiceBySaleId = useMemo(() => {
    const map = {}
    ;(sales || []).forEach((sale) => (map[sale.id] = sale.invoiceNumber))
    return map
  }, [sales])

  const filteredSalesReturns = useMemo(() => {
    if (!salesReturns) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return salesReturns

    return salesReturns.filter((row) => {
      const invoice = invoiceBySaleId[row.saleId] || ''
      const customer = customerNameById[row.customerId] || ''
      const text = `${invoice} ${customer} ${row.notes || ''}`.toLowerCase()
      return text.includes(q)
    })
  }, [salesReturns, debouncedSearch, customerNameById, invoiceBySaleId])

  const columns = [
    { key: 'saleId', header: 'Sale', render: (row) => invoiceBySaleId[row.saleId] || `#${row.saleId}` },
    { key: 'customerId', header: 'Customer', render: (row) => customerNameById[row.customerId] || '—' },
    { key: 'totalAmount', header: 'Amount', sortable: true, render: (row) => formatCurrency(row.totalAmount) },
    { key: 'refundStatus', header: 'Status', render: (row) => <Badge>{row.refundStatus}</Badge> },
    { key: 'notes', header: 'Notes', render: (row) => row.notes || '—' },
    { key: 'createdAt', header: 'Date', render: (row) => formatDateTime(row.createdAt || row.returnDate) },
  ]

  return (
    <div>
      <PageHeader
        title="Sales Returns"
        description="Track returned sales and refund status for customers."
        actions={
          <Button icon={RotateCcw} onClick={() => setIsFormOpen(true)}>
            New Return
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by sale, customer or notes…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredSalesReturns}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No sales returns found"
        emptyDescription={search ? 'Try a different search term.' : 'Create your first sales return.'}
      />

      <SalesReturnFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={refetch}
        sales={sales}
        customers={customers}
      />
    </div>
  )
}
