'use client'

import {
    SelectRoot,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValueText,
    Button,
    HStack,
    Text
} from '@chakra-ui/react'
import { Globe, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { changeLocale, type Locale } from '@/lib/i18n'

interface LanguageSelectorProps {
    variant?: 'select' | 'buttons'
    size?: 'sm' | 'md' | 'lg'
    showIcon?: boolean
}

export default function LanguageSelector({ 
    variant = 'select', 
    size = 'md',
    showIcon = true 
}: LanguageSelectorProps) {
    const router = useRouter()
    const { locale } = router

    const languages = [
        { 
            code: 'fr' as Locale, 
            name: 'Français', 
            flag: '🇫🇷' 
        },
        { 
            code: 'en' as Locale, 
            name: 'English', 
            flag: '🇺🇸' 
        }
    ]

    const handleLanguageChange = (newLocale: Locale) => {
        changeLocale(newLocale, router)
    }

    if (variant === 'buttons') {
        return (
            <HStack gap={2}>
                {showIcon && <Globe size={16} color="#6b7280" />}
                {languages.map((language) => (
                    <Button
                        key={language.code}
                        size={size}
                        variant={locale === language.code ? 'solid' : 'ghost'}
                        colorScheme={locale === language.code ? 'blue' : 'gray'}
                        onClick={() => handleLanguageChange(language.code)}
                        minW="60px"
                        fontSize={size === 'sm' ? 'xs' : 'sm'}
                    >
                        <HStack gap={1}>
                            <Text>{language.flag}</Text>
                            <Text>{language.code.toUpperCase()}</Text>
                            {locale === language.code && <Check size={12} />}
                        </HStack>
                    </Button>
                ))}
            </HStack>
        )
    }

    return (
        <HStack gap={2}>
            {showIcon && <Globe size={16} color="#6b7280" />}
            <SelectRoot
                value={[locale || 'fr']}
                onValueChange={(e) => handleLanguageChange(e.value[0] as Locale)}
                size={size}
            >
                <SelectTrigger minW="120px">
                    <SelectValueText>
                        {languages.find(l => l.code === locale)?.flag} {' '}
                        {languages.find(l => l.code === locale)?.name || 'Français'}
                    </SelectValueText>
                </SelectTrigger>
                <SelectContent>
                    {languages.map((language) => (
                        <SelectItem 
                            key={language.code} 
                            item={language.code}
                        >
                            <HStack gap={2}>
                                <Text>{language.flag}</Text>
                                <Text>{language.name}</Text>
                                {locale === language.code && <Check size={16} color="#3b82f6" />}
                            </HStack>
                        </SelectItem>
                    ))}
                </SelectContent>
            </SelectRoot>
        </HStack>
    )
}