import apiClient from './axiosClient'

const RESOURCE = '/purchase-return-items'

export const getPurchaseReturnItems = () => apiClient.get(RESOURCE)
export const getPurchaseReturnItemById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const getPurchaseReturnItemsByPurchaseReturnId = (purchaseReturnId) =>
  apiClient.get(`${RESOURCE}/purchase-return/${purchaseReturnId}`)
export const getPurchaseReturnItemsByProductId = (productId) =>
  apiClient.get(`${RESOURCE}/product/${productId}`)
export const createPurchaseReturnItem = (payload) => apiClient.post(RESOURCE, payload)
export const updatePurchaseReturnItem = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)

export default {
  getPurchaseReturnItems,
  getPurchaseReturnItemById,
  getPurchaseReturnItemsByPurchaseReturnId,
  getPurchaseReturnItemsByProductId,
  createPurchaseReturnItem,
  updatePurchaseReturnItem,
}
