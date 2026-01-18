import { createFileRoute, redirect } from '@tanstack/react-router'
import { authService } from '@/services/auth'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Redirect to dashboard if authenticated, otherwise to login
    if (authService.isAuthenticated()) {
      throw redirect({
        to: '/dashboard',
      })
    } else {
      throw redirect({
        to: '/login',
      })
    }
  },
})
