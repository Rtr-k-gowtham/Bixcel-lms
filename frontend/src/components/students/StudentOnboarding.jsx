import React from 'react'
import StudentManagement from './StudentManagement'

export { StudentManagement }

export function StudentOnboarding(props) {
  return <StudentManagement initialTab="wizard" {...props} />
}

export default StudentOnboarding
