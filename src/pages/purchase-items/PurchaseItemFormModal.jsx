import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createPurchaseItem, updatePurchaseItem } from '../../api/purchaseItemApi'
import { validate, isRequired, isPositiveNumber } from '../../utils/validators'

const EMPTY = { purchaseId: '', productId: '', quantity: '', purchasePrice: '' }

export default function PurchaseItemFormModal({ isOpen, onClose, onSaved, item, purchases, products }) {
  const isEditMode = Boolean(item)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        item
          ? {
              purchaseId: item.purchaseId ?? '',
              productId: item.productId ?? '',
              quantity: item.quantity ?? '',
              purchasePrice: item.purchasePrice ?? '',
            }
          : EMPTY
      )
      setErrors({})
    }
  }, [isOpen, item])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const purchaseOptions = (purchases || []).map((p) => ({ value: p.id, label: p.invoiceNumber || `Purchase #${p.id}` }))
  const productOptions = (products || []).map((p) => ({ value: p.id, label: p.productName }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      purchaseId: [isRequired],
      productId: [isRequired],
      quantity: [isRequired, isPositiveNumber],
      purchasePrice: [isRequired, isPositiveNumber],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const payload = {
        purchaseId: Number(values.purchaseId),
        productId: Number(values.productId),
        quantity: Number(values.quantity),
        purchasePrice: Number(values.purchasePrice),
      }
      if (isEditMode) {
        await updatePurchaseItem(item.id, payload)
        toast.success('Purchase item updated successfully')
      } else {
        await createPurchaseItem(payload)
        toast.success('Purchase item created successfully')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save purchase item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Purchase Item' : 'Add Purchase Item'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Add item'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Select
          label="Purchase (invoice)"
          options={purchaseOptions}
          value={values.purchaseId}
          onChange={onChange('purchaseId')}
          error={errors.purchaseId}
          required
        />
        <Select
          label="Product"
          options={productOptions}
          value={values.productId}
          onChange={onChange('productId')}
          error={errors.productId}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            value={values.quantity}
            onChange={onChange('quantity')}
            error={errors.quantity}
            required
          />
          <Input
            label="Purchase price"
            type="number"
            step="0.01"
            value={values.purchasePrice}
            onChange={onChange('purchasePrice')}
            error={errors.purchasePrice}
            required
          />
        </div>
      </form>
    </Modal>
  )
}
