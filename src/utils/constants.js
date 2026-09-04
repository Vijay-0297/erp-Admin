// Keys used for persisting auth state. Centralized so they're never
// duplicated/mistyped across the codebase.
export const TOKEN_KEY = 'erp_access_token'
export const USER_KEY = 'erp_user'

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'CANCELLED', label: 'Cancelled' },
]
