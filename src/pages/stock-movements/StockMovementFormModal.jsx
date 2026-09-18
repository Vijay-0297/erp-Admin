import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import Textarea from '../../components/ui/Input.jsx'
import { createStockMovement } from '../../api/stockMovementApi'
import { validate, isRequired, isPositiveNumber } from '../../utils/validators'

const EMPTY = {
  productId: '',
  movementType: 'PURCHASE',
  quantity: '',
  referenceId: '',
  notes: '',
}

export default function StockMovementFormModal({ isOpen, onClose, onSaved, item, products }) {
  const isEditMode = Boolean(item)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        item
          ? {
              productId: item.productId ?? '',
              movementType: item.movementType ?? 'PURCHASE',
              quantity: item.quantity ?? '',
              referenceId: item.referenceId ?? '',
              notes: item.notes ?? '',
            }
          : EMPTY
      )
      setErrors({})
    }
  }, [isOpen, item])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const productOptions = (products || []).map((p) => ({ value: p.id, label: p.productName }))

  const movementOptions = [
    { value: 'PURCHASE', label: 'Purchase' },
    { value: 'SALE', label: 'Sale' },
    { value: 'ADJUSTMENT', label: 'Adjustment' },
    { value: 'TRANSFER', label: 'Transfer' },
  ]

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      productId: [isRequired],
      movementType: [isRequired],
      quantity: [isRequired, isPositiveNumber],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const payload = {
        productId: Number(values.productId),
        movementType: values.movementType,
        quantity: Number(values.quantity),
        referenceId: values.referenceId ? Number(values.referenceId) : null,
        notes: values.notes,
      }

      await createStockMovement(payload)
      toast.success('Stock movement recorded')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to record stock movement')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Stock Movement' : 'Record Stock Movement'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Record'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Select label="Product" options={productOptions} value={values.productId} onChange={onChange('productId')} error={errors.productId} required />

        <Select label="Movement type" options={movementOptions} value={values.movementType} onChange={onChange('movementType')} error={errors.movementType} required />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Quantity" type="number" value={values.quantity} onChange={onChange('quantity')} error={errors.quantity} required />
          <Input label="Reference ID" type="number" value={values.referenceId} onChange={onChange('referenceId')} />
        </div>

        <Input label="Notes" as="textarea" value={values.notes} onChange={onChange('notes')} />
      </form>
    </Modal>
  )
}
