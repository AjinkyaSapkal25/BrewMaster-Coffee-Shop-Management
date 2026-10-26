import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { logout, hasRole } from '../services/auth'
import './Categories.css'

const emptyForm = {
  name: '',
  description: '',
}

function Categories() {
  const navigate = useNavigate()

  const canManageCategories = hasRole('ROLE_ADMIN','ROLE_MANAGER')

  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const handleApiError = useCallback((err, fallbackMessage) => {
    if (err.response?.status === 401) {
      logout()
      navigate('/login', { replace: true })
      return
    }

    if (err.response?.status === 403) {
      setError(
        'Access denied. Your account does not have permission to perform this operation.'
      )
      return
    }

    setError(
      err.response?.data?.message ||
        (err.response
          ? fallbackMessage
          : 'Cannot connect to the server. Please check that the Spring Boot backend is running.')
    )
  }, [navigate])

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/categories')
      setCategories(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      handleApiError(err, 'Unable to load categories.')
    } finally {
      setLoading(false)
    }
  }, [handleApiError])

  useEffect(() => {
    // Intentional: load initial page data after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories()
  }, [loadCategories])

  function openAddForm() {
    if (!canManageCategories) {
      setError('You do not have permission to create categories.')
      return
    }

    setEditingId(null)
    setForm({ ...emptyForm })
    setFormError('')
    setError('')
    setMessage('')
    setShowForm(true)
  }

  function openEditForm(category) {
    if (!canManageCategories) {
      setError('You do not have permission to edit categories.')
      return
    }

    setEditingId(category.id)

    setForm({
      name: category.name ?? '',
      description: category.description ?? '',
    })

    setFormError('')
    setError('')
    setMessage('')
    setShowForm(true)
  }

  function closeForm() {
    if (saving) {
      return
    }

    setShowForm(false)
    setEditingId(null)
    setForm({ ...emptyForm })
    setFormError('')
  }

  function handleInputChange(event) {
    const { name, value } = event.target

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))

    setFormError('')
  }

  function validateForm() {
    const name = form.name.trim()

    if (!name) {
      return 'Category name is required.'
    }

    if (name.length > 100) {
      return 'Category name must not exceed 100 characters.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!canManageCategories) {
      setShowForm(false)
      setError('You do not have permission to manage categories.')
      return
    }

    setError('')
    setMessage('')

    const validationError = validateForm()

    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError('')
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
    }

    try {
      if (editingId !== null) {
        await api.put(`/api/categories/${editingId}`, payload)
        setMessage('Category updated successfully.')
      } else {
        await api.post('/api/categories', payload)
        setMessage('Category created successfully.')
      }

      setShowForm(false)
      setEditingId(null)
      setForm({ ...emptyForm })

      await loadCategories()
    } catch (err) {
      if (err.response?.status === 400) {
        setFormError(
          err.response.data?.message ||
            'Please check the category details and try again.'
        )
      } else {
        handleApiError(err, 'Unable to save the category.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category) {
    if (!canManageCategories) {
      setError('You do not have permission to delete categories.')
      return
    }

    if (deletingId !== null || saving) {
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the category "${category.name}"?`
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')
    setDeletingId(category.id)

    try {
      await api.delete(`/api/categories/${category.id}`)

      setMessage(`Category "${category.name}" deleted successfully.`)

      await loadCategories()
    } catch (err) {
      handleApiError(err, 'Unable to delete the category.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredCategories = categories.filter((category) => {
    const query = search.trim().toLowerCase()

    return (
      category.name?.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query) ||
      String(category.id).includes(query)
    )
  })

  return (
    <div className="categories-page">
      <header className="categories-header">
        <div>
          <p className="categories-eyebrow">
            BREWMASTER / INVENTORY
          </p>

          <h1>Category Management</h1>

          <p className="categories-subtitle">
            Organize your coffee menu into clear, manageable categories.
          </p>
        </div>

        <div className="categories-header-actions">
          {canManageCategories && (
            <button
              type="button"
              className="categories-primary-button"
              onClick={openAddForm}
              disabled={saving}
            >
              + Add Category
            </button>
          )}
        </div>
      </header>

      {message && (
        <div className="categories-alert categories-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="categories-alert categories-error" role="alert">
          {error}
        </div>
      )}

      <section className="categories-summary">
        <div className="categories-summary-card">
          <span>Total Categories</span>
          <strong>{categories.length}</strong>
          <small>Categories currently returned by the API</small>
        </div>

        <div className="categories-summary-card">
          <span>Search Results</span>
          <strong>{filteredCategories.length}</strong>
          <small>Categories matching your search</small>
        </div>
      </section>

      {showForm && canManageCategories && (
        <section className="categories-form-card">
          <div className="categories-form-heading">
            <div>
              <h2>
                {editingId !== null ? 'Edit Category' : 'Add New Category'}
              </h2>

              <p>
                {editingId !== null
                  ? 'Update the selected category details.'
                  : 'Enter the details for your new product category.'}
              </p>
            </div>

            <button
              type="button"
              className="categories-close-button"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close category form"
            >
              ×
            </button>
          </div>

          {formError && (
            <div className="categories-alert categories-error" role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="categories-form-grid">
              <div className="categories-field">
                <label htmlFor="category-name">Category Name *</label>

                <input
                  id="category-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleInputChange}
                  maxLength={100}
                  placeholder="e.g. Hot Drinks"
                  autoComplete="off"
                  required
                />

                <small>
                  {form.name.length}/100 characters
                </small>
              </div>

              <div className="categories-field">
                <label htmlFor="category-description">
                  Description
                </label>

                <textarea
                  id="category-description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe the category"
                />

                <small>
                  Optional description of the category.
                </small>
              </div>
            </div>

            <div className="categories-form-actions">
              <button
                type="button"
                className="categories-secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="categories-primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Save Changes'
                    : 'Create Category'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="categories-table-card">
        <div className="categories-toolbar">
          <div>
            <h2>Your Categories</h2>

            <p>
              {filteredCategories.length}{' '}
              {filteredCategories.length === 1 ? 'category' : 'categories'} found
            </p>
          </div>

          <div className="categories-search">
            <label
              htmlFor="category-search"
              className="categories-visually-hidden"
            >
              Search categories
            </label>

            <input
              id="category-search"
              type="search"
              placeholder="Search by name, description, or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="categories-state">
            <h3>Loading categories...</h3>
            <p>Please wait while your categories are retrieved.</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="categories-state">
            <h3>No categories found</h3>

            <p>
              {search
                ? 'Try another search term.'
                : 'Create your first category to get started.'}
            </p>

            {!search && canManageCategories && (
              <button
                type="button"
                className="categories-primary-button"
                onClick={openAddForm}
              >
                + Create First Category
              </button>
            )}
          </div>
        ) : (
          <div className="categories-table-wrapper">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  {canManageCategories && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <span className="category-id">
                        #{category.id}
                      </span>
                    </td>

                    <td>
                      <strong className="categories-name">
                        {category.name}
                      </strong>
                    </td>

                    <td>
                      <span className="categories-description">
                        {category.description || 'No description'}
                      </span>
                    </td>

                    {canManageCategories && (
                      <td>
                        <div className="categories-actions">
                          <button
                            type="button"
                            className="categories-edit-button"
                            onClick={() => openEditForm(category)}
                            disabled={saving || deletingId !== null}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="categories-delete-button"
                            onClick={() => handleDelete(category)}
                            disabled={deletingId !== null || saving}
                          >
                            {deletingId === category.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Categories
