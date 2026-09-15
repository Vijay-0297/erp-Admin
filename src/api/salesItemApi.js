import apiClient from './axiosClient'

const RESOURCE = '/sales-items'

export const getSalesItems = () => apiClient.get(RESOURCE)
export const getSalesItemById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const getSalesItemsBySaleId = (saleId) => apiClient.get(`${RESOURCE}/sale/${saleId}`)
export const getSalesItemsByProductId = (productId) => apiClient.get(`${RESOURCE}/product/${productId}`)
export const createSalesItem = (payload) => apiClient.post(RESOURCE, payload)
export const updateSalesItem = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
