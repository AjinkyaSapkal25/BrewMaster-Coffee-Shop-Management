import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { logout, hasRole } from '../services/auth'
import './Products.css'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  available: true,
  categoryId: '',
}

function Products() {
  const navigate = useNavigate()

  // ADMIN and MANAGER can manage products.
  const canManageProducts = hasRole('ROLE_ADMIN', 'ROLE_MANAGER')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        'Access denied. Please log in with an account that has permission to perform this operation.'
      )
      return
    }

    const responseMessage = err.response?.data?.message

    setError(
      responseMessage ||
        (err.response
          ? fallbackMessage
          : 'Cannot connect to the server. Check that the Spring Boot backend is running.')
    )
  }, [navigate])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/products')
      setProducts(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      handleApiError(err, 'Unable to load products.')
    } finally {
      setLoading(false)
    }
  }, [handleApiError])

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/categories')
      setCategories(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      handleApiError(err, 'Unable to load categories.')
    }
  }, [handleApiError])

  useEffect(() => {
    // Intentional: load initial page data after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProducts()
    void loadCategories
  }, [loadProducts, loadCategories])

  function openAddForm() {
    if (!canManageProducts) return

    setEditingId(null)
    setForm({ ...emptyForm })
    setFormError('')
    setError('')
    setMessage('')
    setShowForm(true)
  }

  function openEditForm(product) {
    if (!canManageProducts) return

    setEditingId(product.id)

    setForm({
      name: product.name ?? '',
      description: product.description ?? '',
      price: product.price ?? '',
      available: product.available ?? true,
      categoryId: product.categoryId ?? '',
    })

    setFormError('')
    setError('')
    setMessage('')
    setShowForm(true)
  }

  function closeForm() {
    if (saving) return

    setShowForm(false)
    setEditingId(null)
    setForm({ ...emptyForm })
    setFormError('')
  }

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function validateForm() {
    if (!form.name.trim()) {
      return 'Product name is required.'
    }

    if (form.name.trim().length > 100) {
      return 'Product name must not exceed 100 characters.'
    }

    if (form.description.length > 500) {
      return 'Description must not exceed 500 characters.'
    }

    const price = Number(form.price)

    if (form.price === '' || !Number.isFinite(price) || price <= 0) {
      return 'Enter a valid price greater than 0.'
    }

    if (!form.categoryId) {
      return 'Please select a category.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!canManageProducts) {
      setError('Access denied. You cannot manage products.')
      setShowForm(false)
      return
    }

    setMessage('')
    setError('')

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
      price: Number(form.price),
      available: form.available,
      categoryId: Number(form.categoryId),
    }

    try {
      if (editingId !== null) {
        await api.put(`/api/products/${editingId}`, payload)
        setMessage('Product updated successfully.')
      } else {
        await api.post('/api/products', payload)
        setMessage('Product created successfully.')
      }

      setShowForm(false)
      setEditingId(null)
      setForm({ ...emptyForm })

      await loadProducts()
    } catch (err) {
      if (err.response?.status === 400) {
        setFormError(
          err.response.data?.message ||
            'Please check the product details and try again.'
        )
      } else {
        handleApiError(err, 'Unable to save the product.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product) {
    if (!canManageProducts) {
      setError('Access denied. You cannot delete products.')
      return
    }

    if (saving) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    try {
      await api.delete(`/api/products/${product.id}`)
      setMessage(`"${product.name}" was deleted successfully.`)

      await loadProducts()
    } catch (err) {
      handleApiError(err, 'Unable to delete the product.')
    }
  }

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase()

    return (
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.categoryName?.toLowerCase().includes(query) ||
      String(product.id).includes(query)
    )
  })

  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(price) || 0)
  }

  return (
    <div className="products-page">
      <header className="products-header">
        <div>
          <p className="products-eyebrow">BREWMASTER MANAGEMENT</p>
          <h1>Product Management</h1>
          <p className="products-subtitle">
            Manage your coffee menu, prices, categories and availability.
          </p>
        </div>

        <div className="products-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>

          {canManageProducts && (
            <button
              type="button"
              className="primary-button"
              onClick={openAddForm}
              disabled={saving}
            >
              + Add Product
            </button>
          )}
        </div>
      </header>

      {message && (
        <div className="products-alert success-alert" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="products-alert error-alert" role="alert">
          {error}
        </div>
      )}

      <section className="products-summary">
        <div className="summary-card">
          <span className="summary-label">Total Products</span>
          <strong>{products.length}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Available</span>
          <strong>
            {products.filter((product) => product.available).length}
          </strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Unavailable</span>
          <strong>
            {products.filter((product) => !product.available).length}
          </strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Categories</span>
          <strong>{categories.length}</strong>
        </div>
      </section>

      {showForm && canManageProducts && (
        <section className="product-form-card">
          <div className="form-heading">
            <div>
              <h2>
                {editingId !== null ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p>
                {editingId !== null
                  ? 'Update the selected product details.'
                  : 'Enter the details for your new menu item.'}
              </p>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close product form"
            >
              ×
            </button>
          </div>

          {formError && (
            <div className="products-alert error-alert" role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="product-form-grid">
              <div className="form-field">
                <label htmlFor="product-name">Product Name *</label>
                <input
                  id="product-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleInputChange}
                  maxLength={100}
                  placeholder="e.g. Cappuccino"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="product-category">Category *</label>
                <select
                  id="product-category"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {categories.length === 0 && (
                  <small>
                    No categories are available. Create a category first.
                  </small>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="product-price">Price (₹) *</label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 150.00"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={3}
                  placeholder="Describe this menu item"
                />
                <small>{form.description.length}/500 characters</small>
              </div>
            </div>

            <label className="availability-control">
              <input
                name="available"
                type="checkbox"
                checked={form.available}
                onChange={handleInputChange}
              />
              <span>Product is available for ordering</span>
            </label>

            <div className="product-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving || categories.length === 0}
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Save Changes'
                    : 'Create Product'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="products-table-card">
        <div className="table-toolbar">
          <div>
            <h2>Menu Products</h2>
            <p>{filteredProducts.length} product(s) found</p>
          </div>

          <div className="products-search">
            <label htmlFor="product-search" className="visually-hidden">
              Search products
            </label>

            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
            />
          </div>
        </div>

        {loading ? (
          <div className="products-state">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="products-state">
            <h3>No products found</h3>
            <p>
              {search
                ? 'Try another search term.'
                : 'No products are available to display.'}
            </p>
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  {canManageProducts && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>

                    <td>
                      <div className="product-name-cell">
                        <strong>{product.name}</strong>
                        <span>{product.description || 'No description'}</span>
                      </div>
                    </td>

                    <td>{product.categoryName || 'Uncategorized'}</td>

                    <td className="product-price">
                      {formatPrice(product.price)}
                    </td>

                    <td>
                      <span
                        className={`availability-badge ${
                          product.available
                            ? 'is-available'
                            : 'is-unavailable'
                        }`}
                      >
                        {product.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>

                    {canManageProducts && (
                      <td>
                        <div className="product-actions">
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => openEditForm(product)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => handleDelete(product)}
                          >
                            Delete
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

export default Products

