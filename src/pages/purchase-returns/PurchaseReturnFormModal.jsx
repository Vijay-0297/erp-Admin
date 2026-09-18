import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createPurchaseReturn, updatePurchaseReturn } from '../../api/purchaseReturnApi'
import { validate, isRequired, isPositiveNumber } from '../../utils/validators'

const EMPTY = {
  purchaseId: '',
  supplierId: '',
  totalAmount: '',
  notes: '',
}

export default function PurchaseReturnFormModal({ isOpen, onClose, onSaved, purchaseReturn, purchases = [], suppliers = [] }) {
  const isEditMode = Boolean(purchaseReturn)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        purchaseReturn
          ? {
              purchaseId: purchaseReturn.purchaseId ?? '',
              supplierId: purchaseReturn.supplierId ?? '',
              totalAmount: purchaseReturn.totalAmount ?? '',
              notes: purchaseReturn.notes ?? '',
            }
          : EMPTY
      )
      setErrors({})
    }
  }, [isOpen, purchaseReturn])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const purchaseOptions = (purchases || []).map((purchase) => ({
    value: purchase.id,
    label: purchase.invoiceNumber || `Purchase #${purchase.id}`,
  }))

  const supplierOptions = (suppliers || []).map((supplier) => ({
    value: supplier.id,
    label: supplier.supplierName || `Supplier #${supplier.id}`,
  }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      purchaseId: [isRequired],
      supplierId: [isRequired],
      totalAmount: [isRequired, isPositiveNumber],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const payload = {
        purchaseId: Number(values.purchaseId),
        supplierId: Number(values.supplierId),
        totalAmount: Number(values.totalAmount),
        notes: values.notes,
      }

      if (isEditMode) {
        await updatePurchaseReturn(purchaseReturn.id, payload)
        toast.success('Purchase return updated successfully')
      } else {
        await createPurchaseReturn(payload)
        toast.success('Purchase return created successfully')
      }

      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save purchase return')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Purchase Return' : 'Create Purchase Return'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Create return'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Purchase"
            options={purchaseOptions}
            value={values.purchaseId}
            onChange={onChange('purchaseId')}
            error={errors.purchaseId}
            required
          />
          <Select
            label="Supplier"
            options={supplierOptions}
            value={values.supplierId}
            onChange={onChange('supplierId')}
            error={errors.supplierId}
            required
          />
        </div>

        <Input
          label="Total amount"
          type="number"
          step="0.01"
          value={values.totalAmount}
          onChange={onChange('totalAmount')}
          error={errors.totalAmount}
          required
        />

        <Input
          label="Notes"
          value={values.notes}
          onChange={onChange('notes')}
          error={errors.notes}
          placeholder="Damaged products returned to supplier"
        />
      </form>
    </Modal>
  )
}
