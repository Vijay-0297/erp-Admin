import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getCategories } from '../api/categoryApi'

const CategoriesContext = createContext(null)

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getCategories()
      setCategories(res.data)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addCategory = useCallback((category) => {
    setCategories((prev) => (prev ? [category, ...prev] : [category]))
  }, [])

  const updateCategoryLocal = useCallback((category) => {
    setCategories((prev) => (prev ? prev.map((c) => (c.id === category.id || c.categoryId === category.categoryId ? { ...c, ...category } : c)) : [category]))
  }, [])

  return (
    <CategoriesContext.Provider value={{ categories, isLoading, error, refresh, addCategory, updateCategoryLocal, setCategories }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories must be used within CategoriesProvider')
  return ctx
}

export default CategoriesContext
