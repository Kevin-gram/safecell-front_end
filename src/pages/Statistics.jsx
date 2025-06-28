import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../contexts/I18nContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FiBarChart2, FiPieChart, FiRefreshCw, FiTrendingUp, FiDownload, FiCalendar } from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Statistics() {
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('alldata');
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const periodOptions = [
    { value: 'day', label: t('statistics.today') },
    { value: 'week', label: t('statistics.week') },
    { value: 'month', label: t('statistics.month') },
    { value: 'year', label: t('statistics.year') },
    { value: 'alldata', label: 'All Data' }
  ];

  const filterDataByPeriod = (data, period) => {
    if (period === 'alldata') return data;

    const now = new Date();
    const cutoffDate = new Date();

    switch (period) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter(item => {
      const itemDate = new Date(item.timestamp || item.createdAt || item.date);
      return itemDate >= cutoffDate;
    });
  };

  const exportToCSV = (period) => {
    if (!rawData || rawData.length === 0) {
      alert(t('statistics.noDataToExport'));
      return;
    }

    const filteredData = filterDataByPeriod(rawData, period);
    
    // Prepare CSV headers
    const headers = [
      'Date',
      'Timestamp',
      'Prediction Result',
      'Confidence Level',
      'Province',
      'District',
      'Sector',
      'Hospital',
      'User ID'
    ];

    // Prepare CSV rows
    const csvRows = filteredData.map(item => [
      new Date(item.timestamp || item.createdAt || item.date).toLocaleDateString(),
      item.timestamp || item.createdAt || item.date || '',
      item.predictionResults?.result || 'N/A',
      item.predictionResults?.confidenceLevel || 0,
      item.province || 'N/A',
      item.district || 'N/A',
      item.sector || 'N/A',
      item.hospital || 'N/A',
      item.userId || item.user_id || 'N/A'
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statistics_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (period) => {
    if (!rawData || rawData.length === 0) {
      alert(t('statistics.noDataToExport'));
      return;
    }

    const filteredData = filterDataByPeriod(rawData, period);
    
    // Prepare Excel data
    const headers = [
      'Date',
      'Timestamp',
      'Prediction Result',
      'Confidence Level',
      'Province',
      'District',
      'Sector',
      'Hospital',
      'User ID'
    ];

    const excelData = filteredData.map(item => [
      new Date(item.timestamp || item.createdAt || item.date).toLocaleDateString(),
      item.timestamp || item.createdAt || item.date || '',
      item.predictionResults?.result || 'N/A',
      item.predictionResults?.confidenceLevel || 0,
      item.province || 'N/A',
      item.district || 'N/A',
      item.sector || 'N/A',
      item.hospital || 'N/A',
      item.userId || item.user_id || 'N/A'
    ]);

    // Create Excel content (simple HTML table format that Excel can read)
    const excelContent = `
      <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${excelData.map(row => 
                `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Create and download the file
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statistics_${period}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = (exportType, period) => {
    if (exportType === 'csv') {
      exportToCSV(period);
    } else if (exportType === 'excel') {
      exportToExcel(period);
    }
    setShowExportDropdown(false);
  };

  const processStatistics = (data) => {
    return {
      summary: {
        total: data.length,
        totalPositive: data.filter((d) => d.predictionResults?.result === 'positive').length,
        totalNegative: data.filter((d) => d.predictionResults?.result === 'negative').length,
        positiveRate: data.length > 0 ? (
          (data.filter((d) => d.predictionResults?.result === 'positive').length / data.length) *
          100
        ).toFixed(1) : '0.0',
      },
      labels: data.map((d, index) => `Test ${index + 1}`),
      datasets: {
        positive: data
          .filter((d) => d.predictionResults?.result === 'positive')
          .map((d) => d.predictionResults?.confidenceLevel || 0),
        negative: data
          .filter((d) => d.predictionResults?.result === 'negative')
          .map((d) => d.predictionResults?.confidenceLevel || 0),
      },
      confidenceDistribution: {
        labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
        data: [
          data.filter((d) => d.predictionResults?.confidenceLevel <= 20).length,
          data.filter(
            (d) =>
              d.predictionResults?.confidenceLevel > 20 &&
              d.predictionResults?.confidenceLevel <= 40
          ).length,
          data.filter(
            (d) =>
              d.predictionResults?.confidenceLevel > 40 &&
              d.predictionResults?.confidenceLevel <= 60
          ).length,
          data.filter(
            (d) =>
              d.predictionResults?.confidenceLevel > 60 &&
              d.predictionResults?.confidenceLevel <= 80
          ).length,
          data.filter((d) => d.predictionResults?.confidenceLevel > 80).length,
        ],
      },
    };
  };

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/detection-data/');
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const apiResponse = await response.json();
      const data = Array.isArray(apiResponse) ? apiResponse : apiResponse.data || [];

      // Store raw data for filtering and export
      setRawData(data);

      // Process the data
      const processedData = processStatistics(data);
      setStats(processedData);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const getChartColors = (isDarkMode = false) => {
    return {
      positive: {
        backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        borderColor: isDarkMode ? 'rgb(239, 68, 68)' : 'rgb(239, 68, 68)',
      },
      negative: {
        backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)',
        borderColor: isDarkMode ? 'rgb(16, 185, 129)' : 'rgb(16, 185, 129)',
      },
    };
  };

  const getDetectionRateData = () => {
    if (!stats) return null;

    const colors = getChartColors(document.documentElement.classList.contains('dark'));

    return {
      labels: stats.labels,
      datasets: [
        {
          label: t('statistics.positiveDetections'),
          data: stats.datasets.positive,
          backgroundColor: colors.positive.backgroundColor,
          borderColor: colors.positive.borderColor,
          borderWidth: 2,
          tension: 0.3,
        },
        {
          label: t('statistics.negativeDetections'),
          data: stats.datasets.negative,
          backgroundColor: colors.negative.backgroundColor,
          borderColor: colors.negative.borderColor,
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    };
  };

  const getConfidenceDistributionData = () => {
    if (!stats?.confidenceDistribution) return null;

    return {
      labels: stats.confidenceDistribution.labels,
      datasets: [
        {
          label: 'Count',
          data: stats.confidenceDistribution.data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('statistics.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('statistics.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {/* Export Button with Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              icon={<FiDownload />}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              disabled={!stats || stats.summary.total === 0}
            >
              {t('statistics.exportData')}
            </Button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                <div className="p-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 py-1 mb-2">
                    {t('statistics.selectPeriod')}:
                  </div>
                  {periodOptions.map((period) => (
                    <div key={period.value} className="mb-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                        {period.label}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleExport('csv', period.value)}
                          className="flex-1 text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
                        >
                          📄 CSV
                        </button>
                        <button
                          onClick={() => handleExport('excel', period.value)}
                          className="flex-1 text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
                        >
                          📊 Excel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            icon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
            onClick={fetchStatistics}
            disabled={loading}
          >
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showExportDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowExportDropdown(false)}
        />
      )}

      {error ? (
        <div className="p-4 bg-error-100 dark:bg-error-900/20 text-error-700 dark:text-error-400 rounded-md">
          {error}
        </div>
      ) : loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-pulse text-center">
            <FiRefreshCw className="animate-spin mx-auto h-8 w-8 text-primary-600 dark:text-primary-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('statistics.totalScans')}</p>
              <p className="mt-1 text-2xl font-semibold">{stats.summary.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('statistics.positiveCases')}</p>
              <p className="mt-1 text-2xl font-semibold text-error-600 dark:text-error-400">
                {stats.summary.totalPositive}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('statistics.negativeCases')}</p>
              <p className="mt-1 text-2xl font-semibold text-success-600 dark:text-success-400">
                {stats.summary.totalNegative}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('statistics.positiveRate')}</p>
              <p className="mt-1 text-2xl font-semibold">{stats.summary.positiveRate}%</p>
            </Card>
          </div>

          {/* Detection Rate Chart */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <FiTrendingUp size={20} className="text-primary-600 dark:text-primary-400 mr-2" />
              <h2 className="text-xl font-semibold">{t('statistics.detectionRate')}</h2>
            </div>
            <div className="h-80">
              <Line
                data={getDetectionRateData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: document.documentElement.classList.contains('dark')
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                    x: {
                      grid: {
                        color: document.documentElement.classList.contains('dark')
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Positive/Negative Distribution */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <FiBarChart2 size={20} className="text-secondary-600 dark:text-secondary-400 mr-2" />
                <h2 className="text-xl font-semibold">{t('statistics.distributionChart')}</h2>
              </div>
              <div className="h-64">
                <Bar
                  data={{
                    labels: [t('statistics.positiveDetections'), t('statistics.negativeDetections')],
                    datasets: [
                      {
                        label: 'Count',
                        data: [stats.summary.totalPositive, stats.summary.totalNegative],
                        backgroundColor: ['rgba(239, 68, 68, 0.6)', 'rgba(16, 185, 129, 0.6)'],
                        borderColor: ['rgb(239, 68, 68)', 'rgb(16, 185, 129)'],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </Card>

            {/* Confidence Distribution */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <FiPieChart size={20} className="text-accent-600 dark:text-accent-400 mr-2" />
                <h2 className="text-xl font-semibold">{t('statistics.confidenceDistribution')}</h2>
              </div>
              <div className="h-64">
                <Doughnut
                  data={getConfidenceDistributionData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center p-12">
          <p>{t('statistics.noData')}</p>
        </div>
      )}
    </motion.div>
  );
}