import apiClient from './axiosClient'

const RESOURCE = '/sales'

export const getSales = () => apiClient.get(RESOURCE)
export const createSale = (payload) => apiClient.post(RESOURCE, payload)
// Only create + list-all are defined for /sales in the backend contract.
// GET by id, PUT and DELETE are not present — add them here once the
// backend exposes them; do not fabricate the routes.
