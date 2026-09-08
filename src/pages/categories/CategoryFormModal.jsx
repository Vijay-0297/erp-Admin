import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'

import { createCategory, updateCategory } from '../../api/categoryApi'
import { useCategories } from '../../context/CategoriesContext'
import { validate, isRequired } from '../../utils/validators'
import { STATUS_OPTIONS } from '../../utils/constants'

const EMPTY = {
  categoryName: '',
  description: '',
  status: 'active',
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSaved,
  category,
}) {
  const { addCategory, updateCategoryLocal } = useCategories()
  const categoryKeyId = category?.id ?? category?.categoryId
  const isEditMode = Boolean(category && categoryKeyId != null)

  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (category) {
      setValues({
        categoryName: category.categoryName || '',
        description: category.description || '',
        status: category.status || 'active',
      })
    } else {
      setValues(EMPTY)
    }

    setErrors({})
  }, [isOpen, category])

  const onChange = (field) => (e) => {
    setValues((previous) => ({
      ...previous,
      [field]: e.target.value,
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const fieldErrors = validate(values, {
      categoryName: [isRequired],
    })

    setErrors(fieldErrors)

    if (Object.keys(fieldErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode) {
        if (categoryKeyId == null) {
          toast.error('Invalid category id')
          return
        }

        // Prefer numeric id when possible (backend expects integer path param)
        const numericId = Number(categoryKeyId)
        const idForRequest = Number.isFinite(numericId) ? numericId : categoryKeyId

        console.log('Updating category:', idForRequest, values)

        // Include both id and categoryId so the backend entity mapping works
        // regardless of whether the @Id field is named 'id' or 'categoryId'
        const res = await updateCategory(idForRequest, { id: idForRequest, categoryId: idForRequest, ...values })
        const updated = res?.data || null

        toast.success('Category updated successfully')
        if (updated) updateCategoryLocal(updated)
      } else {
        console.log('Creating category:', values)
        const res = await createCategory(values)
        const created = res?.data || null

        toast.success('Category created successfully')
        if (created) addCategory(created)
      }

      await onSaved()
      onClose()
    } catch (err) {
      console.error('Category save error:', err)

      // If server returned validation errors, display them on the form
      if (err && err.errors) {
        setErrors(err.errors)
        toast.error(err.message || 'Validation failed')
        return
      }

      toast.error(err.message || 'Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditMode
          ? 'Edit Category'
          : 'Create Category'
      }
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            onClick={onSubmit}
            isLoading={isSubmitting}
          >
            {isEditMode
              ? 'Save changes'
              : 'Create category'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={onSubmit}
        className="space-y-4"
        noValidate
      >
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

        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={values.status}
          onChange={onChange('status')}
        />
      </form>
    </Modal>
  )
}