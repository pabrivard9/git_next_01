'use client'

import {
    Box,
    Button,
    Container,
    Flex,
    Stack,
    Text,
    Heading,
    VStack,
    HStack,
    Alert,
    Input
} from '@chakra-ui/react'
import { ArrowRight, FileCode, Loader2, ArrowLeft } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PinPageContent() {
    const [pin, setPin] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [email, setEmail] = useState('')

    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const emailParam = searchParams.get('email')
        if (emailParam) {
            setEmail(emailParam)
        } else {
            // Si pas d'email dans l'URL, rediriger vers recovery
            router.push('/auth/recovery')
        }
    }, [searchParams, router])

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (pin.length !== 6) {
            setError('Le code PIN doit contenir 6 chiffres')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/recovery/verify-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, pin }),
            })

            const data = await response.json()

            if (response.ok) {
                // Redirection vers la page de réinitialisation
                router.push(`/auth/recovery/reinit-password?token=${data.token}`)
            } else {
                setError(data.error || 'Code PIN invalide')
                setPin('') // Reset PIN on error
            }
        } catch (err) {
            setError('Erreur de connexion au serveur')
            console.error('Erreur:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const resendPin = async () => {
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/recovery/send-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            if (response.ok) {
                setError('')
                alert('Un nouveau code PIN a été envoyé à votre adresse email.')
            } else {
                setError('Erreur lors du renvoi du code PIN')
            }
        } catch (err) {
            setError('Erreur de connexion au serveur')
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
                        <form onSubmit={handlePinSubmit}>
                            <Stack gap={6}>
                                {/* Title */}
                                <Heading size="2xl" fontFamily="Inter" fontWeight="bold" textAlign="center" mb={2}>
                                    <Text color="blue.800">Code de vérification</Text>
                                </Heading>

                                <Text textAlign="center" color="gray.600" fontSize="sm" mb={4}>
                                    Saisissez le code PIN à 6 chiffres envoyé à :<br />
                                    <Text as="span" fontWeight="semibold" color="blue.800">{email}</Text>
                                </Text>

                                {/* Alerts */}
                                {error && (
                                    <Alert.Root status="error" variant="surface">
                                        <Alert.Title>Erreur</Alert.Title>
                                        <Alert.Description>{error}</Alert.Description>
                                    </Alert.Root>
                                )}

                                {/* PIN Input */}
                                <Box textAlign="center">
                                    <HStack gap={2} justify="center">
                                        <Input
                                            type="text"
                                            maxLength={1}
                                            w="3rem"
                                            h="3rem"
                                            textAlign="center"
                                            fontSize="xl"
                                            fontWeight="bold"
                                            value={pin[0] || ''}
                                            onChange={(e) => {
                                                const newPin = pin.split('')
                                                newPin[0] = e.target.value.replace(/[^0-9]/g, '')
                                                setPin(newPin.join(''))
                                                if (e.target.value && e.target.nextElementSibling) {
                                                    (e.target.nextElementSibling as HTMLInputElement).focus()
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !pin[0] && e.target.previousElementSibling) {
                                                    (e.target.previousElementSibling as HTMLInputElement).focus()
                                                }
                                            }}
                                            disabled={isLoading}
                                        />
                                        <Input
                                            type="text"
                                            maxLength={1}
                                            w="3rem"
                                            h="3rem"
                                            textAlign="center"
                                            fontSize="xl"
                                            fontWeight="bold"
                                            value={pin[1] || ''}
                                            onChange={(e) => {
                                                const newPin = pin.split('')
                                                newPin[1] = e.target.value.replace(/[^0-9]/g, '')
                                                setPin(newPin.join(''))
                                                if (e.target.value && e.target.nextElementSibling) {
                                                    (e.target.nextElementSibling as HTMLInputElement).focus()
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !pin[1] && e.target.previousElementSibling) {
                                                    (e.target.previousElementSibling as HTMLInputElement).focus()
                                                }
                                            }}
                                            disabled={isLoading}
                                        />
                                        <Input
                                            type="text"
                                            maxLength={1}
                                            w="3rem"
                                            h="3rem"
                                            textAlign="center"
                                            fontSize="xl"
                                            fontWeight="bold"
                                            value={pin[2] || ''}
                                            onChange={(e) => {
                                                const newPin = pin.split('')
                                                newPin[2] = e.target.value.replace(/[^0-9]/g, '')
                                                setPin(newPin.join(''))
                                                if (e.target.value && e.target.nextElementSibling) {
                                                    (e.target.nextElementSibling as HTMLInputElement).focus()
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !pin[2] && e.target.previousElementSibling) {
                                                    (e.target.previousElementSibling as HTMLInputElement).focus()
                                                }
                                            }}
                                            disabled={isLoading}
                                        />
                                        <Input
                                            type="text"
                                            maxLength={1}
                                            w="3rem"
                                            h="3rem"
                                            textAlign="center"
                                            fontSize="xl"
                                            fontWeight="bold"
                                            value={pin[3] || ''}
                                            onChange={(e) => {
                                                const newPin = pin.split('')
                                                newPin[3] = e.target.value.replace(/[^0-9]/g, '')
                                                setPin(newPin.join(''))
                                                if (e.target.value && e.target.nextElementSibling) {
                                                    (e.target.nextElementSibling as HTMLInputElement).focus()
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !pin[3] && e.target.previousElementSibling) {
                                                    (e.target.previousElementSibling as HTMLInputElement).focus()
                                                }
                                            }}
                                            disabled={isLoading}
                                        />
                                        <Input
                                            type="text"
                                            maxLength={1}
                                            w="3rem"
                                            h="3rem"
                                            textAlign="center"
                                            fontSize="xl"
                                            fontWeight="bold"
                                            value={pin[4] || ''}
                                            onChange={(e) => {
                                                const newPin = pin.split('')
                                                newPin[4] = e.target.value.replace(/[^0-9]/g, '')
                                                setPin(newPin.join(''))
                                                if (e.target.value && e.target.nextElementSibling) {
                                                    (e.target.nextElementSibling as HTMLInputElement).focus()
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !pin[4] && e.target.previousElementSibling) {
                                                    (e.target.previousElementSibling as HTMLInputElement).focus()
                                                }
                                            }}
                                            disabled={isLoading}
                                        />
                                        <Input
                                            type="text"
                                            maxLength={1}
                                            w="3rem"
                                            h="3rem"
                                            textAlign="center"
                                            fontSize="xl"
                                            fontWeight="bold"
                                            value={pin[5] || ''}
                                            onChange={(e) => {
                                                const newPin = pin.split('')
                                                newPin[5] = e.target.value.replace(/[^0-9]/g, '')
                                                setPin(newPin.join(''))
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !pin[5] && e.target.previousElementSibling) {
                                                    (e.target.previousElementSibling as HTMLInputElement).focus()
                                                }
                                            }}
                                            disabled={isLoading}
                                        />
                                    </HStack>
                                    <Text fontSize="sm" color="gray.600" mt={2}>
                                        Code PIN à 6 chiffres
                                    </Text>
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
                                        disabled={isLoading || pin.length !== 6}
                                        loading={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                Vérification...
                                            </>
                                        ) : (
                                            <>
                                                Valider
                                                <ArrowRight />
                                            </>
                                        )}
                                    </Button>
                                </HStack>

                                {/* Resend PIN */}
                                <Text textAlign="center" color="gray.600" fontSize="sm">
                                    Code non reçu ?{' '}
                                    <Text 
                                        as="span" 
                                        color="blue.800" 
                                        cursor="pointer" 
                                        _hover={{ textDecoration: "underline" }}
                                        onClick={resendPin}
                                    >
                                        Renvoyer
                                    </Text>
                                </Text>

                                {/* Back to recovery */}
                                <Text textAlign="center" color="gray.600" fontSize="sm">
                                    <Link href="/auth/recovery">
                                        <Text as="span" color="blue.800" cursor="pointer" _hover={{ textDecoration: "underline" }} display="flex" alignItems="center" justifyContent="center" gap={1}>
                                            <ArrowLeft size={16} />
                                            Retour
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

export default function PinPage() {
    return (
        <Suspense fallback={
            <Flex minH="100vh" align="center" justify="center" bg="gray.50">
                <Text>Chargement...</Text>
            </Flex>
        }>
            <PinPageContent />
        </Suspense>
    )
}