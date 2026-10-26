import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { logout } from '../services/auth'
import './Users.css'

const ROLES = [
  'ROLE_ADMIN',
  'ROLE_MANAGER',
  'ROLE_CASHIER',
  'ROLE_BARISTA',
]

function getRoleName(role) {
  if (typeof role === 'string') return role

  return role?.name ?? role?.roleName ?? role?.authority ?? ''
}

function getUserRoles(user) {
  if (!Array.isArray(user.roles)) return []

  return user.roles.map(getRoleName).filter(Boolean)
}

function Users() {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  const [editingUser, setEditingUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [saving, setSaving] = useState(false)

  const handleApiError = useCallback((err, fallbackMessage) => {
    if (err.response?.status === 401) {
      logout()
      navigate('/login', { replace: true })
      return
    }

    if (err.response?.status === 403) {
      setError(
        'Access denied. Only an authorized administrator can manage users.'
      )
      return
    }

    setError(
      err.response?.data?.message ||
        (err.response
          ? fallbackMessage
          : 'Cannot connect to the server. Check that the Spring Boot backend is running.')
    )
  }, [navigate])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/users')

      setUsers(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      handleApiError(err, 'Unable to load users.')
    } finally {
      setLoading(false)
    }
  }, [handleApiError])

  useEffect(() => {
    // Intentional: load initial page data after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers()
  }, [loadUsers])

  function openRoleEditor(user) {
    const currentRoles = getUserRoles(user)

    setEditingUser(user)
    setSelectedRole(currentRoles[0] ?? '')
    setError('')
    setMessage('')
  }

  function closeRoleEditor() {
    setEditingUser(null)
    setSelectedRole('')
  }

  async function handleRoleUpdate(event) {
    event.preventDefault()

    if (!editingUser || !selectedRole) {
      setError('Please select a role.')
      return
    }

    const confirmed = window.confirm(
      `Change the role of ${editingUser.firstName} ${editingUser.lastName} to ${selectedRole}?\n\nThis operation replaces the user's existing roles with the selected role.`
    )

    if (!confirmed) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await api.put(`/api/users/${editingUser.id}/role`, {
        role: selectedRole,
      })

      setMessage(
        `Role updated successfully for ${editingUser.firstName} ${editingUser.lastName}.`
      )

      closeRoleEditor()
      await loadUsers()
    } catch (err) {
      handleApiError(err, 'Unable to update the user role.')
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return users

    return users.filter((user) => {
      const fullName =
        `${user.firstName ?? ''} ${user.lastName ?? ''}`.toLowerCase()

      const email = String(user.email ?? '').toLowerCase()
      const phone = String(user.phone ?? '').toLowerCase()
      const id = String(user.id ?? '')
      const roles = getUserRoles(user).join(' ').toLowerCase()

      return (
        id.includes(query) ||
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        roles.includes(query)
      )
    })
  }, [users, search])

  return (
    <main className="users-page">
      <header className="users-header">
        <div>
          <p className="users-eyebrow">BREWMASTER MANAGEMENT</p>
          <h1>User Management</h1>
          <p className="users-subtitle">
            View registered users and manage their application roles.
          </p>
        </div>

        <div className="users-header-actions">
          <button
            type="button"
            className="users-secondary-button"
            onClick={loadUsers}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </header>

      {message && (
        <div className="users-alert users-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="users-alert users-error" role="alert">
          {error}
        </div>
      )}

      <section className="users-summary">
        <article className="users-summary-card">
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </article>

        <article className="users-summary-card">
          <span>Search Results</span>
          <strong>{filteredUsers.length}</strong>
        </article>

        <article className="users-summary-card">
          <span>Administrators</span>
          <strong>
            {users.filter((user) =>
              getUserRoles(user).includes('ROLE_ADMIN')
            ).length}
          </strong>
        </article>

        <article className="users-summary-card">
          <span>Managers</span>
          <strong>
            {users.filter((user) =>
              getUserRoles(user).includes('ROLE_MANAGER')
            ).length}
          </strong>
        </article>
      </section>

      {editingUser && (
        <section className="users-editor-card">
          <div className="users-editor-heading">
            <div>
              <h2>Update User Role</h2>
              <p>
                {editingUser.firstName} {editingUser.lastName}
                {' · '}
                {editingUser.email}
              </p>
            </div>

            <button
              type="button"
              className="users-close-button"
              onClick={closeRoleEditor}
              disabled={saving}
              aria-label="Close role editor"
            >
              ×
            </button>
          </div>

          <div className="users-role-warning">
            <strong>Important:</strong> Updating the role replaces the user's
            existing roles with the selected role. Select carefully.
          </div>

          <form onSubmit={handleRoleUpdate}>
            <div className="users-field">
              <label htmlFor="user-role">Application Role</label>

              <select
                id="user-role"
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                required
                disabled={saving}
              >
                <option value="">Select a role</option>

                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replace('ROLE_', '')}
                  </option>
                ))}
              </select>
            </div>

            <div className="users-editor-actions">
              <button
                type="button"
                className="users-secondary-button"
                onClick={closeRoleEditor}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="users-primary-button"
                disabled={saving || !selectedRole}
              >
                {saving ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="users-table-card">
        <div className="users-toolbar">
          <div>
            <h2>Registered Users</h2>
            <p>{filteredUsers.length} user(s) found</p>
          </div>

          <div className="users-search">
            <label
              htmlFor="users-search-input"
              className="users-visually-hidden"
            >
              Search users
            </label>

            <input
              id="users-search-input"
              type="search"
              placeholder="Search name, email, phone, role, or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="users-state">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-state">
            <h3>No users found</h3>
            <p>
              {search
                ? 'Try another search term.'
                : 'No users were returned by the API.'}
            </p>
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Roles</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const roles = getUserRoles(user)

                  return (
                    <tr key={user.id}>
                      <td>#{user.id}</td>

                      <td>
                        <strong className="users-name">
                          {[user.firstName, user.lastName]
                            .filter(Boolean)
                            .join(' ') || '—'}
                        </strong>
                      </td>

                      <td>{user.email || '—'}</td>

                      <td>{user.phone || '—'}</td>

                      <td>
                        <div className="users-role-list">
                          {roles.length > 0 ? (
                            roles.map((role) => (
                              <span
                                className="users-role-badge"
                                key={role}
                              >
                                {role.replace('ROLE_', '')}
                              </span>
                            ))
                          ) : (
                            <span className="users-no-role">
                              No role returned
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="users-edit-button"
                          onClick={() => openRoleEditor(user)}
                        >
                          Manage Role
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default Users