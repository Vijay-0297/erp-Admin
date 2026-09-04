import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { validate, isRequired, isEmail, minLength } from '../../utils/validators'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ username: '', email: '', password: '', fullName: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      username: [isRequired],
      fullName: [isRequired],
      email: [isRequired, isEmail],
      password: [isRequired, minLength(6)],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await register(values)
      toast.success('Account created. Please sign in.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-500">Get started with your ERP workspace.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <Input
          label="Full name"
          icon={User}
          placeholder="Jane Doe"
          value={values.fullName}
          onChange={onChange('fullName')}
          error={errors.fullName}
          required
        />
        <Input
          label="Username"
          icon={User}
          placeholder="janedoe"
          value={values.username}
          onChange={onChange('username')}
          error={errors.username}
          required
        />
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@company.com"
          value={values.email}
          onChange={onChange('email')}
          error={errors.email}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="At least 6 characters"
          value={values.password}
          onChange={onChange('password')}
          error={errors.password}
          required
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  )
}
