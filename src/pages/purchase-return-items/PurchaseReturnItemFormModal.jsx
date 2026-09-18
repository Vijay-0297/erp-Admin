import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createPurchaseReturnItem, updatePurchaseReturnItem } from '../../api/purchaseReturnItemApi'
import { validate, isRequired, isPositiveNumber } from '../../utils/validators'

const EMPTY = {
  purchaseReturnId: '',
  productId: '',
  quantity: '',
  price: '',
}

export default function PurchaseReturnItemFormModal({ isOpen, onClose, onSaved, item, purchaseReturns, products }) {
  const isEditMode = Boolean(item)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        item
          ? {
              purchaseReturnId: item.purchaseReturnId ?? '',
              productId: item.productId ?? '',
              quantity: item.quantity ?? '',
              price: item.price ?? '',
            }
          : EMPTY
      )
      setErrors({})
    }
  }, [isOpen, item])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const purchaseReturnOptions = (purchaseReturns || []).map((pr) => ({ value: pr.id, label: `Return #${pr.id}` }))

  const productOptions = (products || []).map((product) => ({ value: product.id, label: product.productName }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      purchaseReturnId: [isRequired],
      productId: [isRequired],
      quantity: [isRequired, isPositiveNumber],
      price: [isRequired, isPositiveNumber],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const payload = {
        purchaseReturnId: Number(values.purchaseReturnId),
        productId: Number(values.productId),
        quantity: Number(values.quantity),
        price: Number(values.price),
      }

      if (isEditMode) {
        await updatePurchaseReturnItem(item.id, payload)
        toast.success('Purchase return item updated successfully')
      } else {
        await createPurchaseReturnItem(payload)
        toast.success('Purchase return item created successfully')
      }

      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save purchase return item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Purchase Return Item' : 'Add Purchase Return Item'}
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
          label="Purchase return"
          options={purchaseReturnOptions}
          value={values.purchaseReturnId}
          onChange={onChange('purchaseReturnId')}
          error={errors.purchaseReturnId}
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
            label="Unit price"
            type="number"
            step="0.01"
            value={values.price}
            onChange={onChange('price')}
            error={errors.price}
            required
          />
        </div>
      </form>
    </Modal>
  )
}
