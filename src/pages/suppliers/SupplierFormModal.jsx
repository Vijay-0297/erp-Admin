import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import { createSupplier, updateSupplier } from '../../api/supplierApi'
import { validate, isRequired, isEmail, isMobile } from '../../utils/validators'

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
]

const EMPTY = { supplierName: '', contactPerson: '', phone: '', email: '', address: '', status: 'ACTIVE' }

export default function SupplierFormModal({ isOpen, onClose, onSaved, supplier }) {
  const isEditMode = Boolean(supplier)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        supplier
          ? {
              supplierName: supplier.supplierName || '',
              contactPerson: supplier.contactPerson || '',
              phone: supplier.phone || '',
              email: supplier.email || '',
              address: supplier.address || '',
              status: supplier.status || 'ACTIVE',
            }
          : EMPTY
      )
      setErrors({})
    }
  }, [isOpen, supplier])

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      supplierName: [isRequired],
      contactPerson: [isRequired],
      phone: [isRequired, isMobile],
      email: [isEmail],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      if (isEditMode) {
        await updateSupplier(supplier.id, values)
        toast.success('Supplier updated successfully')
      } else {
        await createSupplier(values)
        toast.success('Supplier created successfully')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save supplier')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Supplier' : 'Create Supplier'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Create supplier'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Supplier name"
          value={values.supplierName}
          onChange={onChange('supplierName')}
          error={errors.supplierName}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contact person"
            value={values.contactPerson}
            onChange={onChange('contactPerson')}
            error={errors.contactPerson}
            required
          />
          <Input label="Phone" value={values.phone} onChange={onChange('phone')} error={errors.phone} required />
        </div>
        <Input label="Email" type="email" value={values.email} onChange={onChange('email')} error={errors.email} />
        <Input label="Address" value={values.address} onChange={onChange('address')} error={errors.address} />
        <Select label="Status" options={STATUS_OPTIONS} value={values.status} onChange={onChange('status')} />
      </form>
    </Modal>
  )
}
