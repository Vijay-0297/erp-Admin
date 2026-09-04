import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createUser, updateUser } from '../../api/userApi'
import { validate, isRequired, isEmail, isMobile, minLength } from '../../utils/validators'

const EMPTY = { username: '', email: '', password: '', fullName: '', mobile: '', roleId: '' }

export default function UserFormModal({ isOpen, onClose, onSaved, user, roles }) {
  const isEditMode = Boolean(user)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        user
          ? {
              username: user.username || '',
              email: user.email || '',
              password: '',
              fullName: user.fullName || '',
              mobile: user.mobile || '',
              roleId: user.roleId ?? '',
            }
          : EMPTY
      )
      setErrors({})
    }
  }, [isOpen, user])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const roleOptions = (roles || []).map((r) => ({ value: r.id, label: r.roleName }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const schema = {
      username: [isRequired],
      fullName: [isRequired],
      email: [isRequired, isEmail],
      mobile: [isMobile],
      password: isEditMode ? [] : [isRequired, minLength(6)],
    }
    const fieldErrors = validate(values, schema)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const payload = { ...values }
      if (isEditMode && !payload.password) delete payload.password
      if (payload.roleId === '') delete payload.roleId
      if (isEditMode) {
        await updateUser(user.id, payload)
        toast.success('User updated successfully')
      } else {
        await createUser(payload)
        toast.success('User created successfully')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit User' : 'Create User'}
      description={isEditMode ? 'Update this user\'s details.' : 'Add a new user to your workspace.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Full name"
          value={values.fullName}
          onChange={onChange('fullName')}
          error={errors.fullName}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Username"
            value={values.username}
            onChange={onChange('username')}
            error={errors.username}
            required
          />
          <Input
            label="Mobile"
            value={values.mobile}
            onChange={onChange('mobile')}
            error={errors.mobile}
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={values.email}
          onChange={onChange('email')}
          error={errors.email}
          required
        />
        <Input
          label={isEditMode ? 'New password' : 'Password'}
          type="password"
          value={values.password}
          onChange={onChange('password')}
          error={errors.password}
          hint={isEditMode ? 'Leave blank to keep the current password' : undefined}
          required={!isEditMode}
        />
        <Select
          label="Role"
          options={roleOptions}
          value={values.roleId}
          onChange={onChange('roleId')}
        />
      </form>
    </Modal>
  )
}
