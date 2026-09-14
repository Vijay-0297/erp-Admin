import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createSalesItem, updateSalesItem } from '../../api/salesItemApi'
import { validate, isRequired, isPositiveNumber } from '../../utils/validators'

const EMPTY = { saleId: '', productId: '', quantity: '', sellingPrice: '' }

export default function SalesItemFormModal({ isOpen, onClose, onSaved, item, sales, products }) {
  const isEditMode = Boolean(item)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        item
          ? {
              saleId: item.saleId ?? '',
              productId: item.productId ?? '',
              quantity: item.quantity ?? '',
              sellingPrice: item.sellingPrice ?? '',
            }
          : EMPTY
      )
      setErrors({})
    }
  }, [isOpen, item])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const saleOptions = (sales || []).map((sale) => ({
    value: sale.id,
    label: sale.invoiceNumber || `Sale #${sale.id}`,
  }))
  const productOptions = (products || []).map((product) => ({
    value: product.id,
    label: product.productName,
  }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      saleId: [isRequired],
      productId: [isRequired],
      quantity: [isRequired, isPositiveNumber],
      sellingPrice: [isRequired, isPositiveNumber],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const payload = {
        saleId: Number(values.saleId),
        productId: Number(values.productId),
        quantity: Number(values.quantity),
        sellingPrice: Number(values.sellingPrice),
      }

      if (isEditMode) {
        await updateSalesItem(item.id, payload)
        toast.success('Sales item updated successfully')
      } else {
        await createSalesItem(payload)
        toast.success('Sales item created successfully')
      }

      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save sales item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Sales Item' : 'Add Sales Item'}
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
          label="Sale invoice"
          options={saleOptions}
          value={values.saleId}
          onChange={onChange('saleId')}
          error={errors.saleId}
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
            label="Selling price"
            type="number"
            step="0.01"
            value={values.sellingPrice}
            onChange={onChange('sellingPrice')}
            error={errors.sellingPrice}
            required
          />
        </div>
      </form>
    </Modal>
  )
}
