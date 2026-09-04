export const isRequired = (value) => (value === undefined || value === null || String(value).trim() === '' ? 'This field is required' : null)

export const isEmail = (value) => {
  if (!value) return null
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(value) ? null : 'Enter a valid email address'
}

export const minLength = (min) => (value) => {
  if (!value) return null
  return String(value).length >= min ? null : `Must be at least ${min} characters`
}

export const isMobile = (value) => {
  if (!value) return null
  const re = /^[0-9]{10,15}$/
  return re.test(value) ? null : 'Enter a valid mobile number (10–15 digits)'
}

export const isPositiveNumber = (value) => {
  if (value === '' || value === undefined || value === null) return null
  return Number(value) >= 0 ? null : 'Must be zero or greater'
}

/**
 * Runs a { field: [validatorFns] } schema against a values object and
 * returns a { field: errorMessage } map containing only the failures.
 */
export function validate(values, schema) {
  const errors = {}
  for (const field of Object.keys(schema)) {
    for (const validator of schema[field]) {
      const message = validator(values[field])
      if (message) {
        errors[field] = message
        break
      }
    }
  }
  return errors
}
