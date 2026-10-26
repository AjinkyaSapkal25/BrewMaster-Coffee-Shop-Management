import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    const tokenType = localStorage.getItem('tokenType') || 'Bearer'

    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api

