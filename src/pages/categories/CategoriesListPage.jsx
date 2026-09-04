import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Trash2, FolderPlus } from 'lucide-react'
import { getCategories, deleteCategory } from '../../api/categoryApi'
import { useApi, useMutation } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import CategoryFormModal from './CategoryFormModal.jsx'

export default function CategoriesListPage() {
  const { data: categories, isLoading, error, refetch } = useApi(getCategories, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, category: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { mutate: runDelete, isSubmitting: isDeleting } = useMutation(deleteCategory)

  const filteredCategories = useMemo(() => {
    if (!categories) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => [c.categoryName, c.description].some((f) => f?.toLowerCase().includes(q)))
  }, [categories, debouncedSearch])

  const handleDelete = async () => {
    try {
      await runDelete(deleteTarget.id)
      toast.success('Category deleted')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to delete category')
    }
  }

  const columns = [
    { key: 'categoryName', header: 'Category', sortable: true },
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setFormState({ isOpen: true, category: row })}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize your products into categories."
        actions={
          <Button icon={FolderPlus} onClick={() => setFormState({ isOpen: true, category: null })}>
            New Category
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search categories…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredCategories}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No categories found"
        emptyDescription={search ? 'Try a different search term.' : 'Create your first category to get started.'}
      />

      <CategoryFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, category: null })}
        onSaved={refetch}
        category={formState.category}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
        title="Delete category"
        description={deleteTarget ? `Delete "${deleteTarget.categoryName}"? Products in this category will be affected.` : ''}
        confirmLabel="Delete"
      />
    </div>
  )
}
