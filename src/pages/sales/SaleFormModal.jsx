import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createSale } from '../../api/salesApi'
import { validate, isRequired, isPositiveNumber } from '../../utils/validators'
import { PAYMENT_STATUS_OPTIONS } from '../../utils/constants'
import { useAuth } from '../../hooks/useAuth'

const EMPTY = { customerId: '', invoiceNumber: '', totalAmount: '', paymentStatus: 'PENDING' }

export default function SaleFormModal({ isOpen, onClose, onSaved, customers }) {
  const { user } = useAuth()
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

  const customerOptions = (customers || []).map((c) => ({ value: c.id, label: c.customerName }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      customerId: [isRequired],
      invoiceNumber: [isRequired],
      totalAmount: [isRequired, isPositiveNumber],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await createSale({
        customerId: Number(values.customerId),
        invoiceNumber: values.invoiceNumber,
        totalAmount: Number(values.totalAmount),
        paymentStatus: values.paymentStatus,
        createdBy: user?.id ?? 1,
      })
      toast.success('Sale recorded successfully')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to record sale')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Sale"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            Record sale
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Select
          label="Customer"
          options={customerOptions}
          value={values.customerId}
          onChange={onChange('customerId')}
          error={errors.customerId}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Invoice number"
            value={values.invoiceNumber}
            onChange={onChange('invoiceNumber')}
            error={errors.invoiceNumber}
            required
          />
          <Input
            label="Total amount"
            type="number"
            step="0.01"
            value={values.totalAmount}
            onChange={onChange('totalAmount')}
            error={errors.totalAmount}
            required
          />
        </div>
        <Select
          label="Payment status"
          options={PAYMENT_STATUS_OPTIONS}
          value={values.paymentStatus}
          onChange={onChange('paymentStatus')}
        />
      </form>
    </Modal>
  )
}
