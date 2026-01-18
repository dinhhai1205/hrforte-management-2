
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { Users, CreditCard, Activity, ArrowUpRight } from 'lucide-react'

// Define this locally for now or in types
interface DashboardStats {
  activeSubscriptions: number
  pendingOffline: number
  recentTransactions: number
}

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient<DashboardStats>('/api/stats'),
  })

  if (isLoading) {
    return <div className="p-8">Loading stats...</div>
  }

  return (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active Subscriptions
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.activeSubscriptions}</div>
                    <p className="text-xs text-muted-foreground">
                        +20% from last month
                    </p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Pending Offline Payments
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats?.pendingOffline}</div>
                    <p className="text-xs text-muted-foreground">
                        Requires attention
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Recent Transactions
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.recentTransactions}</div>
                    <p className="text-xs text-muted-foreground">
                        Last 24 hours
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                   <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md">
                       Chart Placeholder
                   </div>
                </CardContent>
            </Card>
             <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-2">
                       <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                            <ArrowUpRight className="h-4 w-4 mr-2 text-primary" />
                            <span className="text-sm font-medium">Review Pending Payments</span>
                       </div>
                   </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
