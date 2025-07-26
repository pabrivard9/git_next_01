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
import { ArrowRight, FileCode, Loader2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RecoveryPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const router = useRouter()

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch('/api/auth/recovery/send-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess('Un code PIN a été envoyé à votre adresse email.')
                
                // Redirection vers la page PIN après 2 secondes
                setTimeout(() => {
                    router.push(`/auth/recovery/pin?email=${encodeURIComponent(email)}`)
                }, 2000)
            } else {
                setError(data.error || 'Erreur lors de l\'envoi du code PIN')
            }
        } catch (err) {
            setError('Erreur de connexion au serveur')
            console.error('Erreur:', err)
        } finally {
            setIsLoading(false)
        }
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
                        <form onSubmit={handleRecovery}>
                            <Stack gap={6}>
                                {/* Title */}
                                <Heading size="2xl" fontFamily="Inter" fontWeight="bold" textAlign="center" mb={2}>
                                    <Text color="blue.800">Mot de passe oublié</Text>
                                </Heading>

                                <Text textAlign="center" color="gray.600" fontSize="sm" mb={4}>
                                    Saisissez votre adresse email pour recevoir un code de récupération
                                </Text>

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
                                        disabled={isLoading}
                                        loading={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                Envoyer le code PIN
                                                <ArrowRight />
                                            </>
                                        )}
                                    </Button>
                                </HStack>

                                {/* Back to login */}
                                <Text textAlign="center" color="gray.600" fontSize="sm">
                                    <Link href="/auth/login">
                                        <Text as="span" color="blue.800" cursor="pointer" _hover={{ textDecoration: "underline" }} display="flex" alignItems="center" justifyContent="center" gap={1}>
                                            <ArrowLeft size={16} />
                                            Retour à la connexion
                                        </Text>
                                    </Link>
                                </Text>
                            </Stack>
                        </form>
                    </Box>
                </VStack>
            </Container>
        </Flex>
    )
}