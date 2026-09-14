import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createProduct, updateProduct } from '../../api/productApi'
import { getCategories } from '../../api/categoryApi'
import { validate, isRequired, isPositiveNumber } from '../../utils/validators'
import { STATUS_OPTIONS } from '../../utils/constants'
import {
  getProductId,
  getCategoryId,
  getCategoryName,
  resolveProductCategoryId,
  resolveProductCategoryName,
} from '../../utils/productUtils'

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

export default function ProductFormModal({ isOpen, onClose, onSaved, product, categories = [] }) {
  const isEditMode = Boolean(product)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [internalCategories, setInternalCategories] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  // Use passed categories, or fall back to internalCategories if empty
  const activeCategories = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return categories
    }
    return internalCategories
  }, [categories, internalCategories])

  // If no categories were passed and modal opens, fetch them
  useEffect(() => {
    if (!isOpen) return
    if (Array.isArray(categories) && categories.length > 0) return

    let isMounted = true
    setIsLoadingCategories(true)
    getCategories()
      .then((res) => {
        if (isMounted && res?.data) {
          setInternalCategories(Array.isArray(res.data) ? res.data : [])
        }
      })
      .catch(() => {
        // Handled gracefully via options
      })
      .finally(() => {
        if (isMounted) setIsLoadingCategories(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, categories])

  // Initialize form state whenever modal opens or product changes
  useEffect(() => {
    if (!isOpen) return

    if (product) {
      const rawCatId = resolveProductCategoryId(product, activeCategories)
      setValues({
        categoryId: rawCatId != null && rawCatId !== '' ? String(rawCatId) : '',
        productName: product.productName || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        purchasePrice: product.purchasePrice != null ? String(product.purchasePrice) : '',
        sellingPrice: product.sellingPrice != null ? String(product.sellingPrice) : '',
        stockQuantity: product.stockQuantity != null ? String(product.stockQuantity) : '',
        minimumStock: product.minimumStock != null ? String(product.minimumStock) : '',
        unit: product.unit || '',
        status: product.status || 'active',
      })
    } else {
      setValues(EMPTY)
    }
    setErrors({})
  }, [isOpen, product])

  // Build selectable category options
  const categoryOptions = useMemo(() => {
    const list = (activeCategories || [])
      .map((cat) => {
        const id = getCategoryId(cat)
        const name = getCategoryName(cat)
        if (id == null || id === '') return null
        return { value: String(id), label: name || `Category #${id}` }
      })
      .filter(Boolean)

    // If product has a category that isn't in activeCategories yet (e.g. while loading),
    // inject a fallback option so the dropdown immediately shows the correct category
    if (values.categoryId) {
      const exists = list.some((opt) => opt.value === String(values.categoryId))
      if (!exists) {
        const fallbackName = resolveProductCategoryName(product, activeCategories) || `Category #${values.categoryId}`
        list.unshift({ value: String(values.categoryId), label: fallbackName })
      }
    }

    return list
  }, [activeCategories, values.categoryId, product])

  const onChange = (field) => (e) => {
    const val = e.target.value
    setValues((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const fieldErrors = validate(values, {
      productName: [isRequired],
      sku: [isRequired],
      categoryId: [(val) => (!val || String(val).trim() === '' ? 'Category is required.' : null)],
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
        productName: values.productName.trim(),
        categoryId: Number(values.categoryId),
        sku: values.sku.trim(),
        barcode: values.barcode ? values.barcode.trim() : '',
        purchasePrice: Number(values.purchasePrice),
        sellingPrice: Number(values.sellingPrice),
        stockQuantity: Number(values.stockQuantity),
        minimumStock: values.minimumStock === '' ? 0 : Number(values.minimumStock),
        unit: values.unit ? values.unit.trim() : '',
        status: values.status || 'active',
      }

      if (isEditMode) {
        const productId = getProductId(product)
        if (!productId) {
          throw new Error('Product ID is missing. Unable to update.')
        }
        await updateProduct(productId, payload)
        toast.success('Product updated successfully')
      } else {
        await createProduct(payload)
        toast.success('Product created successfully')
      }

      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save product')
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
            value={values.categoryId ?? ''}
            onChange={onChange('categoryId')}
            placeholder={isLoadingCategories ? 'Loading categories…' : 'Select…'}
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
