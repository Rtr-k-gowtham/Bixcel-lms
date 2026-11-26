import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
})

export const apiService = {
  // Check backend health
  checkHealth: async () => {
    const response = await apiClient.get('/health')
    return response.data
  },

  // Get all courses
  getCourses: async () => {
    const response = await apiClient.get('/courses')
    return response.data
  },

  // Get course by id
  getCourse: async (id) => {
    const response = await apiClient.get(`/courses/${id}`)
    return response.data
  },

  // Create new course
  createCourse: async (courseData) => {
    const response = await apiClient.post('/courses', courseData)
    return response.data
  },
}

export default apiService
