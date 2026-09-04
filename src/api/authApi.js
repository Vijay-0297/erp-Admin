import apiClient from './axiosClient'

// POST /api/auth/register  { username, email, password, fullName }
export const registerRequest = (payload) => apiClient.post('/auth/register', payload)

// POST /api/auth/login  { email, password } -> { token, ... }
export const loginRequest = (payload) => apiClient.post('/auth/login', payload)
