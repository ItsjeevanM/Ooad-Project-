import axiosInstance from './axiosInstance'

export async function fetchInstructorCourses(params = {}) {
  const response = await axiosInstance.get('/instructors/me/courses', { params })
  return response.data
}

export async function fetchInstructorAssignments(courseId, params = {}) {
  const response = await axiosInstance.get(`/instructors/me/courses/${courseId}/assignments`, { params })
  return response.data
}

export async function fetchInstructorSubmissions(assignmentId, params = {}) {
  const response = await axiosInstance.get(`/instructors/me/assignments/${assignmentId}/submissions`, { params })
  return response.data
}

export async function gradeInstructorSubmission(submissionId, payload) {
  const response = await axiosInstance.patch(`/instructors/me/submissions/${submissionId}/grade`, payload)
  return response.data
}

export async function markInstructorAttendance(payload) {
  const response = await axiosInstance.post('/instructors/me/attendance', payload)
  return response.data
}

export async function uploadMaterial(courseId, file) {
  const formData = new FormData()
  formData.append('courseId', courseId)
  formData.append('file', file)
  const response = await axiosInstance.post('/instructors/materials/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export async function fetchCourseStudents(courseId, params = {}) {
  const response = await axiosInstance.get(`/instructors/me/courses/${courseId}/students`, { params })
  return response.data
}

export async function markAttendance(courseId, payload) {
  const response = await axiosInstance.post(`/instructors/me/courses/${courseId}/attendance`, payload)
  return response.data
}

export async function getAttendanceFeed(courseId) {
  const response = await axiosInstance.get(`/instructors/me/courses/${courseId}/attendance`)
  return response.data
}

export async function fetchInstructorMaterials(courseId) {
  const response = await axiosInstance.get(`/instructors/me/courses/${courseId}/materials`)
  return response.data
}