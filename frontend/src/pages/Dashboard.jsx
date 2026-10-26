import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { logout, hasRole } from '../services/auth'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()

  const canViewDashboard = hasRole('ROLE_ADMIN', 'ROLE_MANAGER')

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/dashboard/summary')
      setDashboard(response.data)
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
        navigate('/login', { replace: true })
        return
      }

      if (err.response?.status === 403) {
        setError('You do not have permission to view dashboard statistics.')
      } else if (err.response) {
        setError(
          err.response.data?.message ||
            'Failed to load dashboard statistics.'
        )
      } else if (err.request) {
        setError(
          'Cannot connect to the server. Make sure Spring Boot is running.'
        )
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    if (!canViewDashboard) {
      navigate('/products', { replace: true })
      return
    }

    // Intentional: load the dashboard data when an authorized page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDashboard()
  }, [canViewDashboard, fetchDashboard, navigate])

  const formatSales = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount ?? 0)

  const metrics = dashboard
    ? [
        {
          label: 'Total Products',
          value: dashboard.totalProducts ?? 0,
          icon: '☕',
          description: 'Products in your inventory',
          color: 'coffee',
        },
        {
          label: 'Total Orders',
          value: dashboard.totalOrders ?? 0,
          icon: '▤',
          description: 'Orders recorded by the system',
          color: 'blue',
        },
        {
          label: 'Pending Orders',
          value: dashboard.pendingOrders ?? 0,
          icon: '◷',
          description: 'Orders awaiting completion',
          color: 'orange',
        },
        {
          label: 'Completed Orders',
          value: dashboard.completedOrders ?? 0,
          icon: '✓',
          description: 'Successfully completed orders',
          color: 'green',
        },
        {
          label: 'Cancelled Orders',
          value: dashboard.cancelledOrders ?? 0,
          icon: '×',
          description: 'Orders cancelled in the system',
          color: 'red',
        },
        {
          label: 'Total Sales',
          value: formatSales(dashboard.totalSales),
          icon: '₹',
          description: 'Sales recorded by the system',
          color: 'purple',
        },
      ]
    : []

  if (!canViewDashboard) {
    return null
  }

  return (
    <div className="dashboard-main">
      <header className="topbar">
        <div>
          <p className="eyebrow">BREWMASTER / OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="topbar-subtitle">
            Here's what's happening in your coffee shop.
          </p>
        </div>

        <div className="topbar-right">
          <span className="system-status">
            <span className="status-dot" />
            Management overview
          </span>

          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={fetchDashboard}
            disabled={loading}
          >
            <span aria-hidden="true">↻</span>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </header>

      <section className="welcome-section">
        <div className="welcome-content">
          <span className="welcome-badge">
            <span className="welcome-badge-dot" />
            YOUR COFFEE SHOP AT A GLANCE
          </span>

          <h2>Every great day starts with great coffee.</h2>

          <p>
            Keep track of your inventory, monitor orders, and review your
            business performance—all in one place.
          </p>

          <button
            type="button"
            className="welcome-action"
            onClick={() => navigate('/orders')}
          >
            View Orders
            <span aria-hidden="true"> →</span>
          </button>
        </div>

        <div className="welcome-decoration" aria-hidden="true">
          <div className="welcome-coffee-ring">
            <div className="welcome-coffee-cup">☕</div>
          </div>
          <span className="coffee-decoration-dot coffee-decoration-dot-one" />
          <span className="coffee-decoration-dot coffee-decoration-dot-two" />
          <span className="coffee-decoration-dot coffee-decoration-dot-three" />
        </div>
      </section>

      <section className="metrics-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">BUSINESS PERFORMANCE</p>
            <h2>Your Business Overview</h2>
            <p className="section-description">
              A snapshot of your current products, orders, and sales.
            </p>
          </div>

          {!loading && !error && dashboard && (
            <span className="overview-badge">
              <span className="overview-badge-dot" />
              Live summary
            </span>
          )}
        </div>

        {loading && (
          <div className="feedback-panel" role="status">
            <span className="loading-spinner" />
            <div>
              <strong>Preparing your dashboard</strong>
              <p>Fetching the latest business statistics...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="feedback-panel error-panel" role="alert">
            <div className="feedback-icon">!</div>
            <div className="feedback-content">
              <strong>Unable to load dashboard</strong>
              <p>{error}</p>
              <button
                type="button"
                className="retry-button"
                onClick={fetchDashboard}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && dashboard && (
          <div className="metrics-grid">
            {metrics.map((metric, index) => (
              <article
                className="metric-card"
                key={metric.label}
                style={{ '--card-index': index }}
              >
                <div className="metric-card-top">
                  <span className="metric-label">{metric.label}</span>

                  <span
                    className={`metric-icon ${metric.color}`}
                    aria-hidden="true"
                  >
                    {metric.icon}
                  </span>
                </div>

                <p className="metric-value">{metric.value}</p>

                <div className="metric-card-bottom">
                  <span className={`metric-indicator ${metric.color}`} />
                  <p className="metric-description">
                    {metric.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {!loading && !error && dashboard && (
        <section className="dashboard-insight">
          <div className="insight-icon" aria-hidden="true">
            ✦
          </div>

          <div>
            <h3>Keep your business brewing</h3>
            <p>
              Review pending orders regularly and keep your product
              information up to date for smooth daily operations.
            </p>
          </div>

          <button
            type="button"
            className="insight-action"
            onClick={() => navigate('/products')}
          >
            Manage Products <span aria-hidden="true">→</span>
          </button>
        </section>
      )}

      <footer className="dashboard-footer">
        <span>© {new Date().getFullYear()} BrewMaster</span>
        <span>Coffee Shop Management System</span>
      </footer>
    </div>
  )
}

export default Dashboard

