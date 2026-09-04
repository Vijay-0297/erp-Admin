import apiClient from './axiosClient'

const RESOURCE = '/purchases'

export const getPurchases = () => apiClient.get(RESOURCE)
export const getPurchaseById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const createPurchase = (payload) => apiClient.post(RESOURCE, payload)
export const updatePurchase = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
export const deletePurchase = (id) => apiClient.delete(`${RESOURCE}/${id}`)
