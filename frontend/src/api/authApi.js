import axiosInstance from './axiosInstance'

export async function loginRequest(payload) {
  const response = await axiosInstance.post('/auth/login', payload)
  return response.data?.data
}

export async function registerRequest(payload) {
  const response = await axiosInstance.post('/auth/register', payload)
  return response.data?.data
}

export async function fetchCurrentUser() {
  const response = await axiosInstance.get('/auth/me')
  return response.data?.data
}
