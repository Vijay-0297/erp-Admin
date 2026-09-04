import apiClient from './axiosClient'

const RESOURCE = '/users'

export const getUsers = () => apiClient.get(RESOURCE)
export const getUserById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const createUser = (payload) => apiClient.post(RESOURCE, payload)
export const updateUser = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
// No DELETE /users/{id} endpoint exists in the backend contract.
