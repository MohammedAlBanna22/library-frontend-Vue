import axios from 'axios'

const api = axios.create({
  baseURL: 'http://library-mang-api.test/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add auth token to every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✓ Auth token added to request:', token.substring(0, 20) + '...')
    } else {
      console.log('⚠ No auth token found in localStorage')
    }
    
    return config
  },
  error => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.error('API Error:', error.response?.status, error.response?.data)
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('🔐 Token expired - redirecting to login')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    if (error.response?.status === 403) {
      console.warn('❌ Access Forbidden - User may not have permissions or member profile')
    }
    
    return Promise.reject(error)
  }
)

export default api