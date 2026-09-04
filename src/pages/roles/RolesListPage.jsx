import { useMemo, useState } from 'react'
import { Pencil, ShieldPlus } from 'lucide-react'
import { getRoles } from '../../api/roleApi'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import RoleFormModal from './RoleFormModal.jsx'

export default function RolesListPage() {
  const { data: roles, isLoading, error, refetch } = useApi(getRoles, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, role: null })

  const filteredRoles = useMemo(() => {
    if (!roles) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return roles
    return roles.filter((r) => [r.roleName, r.description].some((f) => f?.toLowerCase().includes(q)))
  }, [roles, debouncedSearch])

  const columns = [
    { key: 'roleName', header: 'Role Name', sortable: true },
    { key: 'description', header: 'Description' },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setFormState({ isOpen: true, role: row })}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Define the roles available for assignment to users."
        actions={
          <Button icon={ShieldPlus} onClick={() => setFormState({ isOpen: true, role: null })}>
            New Role
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search roles…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredRoles}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No roles found"
        emptyDescription={search ? 'Try a different search term.' : 'Create your first role to get started.'}
      />

      <RoleFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, role: null })}
        onSaved={refetch}
        role={formState.role}
      />
    </div>
  )
}
