import { useState, useEffect, useCallback } from 'react'

interface User {
    id: number
    email: string
    lastLogin: Date
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true
    })

    // Checker session when loading the hook
    const checkSession = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include' // Include cookies for session management
            })

            const data = await response.json()

            if (response.ok && data.authenticated) {
                setAuthState({
                    user: data.user,
                    isAuthenticated: true,
                    isLoading: false
                })
            } else {
                setAuthState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false
                })
            }
        } catch (error) {
            console.error('Error verifying session:', error)
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false
            })
        }
    }, [])

    // Login function
    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important to include cookies
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                setAuthState({
                    user: data.user,
                    isAuthenticated: true,
                    isLoading: false
                })

                // Check session again after login
                setTimeout(() => {
                    checkSession()
                }, 500)

                return { success: true, message: data.message }
            } else {
                return { success: false, error: data.error }
            }
        } catch (error) {
            console.error('Error while connecting:', error)
            return { success: false, error: 'Server connection error' }
        }
    }, [checkSession])

    // Logout function
    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include' // Important to include cookies
            })

            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false
            })

            // Redirect to login page
            window.location.href = '/auth/login'

            return { success: true }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error)
            // In case of error, we reset the auth state and redirect to login
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false
            })

            window.location.href = '/auth/login'

            return { success: false, error: 'Erreur lors de la déconnexion' }
        }
    }, [])

    // Check session on component mount
    useEffect(() => {
        checkSession()
    }, [checkSession])

    return {
        ...authState,
        login,
        logout,
        checkSession
    }
}