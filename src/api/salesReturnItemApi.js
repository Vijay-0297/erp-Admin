import apiClient from './axiosClient'

const RESOURCE = '/sales-return-items'

export const getSalesReturnItems = () => apiClient.get(RESOURCE)
export const getSalesReturnItemById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const getSalesReturnItemsBySalesReturnId = (salesReturnId) =>
  apiClient.get(`${RESOURCE}/sales-return/${salesReturnId}`)
export const getSalesReturnItemsByProductId = (productId) =>
  apiClient.get(`${RESOURCE}/product/${productId}`)
export const createSalesReturnItem = (payload) => apiClient.post(RESOURCE, payload)
export const updateSalesReturnItem = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
