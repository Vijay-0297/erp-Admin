import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, UserPlus } from 'lucide-react'
import { getUsers } from '../../api/userApi'
import { getRoles } from '../../api/roleApi'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/forms/SearchInput.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import UserFormModal from './UserFormModal.jsx'

export default function UsersListPage() {
  const { data: users, isLoading, error, refetch } = useApi(getUsers, [])
  const { data: roles } = useApi(getRoles, [])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [formState, setFormState] = useState({ isOpen: false, user: null })

  const roleNameById = useMemo(() => {
    const map = {}
    ;(roles || []).forEach((r) => (map[r.id] = r.roleName))
    return map
  }, [roles])

  const filteredUsers = useMemo(() => {
    if (!users) return []
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      [u.username, u.email, u.fullName, u.mobile].some((f) => f?.toLowerCase().includes(q))
    )
  }, [users, debouncedSearch])

  const columns = [
    { key: 'fullName', header: 'Name', sortable: true },
    { key: 'username', header: 'Username', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'mobile', header: 'Mobile' },
    {
      key: 'roleId',
      header: 'Role',
      render: (row) => (row.roleId ? <Badge tone="info">{roleNameById[row.roleId] || row.roleId}</Badge> : '—'),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Pencil}
          onClick={() => setFormState({ isOpen: true, user: row })}
        >
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage the people who have access to your workspace."
        actions={
          <Button icon={UserPlus} onClick={() => setFormState({ isOpen: true, user: null })}>
            New User
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, username or email…" />
      </div>

      <DataTable
        columns={columns}
        rows={filteredUsers}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No users found"
        emptyDescription={search ? 'Try a different search term.' : 'Create your first user to get started.'}
      />

      <UserFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, user: null })}
        onSaved={refetch}
        user={formState.user}
        roles={roles}
      />
    </div>
  )
}
