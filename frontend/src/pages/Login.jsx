import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      })

      const data = response.data

     if (!data.accessToken) {
       throw new Error('The server did not return an access token.')
     }

     localStorage.setItem('accessToken', data.accessToken)

     if (data.tokenType) {
       localStorage.setItem('tokenType', data.tokenType)
     }

     const roles = data.user?.roles || []

     localStorage.setItem(
       'userRoles',
       JSON.stringify(roles)
     )

     if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MANAGER')) {
       navigate('/dashboard', { replace: true })
     } else {
       navigate('/products', { replace: true })
     }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid email or password.')
        } else {
          setError(
            err.response.data?.message ||
              'Login failed. Please try again.'
          )
        }
      } else if (err.request) {
        setError(
          'Cannot connect to the server. Make sure the Spring Boot backend is running.'
        )
      } else {
        setError(err.message || 'An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <span>☕</span>
          </div>

          <p className="login-brand-label">
            COFFEE SHOP MANAGEMENT
          </p>

          <h1>
            BrewMaster<span>.</span>
          </h1>

          <p className="login-brand-description">
            Your coffee shop, beautifully managed.
          </p>

          <div className="login-coffee-art" aria-hidden="true">
            <div className="coffee-circle coffee-circle-one" />
            <div className="coffee-circle coffee-circle-two" />

            <div className="coffee-cup">
              <div className="coffee-cup-inner">
                <span>☕</span>
              </div>
              <div className="coffee-cup-handle" />
            </div>

            <div className="coffee-bean coffee-bean-one" />
            <div className="coffee-bean coffee-bean-two" />
            <div className="coffee-bean coffee-bean-three" />
          </div>

          <div className="login-brand-bottom">
            <span className="login-brand-dot" />
            <span>Everything your café needs, in one place.</span>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-mobile-brand">
            <span>☕</span>
            <strong>BrewMaster</strong>
          </div>

          <div className="login-heading">
            <span className="login-eyebrow">WELCOME BACK</span>
            <h2>Good to see you.</h2>
            <p>
              Sign in to access your BrewMaster workspace.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Email address</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon" aria-hidden="true">
                  ✉
                </span>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-password-label">
                <label htmlFor="password">Password</label>
              </div>

              <div className="login-input-wrapper">
                <span className="login-input-icon" aria-hidden="true">
                  ◈
                </span>

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  className="login-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}

            <button
              className="login-submit-button"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Signing in...' : 'Sign in to BrewMaster'}</span>
              {!loading && <span aria-hidden="true">→</span>}
            </button>

            <p className="login-security-note">
              <span aria-hidden="true">▣</span>
              Secure access to your workspace
            </p>
          </form>

          <div className="login-form-footer">
            <span className="login-footer-line" />
            <p>BREWED FOR BETTER BUSINESS</p>
            <span className="login-footer-line" />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Login
