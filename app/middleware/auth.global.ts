export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/login']

  if (publicRoutes.includes(to.path)) return

  const session = await useRequestFetch()('/api/auth/get-session', {
    headers: useRequestHeaders(['cookie']),
  })

  if (!session) {
    return navigateTo('/login')
  }
})
