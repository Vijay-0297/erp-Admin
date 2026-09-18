import apiClient from './axiosClient'

const RESOURCE = '/stock-movements'

export const getStockMovements = () => apiClient.get(RESOURCE)
export const getStockMovementById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const createStockMovement = (payload) => apiClient.post(RESOURCE, payload)

export default { getStockMovements, getStockMovementById, createStockMovement }
