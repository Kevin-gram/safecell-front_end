import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { useTheme } from '../contexts/ThemeContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import Select from '../components/ui/Select'
import { FiUser, FiSave, FiMail, FiLock, FiTrash2, FiGlobe, FiMoon, FiSun, FiUpload, FiShield } from 'react-icons/fi'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'rw', label: 'Kinyarwanda' }
]

const THEMES = [
  { value: 'light', label: '🌞 Light' },
  { value: 'dark', label: '🌙 Dark' }
]

export default function Settings() {
  const { t, language, changeLanguage } = useI18n()
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, updateUser, logout } = useAuth()
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture || ''
  })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'profilePicture' && files && files[0]) {
      const file = files[0]
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(t('settings.invalidImageType'))
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('settings.imageTooLarge'))
        return
      }
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, profilePicture: imageUrl }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    setIsUpdating(true)
    
    try {
      await updateUser(formData)
      setSuccess(t('settings.profileUpdatedSuccess'))
    } catch (err) {
      setError(err.message || t('settings.updateError'))
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswords(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwSuccess('')
    setPwError('')
    
    if (passwords.new.length < 6) {
      setPwError(t('auth.passwordTooShort'))
      return
    }
    
    if (passwords.new !== passwords.confirm) {
      setPwError(t('auth.passwordMismatch'))
      return
    }
    
    try {
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPwSuccess(t('settings.passwordUpdatedSuccess'))
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err) {
      setPwError(err.message || t('settings.updateError'))
    }
  }

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage)
    setSuccess(t('settings.languageUpdatedSuccess'))
  }

  const handleThemeChange = (newTheme) => {
    if ((newTheme === 'dark' && !isDarkMode) || (newTheme === 'light' && isDarkMode)) {
      toggleTheme()
      setSuccess(t('settings.themeUpdatedSuccess'))
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 1000))
      logout()
      // In a real app, this would redirect to a goodbye page
    } catch (err) {
      setError(err.message || t('settings.deleteError'))
    }
  }

  const currentTheme = isDarkMode ? 'dark' : 'light'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Profile Section */}
      <Card className="p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center mb-2">
          <FiUser className="mr-2" />
          {t('settings.profile')}
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          
          {/* Profile Picture */}

          <Input
            label={t('settings.displayName')}
            name="name"
            value={formData.name}
            onChange={handleProfileChange}
            required
            icon={<FiUser />}
          />
          
          <Input
            label={t('settings.email')}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleProfileChange}
            required
            disabled
            icon={<FiMail />}
          />
          
          <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('settings.role')}: </span>
              <span className="font-medium capitalize">{user?.role || 'User'}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('settings.joinedDate')}: </span>
              <span className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <Button 
            type="submit" 
            variant="primary" 
            icon={<FiSave />}
            disabled={isUpdating}
          >
            {isUpdating ? t('common.loading') : t('settings.saveChanges')}
          </Button>
        </form>
      </Card>

      {/* Language & Theme Section */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center mb-2">
          <FiGlobe className="mr-2" />
          {t('settings.preferences')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Select
              label={t('settings.language')}
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              options={LANGUAGES}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('settings.languageHelper')}
            </p>
          </div>
          <div>
            <Select
              label={t('settings.theme')}
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
              options={THEMES}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('settings.themeHelper')}
            </p>
          </div>
        </div>
      </Card>

      {/* Password Section */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center mb-2">
          <FiLock className="mr-2" />
          {t('settings.changePassword')}
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {pwSuccess && <Alert type="success" message={pwSuccess} onClose={() => setPwSuccess('')} />}
          {pwError && <Alert type="error" message={pwError} onClose={() => setPwError('')} />}
          
          <Input
            label={t('settings.currentPassword')}
            name="current"
            type="password"
            value={passwords.current}
            onChange={handlePasswordChange}
            required
            placeholder="••••••••"
          />
          
          <Input
            label={t('settings.newPassword')}
            name="new"
            type="password"
            value={passwords.new}
            onChange={handlePasswordChange}
            required
            placeholder="••••••••"
          />
          
          <Input
            label={t('auth.confirmPassword')}
            name="confirm"
            type="password"
            value={passwords.confirm}
            onChange={handlePasswordChange}
            required
            placeholder="••••••••"
          />
          
          <Button type="submit" variant="primary" icon={<FiSave />}>
            {t('settings.updatePassword')}
          </Button>
        </form>
      </Card>

      {/* Privacy Policy & Copyright */}
      <Card className="p-6 space-y-4 border-l-4 border-l-green-500 ">
        <h2 className="text-lg font-semibold flex items-center mb-2 text-accent-600 dark:text-accent-400">
          <FiShield className="mr-2" />
          {t('settings.privacyPolicy') || 'Privacy Policy & Copyright'}
        </h2>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>{t('settings.privacyDataCollectionTitle')}</strong> {t('settings.privacyDataCollection')}
          </p>
          <p>
            <strong>{t('settings.privacyDataUsageTitle')}</strong> {t('settings.privacyDataUsage')}
          </p>
          <p>
            <strong>{t('settings.privacyUserAccountsTitle')}</strong> {t('settings.privacyUserAccounts')}
          </p>
          <p>
            <strong>{t('settings.privacyCookiesTitle')}</strong> {t('settings.privacyCookies')}
          </p>
          <p>
            <strong>{t('settings.privacyCopyrightTitle')}</strong> {t('settings.privacyCopyright')}
          </p>
          <p>
            <strong>{t('settings.privacyAgreementTitle')}</strong> {t('settings.privacyAgreement')}
          </p>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 space-y-4 border-l-4 border-l-error-500">
        <h2 className="text-lg font-semibold flex items-center mb-2 text-error-600 dark:text-error-400">
          <FiTrash2 className="mr-2" />
          {t('settings.dangerZone')}
        </h2>
        <p className="text-sm text-error-700 dark:text-error-300">
          {t('settings.deleteAccountWarning')}
        </p>
        {deleteConfirm ? (
          <div className="flex space-x-2">
            <Button variant="danger" onClick={handleDeleteAccount}>
              {t('settings.confirmDelete')}
            </Button>
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setDeleteConfirm(true)}>
            {t('settings.deleteAccount')}
          </Button>
        )}
         </Card>
    </motion.div>
  )
}