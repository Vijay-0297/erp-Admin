import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic data-fetching hook that standardizes loading / error / data state
 * for a single resource list (or any async read). Call `refetch()` after
 * mutations elsewhere to resync.
 *
 * @param {() => Promise<any>} requestFn - function returning an axios promise
 * @param {any[]} deps - dependency array; refetches when these change
 */
export function useApi(requestFn, deps = []) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestFnRef = useRef(requestFn)
  requestFnRef.current = requestFn

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await requestFnRef.current()
      setData(response.data)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData, setData }
}

/**
 * Wraps a mutation (create/update/delete) call with a submitting flag so
 * forms can disable their submit button and avoid duplicate requests.
 */
export function useMutation(mutationFn) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mutate = useCallback(
    async (...args) => {
      if (isSubmitting) return
      setIsSubmitting(true)
      try {
        const response = await mutationFn(...args)
        return response
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, mutationFn]
  )

  return { mutate, isSubmitting }
}
