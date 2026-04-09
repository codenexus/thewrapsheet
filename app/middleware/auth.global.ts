import { authClient } from '../lib/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for API routes and login
  const publicRoutes = ['/login']
  const isApiRoute = to.path.startsWith('/api/')

  if (publicRoutes.includes(to.path) || isApiRoute) return

  const session = await useRequestFetch()('/api/auth/get-session', {
    headers: useRequestHeaders(['cookie']),
  })

  if (!session) {
    return navigateTo('/login')
  }
})