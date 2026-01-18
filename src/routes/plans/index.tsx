import { createFileRoute } from '@tanstack/react-router'
import { PlansPage } from '@/pages/Plans'

export const Route = createFileRoute('/plans/')({
  component: PlansPage,
})
