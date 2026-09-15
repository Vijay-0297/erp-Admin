import apiClient from './axiosClient'
import { getProductId } from '../utils/productUtils'

const RESOURCE = '/products'

const getLocalProducts = () => {
  try {
    return JSON.parse(localStorage.getItem('local_products') || '[]')
  } catch {
    return []
  }
}

export const getProducts = async () => {
  try {
    const response = await apiClient.get(RESOURCE)
    return response
  } catch (error) {
    const localProducts = getLocalProducts()
    if (localProducts.length > 0) {
      return { data: localProducts }
    }
    throw error
  }
}

export const getProductById = (id) => {
  if (!id || id === 'undefined') {
    return Promise.reject(new Error('Valid Product ID is required.'))
  }
  return apiClient.get(`${RESOURCE}/${id}`)
}

export const createProduct = async (payload) => {
  try {
    return await apiClient.post(RESOURCE, payload)
  } catch (error) {
    // Only fall back to local storage if it's a connection / network error
    if (error.isNetworkError || error.isTimeout) {
      const saved = getLocalProducts()
      const id = `local-${Date.now()}`
      const localProduct = { ...payload, id, productId: id }
      localStorage.setItem('local_products', JSON.stringify([...saved, localProduct]))
      return { data: localProduct }
    }
    throw error
  }
}

export const updateProduct = async (id, payload) => {
  if (!id || id === 'undefined') {
    throw new Error('Valid Product ID is required to update product.')
  }

  const isLocalId = String(id).startsWith('local-')
  const localProducts = getLocalProducts()
  const localIndex = localProducts.findIndex(
    (product) => String(getProductId(product)) === String(id)
  )

  if (isLocalId) {
    if (localIndex >= 0) {
      const nextProducts = [...localProducts]
      nextProducts[localIndex] = { ...nextProducts[localIndex], ...payload, id, productId: id }
      localStorage.setItem('local_products', JSON.stringify(nextProducts))
      return { data: nextProducts[localIndex] }
    }
    const newLocal = { ...payload, id, productId: id }
    localStorage.setItem('local_products', JSON.stringify([...localProducts, newLocal]))
    return { data: newLocal }
  }

  try {
    const response = await apiClient.put(`${RESOURCE}/${id}`, payload)
    // Synchronize local cache if present
    if (localIndex >= 0) {
      const nextProducts = [...localProducts]
      nextProducts[localIndex] = {
        ...nextProducts[localIndex],
        ...response.data,
        id: getProductId(response.data) ?? id,
      }
      localStorage.setItem('local_products', JSON.stringify(nextProducts))
    }
    return response
  } catch (error) {
    // Only fall back to local storage on pure network/timeout error
    if (error.isNetworkError || error.isTimeout) {
      const existingIndex = localProducts.findIndex(
        (product) => String(getProductId(product)) === String(id)
      )
      const nextProducts = [...localProducts]

      if (existingIndex >= 0) {
        nextProducts[existingIndex] = { ...nextProducts[existingIndex], ...payload, id, productId: id }
      } else {
        nextProducts.push({ ...payload, id, productId: id })
      }

      localStorage.setItem('local_products', JSON.stringify(nextProducts))
      return { data: nextProducts[existingIndex >= 0 ? existingIndex : nextProducts.length - 1] }
    }
    throw error
  }
}

export const deleteProduct = async (id) => {
  if (!id || id === 'undefined') {
    throw new Error('Valid Product ID is required to delete product.')
  }

  const isLocalId = String(id).startsWith('local-')
  const localProducts = getLocalProducts()

  if (isLocalId) {
    const nextProducts = localProducts.filter(
      (product) => String(getProductId(product)) !== String(id)
    )
    localStorage.setItem('local_products', JSON.stringify(nextProducts))
    return { data: { id } }
  }

  try {
    const response = await apiClient.delete(`${RESOURCE}/${id}`)
    const nextProducts = localProducts.filter(
      (product) => String(getProductId(product)) !== String(id)
    )
    localStorage.setItem('local_products', JSON.stringify(nextProducts))
    return response
  } catch (error) {
    if (error.isNetworkError || error.isTimeout) {
      const nextProducts = localProducts.filter(
        (product) => String(getProductId(product)) !== String(id)
      )
      localStorage.setItem('local_products', JSON.stringify(nextProducts))
      return { data: { id } }
    }
    throw error
  }
}
