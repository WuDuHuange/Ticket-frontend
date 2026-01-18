import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import mockHandlers from '@/mock'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userRole = computed(() => user.value?.role)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager' || user.value?.role === 'admin')
  const isStaff = computed(() => ['support_staff', 'manager', 'admin'].includes(user.value?.role || ''))
  const userName = computed(() => user.value?.name || '')
  const userAvatar = computed(() => user.value?.avatar || '')

  // Actions
  async function login(email: string, password: string) {
    loading.value = true
    try {
      const response = await mockHandlers.login({ email, password })
      if (response.code === 200 && response.data) {
        const { token: newToken, user: newUser } = response.data
        token.value = newToken
        user.value = newUser
        localStorage.setItem('token', newToken)
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed' }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await mockHandlers.logout()
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return
    
    loading.value = true
    try {
      const response = await mockHandlers.getCurrentUser()
      if (response.code === 200 && response.data) {
        user.value = response.data
      }
    } catch (error) {
      console.error('Fetch user error:', error)
      token.value = null
      localStorage.removeItem('token')
    } finally {
      loading.value = false
    }
  }

  function setUser(newUser: User) {
    user.value = newUser
  }

  // SSO Login - No password required, authentication handled by external SSO provider
  async function loginWithSSO(email: string) {
    loading.value = true
    try {
      // In production, the SSO provider would return a token after successful authentication
      // Here we simulate SSO by calling the mock handler with just the email
      const response = await mockHandlers.ssoLogin({ email })
      if (response.code === 200 && response.data) {
        const { token: newToken, user: newUser } = response.data
        token.value = newToken
        user.value = newUser
        localStorage.setItem('token', newToken)
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (error) {
      console.error('SSO Login error:', error)
      return { success: false, message: 'SSO authentication failed' }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    token,
    loading,
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isManager,
    isStaff,
    userName,
    userAvatar,
    // Actions
    login,
    loginWithSSO,
    logout,
    fetchCurrentUser,
    setUser
  }
})
