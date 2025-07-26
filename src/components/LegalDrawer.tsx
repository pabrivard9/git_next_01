'use client'

import {
    DrawerRoot,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    DrawerCloseTrigger,
    DrawerTitle,
    DrawerBackdrop,
    Button,
    Text,
    VStack,
    Box
} from '@chakra-ui/react'
import { X } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export type LegalType = 'mentions' | 'conditions' | 'confidentialite'

interface LegalDrawerProps {
    type: LegalType
    trigger: React.ReactNode
}

export default function LegalDrawer({ type, trigger }: LegalDrawerProps) {
    const { t } = useTranslation('legal')
    const { t: tCommon } = useTranslation('common')

    // Mapping des types vers les clés de traduction
    const contentMap = {
        mentions: 'legalNotice',
        conditions: 'terms',
        confidentialite: 'privacy'
    }

    const contentKey = contentMap[type]

    return (
        <DrawerRoot placement="end" size="md">
            <DrawerTrigger asChild>
                {trigger}
            </DrawerTrigger>

            <DrawerBackdrop />
            
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle fontSize="xl" fontWeight="bold" color="blue.800">
                        {t(`${contentKey}.title`)}
                    </DrawerTitle>
                    <DrawerCloseTrigger 
                        position="absolute"
                        top={4}
                        right={4}
                        p={2}
                    >
                        <X size={20} />
                    </DrawerCloseTrigger>
                </DrawerHeader>

                <DrawerBody>
                    <VStack align="start" gap={4}>
                        <Box>
                            <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={3}>
                                {t(`${contentKey}.title`)}
                            </Text>
                            <Text color="gray.600" lineHeight="1.6">
                                {t(`${contentKey}.content`)}
                            </Text>
                        </Box>

                        {/* Placeholder pour contenu futur */}
                        <Box bg="gray.50" p={4} rounded="md" w="full">
                            <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                {t('placeholder')}
                            </Text>
                        </Box>

                        {/* Sections spécifiques selon le type */}
                        <VStack align="start" gap={3} w="full">
                            <Text fontWeight="semibold" color="gray.800">
                                Sections à inclure :
                            </Text>
                            {Object.keys(t(`${contentKey}.sections`, { returnObjects: true }) || {}).map((sectionKey) => (
                                <Text key={sectionKey} fontSize="sm" color="gray.600">
                                    • {t(`${contentKey}.sections.${sectionKey}`)}
                                </Text>
                            ))}
                        </VStack>
                    </VStack>
                </DrawerBody>

                <DrawerFooter>
                    <Button 
                        variant="outline" 
                        w="full"
                        onClick={() => {}}
                    >
                        {tCommon('app.close')}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </DrawerRoot>
    )
}