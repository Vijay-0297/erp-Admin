import apiClient from './axiosClient'

const RESOURCE = '/suppliers'

export const getSuppliers = () => apiClient.get(RESOURCE)
export const getSupplierById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const createSupplier = (payload) => apiClient.post(RESOURCE, payload)
export const updateSupplier = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
export const deleteSupplier = (id) => apiClient.delete(`${RESOURCE}/${id}`)
