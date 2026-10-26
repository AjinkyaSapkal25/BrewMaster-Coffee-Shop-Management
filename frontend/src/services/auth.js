export function getToken() {
  return localStorage.getItem('accessToken')
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function getUserRoles() {
  try {
    const roles = JSON.parse(localStorage.getItem('userRoles') || '[]')

    return Array.isArray(roles) ? roles : []
  } catch {
    return []
  }
}

export function hasRole(...allowedRoles) {
  const userRoles = getUserRoles()

  return userRoles.some((role) => allowedRoles.includes(role))
}

export function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('tokenType')
  localStorage.removeItem('userRoles')
}