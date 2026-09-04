import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createProduct, updateProduct } from '../../api/productApi'
import { validate, isRequired, isPositiveNumber } from '../../utils/validators'
import { STATUS_OPTIONS } from '../../utils/constants'

const EMPTY = {
  categoryId: '',
  productName: '',
  sku: '',
  barcode: '',
  purchasePrice: '',
  sellingPrice: '',
  stockQuantity: '',
  minimumStock: '',
  unit: '',
  status: 'active',
}

export default function ProductFormModal({ isOpen, onClose, onSaved, product, categories }) {
  const isEditMode = Boolean(product)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        product
          ? {
              categoryId: product.categoryId ?? '',
              productName: product.productName || '',
              sku: product.sku || '',
              barcode: product.barcode || '',
              purchasePrice: product.purchasePrice ?? '',
              sellingPrice: product.sellingPrice ?? '',
              stockQuantity: product.stockQuantity ?? '',
              minimumStock: product.minimumStock ?? '',
              unit: product.unit || '',
              status: product.status || 'active',
            }
          : EMPTY
      )
      setErrors({})
    }
  }, [isOpen, product])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const categoryOptions = (categories || []).map((c) => ({ value: c.id, label: c.categoryName }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      productName: [isRequired],
      sku: [isRequired],
      categoryId: [isRequired],
      purchasePrice: [isRequired, isPositiveNumber],
      sellingPrice: [isRequired, isPositiveNumber],
      stockQuantity: [isRequired, isPositiveNumber],
      minimumStock: [isPositiveNumber],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const payload = {
        ...values,
        categoryId: Number(values.categoryId),
        purchasePrice: Number(values.purchasePrice),
        sellingPrice: Number(values.sellingPrice),
        stockQuantity: Number(values.stockQuantity),
        minimumStock: values.minimumStock === '' ? 0 : Number(values.minimumStock),
      }
      if (isEditMode) {
        await updateProduct(product.id, payload)
        toast.success('Product updated successfully')
      } else {
        await createProduct(payload)
        toast.success('Product created successfully')
      }
      onSaved()
      onClose()
    } catch (err) {
      // If API fails (dev server down or network error), persist locally as a fallback
      try {
        const payload = {
          ...values,
          categoryId: Number(values.categoryId),
          purchasePrice: Number(values.purchasePrice),
          sellingPrice: Number(values.sellingPrice),
          stockQuantity: Number(values.stockQuantity),
          minimumStock: values.minimumStock === '' ? 0 : Number(values.minimumStock),
        }
        const saved = JSON.parse(localStorage.getItem('local_products') || '[]')
        if (isEditMode && product && product.id) {
          // replace existing local item if present
          const idx = saved.findIndex((p) => p.id === product.id)
          if (idx !== -1) saved[idx] = { ...saved[idx], ...payload }
          else saved.push({ id: product.id, ...payload })
        } else {
          // create temp id and push
          const id = `local-${Date.now()}`
          saved.push({ id, ...payload })
        }
        localStorage.setItem('local_products', JSON.stringify(saved))
        toast.success('Product saved locally (offline fallback)')
        onSaved()
        onClose()
      } catch (localErr) {
        toast.error(err.message || 'Failed to save product')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Product' : 'Create Product'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Product name"
            value={values.productName}
            onChange={onChange('productName')}
            error={errors.productName}
            required
            containerClassName="col-span-2"
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={values.categoryId}
            onChange={onChange('categoryId')}
            error={errors.categoryId}
            required
          />
          <Input label="Unit" placeholder="e.g. Piece, Box" value={values.unit} onChange={onChange('unit')} />
          <Input label="SKU" value={values.sku} onChange={onChange('sku')} error={errors.sku} required />
          <Input label="Barcode" value={values.barcode} onChange={onChange('barcode')} />
          <Input
            label="Purchase price"
            type="number"
            step="0.01"
            value={values.purchasePrice}
            onChange={onChange('purchasePrice')}
            error={errors.purchasePrice}
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
          <Input
            label="Stock quantity"
            type="number"
            value={values.stockQuantity}
            onChange={onChange('stockQuantity')}
            error={errors.stockQuantity}
            required
          />
          <Input
            label="Minimum stock"
            type="number"
            value={values.minimumStock}
            onChange={onChange('minimumStock')}
            error={errors.minimumStock}
            hint="Used to flag low-stock alerts"
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={values.status}
            onChange={onChange('status')}
            containerClassName="col-span-2"
          />
        </div>
      </form>
    </Modal>
  )
}
