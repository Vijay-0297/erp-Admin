import apiClient from './axiosClient'

const RESOURCE = '/products'

export const getProducts = () => apiClient.get(RESOURCE)
export const getProductById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const createProduct = (payload) => apiClient.post(RESOURCE, payload)
export const updateProduct = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
export const deleteProduct = (id) => apiClient.delete(`${RESOURCE}/${id}`)
