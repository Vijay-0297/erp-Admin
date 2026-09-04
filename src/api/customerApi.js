import apiClient from './axiosClient'

const RESOURCE = '/customers'

export const getCustomers = () => apiClient.get(RESOURCE)
export const getCustomerById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const createCustomer = (payload) => apiClient.post(RESOURCE, payload)
export const updateCustomer = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
export const deleteCustomer = (id) => apiClient.delete(`${RESOURCE}/${id}`)
