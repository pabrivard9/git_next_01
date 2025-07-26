'use client'

import {
    Field,
    Box,
    Button,
    Container,
    Flex,
    Input,
    Stack,
    Text,
    Heading,
    VStack,
    HStack,
    Alert
} from '@chakra-ui/react'
import { Eye, EyeOff, ArrowRight, FileCode, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess('Connexion réussie ! Redirection...')
                console.log('Utilisateur connecté:', data.user)

                // TODO: Stocker les données de session ici
                // localStorage.setItem('user', JSON.stringify(data.user))

                // Redirection vers la page d'accueil après 1 seconde
                setTimeout(() => {
                    router.push('/')
                }, 1000)
            } else {
                setError(data.error || 'Erreur de connexion')
            }
        } catch (err) {
            setError('Erreur de connexion au serveur')
            console.error('Erreur:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const togglePassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <Flex minH="100vh" align="center" justify="center" bg="gray.50">
            <Container maxW="md" py={12}>
                <VStack gap={12}>
                    {/* Header */}
                    <VStack textAlign="center">
                        <Heading>
                            <FileCode size={64} color="#1a3478" />
                        </Heading>
                    </VStack>

                    {/* Form */}
                    <Box
                        w="full"
                        bg="white"
                        rounded="md"
                        boxShadow="sm"
                        p={6}
                        mb={10}
                        border="1px"
                        borderColor="gray.200"
                    >
                        <form onSubmit={handleLogin}>
                            <Stack gap={6}>
                                {/* Title */}
                                <Heading size="2xl" fontFamily="Inter" fontWeight="bold" textAlign="center" mb={2}>
                                    <Text color="blue.800">Se connecter</Text>
                                </Heading>

                                {/* Alerts */}
                                {error && (
                                    <Alert.Root status="error" variant="surface">
                                        <Alert.Title>Erreur</Alert.Title>
                                        <Alert.Description>{error}</Alert.Description>
                                    </Alert.Root>
                                )}

                                {success && (
                                    <Alert.Root status="success" variant="surface">
                                        <Alert.Title>Succès</Alert.Title>
                                        <Alert.Description>{success}</Alert.Description>
                                    </Alert.Root>
                                )}

                                {/* Email Field */}
                                <Box>
                                    <Field.Root required>
                                        <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                            Email <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder=""
                                            size="lg"
                                            variant="subtle"
                                            required
                                            disabled={isLoading}
                                            css={{ "--focus-color": "white" }}
                                        />
                                    </Field.Root>
                                </Box>

                                {/* Password Field */}
                                <Box position="relative">
                                    <Field.Root required>
                                        <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                            Mot de passe <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder=""
                                            size="lg"
                                            variant="subtle"
                                            pr="3rem"
                                            required
                                            disabled={isLoading}
                                            css={{ "--focus-color": "white" }}
                                        />
                                        <Button
                                            position="absolute"
                                            right={2}
                                            top="72%"
                                            transform="translateY(-50%)"
                                            variant="ghost"
                                            size="sm"
                                            onClick={togglePassword}
                                            p={1}
                                            minW="auto"
                                            h="auto"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </Button>
                                    </Field.Root>
                                </Box>

                                {/* Login Button */}
                                <HStack>
                                    <Button
                                        type="submit"
                                        rounded="s"
                                        backgroundColor="blue.800"
                                        color="white"
                                        variant="subtle"
                                        size="lg"
                                        colorScheme="blue"
                                        w="full"
                                        mt={4}
                                        disabled={isLoading}
                                        loading={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                Connexion...
                                            </>
                                        ) : (
                                            <>
                                                Se connecter
                                                <ArrowRight />
                                            </>
                                        )}
                                    </Button>
                                </HStack>

                                {/* Password recovery */}
                                <Text textAlign="center" color="gray.600" fontSize="sm">
                                    <Text as="span" color="blue.800" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                                        Mot de passe oublié ?
                                    </Text>
                                </Text>
                            </Stack>
                        </form>
                    </Box>
                </VStack>
            </Container>
        </Flex>
    )
}