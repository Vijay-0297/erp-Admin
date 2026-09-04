import axios from 'axios'
import toast from 'react-hot-toast'
import { TOKEN_KEY, USER_KEY } from '../utils/constants'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Request interceptor: attach JWT bearer token automatically -----------
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// --- Response interceptor: centralized error normalization ----------------
// Every consumer of apiClient receives errors already shaped as:
// { status, message, errors, isNetworkError, isTimeout }
let isRedirectingToLogin = false

const friendlyMessageFor = (status, serverMessage) => {
  switch (status) {
    case 400:
      return serverMessage || 'The request could not be processed. Please check your input.'
    case 401:
      return 'Your session has expired. Please login again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return serverMessage || 'The requested resource was not found.'
    case 409:
      return serverMessage || 'This action conflicts with existing data.'
    case 422:
      return serverMessage || 'Some fields failed validation.'
    case 500:
      return 'Something went wrong on the server. Please try again later.'
    default:
      return serverMessage || 'Something went wrong. Please try again.'
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = {
      status: null,
      message: 'Something went wrong. Please try again.',
      errors: null,
      isNetworkError: false,
      isTimeout: false,
      raw: error,
    }

    if (error.code === 'ECONNABORTED') {
      normalized.isTimeout = true
      normalized.message = 'The request timed out. Please check your connection and try again.'
      return Promise.reject(normalized)
    }

    if (!error.response) {
      normalized.isNetworkError = true
      normalized.message = 'Unable to reach the server. Please check your network connection.'
      return Promise.reject(normalized)
    }

    const { status, data } = error.response
    normalized.status = status
    normalized.errors = data?.errors || data?.fieldErrors || null
    normalized.message = friendlyMessageFor(status, data?.message)

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (!isRedirectingToLogin && !window.location.pathname.startsWith('/login')) {
        isRedirectingToLogin = true
        toast.error(normalized.message)
        window.location.assign('/login')
      }
    }

    return Promise.reject(normalized)
  }
)

export default apiClient
export { BASE_URL }
