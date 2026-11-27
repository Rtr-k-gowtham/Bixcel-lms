import axios from 'axios'

const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || '/api')

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
})

// Attach auth token if available
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('bx_auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // ignore
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const apiService = {
  // Authentication API
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    if (response.data && response.data.token) {
      try {
        localStorage.setItem('bx_auth_token', response.data.token)
        localStorage.setItem('bx_auth_user', JSON.stringify(response.data.user))
      } catch {
        // ignore
      }
    }
    return response.data
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Silently handle network errors
    } finally {
      try {
        localStorage.removeItem('bx_auth_token')
        localStorage.removeItem('bx_auth_user')
      } catch {
        // ignore
      }
    }
  },

  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem('bx_auth_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },

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

  // Update existing course
  updateCourse: async (id, courseData) => {
    const response = await apiClient.put(`/courses/${id}`, courseData)
    return response.data
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await apiClient.delete(`/courses/${id}`)
    return response.data
  },

  // Module Library API
  getModules: async () => {
    const response = await apiClient.get('/modules')
    return response.data
  },
  getModule: async (id) => {
    const response = await apiClient.get(`/modules/${id}`)
    return response.data
  },
  createModule: async (moduleData) => {
    const response = await apiClient.post('/modules', moduleData)
    return response.data
  },
  updateModule: async (id, moduleData) => {
    const response = await apiClient.put(`/modules/${id}`, moduleData)
    return response.data
  },
  deleteModule: async (id) => {
    const response = await apiClient.delete(`/modules/${id}`)
    return response.data
  },

  // Users API
  getUsers: async () => {
    const response = await apiClient.get('/users')
    return response.data
  },
  createUser: async (userData) => {
    const response = await apiClient.post('/users', userData)
    return response.data
  },
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/users/${id}`, userData)
    return response.data
  },
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`)
    return response.data
  },

  // Roles API
  getRoles: async () => {
    const response = await apiClient.get('/roles')
    return response.data
  },
  createRole: async (roleData) => {
    const response = await apiClient.post('/roles', roleData)
    return response.data
  },
  updateRole: async (id, roleData) => {
    const response = await apiClient.put(`/roles/${id}`, roleData)
    return response.data
  },
  deleteRole: async (id) => {
    const response = await apiClient.delete(`/roles/${id}`)
    return response.data
  },

  // Permission Matrix API
  getPermissions: async () => {
    const response = await apiClient.get('/permissions')
    return response.data
  },
  savePermissions: async (payload) => {
    const response = await apiClient.post('/permissions', payload)
    return response.data
  },

  // Audit Logs API
  getAuditLogs: async () => {
    const response = await apiClient.get('/audit-logs')
    return response.data
  },
  getAuditLog: async (id) => {
    const response = await apiClient.get(`/audit-logs/${id}`)
    return response.data
  },

  // Notifications API
  getNotifications: async () => {
    const response = await apiClient.get('/notifications')
    return response.data
  },
  markAllNotificationsRead: async () => {
    const response = await apiClient.post('/notifications/read-all')
    return response.data
  },
  markNotificationRead: async (id) => {
    const response = await apiClient.put(`/notifications/${id}`)
    return response.data
  },
  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`)
    return response.data
  },

  // User Profile API
  getProfile: async () => {
    const response = await apiClient.get('/profile')
    return response.data
  },
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/profile', profileData)
    return response.data
  },
  revokeSession: async (sessionId) => {
    const response = await apiClient.delete(`/profile/sessions/${sessionId}`)
    return response.data
  },

  // Student Onboarding & Enrollment API
  getStudents: async (params = {}) => {
    const response = await apiClient.get('/students', { params })
    return response.data
  },
  getStudent: async (id) => {
    const response = await apiClient.get(`/students/${id}`)
    return response.data
  },
  getStudentTracks: async () => {
    const response = await apiClient.get('/students/tracks')
    return response.data
  },
  createStudent: async (studentData) => {
    const response = await apiClient.post('/students', studentData)
    return response.data
  },
  updateStudent: async (id, studentData) => {
    const response = await apiClient.put(`/students/${id}`, studentData)
    return response.data
  },
  deleteStudent: async (id) => {
    const response = await apiClient.delete(`/students/${id}`)
    return response.data
  },
  updateStudentCredentials: async (payload) => {
    const response = await apiClient.post('/students/credentials', payload)
    return response.data
  },

  // Batch Management API
  getBatches: async (params = {}) => {
    const response = await apiClient.get('/batches', { params })
    return response.data
  },
  getBatch: async (id) => {
    const response = await apiClient.get(`/batches/${id}`)
    return response.data
  },
  createBatch: async (batchData) => {
    const response = await apiClient.post('/batches', batchData)
    return response.data
  },
  updateBatch: async (id, batchData) => {
    const response = await apiClient.put(`/batches/${id}`, batchData)
    return response.data
  },
  deleteBatch: async (id) => {
    const response = await apiClient.delete(`/batches/${id}`)
    return response.data
  },
  assignBatchStudents: async (payload) => {
    const response = await apiClient.post('/batches/assign-students', payload)
    return response.data
  },
  removeBatchStudent: async (payload) => {
    const response = await apiClient.post('/batches/remove-student', payload)
    return response.data
  },

  // Tutor Management & Allocation API
  getTutors: async (params = {}) => {
    const response = await apiClient.get('/tutors', { params })
    return response.data
  },
  getTutor: async (id) => {
    const response = await apiClient.get(`/tutors/${id}`)
    return response.data
  },
  createTutor: async (tutorData) => {
    const response = await apiClient.post('/tutors', tutorData)
    return response.data
  },
  updateTutor: async (id, tutorData) => {
    const response = await apiClient.put(`/tutors/${id}`, tutorData)
    return response.data
  },
  deleteTutor: async (id) => {
    const response = await apiClient.delete(`/tutors/${id}`)
    return response.data
  },
  assignTutor: async (assignmentData) => {
    const response = await apiClient.post('/tutors/assign', assignmentData)
    return response.data
  },

  // Fees & Payment Collection API
  getFees: async (params = {}) => {
    const response = await apiClient.get('/fees', { params })
    return response.data
  },
  getBalanceReport: async (params = {}) => {
    const response = await apiClient.get('/fees/balance', { params })
    return response.data
  },
  sendFeeReminder: async (payload) => {
    const response = await apiClient.post('/fees/remind', payload)
    return response.data
  },
  saveFeeCommitment: async (payload) => {
    const response = await apiClient.post('/fees/commitment', payload)
    return response.data
  },
  collectFeePayment: async (paymentData) => {
    const response = await apiClient.post('/fees/collect', paymentData)
    return response.data
  },
  getFeeReceipt: async (receiptNo) => {
    const response = await apiClient.get(`/fees/receipt/${receiptNo}`)
    return response.data
  },

  // Student Calendar & Environment API
  getCalendarEvents: async (params = {}) => {
    const response = await apiClient.get('/calendar', { params })
    return response.data
  },
  getCalendarToday: async () => {
    const response = await apiClient.get('/calendar/today')
    return response.data
  },
  createCalendarEvent: async (eventData) => {
    const response = await apiClient.post('/calendar', eventData)
    return response.data
  },
  updateCalendarEvent: async (id, eventData) => {
    const response = await apiClient.put(`/calendar/${id}`, eventData)
    return response.data
  },
  deleteCalendarEvent: async (id) => {
    const response = await apiClient.delete(`/calendar/${id}`)
    return response.data
  },

  // Student Academic Progress Report API
  getProgressList: async (params = {}) => {
    const response = await apiClient.get('/progress', { params })
    return response.data
  },
  getStudentProgress: async (id) => {
    const response = await apiClient.get(`/progress/${id}`)
    return response.data
  },
  saveAdvisorRemark: async (remarkData) => {
    const response = await apiClient.post('/progress/remark', remarkData)
    return response.data
  },
}

export default apiService
