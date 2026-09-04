import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { createRole, updateRole } from '../../api/roleApi'
import { validate, isRequired } from '../../utils/validators'

const EMPTY = { roleName: '', description: '' }

export default function RoleFormModal({ isOpen, onClose, onSaved, role }) {
  const isEditMode = Boolean(role)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(role ? { roleName: role.roleName || '', description: role.description || '' } : EMPTY)
      setErrors({})
    }
  }, [isOpen, role])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, { roleName: [isRequired] })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      if (isEditMode) {
        await updateRole(role.id, values)
        toast.success('Role updated successfully')
      } else {
        await createRole(values)
        toast.success('Role created successfully')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save role')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Role' : 'Create Role'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Create role'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Role name"
          placeholder="e.g. ADMIN"
          value={values.roleName}
          onChange={onChange('roleName')}
          error={errors.roleName}
          required
        />
        <Input
          label="Description"
          placeholder="What can this role do?"
          value={values.description}
          onChange={onChange('description')}
          error={errors.description}
        />
      </form>
    </Modal>
  )
}
