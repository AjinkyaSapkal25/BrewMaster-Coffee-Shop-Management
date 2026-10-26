import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { logout, hasRole } from '../services/auth'
import './Orders.css'

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
]

function formatCurrency(amount) {
  const value = Number(amount ?? 0)

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(date) {
  if (!date) return '—'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return parsedDate.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function Orders() {
  const navigate = useNavigate()

  // Role-based permissions
  const canCreateOrders = hasRole(
    'ROLE_ADMIN',
    'ROLE_MANAGER',
    'ROLE_CASHIER'
  )

  const canUpdateOrderStatus = hasRole(
    'ROLE_ADMIN',
    'ROLE_MANAGER',
    'ROLE_BARISTA'
  )

  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState('')

  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1 },
  ])

  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [statusChanges, setStatusChanges] = useState({})
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

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
          : 'Cannot connect to the server. Check that the Spring Boot backend is running.')
    )
  }, [navigate])

  const loadPageData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        api.get('/api/orders'),
        api.get('/api/products'),
      ])

      setOrders(
        Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : []
      )

      setProducts(
        Array.isArray(productsResponse.data)
          ? productsResponse.data.filter(
              (product) => product.available === true
            )
          : []
      )
    } catch (err) {
      handleApiError(err, 'Unable to load orders and products.')
    } finally {
      setLoading(false)
    }
  }, [handleApiError])

  useEffect(() => {
    // Intentional: fetch orders/products when this authorized page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPageData()
  }, [loadPageData])

  function openCreateForm() {
    if (!canCreateOrders) {
      setError('You do not have permission to create orders.')
      return
    }

    setError('')
    setMessage('')
    setFormError('')
    setOrderItems([{ productId: '', quantity: 1 }])
    setShowForm(true)
  }

  function closeCreateForm() {
    if (saving) {
      return
    }

    setShowForm(false)
    setFormError('')
    setOrderItems([{ productId: '', quantity: 1 }])
  }

  function handleItemChange(index, field, value) {
    setOrderItems((previousItems) =>
      previousItems.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    )

    setFormError('')
  }

  function addOrderItem() {
    if (!canCreateOrders || saving) {
      return
    }

    setOrderItems((previousItems) => [
      ...previousItems,
      { productId: '', quantity: 1 },
    ])
  }

  function removeOrderItem(index) {
    if (!canCreateOrders || saving) {
      return
    }

    setOrderItems((previousItems) =>
      previousItems.filter(
        (_, itemIndex) => itemIndex !== index
      )
    )

    setFormError('')
  }

  const estimatedTotal = useMemo(() => {
    return orderItems.reduce((total, item) => {
      const product = products.find(
        (currentProduct) =>
          String(currentProduct.id) === String(item.productId)
      )

      const quantity = Number(item.quantity)

      if (!product || !Number.isFinite(quantity) || quantity <= 0) {
        return total
      }

      return total + Number(product.price) * quantity
    }, 0)
  }, [orderItems, products])

  async function handleCreateOrder(event) {
    event.preventDefault()

    if (!canCreateOrders) {
      setShowForm(false)
      setError('You do not have permission to create orders.')
      return
    }

    setError('')
    setMessage('')
    setFormError('')

    if (orderItems.length === 0) {
      setFormError('Add at least one product to the order.')
      return
    }

    for (const item of orderItems) {
      if (!item.productId) {
        setFormError('Please select a product for every order item.')
        return
      }

      if (
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
      ) {
        setFormError(
          'Every product quantity must be a positive whole number.'
        )
        return
      }
    }

    const productIds = orderItems.map((item) => item.productId)

    if (new Set(productIds).size !== productIds.length) {
      setFormError(
        'The same product is selected more than once. Combine its quantity into one item.'
      )
      return
    }

    const payload = {
      items: orderItems.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      })),
    }

    setSaving(true)

    try {
      await api.post('/api/orders', payload)

      setShowForm(false)
      setOrderItems([{ productId: '', quantity: 1 }])
      setMessage('Order created successfully.')

      await loadPageData()
    } catch (err) {
      if (err.response?.status === 400) {
        setFormError(
          err.response.data?.message ||
            'The order details are invalid. Please check the selected products and quantities.'
        )
      } else {
        handleApiError(err, 'Unable to create the order.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusUpdate(order) {
    if (!canUpdateOrderStatus) {
      setError('You do not have permission to update order status.')
      return
    }

    if (updatingOrderId !== null) {
      return
    }

    const selectedStatus = statusChanges[order.id] ?? order.status

    if (selectedStatus === order.status) {
      setMessage('Select a different status before updating.')
      setError('')
      return
    }

    const confirmed = window.confirm(
      `Change order #${order.id} from ${order.status} to ${selectedStatus}?`
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')
    setUpdatingOrderId(order.id)

    try {
      await api.patch(`/api/orders/${order.id}/status`, {
        status: selectedStatus,
      })

      setMessage(`Order #${order.id} status updated successfully.`)

      setStatusChanges((previous) => {
        const updated = { ...previous }
        delete updated[order.id]
        return updated
      })

      await loadPageData()
    } catch (err) {
      handleApiError(
        err,
        'Unable to update the order status. Check whether this status transition is permitted.'
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return orders
    }

    return orders.filter((order) => {
      const orderId = String(order.id ?? '')
      const status = String(order.status ?? '').toLowerCase()

      const productNames = (order.items ?? [])
        .map((item) => item.productName ?? '')
        .join(' ')
        .toLowerCase()

      return (
        orderId.includes(query) ||
        status.includes(query) ||
        productNames.includes(query)
      )
    })
  }, [orders, search])

  const totalRevenue = orders
    .filter((order) => order.status !== 'CANCELLED')
    .reduce(
      (total, order) => total + Number(order.totalAmount ?? 0),
      0
    )

  const pendingOrders = orders.filter(
    (order) => order.status === 'PENDING'
  ).length

  const activeOrders = orders.filter((order) =>
    ['CONFIRMED', 'PREPARING', 'READY'].includes(order.status)
  ).length

  return (
    <main className="orders-page">
      <header className="orders-header">
        <div>
          <p className="orders-eyebrow">
            BREWMASTER / OPERATIONS
          </p>

          <h1>Order Management</h1>

          <p className="orders-subtitle">
            Manage customer orders and track coffee preparation.
          </p>
        </div>

        <div className="orders-header-actions">
          {canCreateOrders && (
            <button
              type="button"
              className="orders-primary-button"
              onClick={openCreateForm}
            >
              + Create Order
            </button>
          )}
        </div>
      </header>

      {message && (
        <div className="orders-alert orders-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="orders-alert orders-error" role="alert">
          {error}
        </div>
      )}

      <section className="orders-summary">
        <article className="orders-summary-card">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
          <small>All orders returned by the API</small>
        </article>

        <article className="orders-summary-card">
          <span>Pending Orders</span>
          <strong>{pendingOrders}</strong>
          <small>Orders awaiting the next step</small>
        </article>

        <article className="orders-summary-card">
          <span>Active Orders</span>
          <strong>{activeOrders}</strong>
          <small>Confirmed, preparing, or ready</small>
        </article>

        <article className="orders-summary-card">
          <span>Order Value</span>
          <strong>{formatCurrency(totalRevenue)}</strong>
          <small>Excludes cancelled orders</small>
        </article>
      </section>

      {showForm && canCreateOrders && (
        <section className="orders-form-card">
          <div className="orders-form-heading">
            <div>
              <h2>Create New Order</h2>

              <p>
                Select available products and specify the quantity for each.
              </p>
            </div>

            <button
              type="button"
              className="orders-close-button"
              onClick={closeCreateForm}
              aria-label="Close order form"
              disabled={saving}
            >
              ×
            </button>
          </div>

          {formError && (
            <div className="orders-alert orders-error" role="alert">
              {formError}
            </div>
          )}

          {products.length === 0 ? (
            <div className="orders-state">
              <h3>No available products</h3>
              <p>
                Add or enable a product before creating an order.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateOrder}>
              <div className="orders-items-heading">
                <div>
                  <h3>Order Items</h3>
                  <p>Select a product and enter its quantity.</p>
                </div>

                <button
                  type="button"
                  className="orders-secondary-button"
                  onClick={addOrderItem}
                  disabled={saving}
                >
                  + Add Product
                </button>
              </div>

              {orderItems.map((item, index) => {
                const selectedProduct = products.find(
                  (product) =>
                    String(product.id) === String(item.productId)
                )

                const lineTotal =
                  Number(selectedProduct?.price ?? 0) *
                  Number(item.quantity ?? 0)

                return (
                  <div className="orders-item-row" key={index}>
                    <div className="orders-field orders-product-field">
                      <label htmlFor={`order-product-${index}`}>
                        Product
                      </label>

                      <select
                        id={`order-product-${index}`}
                        value={item.productId}
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            'productId',
                            event.target.value
                          )
                        }
                        required
                        disabled={saving}
                      >
                        <option value="">Select a product</option>

                        {products.map((product) => {
                          const selectedElsewhere = orderItems.some(
                            (otherItem, otherIndex) =>
                              otherIndex !== index &&
                              String(otherItem.productId) ===
                                String(product.id)
                          )

                          return (
                            <option
                              key={product.id}
                              value={product.id}
                              disabled={selectedElsewhere}
                            >
                              {product.name} — {formatCurrency(product.price)}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    <div className="orders-field orders-quantity-field">
                      <label htmlFor={`order-quantity-${index}`}>
                        Quantity
                      </label>

                      <input
                        id={`order-quantity-${index}`}
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            'quantity',
                            event.target.value
                          )
                        }
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="orders-line-total">
                      <span>Subtotal</span>
                      <strong>{formatCurrency(lineTotal)}</strong>
                    </div>

                    <button
                      type="button"
                      className="orders-remove-button"
                      onClick={() => removeOrderItem(index)}
                      disabled={saving || orderItems.length === 1}
                      aria-label={`Remove order item ${index + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                )
              })}

              <div className="orders-estimated-total">
                <span>Estimated Total</span>
                <strong>{formatCurrency(estimatedTotal)}</strong>
                <small>
                  The backend calculates and saves the official order total.
                </small>
              </div>

              <div className="orders-form-actions">
                <button
                  type="button"
                  className="orders-secondary-button"
                  onClick={closeCreateForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="orders-primary-button"
                  disabled={saving}
                >
                  {saving ? 'Creating Order...' : 'Create Order'}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className="orders-table-card">
        <div className="orders-toolbar">
          <div>
            <h2>Your Orders</h2>

            <p>
              {filteredOrders.length}{' '}
              {filteredOrders.length === 1 ? 'order' : 'orders'} found
            </p>
          </div>

          <div className="orders-toolbar-actions">
            <div className="orders-search">
              <label
                htmlFor="orders-search-input"
                className="orders-visually-hidden"
              >
                Search orders
              </label>

              <input
                id="orders-search-input"
                type="search"
                placeholder="Search ID, status, or product..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="orders-secondary-button"
              onClick={loadPageData}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="orders-state">
            <h3>Loading orders...</h3>
            <p>Please wait while your orders are retrieved.</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-state">
            <h3>No orders found</h3>

            <p>
              {search
                ? 'Try a different search term.'
                : 'Create your first order to get started.'}
            </p>

            {!search && canCreateOrders && (
              <button
                type="button"
                className="orders-primary-button"
                onClick={openCreateForm}
              >
                + Create First Order
              </button>
            )}
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const selectedStatus =
                    statusChanges[order.id] ?? order.status

                  const isExpanded = expandedOrderId === order.id

                  return (
                    <Fragment key={order.id}>
                      <tr>
                        <td>
                          <strong className="orders-id">
                            #{order.id}
                          </strong>
                        </td>

                        <td className="orders-date">
                          {formatDate(order.orderDate)}
                        </td>

                        <td>
                          {order.items?.length ?? 0}{' '}
                          {(order.items?.length ?? 0) === 1
                            ? 'item type'
                            : 'item types'}
                        </td>

                        <td className="orders-amount">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td>
                          <span
                            className={`orders-status orders-status-${String(
                              order.status ?? ''
                            ).toLowerCase()}`}
                          >
                            {order.status ?? 'UNKNOWN'}
                          </span>
                        </td>

                        <td>
                          <div className="orders-actions">
                            <button
                              type="button"
                              className="orders-view-button"
                              onClick={() =>
                                setExpandedOrderId(
                                  isExpanded ? null : order.id
                                )
                              }
                            >
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="orders-expanded-cell">
                            <div className="orders-details">
                              <h3>Order #{order.id} Details</h3>

                              <div className="orders-details-table-wrapper">
                                <table className="orders-details-table">
                                  <thead>
                                    <tr>
                                      <th>Product</th>
                                      <th>Quantity</th>
                                      <th>Unit Price</th>
                                      <th>Subtotal</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {(order.items ?? []).map((item, index) => (
                                      <tr
                                        key={
                                          item.id ??
                                          `${order.id}-item-${index}`
                                        }
                                      >
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>
                                          {formatCurrency(item.unitPrice)}
                                        </td>
                                        <td>
                                          {formatCurrency(item.subtotal)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="orders-details-footer">
                                <div className="orders-details-total">
                                  <span>Order Total</span>
                                  <strong>
                                    {formatCurrency(order.totalAmount)}
                                  </strong>
                                </div>

                                {canUpdateOrderStatus && (
                                  <div className="orders-status-editor">
                                    <div className="orders-status-field">
                                      <label htmlFor={`status-${order.id}`}>
                                        Update Status
                                      </label>

                                      <select
                                        id={`status-${order.id}`}
                                        value={selectedStatus}
                                        onChange={(event) =>
                                          setStatusChanges((previous) => ({
                                            ...previous,
                                            [order.id]: event.target.value,
                                          }))
                                        }
                                        disabled={
                                          updatingOrderId !== null
                                        }
                                      >
                                        {ORDER_STATUSES.map((status) => (
                                          <option
                                            key={status}
                                            value={status}
                                          >
                                            {status}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <button
                                      type="button"
                                      className="orders-primary-button"
                                      onClick={() =>
                                        handleStatusUpdate(order)
                                      }
                                      disabled={
                                        updatingOrderId !== null ||
                                        selectedStatus === order.status
                                      }
                                    >
                                      {updatingOrderId === order.id
                                        ? 'Updating...'
                                        : 'Update Status'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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

export default Orders

