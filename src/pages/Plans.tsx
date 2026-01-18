
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { toast } from 'sonner'

// Schema
const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  interval: z.enum(['monthly', 'yearly']),
})

type PlanFormValues = z.infer<typeof planSchema>

interface Plan extends PlanFormValues {
  id: string
}

export function PlansPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  
  const queryClient = useQueryClient()

  // Queries
  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiClient<Plan[]>('/api/plans'),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: PlanFormValues) => 
        apiClient('/api/plans', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['plans'] })
        setIsDialogOpen(false)
        toast.success("Plan created successfully")
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: Plan) => 
        apiClient(`/api/plans/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['plans'] })
        setIsDialogOpen(false)
        setEditingPlan(null)
        toast.success("Plan updated successfully")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
        apiClient(`/api/plans/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['plans'] })
        toast.success("Plan deleted")
    }
  })

  // Form
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      name: '',
      price: 0,
      currency: 'USD',
      interval: 'monthly',
    },
  })

  // Handlers
  const openCreateDialog = () => {
      setEditingPlan(null)
      form.reset({
          name: '',
          price: 0,
          currency: 'USD',
          interval: 'monthly',
      })
      setIsDialogOpen(true)
  }

  const openEditDialog = (plan: Plan) => {
      setEditingPlan(plan)
      form.reset({
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          interval: plan.interval
      })
      setIsDialogOpen(true)
  }

  const onSubmit = (values: PlanFormValues) => {
      if (editingPlan) {
          updateMutation.mutate({ ...values, id: editingPlan.id })
      } else {
          createMutation.mutate(values)
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Plans</h2>
        <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Create Plan
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
                </TableRow>
            ) : plans?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No plans found.</TableCell>
                </TableRow>
            ) : (
                plans?.map((plan) => (
                    <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>{plan.currency} {plan.price}</TableCell>
                        <TableCell className="capitalize">{plan.interval}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(plan.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
                <DialogDescription>
                    {editingPlan ? 'Update plan details.' : 'Add a new subscription plan.'}
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Pro Plan" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Currency</FormLabel>
                                    <FormControl>
                                        <Input placeholder="USD" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="interval"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Billing Interval</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select interval" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
