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

  // Helper function to safely extract nested values
  const safeGet = (obj, path, defaultValue = 'N/A') => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== null && result !== undefined ? result : defaultValue;
  };

  // Helper function to get date from various possible fields (UPDATED)
  const getDateFromItem = (item) => {
    const possibleDateFields = [
      'createdAt', 'timestamp', 'created_at', 'date', 
      'detection_date', 'scan_date', 'dateCreated'
    ];
    
    for (const field of possibleDateFields) {
      const dateValue = safeGet(item, field, null);
      if (dateValue) {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    // If no valid date found, return current date
    return new Date();
  };

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
      const itemDate = getDateFromItem(item);
      return itemDate >= cutoffDate;
    });
  };

  // Enhanced data extraction function (UPDATED)
  const extractDataForExport = (item) => {
    // Use createdAt as primary date field
    const itemDate = new Date(item.createdAt || item.timestamp || new Date());
    
    // Try multiple possible field names for each data point
    const predictionResult = safeGet(item, 'predictionResults.result', 
      safeGet(item, 'prediction_result', 
        safeGet(item, 'result', 
          safeGet(item, 'detection_result', 'N/A'))));
    
    const confidenceLevel = safeGet(item, 'predictionResults.confidenceLevel', 
      safeGet(item, 'confidence_level', 
        safeGet(item, 'confidence', 
          safeGet(item, 'predictionResults.confidence', 0))));
    
    const province = safeGet(item, 'province', 
      safeGet(item, 'location.province', 
        safeGet(item, 'user.province', 'N/A')));
    
    const district = safeGet(item, 'district', 
      safeGet(item, 'location.district', 
        safeGet(item, 'user.district', 'N/A')));
    
    const sector = safeGet(item, 'sector', 
      safeGet(item, 'location.sector', 
        safeGet(item, 'user.sector', 'N/A')));
    
    const hospital = safeGet(item, 'hospital', 
      safeGet(item, 'location.hospital', 
        safeGet(item, 'facility', 
          safeGet(item, 'healthcare_facility', 'N/A'))));
    
    const userId = safeGet(item, 'userId', 
      safeGet(item, 'user_id', 
        safeGet(item, 'user.id', 
          safeGet(item, 'id', 'N/A'))));

    return {
      date: itemDate.toLocaleDateString(),
      timestamp: itemDate.toISOString(),
      createdAt: item.createdAt || 'N/A',
      predictionResult,
      confidenceLevel: typeof confidenceLevel === 'number' ? confidenceLevel : parseFloat(confidenceLevel) || 0,
      province,
      district,
      sector,
      hospital,
      userId,
      rawItem: item // Keep original for debugging
    };
  };

  const exportToCSV = (period) => {
    if (!rawData || rawData.length === 0) {
      alert(t('statistics.noDataToExport') || 'No data available to export');
      return;
    }

    const filteredData = filterDataByPeriod(rawData, period);
    
    if (filteredData.length === 0) {
      alert(`No data available for the selected period: ${periodOptions.find(p => p.value === period)?.label || period}`);
      return;
    }

    // Extract and sort data by createdAt date (newest first)
    const extractedData = filteredData
      .map(extractDataForExport)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Sort descending (newest first)
      });
    
    // Prepare CSV headers
    const headers = [
      'Date',
      'Created At',
      'Full Timestamp',
      'Prediction Result',
      'Confidence Level (%)',
      'Province',
      'District',
      'Sector',
      'Hospital/Facility',
      'User ID'
    ];

    // Prepare CSV rows
    const csvRows = extractedData.map(item => [
      item.date,
      item.createdAt,
      item.timestamp,
      item.predictionResult,
      item.confidenceLevel,
      item.province,
      item.district,
      item.sector,
      item.hospital,
      item.userId
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(field => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `malaria_statistics_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Exported ${extractedData.length} records for period: ${period}`);
  };

  const exportToExcel = (period) => {
    if (!rawData || rawData.length === 0) {
      alert(t('statistics.noDataToExport') || 'No data available to export');
      return;
    }

    const filteredData = filterDataByPeriod(rawData, period);
    
    if (filteredData.length === 0) {
      alert(`No data available for the selected period: ${periodOptions.find(p => p.value === period)?.label || period}`);
      return;
    }

    // Extract and sort data by createdAt date (newest first)
    const extractedData = filteredData
      .map(extractDataForExport)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Sort descending (newest first)
      });
    
    // Prepare Excel data
    const headers = [
      'Date',
      'Created At',
      'Full Timestamp',
      'Prediction Result',
      'Confidence Level (%)',
      'Province',
      'District',
      'Sector',
      'Hospital/Facility',
      'User ID'
    ];

    // Create Excel content (simple HTML table format)
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
              ${extractedData.map(item => 
                `<tr>
                  <td>${item.date}</td>
                  <td>${item.createdAt}</td>
                  <td>${item.timestamp}</td>
                  <td>${item.predictionResult}</td>
                  <td>${item.confidenceLevel}</td>
                  <td>${item.province}</td>
                  <td>${item.district}</td>
                  <td>${item.sector}</td>
                  <td>${item.hospital}</td>
                  <td>${item.userId}</td>
                </tr>`
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
    link.setAttribute('download', `malaria_statistics_${period}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Exported ${extractedData.length} records to Excel for period: ${period}`);
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
    // Extract prediction results using the same safe method
    const extractedData = data.map(item => {
      const predictionResult = safeGet(item, 'predictionResults.result', 
        safeGet(item, 'prediction_result', 
          safeGet(item, 'result', 
            safeGet(item, 'detection_result', null))));
      
      const confidenceLevel = safeGet(item, 'predictionResults.confidenceLevel', 
        safeGet(item, 'confidence_level', 
          safeGet(item, 'confidence', 
            safeGet(item, 'predictionResults.confidence', 0))));

      return {
        ...item,
        extractedResult: predictionResult,
        extractedConfidence: typeof confidenceLevel === 'number' ? confidenceLevel : parseFloat(confidenceLevel) || 0
      };
    });

    const positiveResults = extractedData.filter(d => 
      d.extractedResult && d.extractedResult.toLowerCase().includes('positive')
    );
    
    const negativeResults = extractedData.filter(d => 
      d.extractedResult && d.extractedResult.toLowerCase().includes('negative')
    );

    return {
      summary: {
        total: data.length,
        totalPositive: positiveResults.length,
        totalNegative: negativeResults.length,
        positiveRate: data.length > 0 ? (
          (positiveResults.length / data.length) * 100
        ).toFixed(1) : '0.0',
      },
      labels: data.map((d, index) => `Test ${index + 1}`),
      datasets: {
        positive: positiveResults.map(d => d.extractedConfidence),
        negative: negativeResults.map(d => d.extractedConfidence),
      },
      confidenceDistribution: {
        labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
        data: [
          extractedData.filter(d => d.extractedConfidence <= 20).length,
          extractedData.filter(d => d.extractedConfidence > 20 && d.extractedConfidence <= 40).length,
          extractedData.filter(d => d.extractedConfidence > 40 && d.extractedConfidence <= 60).length,
          extractedData.filter(d => d.extractedConfidence > 60 && d.extractedConfidence <= 80).length,
          extractedData.filter(d => d.extractedConfidence > 80).length,
        ],
      },
    };
  };

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching statistics from API...');
      const response = await fetch('https://safecell.onrender.com/detection-data/');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      console.log("backend response", response)
      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
      
      const data = Array.isArray(apiResponse) ? apiResponse : apiResponse.data || [];
      console.log('Processed data length:', data.length);
      
      if (data.length > 0) {
        console.log('Sample data item:', data[0]);
        console.log('Available fields in first item:', Object.keys(data[0]));
      }

      // Store raw data for filtering and export
      setRawData(data);

      // Process the data
      const processedData = processStatistics(data);
      setStats(processedData);
      
      console.log('Statistics processed successfully');
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
              {t('statistics.exportData') || 'Export Data'} ({stats?.summary.total || 0} records)
            </Button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                <div className="p-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 py-1 mb-2">
                    {t('statistics.selectPeriod') || 'Select Period'}:
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
            {t('common.refresh') || 'Refresh'}
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
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          <p><strong>Error:</strong> {error}</p>
          <p className="text-sm mt-2">Please check the browser console for more details.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            icon={<FiRefreshCw />}
            onClick={fetchStatistics}
          >
            Try Again
          </Button>
        </div>
      ) : loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-pulse text-center">
            <FiRefreshCw className="animate-spin mx-auto h-8 w-8 text-primary-600 dark:text-primary-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('common.loading') || 'Loading...'}</p>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('statistics.totalScans') || 'Total Scans'}</p>
              <p className="mt-1 text-2xl font-semibold">{stats.summary.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('statistics.positiveCases') || 'Positive Cases'}</p>
              <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
                {stats.summary.totalPositive}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('statistics.negativeCases') || 'Negative Cases'}</p>
              <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                {stats.summary.totalNegative}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('statistics.positiveRate') || 'Positive Rate'}</p>
              <p className="mt-1 text-2xl font-semibold">{stats.summary.positiveRate}%</p>
            </Card>
          </div>

          {/* Detection Rate Chart */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <FiTrendingUp size={20} className="text-primary-600 dark:text-primary-400 mr-2" />
              <h2 className="text-xl font-semibold">{t('statistics.detectionRate') || 'Detection Rate Over Time'}</h2>
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
                <h2 className="text-xl font-semibold">{t('statistics.distributionChart') || 'Detection Results Distribution'}</h2>
              </div>
              <div className="h-64">
                <Bar
                  data={{
                    labels: [t('statistics.positiveDetections') || 'Positive', t('statistics.negativeDetections') || 'Negative'],
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
                <h2 className="text-xl font-semibold">{t('statistics.confidenceDistribution') || 'Confidence Level Distribution'}</h2>
              </div>
              <div className="h-64">
                <Doughnut
                  data={getConfidenceDistributionData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
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
          <p className="text-gray-600 dark:text-gray-400">{t('statistics.noData') || 'No data available'}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            icon={<FiRefreshCw />}
            onClick={fetchStatistics}
          >
            {t('common.tryAgain') || 'Try Again'}
          </Button>
        </div>
      )}
    </motion.div>
  );
}