import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createCustomer, updateCustomer } from '../../api/customerApi'
import { validate, isRequired, isEmail, isMobile } from '../../utils/validators'
import { STATUS_OPTIONS } from '../../utils/constants'

const EMPTY = { customerName: '', phone: '', email: '', address: '', status: 'active' }

export default function CustomerFormModal({ isOpen, onClose, onSaved, customer }) {
  const isEditMode = Boolean(customer)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        customer
          ? {
              customerName: customer.customerName || '',
              phone: customer.phone || '',
              email: customer.email || '',
              address: customer.address || '',
              status: customer.status || 'active',
            }
          : EMPTY
      )
      setErrors({})
    }
  }, [isOpen, customer])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      customerName: [isRequired],
      phone: [isRequired, isMobile],
      email: [isEmail],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      // The create-customer contract omits `status`; only send it on update,
      // matching what the backend examples actually accept.
      const payload = isEditMode ? values : { ...values, status: undefined }
      if (isEditMode) {
        await updateCustomer(customer.id, payload)
        toast.success('Customer updated successfully')
      } else {
        await createCustomer(payload)
        toast.success('Customer created successfully')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Customer' : 'Create Customer'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Create customer'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Customer name"
          value={values.customerName}
          onChange={onChange('customerName')}
          error={errors.customerName}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" value={values.phone} onChange={onChange('phone')} error={errors.phone} required />
          <Input label="Email" type="email" value={values.email} onChange={onChange('email')} error={errors.email} />
        </div>
        <Input label="Address" value={values.address} onChange={onChange('address')} error={errors.address} />
        {isEditMode && (
          <Select label="Status" options={STATUS_OPTIONS} value={values.status} onChange={onChange('status')} />
        )}
      </form>
    </Modal>
  )
}
