
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, CreditCard, Search, Banknote } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Schemas
const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
  reference: z.string().min(1, 'Reference number is required'),
  date: z.date(),
  notes: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface Subscription {
  id: string
  clientName: string
  email: string
  planId: string
  status: 'active' | 'pending' | 'overdue' | 'cancelled'
  paymentMethod: 'stripe' | 'offline'
}

export function SubscriptionsPage() {
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const queryClient = useQueryClient()

  // Data
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => apiClient<Subscription[]>('/api/subscriptions'),
  })

  // Mutation
  const payMutation = useMutation({
    mutationFn: (data: PaymentFormValues) => 
        apiClient(`/api/subscriptions/${selectedSub?.id}/pay`, { 
            method: 'POST', 
            body: JSON.stringify(data) 
        }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
        queryClient.invalidateQueries({ queryKey: ['stats'] }) // Update dashboard stats too
        setIsPaymentOpen(false)
        setSelectedSub(null)
        toast.success("Payment recorded successfully")
    }
  })

  // Form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      amount: 0,
      reference: '',
      date: new Date(),
      notes: ''
    },
  })

  // Filter Logic
  const filteredSubs = subscriptions?.filter(sub => {
    const statusMatch = filterStatus === 'all' || sub.status === filterStatus
    const methodMatch = filterMethod === 'all' || sub.paymentMethod === filterMethod
    const searchMatch = sub.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        sub.email.toLowerCase().includes(searchQuery.toLowerCase())
    return statusMatch && methodMatch && searchMatch
  })

  // Handlers
  const openPaymentModal = (sub: Subscription) => {
      setSelectedSub(sub)
      form.reset({
          amount: 0, // Ideally fetch plan price
          reference: '',
          date: new Date(),
          notes: ''
      })
      setIsPaymentOpen(true)
  }

  const onSubmit = (values: PaymentFormValues) => {
      payMutation.mutate(values)
  }

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'active': return 'bg-green-500 hover:bg-green-600'
          case 'pending': return 'bg-orange-500 hover:bg-orange-600'
          case 'overdue': return 'bg-red-500 hover:bg-red-600'
          default: return 'bg-gray-500'
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
      </div>

        {/* Filters */}
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search client..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={filterMethod} onValueChange={setFilterMethod}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Plan ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                </TableRow>
            ) : filteredSubs?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">No subscriptions found.</TableCell>
                </TableRow>
            ) : (
                filteredSubs?.map((sub) => (
                    <TableRow key={sub.id}>
                        <TableCell>
                            <div className="font-medium">{sub.clientName}</div>
                            <div className="text-xs text-muted-foreground">{sub.email}</div>
                        </TableCell>
                        <TableCell>{sub.planId}</TableCell>
                        <TableCell>
                            <Badge className={getStatusColor(sub.status)}>{sub.status}</Badge>
                        </TableCell>
                        <TableCell className="capitalize flex items-center gap-2">
                             {sub.paymentMethod === 'stripe' ? <CreditCard className="h-4 w-4"/> : <Banknote className="h-4 w-4"/>}
                             {sub.paymentMethod}
                        </TableCell>
                        <TableCell className="text-right">
                             {sub.paymentMethod === 'offline' && sub.status !== 'active' && (
                                 <Button size="sm" onClick={() => openPaymentModal(sub)}>
                                     Mark Paid
                                 </Button>
                             )}
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Record Offline Payment</DialogTitle>
                <DialogDescription>
                    Record a manual payment for {selectedSub?.clientName}.
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                     <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Transaction Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reference Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Bank Transfer ID / Check #" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                     <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount Paid</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                     <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Additional details..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <Button type="submit" disabled={payMutation.isPending}>
                            {payMutation.isPending ? 'Processing...' : 'Confirm Payment'}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
