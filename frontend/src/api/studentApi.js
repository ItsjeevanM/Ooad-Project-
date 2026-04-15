import axiosInstance from './axiosInstance'

export async function fetchStudentCourses(params = {}) {
  const response = await axiosInstance.get('/students/me/courses', { params })
  return response.data
}

export async function fetchAvailableCourses() {
  const response = await axiosInstance.get('/students/me/courses/available')
  return response.data
}

export async function enrollInCourse(courseId) {
  const response = await axiosInstance.post('/students/me/courses/enroll', { courseId })
  return response.data
}

export async function fetchStudentAssignments(params = {}) {
  const response = await axiosInstance.get('/students/me/assignments', { params })
  return response.data
}

export async function fetchStudentMarks(params = {}) {
  const response = await axiosInstance.get('/students/me/marks', { params })
  return response.data
}

export async function fetchStudentAttendance(params = {}) {
  const response = await axiosInstance.get('/students/me/attendance', { params })
  return response.data
}

export async function fetchCourseMaterials(courseId) {
  const response = await axiosInstance.get(`/students/materials/${courseId}`)
  return response.data
}