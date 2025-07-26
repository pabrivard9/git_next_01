'use client'

import { Text, HStack, Box, VStack } from '@chakra-ui/react'
import LegalDrawer from './LegalDrawer'
import LanguageSelector from './LanguageSelector'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'

export default function AuthFooter() {
    const { t } = useTranslation('common')

    return (
        <Box w="full" pt={8} pb={4}>
            {/* Language Selector */}
            <VStack gap={4} mb={6}>
                <LanguageSelector variant="buttons" size="sm" />
            </VStack>
            
            <HStack 
                justify="center" 
                gap={6} 
                wrap="wrap"
                fontSize="sm"
            >
                <LegalDrawer 
                    type="mentions"
                    trigger={
                        <Text 
                            color="gray.600" 
                            cursor="pointer" 
                            _hover={{ 
                                color: "blue.800", 
                                textDecoration: "underline" 
                            }}
                            transition="all 0.2s"
                        >
                            {t('footer.legalNotice')}
                        </Text>
                    }
                />

                <Text color="gray.400">|</Text>

                <LegalDrawer 
                    type="conditions"
                    trigger={
                        <Text 
                            color="gray.600" 
                            cursor="pointer" 
                            _hover={{ 
                                color: "blue.800", 
                                textDecoration: "underline" 
                            }}
                            transition="all 0.2s"
                        >
                            {t('footer.terms')}
                        </Text>
                    }
                />

                <Text color="gray.400">|</Text>

                <LegalDrawer 
                    type="confidentialite"
                    trigger={
                        <Text 
                            color="gray.600" 
                            cursor="pointer" 
                            _hover={{ 
                                color: "blue.800", 
                                textDecoration: "underline" 
                            }}
                            transition="all 0.2s"
                        >
                            {t('footer.privacy')}
                        </Text>
                    }
                />
            </HStack>

            <Text 
                textAlign="center" 
                color="gray.500" 
                fontSize="xs" 
                mt={4}
            >
                © {new Date().getFullYear()} {t('app.name')}. {t('footer.copyright')}.
            </Text>
        </Box>
    )
}