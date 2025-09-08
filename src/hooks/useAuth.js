import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('digininja_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Mock authentication - in real app, this would call your backend
    const mockUser = {
      id: 'user_123',
      email,
      subscriptionTier: 'free',
      generationsUsed: 0,
      generationsLimit: 3,
      createdAt: new Date().toISOString()
    }
    
    setUser(mockUser)
    localStorage.setItem('digininja_user', JSON.stringify(mockUser))
    return mockUser
  }

  const signup = async (email, password) => {
    // Mock signup
    return login(email, password)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('digininja_user')
  }

  const updateSubscription = (tier) => {
    const updatedUser = {
      ...user,
      subscriptionTier: tier,
      generationsLimit: tier === 'pro' ? Infinity : tier === 'premium' ? Infinity : 3
    }
    setUser(updatedUser)
    localStorage.setItem('digininja_user', JSON.stringify(updatedUser))
  }

  const incrementGenerations = () => {
    if (user) {
      const updatedUser = {
        ...user,
        generationsUsed: user.generationsUsed + 1
      }
      setUser(updatedUser)
      localStorage.setItem('digininja_user', JSON.stringify(updatedUser))
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateSubscription,
    incrementGenerations
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}