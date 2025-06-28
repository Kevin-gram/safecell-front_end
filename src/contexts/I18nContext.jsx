import { createContext, useContext, useState, useEffect } from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { translationEN } from '../i18n/en'
import { translationFR } from '../i18n/fr'
import { translationRW } from '../i18n/rw'

const I18nContext = createContext(null)

// Initialize i18next
const initI18n = async () => {
  if (!i18n.isInitialized) {
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources: {
          en: {
            translation: translationEN
          },
          fr: {
            translation: translationFR
          },
          rw: {
            translation: translationRW
          }
        },
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false
        }
      })
  }
}

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Initialize i18next and set up the provider
  useEffect(() => {
    const setupI18n = async () => {
      try {
        await initI18n()
        
        // Check for saved language preference
        const savedLanguage = localStorage.getItem('language')
        const initialLanguage = savedLanguage || i18n.language || 'en'
        
        if (savedLanguage && savedLanguage !== i18n.language) {
          await i18n.changeLanguage(savedLanguage)
        }
        
        setLanguage(initialLanguage)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize i18n:', error)
        // Fallback to English if initialization fails
        setLanguage('en')
        setIsInitialized(true)
      }
    }
    
    setupI18n()
  }, [])
  
  // Change language function
  const changeLanguage = async (lang) => {
    try {
      await i18n.changeLanguage(lang)
      setLanguage(lang)
      localStorage.setItem('language', lang)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }
  
  const value = {
    language,
    changeLanguage,
    t: (key, options) => {
      if (!isInitialized) {
        return key // Return the key as fallback if not initialized
      }
      return i18n.t(key, options)
    },
    isInitialized
  }
  
  // Don't render children until i18n is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }
  
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}