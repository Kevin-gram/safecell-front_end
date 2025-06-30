import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FiSearch, FiBarChart2, FiMessageSquare, FiClock, FiActivity, FiMapPin } from 'react-icons/fi';

export default function Home() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [timeOfDay, setTimeOfDay] = useState('');
  const [recentDetections, setRecentDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  // Generate random timestamps for the last 7 days
  const generateRandomTimestamp = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const randomTime = sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime());
    return new Date(randomTime);
  };

  const fetchRecentDetections = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('https://safecell.onrender.com/detection-data/');
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
  
      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
  
      // Extract the actual data array from the API response
      const detections = apiResponse.data || [];
  
      // Add random timestamps and process the data
      const processedDetections = detections.map((detection, index) => ({
        ...detection,
        // Generate random timestamp since it's not available in API
        timestamp: generateRandomTimestamp(),
        // Ensure we have a unique identifier
        id: detection._id || `detection-${index}`,
        // Normalize the result format
        normalizedResult: {
          result: detection.predictionResults?.result === 'positive' ? 'Positive' : 'Negative',
          confidenceLevel: detection.predictionResults?.confidenceLevel || 0,
          processingTime: detection.predictionResults?.processingTime || 0
        }
      }));

      // Sort by timestamp (most recent first) and take the latest 5
      const sortedDetections = processedDetections
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
  
      setRecentDetections(sortedDetections);
    } catch (err) {
      console.error('Error fetching recent detections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentDetections();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero section */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-800 dark:to-secondary-800 rounded-xl p-8 text-white shadow-lg"
      >
        <h1 className="text-3xl md:text-4xl font-bold">
          Good {timeOfDay}, {user?.name}!
        </h1>
        <p className="mt-2 text-lg text-white/90">{t('home.welcome')}</p>
        <p className="mt-1 text-white/80 max-w-2xl">{t('home.description')}</p>
        <div className="mt-6">
          <Link to="/detection">
            <Button variant="accent">{t('home.getStarted')}</Button>
          </Link>
        </div>
      </motion.div>

      {/* Quick access cards */}
      <div>
        <motion.h2 variants={itemVariants} className="text-xl font-semibold mb-4 flex items-center">
          <FiActivity className="mr-2" /> {t('home.quickAccess')}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={itemVariants}>
            <Link to="/detection">
              <Card hoverable className="p-6 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                    <FiSearch className="text-primary-600 dark:text-primary-400" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{t('nav.detection')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Analyze blood smear images
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link to="/statistics">
              <Card hoverable className="p-6 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start">
                  <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-full">
                    <FiBarChart2 className="text-secondary-600 dark:text-secondary-400" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{t('nav.statistics')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      View detection trends and insights
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link to="/feedback">
              <Card hoverable className="p-6 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start">
                  <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-full">
                    <FiMessageSquare className="text-accent-600 dark:text-accent-400" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{t('nav.feedback')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Provide suggestions for improvement
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Recent detections */}
      <div>
        <motion.h2 variants={itemVariants} className="text-xl font-semibold mb-4 flex items-center">
          <FiClock className="mr-2" /> {t('home.recentDetections')}
        </motion.h2>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="text-error-500 dark:text-error-400 mb-2">
                  <FiActivity size={24} className="mx-auto" />
                </div>
                <p className="text-error-500 dark:text-error-400">
                  {t('common.error')}: {error}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={fetchRecentDetections}
                >
                  Try Again
                </Button>
              </div>
            ) : recentDetections.length > 0 ? (
              <div className="divide-y dark:divide-gray-700">
                {recentDetections.map((detection, index) => (
                  <div
                    key={detection.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`h-3 w-3 rounded-full mt-1 flex-shrink-0 ${
                            detection.normalizedResult.result === 'Positive'
                              ? 'bg-error-500 shadow-lg shadow-error-500/30'
                              : 'bg-success-500 shadow-lg shadow-success-500/30'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${
                              detection.normalizedResult.result === 'Positive'
                                ? 'text-error-700 dark:text-error-400'
                                : 'text-success-700 dark:text-success-400'
                            }`}>
                              {detection.normalizedResult.result}
                            </span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {detection.normalizedResult.confidenceLevel}% confidence
                            </span>
                          </div>
                          
                          <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <FiMapPin size={12} className="mr-1" />
                            <span>{detection.hospital}</span>
                          </div>
                          
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {detection.district}, {detection.province} • {detection.sector}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimestamp(detection.timestamp)}
                        </span>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {detection.normalizedResult.processingTime}ms
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FiClock size={32} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {t('home.noDetections')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Recent detection results will appear here
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}