import apiClient from './axiosClient'

const RESOURCE = '/sales-returns'

export const getSalesReturns = () => apiClient.get(RESOURCE)
export const createSalesReturn = (payload) => apiClient.post(RESOURCE, payload)

// Only list + create are included here because those are the routes currently
// confirmed by the backend contract. Extend with GET by id, PUT, or DELETE
// only when the backend exposes those endpoints.
