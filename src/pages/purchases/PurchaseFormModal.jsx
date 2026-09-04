import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createPurchase, updatePurchase } from '../../api/purchaseApi'
import { validate, isRequired, isPositiveNumber } from '../../utils/validators'
import { PAYMENT_STATUS_OPTIONS } from '../../utils/constants'
import { useAuth } from '../../hooks/useAuth'

const EMPTY = {
  supplierId: '',
  invoiceNumber: '',
  purchaseDateTime: '',
  totalAmount: '',
  paymentStatus: 'PENDING',
}

export default function PurchaseFormModal({ isOpen, onClose, onSaved, purchase, suppliers }) {
  const { user } = useAuth()
  const isEditMode = Boolean(purchase)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        purchase
          ? {
              supplierId: purchase.supplierId ?? '',
              invoiceNumber: purchase.invoiceNumber || '',
              purchaseDateTime: purchase.purchaseDateTime ? purchase.purchaseDateTime.slice(0, 16) : '',
              totalAmount: purchase.totalAmount ?? '',
              paymentStatus: purchase.paymentStatus || 'PENDING',
            }
          : { ...EMPTY, purchaseDateTime: new Date().toISOString().slice(0, 16) }
      )
      setErrors({})
    }
  }, [isOpen, purchase])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const supplierOptions = (suppliers || []).map((s) => ({ value: s.id, label: s.supplierName }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      supplierId: [isRequired],
      invoiceNumber: [isRequired],
      totalAmount: [isRequired, isPositiveNumber],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const payload = {
        supplierId: Number(values.supplierId),
        invoiceNumber: values.invoiceNumber,
        totalAmount: Number(values.totalAmount),
        paymentStatus: values.paymentStatus,
        createdBy: purchase?.createdBy ?? user?.id ?? 1,
      }
      if (!isEditMode) payload.purchaseDateTime = values.purchaseDateTime
      if (isEditMode) {
        await updatePurchase(purchase.id, payload)
        toast.success('Purchase updated successfully')
      } else {
        await createPurchase(payload)
        toast.success('Purchase created successfully')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save purchase')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Purchase' : 'Create Purchase'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Create purchase'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Select
          label="Supplier"
          options={supplierOptions}
          value={values.supplierId}
          onChange={onChange('supplierId')}
          error={errors.supplierId}
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
        {!isEditMode && (
          <Input
            label="Purchase date & time"
            type="datetime-local"
            value={values.purchaseDateTime}
            onChange={onChange('purchaseDateTime')}
          />
        )}
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
