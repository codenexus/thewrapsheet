export default defineNuxtRouteMiddleware(async () => {
  const { data: me } = await useFetch('/api/auth/me')
  if (!me.value?.isAdmin) {
    return navigateTo('/')
  }
})