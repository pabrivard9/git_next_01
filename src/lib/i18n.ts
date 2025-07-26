import { useState, useEffect } from 'react'

// Types pour les traductions
export type Locale = 'fr' | 'en'
export type TranslationKey = string

// Interface pour les traductions
interface TranslationData {
  [key: string]: string | TranslationData
}

// Cache des traductions
const translationCache: Record<string, TranslationData> = {}

// Clé pour le localStorage
const LOCALE_STORAGE_KEY = 'user-locale'

// Charger une traduction
export async function loadTranslation(locale: Locale, namespace: string): Promise<TranslationData> {
  const cacheKey = `${locale}-${namespace}`
  
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey]
  }

  try {
    const translation = await import(`@/locales/${locale}/${namespace}.json`)
    translationCache[cacheKey] = translation.default
    return translation.default
  } catch (error) {
    console.error(`Failed to load translation: ${locale}/${namespace}`, error)
    return {}
  }
}

// Obtenir la locale depuis le localStorage ou défaut
function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'fr'
  
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && ['fr', 'en'].includes(stored)) {
      return stored as Locale
    }
  } catch (error) {
    console.warn('Error reading locale from localStorage:', error)
  }
  
  return detectBrowserLocale()
}

// Sauvegarder la locale dans le localStorage
function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch (error) {
    console.warn('Error saving locale to localStorage:', error)
  }
}

// Hook pour les traductions
export function useTranslation(namespace: string = 'common') {
  const [locale, setLocale] = useState<Locale>('fr')
  const [translations, setTranslations] = useState<TranslationData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Protection d'hydratation
  useEffect(() => {
    setIsMounted(true)
    const initialLocale = getStoredLocale()
    setLocale(initialLocale)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const loadTranslations = async () => {
      setIsLoading(true)
      const translation = await loadTranslation(locale, namespace)
      setTranslations(translation)
      setIsLoading(false)
    }

    loadTranslations()
  }, [locale, namespace, isMounted])

  // Fonction de traduction
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    // Si pas encore monté, retourner la clé pour éviter les erreurs d'hydratation
    if (!isMounted) {
      return key
    }

    const keys = key.split('.')
    let value: string | TranslationData = translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key} in ${namespace}`)
        return key
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`)
      return key
    }

    // Remplacer les paramètres {{param}}
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param]?.toString() || match
      })
    }

    return value
  }

  // Fonction pour changer la locale
  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    setStoredLocale(newLocale)
    // Optionnel : recharger la page pour appliquer la nouvelle langue
    // window.location.reload()
  }

  return {
    t,
    locale,
    isLoading,
    translations,
    changeLocale,
    isMounted
  }
}

// Fonction utilitaire pour changer de langue (version legacy pour compatibilité)
export function changeLocale(locale: Locale): void {
  setStoredLocale(locale)
  // Dans l'App Router, on recharge simplement la page
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

// Détection de la langue du navigateur
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'fr'
  
  const browserLocale = navigator.language.split('-')[0]
  return ['fr', 'en'].includes(browserLocale) ? browserLocale as Locale : 'fr'
}

// Formatage des dates selon la locale
export function formatDate(date: Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', defaultOptions).format(date)
}

// Formatage des nombres selon la locale
export function formatNumber(number: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', options).format(number)
}

// Hook simple pour obtenir juste la locale courante
export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>('fr')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setLocale(getStoredLocale())
  }, [])

  return isMounted ? locale : 'fr'
}