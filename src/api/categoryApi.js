import apiClient from './axiosClient'

const RESOURCE = '/categories'

export const getCategories = () => apiClient.get(RESOURCE)
export const getCategoryById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const createCategory = (payload) => apiClient.post(RESOURCE, payload)
export const updateCategory = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
export const deleteCategory = (id) => apiClient.delete(`${RESOURCE}/${id}`)
