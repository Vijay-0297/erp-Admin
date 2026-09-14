import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createCategory, updateCategory } from '../../api/categoryApi'
import { validate, isRequired } from '../../utils/validators'
import { STATUS_OPTIONS } from '../../utils/constants'
import { getCategoryId } from '../../utils/productUtils'

const EMPTY = { categoryName: '', description: '', status: 'active' }

export default function CategoryFormModal({ isOpen, onClose, onSaved, category }) {
  const isEditMode = Boolean(category)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        category
          ? {
              categoryName: category.categoryName || '',
              description: category.description || '',
              status: category.status || 'active',
            }
          : EMPTY
      )
      setErrors({})
    }
  }, [isOpen, category])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, { categoryName: [isRequired] })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      if (isEditMode) {
        const catId = getCategoryId(category)
        if (!catId) {
          throw new Error('Category ID missing. Unable to update.')
        }
        await updateCategory(catId, values)
        toast.success('Category updated successfully')
      } else {
        await createCategory(values)
        toast.success('Category created successfully')
      }
      onSaved()
      onClose()
    } catch (err) {
      try {
        const catId = getCategoryId(category)
        const saved = JSON.parse(localStorage.getItem('local_categories') || '[]')
        if (isEditMode && catId) {
          const idx = saved.findIndex((c) => String(getCategoryId(c)) === String(catId))
          if (idx !== -1) {
            saved[idx] = { ...saved[idx], ...values, id: catId, categoryId: catId }
          } else {
            saved.push({ id: catId, categoryId: catId, ...values })
          }
        } else {
          const newId = `local-${Date.now()}`
          saved.push({ id: newId, categoryId: newId, ...values })
        }
        localStorage.setItem('local_categories', JSON.stringify(saved))
        toast.success('Category saved locally (offline fallback)')
        onSaved()
        onClose()
      } catch (localErr) {
        toast.error(err.message || 'Failed to save category')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Category' : 'Create Category'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Create category'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Category name"
          value={values.categoryName}
          onChange={onChange('categoryName')}
          error={errors.categoryName}
          required
        />
        <Input
          label="Description"
          value={values.description}
          onChange={onChange('description')}
          error={errors.description}
        />
        <Select label="Status" options={STATUS_OPTIONS} value={values.status} onChange={onChange('status')} />
      </form>
    </Modal>
  )
}
