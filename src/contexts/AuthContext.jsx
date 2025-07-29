import { createContext, useContext, useState, useEffect } from 'react'
import logger from '../utils/logger'

const AuthContext = createContext(null)

// Mock user database
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@safecell.com',
    password: 'admin123',
    name: 'Kevin',
    role: 'admin',
    profilePicture: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    location: {
      district: 'Kigali',
      province: 'Kigali City'
    }
  },
  {
    id: '2',
    email: 'clinician@safecell.com',
    password: 'clinician123',
    name: 'Dr. Jane Smith',
    role: 'clinician',
    profilePicture: '',
    createdAt: '2024-01-15T00:00:00.000Z',
    location: {
      district: 'Gasabo',
      province: 'Kigali City'
    }
  }
]

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setIsAuthenticated(true)
      
      // Log session restoration
      logger.logAuth('session_restored', {
        userId: userData.id,
        email: userData.email,
        role: userData.role
      })
    }
    setLoading(false)
  }, [])
  
  // Mock login function
  const login = async (email, password) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check credentials against mock database
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password)
      
      if (!foundUser) {
        throw new Error('Invalid email or password')
      }
      
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        profilePicture: foundUser.profilePicture,
        createdAt: foundUser.createdAt,
        location: foundUser.location
      }
      
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Log successful login
      logger.logAuth('login_success', {
        userId: userData.id,
        email: userData.email,
        role: userData.role,
        loginMethod: 'email_password'
      })
      
      return { success: true, user: userData }
    } catch (error) {
      // Log failed login
      logger.logAuth('login_failed', {
        email,
        error: error.message,
        loginMethod: 'email_password'
      })
      
      return { 
        success: false, 
        error: error.message || 'Login failed'
      }
    }
  }

  // Mock signup function
  const signup = async (email, password, name = '') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user already exists
      const existingUser = MOCK_USERS.find(u => u.email === email)
      if (existingUser) {
        throw new Error('User with this email already exists')
      }
      
      // Create new user
      const newUser = {
        id: `${Date.now()}`,
        email,
        password,
        name: name || email.split('@')[0],
        role: 'clinician', // Default role
        profilePicture: '',
        createdAt: new Date().toISOString(),
        location: {
          district: '',
          province: ''
        }
      }
      
      // Add to mock database
      MOCK_USERS.push(newUser)
      
      // Log successful signup
      logger.logAuth('signup_success', {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      })
      
      return { success: true, user: newUser }
    } catch (error) {
      // Log failed signup
      logger.logAuth('signup_failed', {
        email,
        error: error.message
      })
      
      return { 
        success: false, 
        error: error.message || 'Signup failed'
      }
    }
  }
  
  // Update user profile
  const updateUser = async (userData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedUser = {
        ...user,
        ...userData
      }
      
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Update in mock database
      const userIndex = MOCK_USERS.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...userData }
      }
      
      // Log profile update
      logger.logAuth('profile_updated', {
        userId: user.id,
        updatedFields: Object.keys(userData)
      })
      
      return { success: true }
    } catch (error) {
      // Log failed profile update
      logger.logAuth('profile_update_failed', {
        userId: user?.id,
        error: error.message
      })
      
      throw new Error('Failed to update profile')
    }
  }

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you would verify the current password
      // For demo purposes, we'll just simulate success
      
      // Log password change
      logger.logAuth('password_changed', {
        userId: user?.id
      })
      
      return { success: true }
    } catch (error) {
      logger.logAuth('password_change_failed', {
        userId: user?.id,
        error: error.message
      })
      
      throw new Error('Failed to change password')
    }
  }

  // Delete account function
  const deleteAccount = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Log account deletion
      logger.logAuth('account_deleted', {
        userId: user?.id
      })
      
      // Clear user data
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
      
      return { success: true }
    } catch (error) {
      logger.logAuth('account_deletion_failed', {
        userId: user?.id,
        error: error.message
      })
      
      throw new Error('Failed to delete account')
    }
  }
  
  // Logout function
  const logout = () => {
    // Log logout
    logger.logAuth('logout', {
      userId: user?.id,
      sessionDuration: Date.now() - logger.startTime
    })
    
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }
  
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateUser,
    changePassword,
    deleteAccount
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}