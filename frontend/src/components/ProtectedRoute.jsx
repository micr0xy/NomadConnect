import useAuthStore from '../store/authStore'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth)

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if ((!hasCheckedAuth || isLoading) && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    window.location.replace('/login')
    return null
  }

  return children
}
