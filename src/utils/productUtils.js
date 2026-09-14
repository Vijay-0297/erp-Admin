/**
 * Unified normalization and resolution helpers for Products and Categories.
 * Supports both backend DTO shapes (productId, categoryId) and frontend/table conventions (id).
 */

export const getProductId = (product) => {
  if (!product) return null
  if (typeof product === 'object') {
    return product.productId ?? product.id ?? product.product_id ?? null
  }
  return product
}

export const getCategoryId = (value) => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'object') {
    if (value.category && typeof value.category === 'object') {
      return getCategoryId(value.category)
    }
    return value.categoryId ?? value.category_id ?? value.id ?? value.categoryID ?? null
  }
  return value
}

export const getCategoryName = (value) => {
  if (!value) return ''
  if (typeof value === 'object') {
    if (value.category && typeof value.category === 'object') {
      return getCategoryName(value.category)
    }
    return (
      value.categoryName ??
      value.name ??
      value.category_name ??
      (typeof value.category === 'string' ? value.category : '')
    )
  }
  return String(value)
}

/**
 * Resolves the category ID from a product using all known backend / frontend formats.
 * If only a category name is present, matches against the provided categories list.
 */
export const resolveProductCategoryId = (product, categories = []) => {
  if (!product) return ''

  // 1. Direct categoryId property (Spring Boot ProductResponse standard)
  if (product.categoryId != null && product.categoryId !== '') {
    return String(product.categoryId)
  }
  if (product.category_id != null && product.category_id !== '') {
    return String(product.category_id)
  }

  // 2. Nested category object or primitive
  if (product.category != null) {
    if (typeof product.category === 'object') {
      const nestedId =
        product.category.categoryId ??
        product.category.id ??
        product.category.category_id ??
        null
      if (nestedId != null && nestedId !== '') {
        return String(nestedId)
      }
      const nestedName = product.category.categoryName ?? product.category.name
      if (nestedName && Array.isArray(categories) && categories.length > 0) {
        const found = categories.find(
          (c) => getCategoryName(c).trim().toLowerCase() === String(nestedName).trim().toLowerCase()
        )
        if (found) {
          const foundId = getCategoryId(found)
          if (foundId != null) return String(foundId)
        }
      }
    } else if (typeof product.category === 'number') {
      return String(product.category)
    } else if (typeof product.category === 'string') {
      const trimmed = product.category.trim()
      if (trimmed !== '' && !isNaN(Number(trimmed))) {
        return trimmed
      }
      if (Array.isArray(categories) && categories.length > 0) {
        const found = categories.find(
          (c) => getCategoryName(c).trim().toLowerCase() === trimmed.toLowerCase()
        )
        if (found) {
          const foundId = getCategoryId(found)
          if (foundId != null) return String(foundId)
        }
      }
    }
  }

  // 3. Fallback: match product.categoryName against categories list
  const catName = product.categoryName ?? product.category_name
  if (catName && Array.isArray(categories) && categories.length > 0) {
    const found = categories.find(
      (c) => getCategoryName(c).trim().toLowerCase() === String(catName).trim().toLowerCase()
    )
    if (found) {
      const foundId = getCategoryId(found)
      if (foundId != null) return String(foundId)
    }
  }

  return ''
}

/**
 * Resolves the display category name for a product.
 * Falls back to looking up categoryId in categories list if name is not embedded.
 */
export const resolveProductCategoryName = (product, categories = []) => {
  if (!product) return ''

  // 1. Direct name on product
  if (product.categoryName) return product.categoryName
  if (product.category_name) return product.category_name

  // 2. Nested category object
  if (product.category && typeof product.category === 'object') {
    const name = product.category.categoryName ?? product.category.name ?? product.category.category_name
    if (name) return name
  } else if (typeof product.category === 'string' && isNaN(Number(product.category))) {
    return product.category
  }

  // 3. Resolve using categoryId matched against categories list
  const catId = resolveProductCategoryId(product, categories)
  if (catId && Array.isArray(categories) && categories.length > 0) {
    const found = categories.find((c) => String(getCategoryId(c)) === String(catId))
    if (found) {
      return getCategoryName(found)
    }
  }

  return ''
}

/**
 * Normalizes a product so both `id` and `productId` are always present and identical.
 */
export const normalizeProduct = (product) => {
  if (!product) return null
  const id = getProductId(product)
  const categoryIdStr = resolveProductCategoryId(product)
  const categoryId = categoryIdStr !== '' && !isNaN(Number(categoryIdStr)) ? Number(categoryIdStr) : categoryIdStr
  return {
    ...product,
    id,
    productId: id,
    categoryId: categoryId !== '' ? categoryId : null,
  }
}

/**
 * Normalizes a category so both `id` and `categoryId` are always present and identical.
 */
export const normalizeCategory = (category) => {
  if (!category) return null
  const id = getCategoryId(category)
  const categoryName = getCategoryName(category)
  return {
    ...category,
    id,
    categoryId: id,
    categoryName,
  }
}
