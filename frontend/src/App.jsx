import { useState, useEffect } from 'react'
import { apiService } from './services/api'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [healthLoading, setHealthLoading] = useState(true)
  const [healthError, setHealthError] = useState(null)

  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    level: 'Beginner',
    duration: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState('')

  // Check health and load courses on mount
  useEffect(() => {
    fetchHealth()
    fetchCourses()
  }, [])

  const fetchHealth = async () => {
    setHealthLoading(true)
    setHealthError(null)
    try {
      const data = await apiService.checkHealth()
      setHealth(data)
    } catch (err) {
      setHealthError(err.message || 'Cannot reach CodeIgniter 4 backend')
    } finally {
      setHealthLoading(false)
    }
  }

  const fetchCourses = async () => {
    setCoursesLoading(true)
    setCoursesError(null)
    try {
      const res = await apiService.getCourses()
      if (res && res.data) {
        setCourses(res.data)
      }
    } catch (err) {
      setCoursesError(err.message || 'Failed to fetch courses')
    } finally {
      setCoursesLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setSubmitting(true)
    setFormSuccess('')
    try {
      const res = await apiService.createCourse(formData)
      if (res && res.data) {
        setCourses((prev) => [res.data, ...prev])
        setFormSuccess('Course added successfully!')
        setFormData({
          title: '',
          instructor: '',
          level: 'Beginner',
          duration: '',
          description: '',
        })
        setTimeout(() => {
          setShowAddModal(false)
          setFormSuccess('')
        }, 1200)
      }
    } catch (err) {
      alert(err.response?.data?.messages?.title || err.message || 'Failed to create course')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="lms-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="nav-brand">
          <div className="brand-logo">B</div>
          <div className="brand-text">
            <h1>Bixcel LMS</h1>
            <span className="brand-sub">React 19 + CodeIgniter 4 Architecture</span>
          </div>
        </div>

        <div className="nav-actions">
          <div className={`status-pill ${health ? 'connected' : healthLoading ? 'loading' : 'disconnected'}`}>
            <span className="dot"></span>
            {healthLoading
              ? 'Connecting to CI4...'
              : health
              ? `CI4 v${health.version || '4.x'} Connected`
              : 'CI4 Disconnected'}
          </div>
          <button className="btn-refresh" onClick={() => { fetchHealth(); fetchCourses(); }}>
            ↻ Refresh
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Backend Status Banner */}
        <section className="status-card">
          <div className="card-header">
            <h2>Backend System Status</h2>
            <span className="badge badge-ci4">CodeIgniter 4.7 PHP</span>
          </div>
          <div className="status-grid">
            <div className="status-item">
              <span className="label">API Endpoint</span>
              <span className="value code">http://localhost:8080/api</span>
            </div>
            <div className="status-item">
              <span className="label">Server Status</span>
              <span className={`value ${health ? 'text-success' : 'text-danger'}`}>
                {health ? '● Operational (200 OK)' : healthError || 'Not Connected'}
              </span>
            </div>
            <div className="status-item">
              <span className="label">Framework Version</span>
              <span className="value">{health?.version ? `CodeIgniter ${health.version}` : '---'}</span>
            </div>
            <div className="status-item">
              <span className="label">Environment</span>
              <span className="value tag">{health?.env || 'development'}</span>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="courses-section">
          <div className="section-header">
            <div>
              <h2>Course Catalog</h2>
              <p className="subtitle">Real-time data fetched from CodeIgniter 4 REST API</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              + Add New Course
            </button>
          </div>

          {coursesLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading courses from CodeIgniter backend...</p>
            </div>
          ) : coursesError ? (
            <div className="error-state">
              <p>⚠️ {coursesError}</p>
              <button className="btn btn-outline" onClick={fetchCourses}>Retry</button>
            </div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <p>No courses found. Add your first course to get started!</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className="course-card-top">
                    <span className={`badge-level ${course.level?.toLowerCase() || 'beginner'}`}>
                      {course.level || 'Beginner'}
                    </span>
                    <span className="course-duration">⏱ {course.duration || 'Flexible'}</span>
                  </div>
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description || 'No description provided.'}</p>
                  <div className="course-card-footer">
                    <div className="instructor">
                      <span className="avatar">👤</span>
                      <span>{course.instructor || 'Instructor'}</span>
                    </div>
                    <div className="enrollment">
                      👥 {course.enrolled || 0} students
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Course</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Advanced TypeScript for Frontend"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Instructor</label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Sarah Connor"
                  />
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select name="level" value={formData.level} onChange={handleInputChange}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g. 6 Weeks (4 hrs/week)"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief course summary..."
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving to CI4...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Bixcel LMS • Powered by <strong>React 19 (Vite)</strong> &amp; <strong>CodeIgniter 4.7 PHP</strong></p>
      </footer>
    </div>
  )
}

export default App
