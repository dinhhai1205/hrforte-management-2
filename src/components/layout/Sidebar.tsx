import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Receipt, Settings, Users, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Plans', href: '/plans', icon: Receipt },
  { name: 'Subscriptions', href: '/subscriptions', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
  // TanStack Router doesn't have useLocation hook in v1 the same way, 
  // but Link handles active state automatically. 
  // We can also use `useRouterState` to get current path if needed for other logic.

  return (
    <div className={cn("flex h-full w-64 flex-col border-r bg-card text-card-foreground", className)}>
      <div className="flex h-16 items-center px-6 border-b">
        <CreditCard className="h-6 w-6 text-primary mr-2" />
        <span className="font-bold text-lg">Offline Admin</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
            activeProps={{
              className: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            }}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">v1.0.0</p>
      </div>
    </div>
  )
}
