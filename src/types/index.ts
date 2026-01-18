// Data entity types based on spec.md

export interface Client {
  id: string
  name: string
  email: string
}

export interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: 'monthly' | 'yearly'
  archived?: boolean
}

export type SubscriptionStatus = 'active' | 'pending' | 'overdue' | 'cancelled'
export type PaymentMethod = 'stripe' | 'offline'

export interface Subscription {
  id: string
  client_id: string
  plan_id: string
  status: SubscriptionStatus
  payment_method: PaymentMethod
  client?: Client
  plan?: Plan
}

export type PaymentType = 'online' | 'offline'

export interface PaymentRecord {
  id: string
  subscription_id: string
  amount: number
  date: string
  reference_code?: string
  type: PaymentType
}
