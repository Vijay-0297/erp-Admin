import apiClient from './axiosClient'

const RESOURCE = '/purchase-returns'

export const getPurchaseReturns = () => apiClient.get(RESOURCE)
export const getPurchaseReturnById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const createPurchaseReturn = (payload) => apiClient.post(RESOURCE, payload)
export const updatePurchaseReturn = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
export const deletePurchaseReturn = (id) => apiClient.delete(`${RESOURCE}/${id}`)
