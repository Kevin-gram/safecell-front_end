import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import { FiUser, FiSave } from 'react-icons/fi'

export default function Settings() {
  const { t } = useI18n()
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(false)
    setError('')
    
    try {
      await updateUser(formData)
      setSuccess(true)
    } catch (err) {
      setError(err.message || t('settings.updateError'))
    }
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
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
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert
              type="success"
              message={t('settings.profileUpdatedSuccess')}
              onClose={() => setSuccess(false)}
            />
          )}
          
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          )}
          
          <div className="space-y-4">
            <Input
              label={t('settings.displayName')}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              icon={<FiUser />}
            />
            
            <Input
              label={t('settings.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            icon={<FiSave />}
          >
            {t('settings.saveChanges')}
          </Button>
        </form>
      </Card>
    </motion.div>
  )
}