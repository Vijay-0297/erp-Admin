import apiClient from './axiosClient'

const RESOURCE = '/purchase-items'

export const getPurchaseItems = () => apiClient.get(RESOURCE)
export const getPurchaseItemById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const getPurchaseItemsByPurchaseId = (purchaseId) =>
  apiClient.get(`${RESOURCE}/purchase/${purchaseId}`)
export const getPurchaseItemsByProductId = (productId) =>
  apiClient.get(`${RESOURCE}/product/${productId}`)
export const createPurchaseItem = (payload) => apiClient.post(RESOURCE, payload)
export const updatePurchaseItem = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
// No DELETE /purchase-items/{id} endpoint exists in the backend contract.
