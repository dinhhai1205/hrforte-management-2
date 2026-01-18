import { Outlet, createRootRoute, redirect, useRouter } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { authService } from '@/services/auth'
import { AppLayout } from '@/components/layout/AppLayout'

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const isAuthenticated = authService.isAuthenticated()
    const isLoginPage = location.pathname === '/login'

    // Redirect to login if not authenticated and not on login page
    if (!isAuthenticated && !isLoginPage) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    // Redirect to dashboard if authenticated and on login page
    if (isAuthenticated && isLoginPage) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: () => {
    const router = useRouter()
    const isLoginPage = router.state.location.pathname === '/login'

    return (
      <>
        {isLoginPage ? (
          <Outlet />
        ) : (
          <AppLayout>
            <Outlet />
          </AppLayout>
        )}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </>
    )
  },
})
