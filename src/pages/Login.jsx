import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FiLogIn, FiMoon, FiSun, FiGlobe } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

export default function Login() {
  const { login } = useAuth();
  const { t, language, changeLanguage } = useI18n();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = t('auth.emailRequired');
    if (!password) newErrors.password = t('auth.passwordRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await login(email, password);

      if (result.success) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.error || t('auth.loginError'));
      }
    } catch (error) {
      setErrorMessage(error.message || t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 flex space-x-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          aria-label={isDarkMode ? t('common.lightMode') : t('common.darkMode')}
        >
          {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center focus:outline-none"
            aria-label={t('common.language')}
          >
            <FiGlobe size={20} />
            <span className="ml-1 text-sm uppercase">{language}</span>
          </button>

          {/* Language dropdown */}
          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700">
              <button
                onClick={() => {
                  changeLanguage('en');
                  setShowLangMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                English
              </button>
              <button
                onClick={() => {
                  changeLanguage('fr');
                  setShowLangMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Français
              </button>
              <button
                onClick={() => {
                  changeLanguage('rw');
                  setShowLangMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Kinyarwanda
              </button>
            </div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('auth.appName')}
        </h1>
        <h2 className="mt-2 text-center text-xl text-gray-600 dark:text-gray-400">
          {t('auth.login')}
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
              className="mb-4"
            />
          )}

          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage('')}
              className="mb-4"
            />
          )}

         

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('auth.email')}
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              placeholder="email@example.com"
            />

            <Input
              label={t('auth.password')}
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/signup"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                >
                  {t('auth.noAccount')}
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
              icon={<FiLogIn />}
            >
              {isLoading ? t('common.loading') : t('auth.loginButton')}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}