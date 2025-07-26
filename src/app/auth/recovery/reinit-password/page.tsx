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
import { Eye, EyeOff, ArrowRight, FileCode, Loader2, CheckCircle } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ReinitPasswordContent() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [token, setToken] = useState('')

    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const tokenParam = searchParams.get('token')
        if (tokenParam) {
            setToken(tokenParam)
        } else {
            // Si pas de token dans l'URL, rediriger vers recovery
            router.push('/auth/recovery')
        }
    }, [searchParams, router])

    // Validation du mot de passe
    const validatePassword = (password: string) => {
        const minLength = password.length >= 12
        const hasLetter = /[a-zA-Z]/.test(password)
        const hasNumber = /\d/.test(password)
        
        return {
            isValid: minLength && hasLetter && hasNumber,
            errors: [
                !minLength && 'Au moins 12 caractères',
                !hasLetter && 'Au moins 1 lettre',
                !hasNumber && 'Au moins 1 chiffre'
            ].filter(Boolean)
        }
    }

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // Validation du nouveau mot de passe
        const passwordValidation = validatePassword(newPassword)
        if (!passwordValidation.isValid) {
            setError(`Le mot de passe ne respecte pas les conditions : ${passwordValidation.errors.join(', ')}`)
            return
        }

        // Vérification de la confirmation
        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne sont pas identiques')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/recovery/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    token, 
                    newPassword 
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess('Mot de passe modifié avec succès ! Connexion automatique...')
                
                // Redirection vers la page d'accueil après 2 secondes
                setTimeout(() => {
                    router.push('/')
                }, 2000)
            } else {
                setError(data.error || 'Erreur lors de la réinitialisation du mot de passe')
            }
        } catch (err) {
            setError('Erreur de connexion au serveur')
            console.error('Erreur:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const passwordValidation = validatePassword(newPassword)

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
                        <form onSubmit={handlePasswordReset}>
                            <Stack gap={6}>
                                {/* Title */}
                                <Heading size="2xl" fontFamily="Inter" fontWeight="bold" textAlign="center" mb={2}>
                                    <Text color="blue.800">Nouveau mot de passe</Text>
                                </Heading>

                                {/* Password Requirements */}
                                <Box bg="blue.50" p={4} rounded="md" border="1px" borderColor="blue.200">
                                    <Text fontSize="sm" fontWeight="semibold" color="blue.800" mb={2}>
                                        Critères requis pour le mot de passe :
                                    </Text>
                                    <VStack align="start" gap={1}>
                                        <Text fontSize="sm" color="blue.700" display="flex" alignItems="center" gap={2}>
                                            {newPassword.length >= 12 ? <CheckCircle size={16} color="green" /> : '•'} 
                                            Au moins 12 caractères
                                        </Text>
                                        <Text fontSize="sm" color="blue.700" display="flex" alignItems="center" gap={2}>
                                            {/[a-zA-Z]/.test(newPassword) ? <CheckCircle size={16} color="green" /> : '•'} 
                                            Au moins 1 lettre
                                        </Text>
                                        <Text fontSize="sm" color="blue.700" display="flex" alignItems="center" gap={2}>
                                            {/\d/.test(newPassword) ? <CheckCircle size={16} color="green" /> : '•'} 
                                            Au moins 1 chiffre
                                        </Text>
                                        <Text fontSize="sm" color="blue.700" display="flex" alignItems="center" gap={2}>
                                            • Ne doit pas être identique au précédent
                                        </Text>
                                    </VStack>
                                </Box>

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

                                {/* New Password Field */}
                                <Box position="relative">
                                    <Field.Root required>
                                        <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                            Nouveau mot de passe <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
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
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            p={1}
                                            minW="auto"
                                            h="auto"
                                            disabled={isLoading}
                                        >
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </Button>
                                    </Field.Root>
                                </Box>

                                {/* Confirm Password Field */}
                                <Box position="relative">
                                    <Field.Root required>
                                        <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                            Confirmation du mot de passe <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            p={1}
                                            minW="auto"
                                            h="auto"
                                            disabled={isLoading}
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </Button>
                                    </Field.Root>
                                </Box>

                                {/* Submit Button */}
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
                                        disabled={isLoading || !passwordValidation.isValid || newPassword !== confirmPassword}
                                        loading={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                Modification...
                                            </>
                                        ) : (
                                            <>
                                                Valider
                                                <ArrowRight />
                                            </>
                                        )}
                                    </Button>
                                </HStack>
                            </Stack>
                        </form>
                    </Box>
                </VStack>
            </Container>
        </Flex>
    )
}

export default function ReinitPasswordPage() {
    return (
        <Suspense fallback={
            <Flex minH="100vh" align="center" justify="center" bg="gray.50">
                <Text>Chargement...</Text>
            </Flex>
        }>
            <ReinitPasswordContent />
        </Suspense>
    )
}