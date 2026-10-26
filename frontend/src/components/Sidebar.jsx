import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { logout, hasRole } from '../services/auth'
import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [showLogoutConfirmation, setShowLogoutConfirmation] =
    useState(false)

  const isAdmin = hasRole('ROLE_ADMIN')
  const isManager = hasRole('ROLE_MANAGER')
  const isCashier = hasRole('ROLE_CASHIER')
  const isBarista = hasRole('ROLE_BARISTA')

  const navigationItems = [
    ...(isAdmin || isManager
      ? [{ label: 'Dashboard', path: '/dashboard', icon: '▦' }]
      : []),

    ...(isAdmin || isManager || isCashier || isBarista
      ? [{ label: 'Products', path: '/products', icon: '☕' }]
      : []),

    ...(isAdmin || isManager || isCashier || isBarista
      ? [{ label: 'Categories', path: '/categories', icon: '▤' }]
      : []),

    ...(isAdmin || isManager || isCashier || isBarista
      ? [{ label: 'Orders', path: '/orders', icon: '🧾' }]
      : []),

    ...(isAdmin
      ? [{ label: 'Users', path: '/users', icon: '👥' }]
      : []),
  ]

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-brand">
        <div className="app-sidebar-icon">☕</div>

        <div>
          <h2>BrewMaster</h2>
          <span>Management System</span>
        </div>
      </div>

      <nav className="app-sidebar-nav" aria-label="Main navigation">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            type="button"
            className={`app-nav-item ${
              location.pathname === item.path ? 'app-nav-active' : ''
            }`}
            onClick={() => navigate(item.path)}
            aria-current={
              location.pathname === item.path ? 'page' : undefined
            }
          >
            <span className="app-nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="app-sidebar-divider" />

        <button
          type="button"
          className="app-nav-item app-logout-item"
          onClick={() => setShowLogoutConfirmation(true)}
        >
          <span className="app-nav-icon">↪</span>
          Logout
        </button>
      </nav>

      <div className="app-sidebar-footer">
        <span className="app-sidebar-status" />
        BrewMaster System
        <small>Connected to your workspace</small>
      </div>

      {showLogoutConfirmation && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            style={{
              backgroundColor: '#fffaf5',
              padding: '30px',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ fontSize: '38px', marginBottom: '12px' }}>
              ☕
            </div>

            <h2
              id="logout-dialog-title"
              style={{
                color: '#3b2418',
                margin: '0 0 12px',
                fontSize: '23px',
              }}
            >
              Confirm Logout
            </h2>

            <p
              style={{
                color: '#75675e',
                lineHeight: 1.6,
                marginBottom: '25px',
              }}
            >
              Are you sure you want to log out of BrewMaster?
              You will need to log in again to access your workspace.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => setShowLogoutConfirmation(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d8c9be',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#3b2418',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#6f3825',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar