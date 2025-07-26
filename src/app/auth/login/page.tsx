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
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // ✅ Correction ici !
import Link from 'next/link'
import AuthFooter from '@/components/AuthFooter'
import { useTranslation } from '@/lib/i18n'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isMounted, setIsMounted] = useState(false)

    const router = useRouter()
    const { t } = useTranslation('auth')
    const { t: tCommon } = useTranslation('common')

    // S'assurer que le composant est monté côté client
    useEffect(() => {
        setIsMounted(true)
    }, [])

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
                setSuccess(t('login.success'))
                console.log('Utilisateur connecté:', data.user)

                // Redirection vers la page d'accueil après 1 seconde
                setTimeout(() => {
                    if (isMounted) {
                        router.push('/')
                    } else {
                        // Fallback si le router n'est pas encore disponible
                        window.location.href = '/'
                    }
                }, 1000)
            } else {
                // Gestion des erreurs avec traductions
                let errorMessage = t('errors.serverError')
                if (data.error) {
                    if (data.error.includes('Email incorrect') || data.error.includes('Mot de passe incorrect')) {
                        errorMessage = t('errors.invalidCredentials')
                    } else if (data.error.includes('désactivé')) {
                        errorMessage = data.error // Garder le message original pour les cas spéciaux
                    } else {
                        errorMessage = t('errors.serverError')
                    }
                }
                setError(errorMessage)
            }
        } catch (err) {
            setError(t('errors.networkError'))
            console.error('Erreur:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const togglePassword = () => {
        setShowPassword(!showPassword)
    }

    // Afficher un loader pendant l'hydratation
    if (!isMounted) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="gray.50">
                <Text>Chargement...</Text>
            </Flex>
        )
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
                                    <Text color="blue.800">{t('login.title')}</Text>
                                </Heading>

                                {/* Alerts */}
                                {error && (
                                    <Alert.Root status="error" variant="surface">
                                        <Alert.Title>{tCommon('app.error')}</Alert.Title>
                                        <Alert.Description>{error}</Alert.Description>
                                    </Alert.Root>
                                )}

                                {success && (
                                    <Alert.Root status="success" variant="surface">
                                        <Alert.Title>{tCommon('app.success')}</Alert.Title>
                                        <Alert.Description>{success}</Alert.Description>
                                    </Alert.Root>
                                )}

                                {/* Email Field */}
                                <Box>
                                    <Field.Root required>
                                        <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                            {t('login.email')} <Field.RequiredIndicator />
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
                                            {t('login.password')} <Field.RequiredIndicator />
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
                                                {tCommon('app.loading')}
                                            </>
                                        ) : (
                                            <>
                                                {t('login.submit')}
                                                <ArrowRight />
                                            </>
                                        )}
                                    </Button>
                                </HStack>

                                {/* Password recovery */}
                                <Text textAlign="center" color="gray.600" fontSize="sm">
                                    <Link href="/auth/recovery">
                                        <Text as="span" color="blue.800" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                                            {t('login.forgotPassword')}
                                        </Text>
                                    </Link>
                                </Text>

                                {/* Sign up link */}
                                <Text textAlign="center" color="gray.600" fontSize="sm" pt={4} borderTop="1px" borderColor="gray.200">
                                    {t('login.noAccount')}{' '}
                                    <Link href="/auth/signup">
                                        <Text as="span" color="blue.800" cursor="pointer" _hover={{ textDecoration: "underline" }} fontWeight="semibold">
                                            {t('login.signUp')}
                                        </Text>
                                    </Link>
                                </Text>
                            </Stack>
                        </form>
                    </Box>

                    {/* Footer with legal links */}
                    <AuthFooter />
                </VStack>
            </Container>
        </Flex>
    )
}