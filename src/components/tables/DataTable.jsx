import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import clsx from 'clsx'
import Pagination from './Pagination.jsx'
import { TableSkeleton } from '../common/Skeleton.jsx'
import EmptyState from '../common/EmptyState.jsx'
import ErrorState from '../common/ErrorState.jsx'

/**
 * Generic, reusable data table with client-side sorting + pagination.
 * Filtering (search) is handled by the caller and passed in via `rows`
 * already filtered, since search semantics differ per page.
 *
 * columns: [{ key, header, render?(row), sortable?, className? }]
 */
export default function DataTable({
  columns,
  rows,
  isLoading,
  error,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription,
  pageSize = 10,
  rowKey = 'id',
}) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({ key: null, direction: 'asc' })

  const sortedRows = useMemo(() => {
    if (!rows) return []
    if (!sort.key) return rows
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.direction === 'asc' ? av - bv : bv - av
      }
      return sort.direction === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
    return copy
  }, [rows, sort])

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pageRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500',
                    col.className
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-ink-800 focus-ring rounded"
                    >
                      {col.header}
                      {sort.key === col.key ? (
                        sort.direction === 'asc' ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="text-ink-300" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          {!isLoading && !error && (
            <tbody>
              {pageRows.map((row) => (
                <tr key={row[rowKey]} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                  {columns.map((col) => (
                    <td key={col.key} className={clsx('px-4 py-3 align-middle text-ink-700', col.className)}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
        {isLoading && <TableSkeleton cols={columns.length} />}
      </div>

      {error && <ErrorState message={error.message} onRetry={onRetry} />}

      {!isLoading && !error && sortedRows.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {!isLoading && !error && sortedRows.length > 0 && (
        <Pagination page={safePage} pageSize={pageSize} total={sortedRows.length} onPageChange={setPage} />
      )}
    </div>
  )
}
