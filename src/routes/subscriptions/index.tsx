import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionsPage } from '@/pages/Subscriptions'

export const Route = createFileRoute('/subscriptions/')({
  component: SubscriptionsPage,
})
