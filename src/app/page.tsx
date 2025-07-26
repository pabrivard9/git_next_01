'use client'

import { Box, Button, Heading, VStack, Text, Flex, Container } from '@chakra-ui/react'
import { User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
    const { user, logout, isLoading } = useAuth()

    const handleLogout = async () => {
        await logout()
    }

    // Loading state - le middleware s'occupe de la redirection
    if (isLoading) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="gray.50">
                <Text>Chargement...</Text>
            </Flex>
        )
    }

    return (
        <Flex minH="100vh" bg="gray.50">
            <Container maxW="4xl" py={12}>
                <VStack gap={8} align="stretch">
                    {/* Header */}
                    <Flex justify="between" align="center">
                        <Heading size="lg" color="blue.900">
                            Dashboard
                        </Heading>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            colorScheme="red"
                            disabled={isLoading}
                        >
                            Déconnexion
                        </Button>
                    </Flex>

                    {/* User Info */}
                    <Box bg="white" p={6} rounded="md" shadow="sm" border="1px" borderColor="gray.200">
                        <VStack align="start" gap={4}>
                            <Flex align="center" gap={3}>
                                <User size={24} color="#1a3478" />
                                <Heading size="md" color="gray.800">
                                    Informations utilisateur
                                </Heading>
                            </Flex>

                            <Box>
                                <Text fontWeight="semibold" color="gray.700">Email :</Text>
                                <Text color="gray.600">{user?.email}</Text>
                            </Box>

                            <Box>
                                <Text fontWeight="semibold" color="gray.700">ID :</Text>
                                <Text color="gray.600">{user?.id}</Text>
                            </Box>

                            <Box>
                                <Text fontWeight="semibold" color="gray.700">Dernière connexion :</Text>
                                <Text color="gray.600">
                                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : 'Inconnue'}
                                </Text>
                            </Box>
                        </VStack>
                    </Box>

                    {/* Session Info */}
                    <Box bg="green.50" p={6} rounded="md" border="1px" borderColor="green.200">
                        <VStack align="start" gap={2}>
                            <Heading size="sm" color="green.800">
                                ✅ Session active - Protégée par middleware
                            </Heading>
                            <Text fontSize="sm" color="green.700">
                                Cette page est automatiquement protégée par le middleware authentification.
                            </Text>
                            <Text fontSize="sm" color="green.700">
                                Vous êtes automatiquement redirigé si votre session expire.
                            </Text>
                        </VStack>
                    </Box>
                </VStack>
            </Container>
        </Flex>
    )
}