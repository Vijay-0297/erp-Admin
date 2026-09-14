import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createSalesReturn } from '../../api/salesReturnApi'
import { validate, isRequired, isPositiveNumber } from '../../utils/validators'

const EMPTY = {
  saleId: '',
  customerId: '',
  totalAmount: '',
  refundStatus: 'PENDING',
  notes: '',
}

const REFUND_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'COMPLETED', label: 'Completed' },
]

export default function SalesReturnFormModal({ isOpen, onClose, onSaved, sales = [], customers = [] }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(EMPTY)
      setErrors({})
    }
  }, [isOpen])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const saleOptions = (sales || []).map((sale) => ({
    value: sale.id,
    label: sale.invoiceNumber || `Sale #${sale.id}`,
  }))

  const customerOptions = (customers || []).map((customer) => ({
    value: customer.id,
    label: customer.customerName || `Customer #${customer.id}`,
  }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      saleId: [isRequired],
      customerId: [isRequired],
      totalAmount: [isRequired, isPositiveNumber],
      refundStatus: [isRequired],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await createSalesReturn({
        saleId: Number(values.saleId),
        customerId: Number(values.customerId),
        totalAmount: Number(values.totalAmount),
        refundStatus: values.refundStatus,
        notes: values.notes,
      })
      toast.success('Sales return created successfully')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to create sales return')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sales Return"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            Create return
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Sale"
            options={saleOptions}
            value={values.saleId}
            onChange={onChange('saleId')}
            error={errors.saleId}
            required
          />
          <Select
            label="Customer"
            options={customerOptions}
            value={values.customerId}
            onChange={onChange('customerId')}
            error={errors.customerId}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Total amount"
            type="number"
            step="0.01"
            value={values.totalAmount}
            onChange={onChange('totalAmount')}
            error={errors.totalAmount}
            required
          />
          <Select
            label="Refund status"
            options={REFUND_STATUS_OPTIONS}
            value={values.refundStatus}
            onChange={onChange('refundStatus')}
            error={errors.refundStatus}
            required
          />
        </div>

        <Input
          label="Notes"
          value={values.notes}
          onChange={onChange('notes')}
          error={errors.notes}
          placeholder="Customer returned damaged products"
        />
      </form>
    </Modal>
  )
}
