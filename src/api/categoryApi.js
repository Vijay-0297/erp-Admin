import apiClient from './axiosClient'

const RESOURCE = '/categories'

const getLocalCategories = () => {
  try {
    return JSON.parse(localStorage.getItem('local_categories') || '[]')
  } catch {
    return []
  }
}

export const getCategories = async () => {
  try {
    const response = await apiClient.get(RESOURCE)
    return response
  } catch (error) {
    const localCategories = getLocalCategories()
    if (localCategories.length > 0) {
      return { data: localCategories }
    }
    throw error
  }
}

export const getCategoryById = (id) => apiClient.get(`${RESOURCE}/${id}`)
export const createCategory = (payload) => apiClient.post(RESOURCE, payload)
export const updateCategory = (id, payload) => apiClient.put(`${RESOURCE}/${id}`, payload)
export const deleteCategory = (id) => apiClient.delete(`${RESOURCE}/${id}`)
