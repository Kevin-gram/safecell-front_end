import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { useLogger } from '../hooks/useLogger';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import {
  FiUsers,
  FiMessageSquare,
  FiBarChart2,
  FiShield,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiTrash2,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiMail,
  FiUser,
  FiClock,
  FiTag
} from 'react-icons/fi';

export default function AdminDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { logInteraction } = useLogger();

  const [feedbackData, setFeedbackData] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    totalFeedback: 0,
    byType: {},
    recentCount: 0
  });

  
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          type="error"
          title={t('admin.accessDenied')}
          message={t('admin.adminOnly')}
        />
      </div>
    );
  }

  
  useEffect(() => {
    loadFeedbackData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedbackData, filters]);

  const loadFeedbackData = () => {
    setLoading(true);
    try {
      const storedFeedback = JSON.parse(localStorage.getItem('safecell_feedback') || '[]');
      
      // Add some mock data if none exists
      if (storedFeedback.length === 0) {
        const mockFeedback = generateMockFeedback();
        localStorage.setItem('safecell_feedback', JSON.stringify(mockFeedback));
        setFeedbackData(mockFeedback);
      } else {
        setFeedbackData(storedFeedback);
      }

      logInteraction('view', 'admin-feedback-list');
    } catch (err) {
      setError(t('admin.loadError'));
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockFeedback = () => {
    const types = ['suggestion', 'bug', 'feature', 'other'];
    const mockData = [];
    
    for (let i = 0; i < 15; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      mockData.push({
        id: `feedback_${Date.now()}_${i}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        type: types[Math.floor(Math.random() * types.length)],
        message: `This is sample feedback message ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        timestamp: date.toISOString(),
        status: Math.random() > 0.7 ? 'resolved' : 'pending',
        priority: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
      });
    }
    
    return mockData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const applyFilters = () => {
    let filtered = [...feedbackData];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(item => new Date(item.timestamp) >= cutoffDate);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower) ||
        item.message.toLowerCase().includes(searchLower)
      );
    }

    setFilteredFeedback(filtered);

    // Update stats
    const typeStats = {};
    feedbackData.forEach(item => {
      typeStats[item.type] = (typeStats[item.type] || 0) + 1;
    });

    const recentCount = feedbackData.filter(item => {
      const itemDate = new Date(item.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate >= weekAgo;
    }).length;

    setStats({
      totalFeedback: feedbackData.length,
      byType: typeStats,
      recentCount
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    logInteraction('view', 'feedback-details', { feedbackId: feedback.id });
  };

  const handleDeleteFeedback = (feedbackId) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      const updatedFeedback = feedbackData.filter(item => item.id !== feedbackId);
      setFeedbackData(updatedFeedback);
      localStorage.setItem('safecell_feedback', JSON.stringify(updatedFeedback));
      setSelectedFeedback(null);
      logInteraction('delete', 'feedback', { feedbackId });
    }
  };

  const handleMarkResolved = (feedbackId) => {
    const updatedFeedback = feedbackData.map(item =>
      item.id === feedbackId ? { ...item, status: 'resolved' } : item
    );
    setFeedbackData(updatedFeedback);
    localStorage.setItem('safecell_feedback', JSON.stringify(updatedFeedback));
    logInteraction('update', 'feedback-status', { feedbackId, status: 'resolved' });
  };

  const exportFeedback = () => {
    const csvContent = [
      ['ID', 'Name', 'Email', 'Type', 'Message', 'Status', 'Priority', 'Date'].join(','),
      ...filteredFeedback.map(item => [
        item.id,
        `"${item.name}"`,
        item.email,
        item.type,
        `"${item.message.replace(/"/g, '""')}"`,
        item.status,
        item.priority,
        new Date(item.timestamp).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    logInteraction('export', 'feedback-data');
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error-600 bg-error-100 dark:bg-error-900/20';
      case 'medium': return 'text-warning-600 bg-warning-100 dark:bg-warning-900/20';
      case 'low': return 'text-success-600 bg-success-100 dark:bg-success-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-success-600 bg-success-100 dark:bg-success-900/20';
      case 'pending': return 'text-warning-600 bg-warning-100 dark:bg-warning-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <FiShield className="mr-2 text-primary-600" />
            {t('admin.dashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('admin.dashboardSubtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            icon={<FiDownload />}
            onClick={exportFeedback}
            disabled={filteredFeedback.length === 0}
          >
            {t('admin.exportFeedback')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
            onClick={loadFeedbackData}
            disabled={loading}
          >
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <FiMessageSquare className="text-primary-500 mr-2" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('admin.totalFeedback')}
              </p>
              <p className="text-2xl font-semibold">{stats.totalFeedback}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <FiClock className="text-warning-500 mr-2" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('admin.recentFeedback')}
              </p>
              <p className="text-2xl font-semibold">{stats.recentCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <FiBarChart2 className="text-success-500 mr-2" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('admin.suggestions')}
              </p>
              <p className="text-2xl font-semibold">{stats.byType.suggestion || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <FiUsers className="text-secondary-500 mr-2" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('admin.bugReports')}
              </p>
              <p className="text-2xl font-semibold">{stats.byType.bug || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiFilter className="mr-2" />
          {t('admin.filters')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.filterByType')}
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="all">{t('admin.allTypes')}</option>
              <option value="suggestion">{t('feedback.suggestion')}</option>
              <option value="bug">{t('feedback.bug')}</option>
              <option value="feature">{t('feedback.feature')}</option>
              <option value="other">{t('feedback.other')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.filterByDate')}
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="all">{t('admin.allTime')}</option>
              <option value="today">{t('admin.today')}</option>
              <option value="week">{t('admin.thisWeek')}</option>
              <option value="month">{t('admin.thisMonth')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.search')}
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder={t('admin.searchPlaceholder')}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Feedback List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold flex items-center">
                <FiMessageSquare className="mr-2" />
                {t('admin.feedbackList')} ({filteredFeedback.length})
              </h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <FiRefreshCw className="animate-spin mx-auto h-8 w-8 text-primary-600" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <Alert type="error" message={error} />
              </div>
            ) : filteredFeedback.length === 0 ? (
              <div className="p-8 text-center">
                <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('admin.noFeedback')}</p>
              </div>
            ) : (
              <div className="divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">
                {filteredFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                      selectedFeedback?.id === feedback.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                    onClick={() => handleViewFeedback(feedback)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {feedback.name}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                            {feedback.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                            {feedback.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {feedback.email}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                          {feedback.message}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <FiTag className="mr-1" />
                          {t(`feedback.${feedback.type}`)}
                          <FiClock className="ml-3 mr-1" />
                          {formatDate(feedback.timestamp)}
                        </div>
                      </div>
                      <FiEye className="text-gray-400 ml-2" size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Feedback Details */}
        <div>
          <Card className="p-6">
            {selectedFeedback ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{t('admin.feedbackDetails')}</h3>
                  <div className="flex space-x-2">
                    {selectedFeedback.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleMarkResolved(selectedFeedback.id)}
                      >
                        {t('admin.markResolved')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      icon={<FiTrash2 />}
                      onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.submittedBy')}
                    </label>
                    <div className="flex items-center mt-1">
                      <FiUser className="mr-2 text-gray-400" size={16} />
                      <span>{selectedFeedback.name}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <FiMail className="mr-2 text-gray-400" size={16} />
                      <span>{selectedFeedback.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.type')}
                    </label>
                    <span className="inline-block mt-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                      {t(`feedback.${selectedFeedback.type}`)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.status')}
                    </label>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${getStatusColor(selectedFeedback.status)}`}>
                      {selectedFeedback.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.priority')}
                    </label>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedFeedback.priority)}`}>
                      {selectedFeedback.priority}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.submittedOn')}
                    </label>
                    <div className="flex items-center mt-1">
                      <FiCalendar className="mr-2 text-gray-400" size={16} />
                      <span>{formatDate(selectedFeedback.timestamp)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.message')}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {selectedFeedback.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t('admin.selectFeedback')}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}