'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Box, Spinner, Flex } from '@chakra-ui/react'

interface ProtectedRouteProps {
    children: React.ReactNode
    redirectTo?: string
}

export default function ProtectedRoute({
    children,
    redirectTo = '/auth/login'
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(redirectTo)
        }
    }, [isAuthenticated, isLoading, router, redirectTo])

    if (isLoading) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="gray.50">
                <Box textAlign="center">
                    <Spinner size="xl" color="blue.900" mb={4} animationDuration="0.8s" borderWidth="4px" />
                </Box>
            </Flex>
        )
    }

    // Redirect in progress
    if (!isAuthenticated) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="gray.50">
                <Box textAlign="center">
                    <Spinner size="xl" color="blue.900" mb={4} animationDuration="0.8s" borderWidth="4px" />
                </Box>
            </Flex>
        )
    }

    // Authenticated user, render the children
    return <>{children}</>
}