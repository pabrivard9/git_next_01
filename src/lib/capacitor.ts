import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard, KeyboardResize } from '@capacitor/keyboard'
import { App } from '@capacitor/app'

// Initialisation des plugins Capacitor
export const initializeCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    console.log('🚀 Initializing Capacitor for platform:', Capacitor.getPlatform())
    
    try {
      // Configuration de la barre de statut
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#1e3a8a' })
      
      // Configuration du clavier
      await Keyboard.setResizeMode({ mode: KeyboardResize.Body })
      
      // Gestion des événements clavier
      Keyboard.addListener('keyboardWillShow', (info) => {
        console.log('Keyboard will show:', info.keyboardHeight)
        document.body.style.paddingBottom = `${info.keyboardHeight}px`
      })
      
      Keyboard.addListener('keyboardWillHide', () => {
        console.log('Keyboard will hide')
        document.body.style.paddingBottom = '0px'
      })
      
      // Gestion du bouton retour Android
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp()
        } else {
          window.history.back()
        }
      })
      
      // Gestion de l'état de l'app
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive)
      })
      
      // Gestion des URLs externes
      App.addListener('appUrlOpen', (event) => {
        console.log('App opened with URL:', event.url)
        // Gérer l'ouverture depuis un lien externe
      })
      
    } catch (error) {
      console.error('Error initializing Capacitor:', error)
    }
  } else {
    console.log('🌐 Running in web browser')
  }
}

// Utilitaires Capacitor
export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform()
}

export const getPlatform = (): string => {
  return Capacitor.getPlatform()
}

export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android'
}

export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios'
}

export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web'
}

// Gestion sécurisée du clavier
export const hideKeyboard = async (): Promise<void> => {
  if (isNativeApp()) {
    try {
      await Keyboard.hide()
    } catch (error) {
      console.error('Error hiding keyboard:', error)
    }
  }
}

// Gestion de la barre de statut
export const setStatusBarColor = async (color: string): Promise<void> => {
  if (isNativeApp()) {
    try {
      await StatusBar.setBackgroundColor({ color })
    } catch (error) {
      console.error('Error setting status bar color:', error)
    }
  }
}

// Gestion de l'orientation
export const getCurrentOrientation = (): string => {
  if (typeof window !== 'undefined') {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  }
  return 'unknown'
}

// Hook pour détecter les changements de plateforme
export const useCapacitorPlatform = () => {
  return {
    isNative: isNativeApp(),
    platform: getPlatform(),
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isWeb: isWeb()
  }
}