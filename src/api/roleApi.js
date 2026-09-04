import apiClient from './axiosClient'

// NOTE: the backend exposes roles under /v1/roles while every other
// resource lives directly under /api/... (confirmed from the source
// Postman collection). This inconsistency is preserved intentionally
// rather than "fixed" on the frontend, per the contract-as-source-of-truth
// rule. Update here if the backend versioning changes.
const RESOURCE = '/v1/roles'

export const getRoles = () => apiClient.get(RESOURCE)
export const getRoleById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const createRole = (payload) => apiClient.post(RESOURCE, payload)
export const updateRole = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
// No DELETE /v1/roles/{id} endpoint exists in the backend contract.
