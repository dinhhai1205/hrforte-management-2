import { http, HttpResponse, delay } from 'msw'

// In-memory data store (resets on reload, but good for prototype)
const plans = [
  { id: '1', name: 'Basic', price: 29, currency: 'USD', interval: 'monthly' },
  { id: '2', name: 'Pro', price: 99, currency: 'USD', interval: 'monthly' },
  { id: '3', name: 'Enterprise', price: 499, currency: 'USD', interval: 'yearly' },
]

const subscriptions = [
  { id: 'sub_1', clientName: 'Alice Corp', email: 'alice@corp.com', planId: '1', status: 'active', paymentMethod: 'stripe' },
  { id: 'sub_2', clientName: 'Bob Ltd', email: 'bob@ltd.com', planId: '2', status: 'pending', paymentMethod: 'offline' },
  { id: 'sub_3', clientName: 'Charlie Inc', email: 'charlie@inc.com', planId: '2', status: 'overdue', paymentMethod: 'stripe' },
  { id: 'sub_4', clientName: 'Delta Org', email: 'delta@org.org', planId: '3', status: 'pending', paymentMethod: 'offline' },
]

export const handlers = [
  // Auth
  http.post('/api/auth/login', async ({ request }) => {
    await delay(500)
    const { email, password } = await request.json() as any

    if (email === 'admin@hrforte.com' && password === 'password123') {
      return HttpResponse.json({ 
        user: { id: 'admin', email, name: 'Admin User' },
        token: 'mock-jwt-token'
      })
    }
    return new HttpResponse(null, { status: 401 })
  }),

  // Stats
  http.get('/api/stats', async () => {
    await delay(300)
    return HttpResponse.json({
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      pendingOffline: subscriptions.filter(s => s.status === 'pending' && s.paymentMethod === 'offline').length,
      recentTransactions: 5 // Mock number
    })
  }),

  // Plans
  http.get('/api/plans', async () => {
    await delay(300)
    return HttpResponse.json(plans)
  }),

  http.post('/api/plans', async ({ request }) => {
    await delay(500)
    const body = await request.json() as any
    const newPlan = { id: String(plans.length + 1), ...body }
    plans.push(newPlan)
    return HttpResponse.json(newPlan, { status: 201 })
  }),

  http.put('/api/plans/:id', async ({ params, request }) => {
    await delay(500)
    const { id } = params
    const body = await request.json() as any
    const index = plans.findIndex(p => p.id === id)
    
    if (index !== -1) {
        plans[index] = { ...plans[index], ...body }
        return HttpResponse.json(plans[index])
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.delete('/api/plans/:id', async ({ params }) => {
    await delay(500)
    const { id } = params
    const index = plans.findIndex(p => p.id === id)
    
    if (index !== -1) {
        plans.splice(index, 1)
        return HttpResponse.json({ success: true })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Subscriptions
  http.get('/api/subscriptions', async () => {
    await delay(300)
    return HttpResponse.json(subscriptions)
  }),

  // Offline Payment
  http.post('/api/subscriptions/:id/pay', async ({ params, request }) => {
    await delay(800)
    const { id } = params
    const body = await request.json() as any
    const sub = subscriptions.find(s => s.id === id)

    if (sub) {
        sub.status = 'active'
        console.log(`[Mock] Payment recorded for ${id}:`, body)
        return HttpResponse.json({ success: true, subscription: sub })
    }
    return new HttpResponse(null, { status: 404 })
  }),
]
