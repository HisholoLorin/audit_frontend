import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import api from '@/lib/api'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { accessToken, user, setUser } = useAuthStore.getState().auth
    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }
    // If token exists but user was lost (e.g. localStorage cleared), re-fetch profile
    if (!user) {
      try {
        const response = await api.get('/auth/me/')
        setUser(response.data)
      } catch {
        // Token is invalid/expired — clear everything and redirect to sign-in
        useAuthStore.getState().auth.reset()
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }
  },
  component: AuthenticatedLayout,
})
