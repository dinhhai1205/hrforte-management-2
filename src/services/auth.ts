// Mock authentication service
export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager'
}

export interface AuthResponse {
  user: User
  token: string
}

// Mock API delay (unused now but kept)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error('Invalid email or password')
    }

    const data = await response.json()
    
    // Store token in localStorage
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))

    return data
  },

  async logout(): Promise<void> {
    await delay(300)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('auth_user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser()
  },
}
