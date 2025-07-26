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
    Alert,
    RadioGroup,
    SelectRoot,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValueText,
    SimpleGrid
} from '@chakra-ui/react'
import { Eye, EyeOff, ArrowRight, FileCode, Loader2, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthFooter from '@/components/AuthFooter'
import { useTranslation } from '@/lib/i18n'

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        gender: 'neutre',
        lastname: '',
        firstname: '',
        email: '',
        phone: '',
        phoneCountry: '+33',
        mobile: '',
        mobileCountry: '+33',
        language: 'fr',
        password: '',
        confirmPassword: ''
    })
    
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const router = useRouter()
    const { t } = useTranslation('auth')
    const { t: tCommon } = useTranslation('common')

    // Validation du mot de passe
    const validatePassword = (password: string) => {
        const minLength = password.length >= 12
        const hasLetter = /[a-zA-Z]/.test(password)
        const hasNumber = /\d/.test(password)
        
        return {
            isValid: minLength && hasLetter && hasNumber,
            errors: [
                !minLength && t('signup.passwordRequirements.minLength'),
                !hasLetter && t('signup.passwordRequirements.hasLetter'),
                !hasNumber && t('signup.passwordRequirements.hasNumber')
            ].filter(Boolean)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccess('')

        // Validation des champs requis
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError(t('errors.serverError')) // Utiliser une traduction générique
            setIsLoading(false)
            return
        }

        // Validation du mot de passe
        const passwordValidation = validatePassword(formData.password)
        if (!passwordValidation.isValid) {
            setError(`${t('errors.weakPassword')} : ${passwordValidation.errors.join(', ')}`)
            setIsLoading(false)
            return
        }

        // Vérification de la confirmation
        if (formData.password !== formData.confirmPassword) {
            setError(t('errors.passwordMismatch'))
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(t('signup.success'))
                
                // Redirection vers la page d'accueil après 2 secondes
                setTimeout(() => {
                    router.push('/')
                }, 2000)
            } else {
                // Gestion des erreurs avec traductions
                let errorMessage = t('errors.serverError')
                if (data.error) {
                    if (data.error.includes('existe déjà') || data.error.includes('already exists')) {
                        errorMessage = t('errors.emailExists')
                    } else if (data.error.includes('conditions') || data.error.includes('requirements')) {
                        errorMessage = t('errors.weakPassword')
                    } else if (data.error.includes('identiques') || data.error.includes('match')) {
                        errorMessage = t('errors.passwordMismatch')
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

    const passwordValidation = validatePassword(formData.password)

    const countryOptions = [
        { value: '+33', label: '+33 (France)' },
        { value: '+32', label: '+32 (Belgique)' },
        { value: '+41', label: '+41 (Suisse)' },
        { value: '+1', label: '+1 (USA/Canada)' },
        { value: '+44', label: '+44 (Royaume-Uni)' },
        { value: '+49', label: '+49 (Allemagne)' },
        { value: '+39', label: '+39 (Italie)' },
        { value: '+34', label: '+34 (Espagne)' },
    ]

    return (
        <Flex minH="100vh" align="center" justify="center" bg="gray.50" py={8}>
            <Container maxW="2xl" py={12}>
                <VStack gap={8}>
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
                        p={8}
                        border="1px"
                        borderColor="gray.200"
                    >
                        <form onSubmit={handleSignUp}>
                            <Stack gap={6}>
                                {/* Title */}
                                <Heading size="2xl" fontFamily="Inter" fontWeight="bold" textAlign="center" mb={4}>
                                    <Text color="blue.800">{t('signup.title')}</Text>
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

                                {/* Gender Field */}
                                <Box>
                                    <Field.Root>
                                        <Field.Label mb={2} fontFamily="Inter" textStyle="md" color="gray.700">
                                            {t('signup.gender')}
                                        </Field.Label>
                                        <RadioGroup.Root
                                            value={formData.gender}
                                            onValueChange={(value) => handleInputChange('gender', value)}
                                        >
                                            <HStack gap={6}>
                                                <RadioGroup.Item value="homme">
                                                    <RadioGroup.ItemControl />
                                                    <RadioGroup.ItemText>{t('signup.genderOptions.male')}</RadioGroup.ItemText>
                                                </RadioGroup.Item>
                                                <RadioGroup.Item value="femme">
                                                    <RadioGroup.ItemControl />
                                                    <RadioGroup.ItemText>{t('signup.genderOptions.female')}</RadioGroup.ItemText>
                                                </RadioGroup.Item>
                                                <RadioGroup.Item value="neutre">
                                                    <RadioGroup.ItemControl />
                                                    <RadioGroup.ItemText>{t('signup.genderOptions.neutral')}</RadioGroup.ItemText>
                                                </RadioGroup.Item>
                                            </HStack>
                                        </RadioGroup.Root>
                                    </Field.Root>
                                </Box>

                                {/* Name Fields */}
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                    <Box>
                                        <Field.Root>
                                            <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                                {t('signup.lastName')}
                                            </Field.Label>
                                            <Input
                                                type="text"
                                                value={formData.lastname}
                                                onChange={(e) => handleInputChange('lastname', e.target.value)}
                                                placeholder=""
                                                size="lg"
                                                variant="subtle"
                                                disabled={isLoading}
                                            />
                                        </Field.Root>
                                    </Box>

                                    <Box>
                                        <Field.Root>
                                            <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                                {t('signup.firstName')}
                                            </Field.Label>
                                            <Input
                                                type="text"
                                                value={formData.firstname}
                                                onChange={(e) => handleInputChange('firstname', e.target.value)}
                                                placeholder=""
                                                size="lg"
                                                variant="subtle"
                                                disabled={isLoading}
                                            />
                                        </Field.Root>
                                    </Box>
                                </SimpleGrid>

                                {/* Email Field */}
                                <Box>
                                    <Field.Root required>
                                        <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                            {t('signup.email')} <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder=""
                                            size="lg"
                                            variant="subtle"
                                            required
                                            disabled={isLoading}
                                        />
                                    </Field.Root>
                                </Box>

                                {/* Phone Fields */}
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                    <Box>
                                        <Field.Root>
                                            <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                                {t('signup.phone')}
                                            </Field.Label>
                                            <HStack gap={2}>
                                                <SelectRoot
                                                    value={[formData.phoneCountry]}
                                                    onValueChange={(e) => handleInputChange('phoneCountry', e.value[0])}
                                                    size="lg"
                                                    disabled={isLoading}
                                                >
                                                    <SelectTrigger w="120px">
                                                        <SelectValueText />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {countryOptions.map((country) => (
                                                            <SelectItem key={country.value} item={country.value}>
                                                                {country.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </SelectRoot>
                                                <Input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    placeholder=""
                                                    size="lg"
                                                    variant="subtle"
                                                    disabled={isLoading}
                                                />
                                            </HStack>
                                        </Field.Root>
                                    </Box>

                                    <Box>
                                        <Field.Root>
                                            <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                                {t('signup.mobile')}
                                            </Field.Label>
                                            <HStack gap={2}>
                                                <SelectRoot
                                                    value={[formData.mobileCountry]}
                                                    onValueChange={(e) => handleInputChange('mobileCountry', e.value[0])}
                                                    size="lg"
                                                    disabled={isLoading}
                                                >
                                                    <SelectTrigger w="120px">
                                                        <SelectValueText />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {countryOptions.map((country) => (
                                                            <SelectItem key={country.value} item={country.value}>
                                                                {country.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </SelectRoot>
                                                <Input
                                                    type="tel"
                                                    value={formData.mobile}
                                                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                                                    placeholder=""
                                                    size="lg"
                                                    variant="subtle"
                                                    disabled={isLoading}
                                                />
                                            </HStack>
                                        </Field.Root>
                                    </Box>
                                </SimpleGrid>

                                {/* Language Field */}
                                <Box>
                                    <Field.Root>
                                        <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                            {t('signup.language')}
                                        </Field.Label>
                                        <SelectRoot
                                            value={[formData.language]}
                                            onValueChange={(e) => handleInputChange('language', e.value[0])}
                                            size="lg"
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValueText />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem item="fr">{t('signup.languages.fr')}</SelectItem>
                                                <SelectItem item="en">{t('signup.languages.en')}</SelectItem>
                                            </SelectContent>
                                        </SelectRoot>
                                    </Field.Root>
                                </Box>

                                {/* Password Requirements */}
                                <Box bg="blue.50" p={4} rounded="md" border="1px" borderColor="blue.200">
                                    <Text fontSize="sm" fontWeight="semibold" color="blue.800" mb={2}>
                                        {t('signup.passwordRequirements.title')}
                                    </Text>
                                    <VStack align="start" gap={1}>
                                        <Text fontSize="sm" color="blue.700" display="flex" alignItems="center" gap={2}>
                                            {formData.password.length >= 12 ? <CheckCircle size={16} color="green" /> : '•'} 
                                            {t('signup.passwordRequirements.minLength')}
                                        </Text>
                                        <Text fontSize="sm" color="blue.700" display="flex" alignItems="center" gap={2}>
                                            {/[a-zA-Z]/.test(formData.password) ? <CheckCircle size={16} color="green" /> : '•'} 
                                            {t('signup.passwordRequirements.hasLetter')}
                                        </Text>
                                        <Text fontSize="sm" color="blue.700" display="flex" alignItems="center" gap={2}>
                                            {/\d/.test(formData.password) ? <CheckCircle size={16} color="green" /> : '•'} 
                                            {t('signup.passwordRequirements.hasNumber')}
                                        </Text>
                                    </VStack>
                                </Box>

                                {/* Password Fields */}
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                    <Box position="relative">
                                        <Field.Root required>
                                            <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                                {t('signup.password')} <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                placeholder=""
                                                size="lg"
                                                variant="subtle"
                                                pr="3rem"
                                                required
                                                disabled={isLoading}
                                            />
                                            <Button
                                                position="absolute"
                                                right={2}
                                                top="72%"
                                                transform="translateY(-50%)"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowPassword(!showPassword)}
                                                p={1}
                                                minW="auto"
                                                h="auto"
                                                disabled={isLoading}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </Button>
                                        </Field.Root>
                                    </Box>

                                    <Box position="relative">
                                        <Field.Root required>
                                            <Field.Label mb={0} fontFamily="Inter" textStyle="md" color="gray.700">
                                                {t('signup.confirmPassword')} <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                placeholder=""
                                                size="lg"
                                                variant="subtle"
                                                pr="3rem"
                                                required
                                                disabled={isLoading}
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
                                </SimpleGrid>

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
                                        disabled={isLoading || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
                                        loading={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                {tCommon('app.loading')}
                                            </>
                                        ) : (
                                            <>
                                                {t('signup.submit')}
                                                <ArrowRight />
                                            </>
                                        )}
                                    </Button>
                                </HStack>

                                {/* Back to login */}
                                <Text textAlign="center" color="gray.600" fontSize="sm" pt={4} borderTop="1px" borderColor="gray.200">
                                    {t('signup.hasAccount')}{' '}
                                    <Link href="/auth/login">
                                        <Text as="span" color="blue.800" cursor="pointer" _hover={{ textDecoration: "underline" }} fontWeight="semibold">
                                            {t('signup.signIn')}
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