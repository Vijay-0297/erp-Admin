import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { validate, isRequired, isEmail } from '../../utils/validators'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(values, {
      email: [isRequired, isEmail],
      password: [isRequired],
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await login(values)
      toast.success('Welcome back!')
      const redirectTo = location.state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900">Sign in</h1>
      <p className="mt-1.5 text-sm text-ink-500">Enter your credentials to access your workspace.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
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
          placeholder="••••••••"
          value={values.password}
          onChange={onChange('password')}
          error={errors.password}
          required
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Create one
        </Link>
      </p>
    </div>
  )
}
