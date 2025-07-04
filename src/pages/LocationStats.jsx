import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useI18n } from "../contexts/I18nContext";
import { MapContainer, TileLayer, Circle, Popup, Marker } from "react-leaflet";
import { divIcon } from 'leaflet';
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import {
  FiAlertTriangle,
  FiActivity,
  FiTrendingUp,
  FiHome,
  FiUsers,
  FiBarChart2,
  FiRefreshCw,
} from "react-icons/fi";
import { FiMapPin } from "react-icons/fi";
import { apiRequest } from "../utils/api";
import "leaflet/dist/leaflet.css";

// Rwanda's center coordinates and bounds
const RWANDA_CENTER = [-1.9403, 29.8739];
const RWANDA_BOUNDS = [
  [-2.8389, 28.8617], 
  [-1.0474, 30.8862], 
];

const RWANDA_DISTRICT_COORDINATES = {
  // Kigali City
  "gasabo": [-1.9536, 30.1044],
  "kicukiro": [-1.9667, 30.1000],
  "nyarugenge": [-1.9481, 30.0588],
  
  // Eastern Province
  "bugesera": [-2.2167, 30.2000],
  "gatsibo": [-1.6000, 30.4167],
  "kayonza": [-1.8833, 30.6167],
  "kirehe": [-2.2167, 30.7000],
  "ngoma": [-2.1833, 30.5167],
  "nyagatare": [-1.3000, 30.3167],
  "rwamagana": [-1.9500, 30.4333],
  
  // Northern Province
  "burera": [-1.4833, 29.8667],
  "gakenke": [-1.6667, 29.8000],
  "gicumbi": [-1.5833, 30.1000],
  "musanze": [-1.5000, 29.6333],
  "rulindo": [-1.7667, 30.0667],
  
  // Southern Province
  "gisagara": [-2.5833, 29.8333],
  "huye": [-2.6000, 29.7333],
  "kamonyi": [-2.0833, 29.8167],
  "muhanga": [-2.0833, 29.7500],
  "nyamagabe": [-2.4500, 29.3500],
  "nyanza": [-2.3500, 29.7500],
  "nyaruguru": [-2.6000, 29.4333],
  "ruhango": [-2.1333, 29.7833],
  
  // Western Province
  "karongi": [-2.0000, 29.3833],
  "ngororero": [-1.8833, 29.5167],
  "nyabihu": [-1.6500, 29.5167],
  "nyamasheke": [-2.2833, 29.1500],
  "rubavu": [-1.6833, 29.3333],
  "rusizi": [-2.4833, 28.9000],
  "rutsiro": [-1.9000, 29.3167]
};

const getDistrictCoordinates = (districtName) => {
  if (!districtName) return RWANDA_CENTER;
  
  const normalizedName = districtName.toLowerCase().replace(/\s+/g, "");
  return RWANDA_DISTRICT_COORDINATES[normalizedName] || RWANDA_CENTER;
};

// Intensity levels for malaria risk (only three levels)
const INTENSITY_LEVELS = [
  {
    level: 1,
    name: "Low",
    color: "#10B981",
    description: "Fewer than 100 cases",
    priority: "low",
  },
  {
    level: 2,
    name: "Moderate",
    color: "#FBBF24",
    description: "100–250 cases",
    priority: "moderate",
  },
  {
    level: 3,
    name: "High",
    color: "#DC2626",
    description: ">250 cases",
    priority: "high",
  },
];

// Create custom marker icons using HTML/CSS instead of React icons
const createCustomMarker = (result, size = 'small') => {
  const isPositive = result === 'positive';
  const markerSize = size === 'large' ? 24 : 16;
  const iconSize = size === 'large' ? 14 : 10;
  
  return divIcon({
    html: `
      <div style="
        width: ${markerSize}px;
        height: ${markerSize}px;
        background-color: ${isPositive ? '#dc2626' : '#10b981'};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: ${iconSize}px;
          height: ${iconSize}px;
          background-color: white;
          border-radius: 50%;
          ${isPositive ? 'background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMTJMMTIgNEg0TDggMTJaIiBmaWxsPSIjZGMyNjI2Ii8+Cjwvc3ZnPgo=);' : 'background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYuNSAxMUwzIDcuNUw0LjQxIDYuMDlMNi41IDguMTlMMTEuNTkgMy4wOUwxMyA0LjVMNi41IDExWiIgZmlsbD0iIzEwYjk4MSIvPgo8L3N2Zz4K);'}
          background-size: ${iconSize - 2}px;
          background-repeat: no-repeat;
          background-position: center;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [markerSize, markerSize],
    iconAnchor: [markerSize / 2, markerSize / 2],
    popupAnchor: [0, -markerSize / 2]
  });
};

// Alternative: Create simple emoji-based markers
const createEmojiMarker = (result, emoji = null) => {
  const isPositive = result === 'positive';
  const markerEmoji = emoji || (isPositive ? '🔴' : '🟢');
  
  return divIcon({
    html: `
      <div style="
        font-size: 20px;
        text-align: center;
        line-height: 1;
        filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));
      ">
        ${markerEmoji}
      </div>
    `,
    className: 'emoji-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Create hospital/facility markers
const createFacilityMarker = (facilityType = 'hospital') => {
  const facilityEmojis = {
    hospital: '🏥',
    clinic: '🏥',
    health_center: '⚕️',
    default: '🏥'
  };
  
  const emoji = facilityEmojis[facilityType] || facilityEmojis.default;
  
  return divIcon({
    html: `
      <div style="
        font-size: 24px;
        text-align: center;
        line-height: 1;
        filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
        background-color: white;
        border-radius: 50%;
        padding: 2px;
        border: 2px solid #0284c7;
      ">
        ${emoji}
      </div>
    `,
    className: 'facility-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export default function LocationStats() {
  const { t } = useI18n();
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districtData, setDistrictData] = useState([]);
  const [detectionData, setDetectionData] = useState([]);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Replace the fetchLocationData function with this corrected version
const fetchLocationData = async (showRefreshLoader = false) => {
  if (showRefreshLoader) {
    setRefreshing(true);
  } else {
    setLoading(true);
  }
  setError(null);

  try {
    // Fetch detection data from the API
    const response = await fetch("https://safecell.onrender.com/detection-data/");

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const apiData = await response.json();
    console.log("api data ", apiData);

    // FIXED: Process the API response - access the correct data structure
    const detections = Array.isArray(apiData) ? apiData : apiData.data || [];

    // Group detections by district to create district-level statistics
    const districtStats = {};

    detections.forEach((detection) => {
      const districtKey = detection.district || "Unknown District";
      const provinceName = detection.province || "Unknown Province";
      const facilityName = detection.hospital || "Unknown Facility";

      if (!districtStats[districtKey]) {
        districtStats[districtKey] = {
          id: districtKey.toLowerCase().replace(/\s+/g, "-"),
          name: districtKey,
          province: provinceName,
          coordinates: RWANDA_CENTER, // This will be updated below
          totalCases: 0,
          positiveCases: 0,
          facilities: new Set(),
          lastUpdated: new Date().toISOString(),
        };
      }

      // FIXED: Update statistics with correct property access
      districtStats[districtKey].totalCases += 1;

      // FIXED: Check for positive cases using the correct property path
      if (detection.predictionResults?.result === "positive") {
        districtStats[districtKey].positiveCases += 1;
      }

      if (facilityName !== "Unknown Facility") {
        districtStats[districtKey].facilities.add(facilityName);
      }
    });

    // FIXED: Convert district stats to array format with proper coordinates
    const processedDistrictData = Object.values(districtStats).map(
      (district) => {
        // Get coordinates for the district
        const districtKey = district.name.toLowerCase().replace(/\s+/g, "");
        const coordinates = RWANDA_DISTRICT_COORDINATES[districtKey] || RWANDA_CENTER;
        
        return {
          ...district,
          coordinates: coordinates, // Use actual district coordinates
          facilities: Array.from(district.facilities),
          intensity: calculateIntensity(district.totalCases),
          positiveRate:
            district.totalCases > 0
              ? ((district.positiveCases / district.totalCases) * 100).toFixed(1)
              : 0,
          riskLevel: getRiskLevel(district.totalCases),
        };
      }
    );

    // FIXED: Filter detections based on time range - add timestamp handling
    const filteredDetections = filterDetectionsByTimeRange(
      detections,
      timeRange
    );

    setDistrictData(processedDistrictData);
    setDetectionData(filteredDetections);

    // Create summary stats
    const totalCases = processedDistrictData.reduce(
      (sum, district) => sum + district.totalCases,
      0
    );
    const totalPositive = processedDistrictData.reduce(
      (sum, district) => sum + district.positiveCases,
      0
    );
    const totalFacilities = new Set(
      processedDistrictData.flatMap((d) => d.facilities)
    ).size;

    setStats({
      totalCases,
      totalPositive,
      totalFacilities,
      activeDistricts: processedDistrictData.length,
      averagePositiveRate:
        processedDistrictData.length > 0
          ? (
              processedDistrictData.reduce(
                (sum, district) => sum + parseFloat(district.positiveRate),
                0
              ) / processedDistrictData.length
            ).toFixed(1)
          : 0,
    });

    // Optional: Validate district data for debugging
    const foundDistricts = new Set();
    const missingDistricts = new Set();
    
    detections.forEach(detection => {
      if (detection.district) {
        const normalizedName = detection.district.toLowerCase().replace(/\s+/g, "");
        if (RWANDA_DISTRICT_COORDINATES[normalizedName]) {
          foundDistricts.add(detection.district);
        } else {
          missingDistricts.add(detection.district);
        }
      }
    });
    
    console.log("Districts found in coordinates:", Array.from(foundDistricts));
    console.log("Districts missing coordinates:", Array.from(missingDistricts));
    
  } catch (error) {
    console.error("Failed to fetch detection data:", error);
    setError(error.message || "Failed to fetch data from API");

    // Set empty data on error
    setDistrictData([]);
    setDetectionData([]);
    setStats(null);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  // Replace the filterDetectionsByTimeRange function with this corrected version
  const filterDetectionsByTimeRange = (detections, range) => {
    const now = new Date();
    const filtered = detections.filter((detection) => {
      // FIXED: Handle multiple possible timestamp fields and create fallback
      let detectionDate = null;

      // Try different possible timestamp fields from your API
      if (detection.timestamp) {
        detectionDate = new Date(detection.timestamp);
      } else if (detection.createdAt) {
        detectionDate = new Date(detection.createdAt);
      } else if (detection.date) {
        detectionDate = new Date(detection.date);
      } else if (detection._id) {
        // FIXED: Extract timestamp from MongoDB ObjectId if available
        try {
          const objectIdTimestamp =
            parseInt(detection._id.substring(0, 8), 16) * 1000;
          detectionDate = new Date(objectIdTimestamp);
        } catch (e) {
          // If ObjectId parsing fails, use current date as fallback
          detectionDate = now;
        }
      } else {
        // Fallback to current date if no timestamp found
        detectionDate = now;
      }

      // Validate the date
      if (isNaN(detectionDate.getTime())) {
        detectionDate = now;
      }

      switch (range) {
        case "today":
          return detectionDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return detectionDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return detectionDate >= monthAgo;
        case "year":
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return detectionDate >= yearAgo;
        default:
          return true;
      }
    });

    return filtered;
  };
  // Fetch data on component mount and time range change
  useEffect(() => {
    fetchLocationData();
  }, [timeRange]);

  const calculateIntensity = (cases) => {
    if (cases < 100) return 1;
    if (cases <= 250) return 2;
    return 3;
  };

  const getRiskLevel = (totalCases) => {
    if (totalCases < 100) return "low";
    if (totalCases <= 250) return "moderate";
    return "high";
  };

  const getCircleColor = (intensity) => {
    return INTENSITY_LEVELS[intensity - 1]?.color || "#000000";
  };

  const getCircleSize = (cases) => {
    return Math.sqrt(cases) * 2000;
  };

  const handleRefresh = () => {
    fetchLocationData(true);
  };

  const timeRangeOptions = [
    { value: "today", label: t('locationStats.timeRangeToday') },
    { value: "week", label: t('locationStats.timeRangeThisWeek') },
    { value: "month", label: t('locationStats.timeRangeThisMonth') },
    { value: "year", label: t('locationStats.timeRangeThisYear') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center text-medical-800 dark:text-medical-200">
            <FiMapPin className="mr-2 text-medical-600" />
            {t('locationStats.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('locationStats.subtitle')}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={timeRangeOptions}
            className="w-48"
          />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            title={t('locationStats.refreshData')}
          >
            <FiRefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>
      {/* Error State */}
      {error && (
        <Card className="p-4 border-l-4 border-l-error-500 bg-error-50 dark:bg-error-900/20">
          <div className="flex items-center">
            <FiAlertTriangle className="text-error-500 mr-2" />
            <div>
              <p className="text-error-800 dark:text-error-200 font-medium">
                {t('locationStats.failedToLoadData')}
              </p>
              <p className="text-error-600 dark:text-error-400 text-sm mt-1">
                {error}
              </p>
              <button
                onClick={() => fetchLocationData()}
                className="mt-2 px-3 py-1 bg-error-600 text-white rounded text-sm hover:bg-error-700"
              >
                {t('locationStats.retry')}
              </button>
            </div>
          </div>
        </Card>
      )}
      {/* Enhanced Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-medical-500">
          <div className="flex items-center">
            <FiMapPin className="text-medical-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('locationStats.activeDistricts')}
              </p>
              <p className="text-2xl font-bold text-medical-600">
                {loading ? t('locationStats.loadingDots') : stats?.activeDistricts || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center">
            <FiActivity className="text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('locationStats.totalDiagnoses')}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? t('locationStats.loadingDots') : stats?.totalCases || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-error-500">
          <div className="flex items-center">
            <FiAlertTriangle className="text-error-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('locationStats.positiveCases')}
              </p>
              <p className="text-2xl font-bold text-error-600">
                {loading ? t('locationStats.loadingDots') : stats?.totalPositive || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-success-500">
          <div className="flex items-center">
            <FiHome className="text-success-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('locationStats.healthcareFacilities')}
              </p>
              <p className="text-2xl font-bold text-success-600">
                {loading ? t('locationStats.loadingDots') : stats?.totalFacilities || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-accent-500">
          <div className="flex items-center">
            <FiTrendingUp className="text-accent-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('locationStats.avgPositiveRate')}
              </p>
              <p className="text-2xl font-bold text-accent-600">
                {loading ? t('locationStats.loadingDots') : `${stats?.averagePositiveRate || 0}%`}
              </p>
            </div>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Risk Levels Card */}
        <Card className="p-6 border-l-4 border-l-medical-500">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-medical-800 dark:text-medical-200">
            <FiAlertTriangle className="mr-2" />
            {t('locationStats.riskAssessmentTitle')}
          </h2>
          <div className="space-y-4">
            {INTENSITY_LEVELS.map(
              ({ level, name, color, description, priority }) => (
                <div key={level} className="flex items-start space-x-3">
                  <div
                    className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <h3 className="font-medium text-sm">
                      {t('locationStats.level')} {level} - {t(`locationStats.${name.toLowerCase().replace(' ', '')}Risk`)}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t(`locationStats.${description.split(' ')[0].toLowerCase()}Cases`)}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          {!loading && detectionData.length > 0 && (
            <div className="mt-6 p-3 bg-medical-50 dark:bg-medical-900/20 rounded-md border border-medical-200 dark:border-medical-800">
              <p className="text-sm text-medical-800 dark:text-medical-200">
                <strong>{t('locationStats.liveDataStatus')}</strong> {t('locationStats.currentlyDisplaying')}{" "}
                {detectionData.length} {t('locationStats.diagnosesFrom')}{" "}
                {stats?.totalFacilities || 0} {t('locationStats.facilitiesAcross')}{" "}
                {stats?.activeDistricts || 0} {t('locationStats.districtsInRwanda')}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="text-medical-600 dark:text-medical-400">
                  <strong>{t('locationStats.positiveCases')}:</strong> {stats?.totalPositive || 0} (
                  {stats?.averagePositiveRate || 0}% {t('locationStats.avgRate')})
                </div>
                <div className="text-medical-600 dark:text-medical-400">
                  <strong>{t('locationStats.timeRange')}</strong>{" "}
                  {timeRange === "today"
                    ? t('locationStats.timeRangeToday')
                    : timeRange === "week"
                    ? t('locationStats.timeRangeThisWeek')
                    : timeRange === "month"
                    ? t('locationStats.timeRangeThisMonth')
                    : t('locationStats.timeRangeThisYear')}
                </div>
              </div>
              <div className="mt-2 text-xs text-medical-500 dark:text-medical-500">
                <strong>{t('locationStats.lastUpdated')}</strong> {new Date().toLocaleString()} |
                <strong className="ml-2">{t('locationStats.dataSource')}</strong> {t('locationStats.dataSourceValue')}
              </div>
            </div>
          )}

          {!loading && detectionData.length === 0 && !error && (
            <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t('locationStats.noDataTitle')}</strong> {t('locationStats.noDataMessage')} (
                {timeRange === "today"
                  ? t('locationStats.timeRangeToday')
                  : timeRange === "week"
                  ? t('locationStats.timeRangeThisWeek')
                  : timeRange === "month"
                  ? t('locationStats.timeRangeThisMonth')
                  : t('locationStats.timeRangeThisYear')}
                ).
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {t('locationStats.noDataSuggestion')}
              </p>
              <div className="mt-2">
                <button
                  onClick={() => fetchLocationData()}
                  className="px-3 py-1 bg-medical-600 text-white rounded text-xs hover:bg-medical-700"
                >
                  {t('locationStats.retryButton')}
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Enhanced Map Card */}
        <Card className="lg:col-span-2 overflow-hidden border-l-4 border-l-medical-500">
          <div className="p-4 border-b dark:border-gray-700 bg-medical-50 dark:bg-medical-900/20">
            <h2 className="text-xl font-semibold text-medical-800 dark:text-medical-200">
              {t('locationStats.mapTitle')}
            </h2>
            <p className="text-sm text-medical-600 dark:text-medical-400 mt-1">
              {t('locationStats.mapDescription')}
            </p>
          </div>
          <div className="h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {t('locationStats.loadingData')}
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FiAlertTriangle className="h-12 w-12 text-error-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('locationStats.unableToLoad')}
                  </p>
                  <button
                    onClick={() => fetchLocationData()}
                    className="mt-2 px-4 py-2 bg-medical-600 text-white rounded hover:bg-medical-700"
                  >
                    {t('locationStats.retry')}
                  </button>
                </div>
              </div>
            ) : (
              <MapContainer
                center={RWANDA_CENTER}
                zoom={8}
                maxBounds={RWANDA_BOUNDS}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* District-level circles */}
                {districtData.map((district, index) => (
                  <Circle
                    key={`district-${index}`}
                    center={district.coordinates}
                    radius={getCircleSize(district.totalCases)}
                    pathOptions={{
                      color: getCircleColor(district.intensity),
                      fillColor: getCircleColor(district.intensity),
                      fillOpacity: 0.6,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px] text-xs">
                        <h3 className="font-bold text-sm text-medical-800">{district.name} {t('locationStats.district')}</h3>
                        <p className="text-gray-600 mb-1">{district.province}</p>
                        <div className="space-y-1">
                          <p>
                            <strong>{t('locationStats.totalTests')}</strong> {district.totalCases}
                          </p>
                          <p>
                            <strong>{t('locationStats.positiveCases')}:</strong> {district.positiveCases}
                          </p>
                          <p>
                            <strong>{t('locationStats.positiveRate')}</strong> {district.positiveRate}%
                          </p>
                          <p>
                            <strong>{t('locationStats.riskLevel')}:</strong>
                            <span
                              className={`ml-1 px-1 py-0.5 rounded text-xs ${
                                district.riskLevel === "critical"
                                  ? "bg-error-100 text-error-800"
                                  : district.riskLevel === "high"
                                  ? "bg-warning-100 text-warning-800"
                                  : district.riskLevel === "moderate"
                                  ? "bg-accent-100 text-accent-800"
                                  : "bg-success-100 text-success-800"
                              }`}
                            >
                              {t(`locationStats.${district.riskLevel}`)}
                            </span>
                          </p>
                          <p>
                            <strong>{t('locationStats.healthcareFacilities')}:</strong>
                          </p>
                          <ul className="text-xs ml-2">
                            {district.facilities.slice(0, 2).map((facility, i) => (
                              <li key={i}>• {facility}</li>
                            ))}
                            {district.facilities.length > 2 && (
                              <li>• +{district.facilities.length - 2} {t('locationStats.more')}</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </Popup>
                  </Circle>
                ))}

                {/* Individual detection markers using custom HTML/CSS markers */}
                {detectionData.slice(-50).map((detection, index) => {
                  const districtCoords = getDistrictCoordinates(detection.district);
                  const offset = 0.02;
                  const randomLat = districtCoords[0] + (Math.random() - 0.5) * offset;
                  const randomLng = districtCoords[1] + (Math.random() - 0.5) * offset;
                  const result = detection.predictionResults?.result === "positive" ? "positive" : "negative";
                  return (
                    <Marker
                      key={`detection-${detection._id || index}`}
                      position={[randomLat, randomLng]}
                      icon={createCustomMarker(result)}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px] text-xs">
                          <h4 className="font-medium text-sm text-medical-800">{t('locationStats.recentDiagnosis')}</h4>
                          <div className="mt-1 space-y-1">
                            <p>
                              <strong>{t('locationStats.result')}</strong>
                              <span
                                className={`ml-1 px-1 py-0.5 rounded text-xs ${
                                  detection.predictionResults?.result === "positive"
                                    ? "bg-error-100 text-error-800"
                                    : "bg-success-100 text-success-800"
                                }`}
                              >
                                {detection.predictionResults?.result === "positive"
                                  ? t('locationStats.positive')
                                  : t('locationStats.negative')}
                              </span>
                            </p>
                            <p>
                              <strong>{t('locationStats.confidence')}</strong> {detection.predictionResults?.confidenceLevel || t('locationStats.notAvailable')}%
                            </p>
                            <p>
                              <strong>{t('locationStats.district')}:</strong> {detection.district || t('locationStats.unknown')}
                            </p>
                            <p>
                              <strong>{t('locationStats.province')}</strong> {detection.province || t('locationStats.unknown')}
                            </p>
                            <p>
                              <strong>{t('locationStats.sector')}</strong> {detection.sector || t('locationStats.unknown')}
                            </p>
                            <p>
                              <strong>{t('locationStats.hospital')}</strong> {detection.hospital || t('locationStats.unknown')}
                            </p>
                            <p>
                              <strong>{t('locationStats.processingTime')}</strong> {detection.predictionResults?.processingTime || t('locationStats.notAvailable')}{t('locationStats.milliseconds')}
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>
        </Card>
      </div>
      {/* FIXED: Enhanced District Details Table */}
      {!loading && !error && districtData.length > 0 && (
        <Card className="overflow-hidden border-l-4 border-l-medical-500">
          <div className="p-4 border-b dark:border-gray-700 bg-medical-50 dark:bg-medical-900/20">
            <h2 className="text-xl font-semibold text-medical-800 dark:text-medical-200 flex items-center">
              <FiBarChart2 className="mr-2" />
              {t('locationStats.tableTitle')} ({districtData.length}{" "}
              {t('locationStats.districts')})
            </h2>
            <p className="text-sm text-medical-600 dark:text-medical-400 mt-1">
              {t('locationStats.basedOn')} {detectionData.length} {t('locationStats.totalDiagnosesText')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('locationStats.districtHeader')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('locationStats.totalCases')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('locationStats.positiveCases')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('locationStats.positiveRate')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('locationStats.riskLevel')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('locationStats.healthcareFacilities')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('locationStats.intensityLevel')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {districtData
                  .sort((a, b) => b.totalCases - a.totalCases)
                  .map((district, index) => (
                    <tr
                      key={district.id || index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        <div>
                          <div className="font-medium">{district.name}</div>
                          <div className="text-xs text-gray-500">
                            {district.province}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        <span className="font-semibold">
                          {district.totalCases}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        <span className="text-error-600 font-medium">
                          {district.positiveCases}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        <span
                          className={`font-medium ${
                            parseFloat(district.positiveRate) > 40
                              ? "text-error-600"
                              : parseFloat(district.positiveRate) > 20
                              ? "text-warning-600"
                              : "text-success-600"
                          }`}
                        >
                          {district.positiveRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: getCircleColor(
                                district.intensity
                              ),
                            }}
                          />
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              district.riskLevel === "critical"
                                ? "bg-error-100 text-error-800 dark:bg-error-900/50 dark:text-error-200"
                                : district.riskLevel === "high"
                                ? "bg-warning-100 text-warning-800 dark:bg-warning-900/50 dark:text-warning-200"
                                : district.riskLevel === "moderate"
                                ? "bg-accent-100 text-accent-800 dark:bg-accent-900/50 dark:text-accent-200"
                                : "bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-200"
                            }`}
                          >
                            {t(`locationStats.${district.riskLevel}`)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <FiHome className="mr-1 text-gray-400" size={12} />
                          <span className="font-medium">
                            {district.facilities.length}
                          </span>
                          {district.facilities.length > 0 && (
                            <div className="ml-2 text-xs text-gray-500">
                              {district.facilities.slice(0, 2).join(", ")}
                              {district.facilities.length > 2 &&
                                `, +${district.facilities.length - 2} ${t('locationStats.more')}`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <span className="text-xs font-medium mr-2">
                            {t('locationStats.level')} {district.intensity}
                          </span>
                          <span className="text-xs text-gray-500">
                            (
                            {INTENSITY_LEVELS[district.intensity - 1]?.name ||
                              t('locationStats.unknown')}
                            )
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* FIXED: Add summary footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                {t('locationStats.totalDistricts')}{" "}
                <strong className="text-gray-900 dark:text-gray-100">
                  {districtData.length}
                </strong>
              </span>
              <span>
                {t('locationStats.totalCases')}{" "}
                <strong className="text-gray-900 dark:text-gray-100">
                  {stats?.totalCases || 0}
                </strong>
              </span>
              <span>
                {t('locationStats.positiveCases')}{" "}
                <strong className="text-error-600">
                  {stats?.totalPositive || 0}
                </strong>
              </span>
              <span>
                {t('locationStats.healthcareFacilities')}{" "}
                <strong className="text-success-600">
                  {stats?.totalFacilities || 0}
                </strong>
              </span>
              <span>
                {t('locationStats.averagePositiveRate')}{" "}
                <strong className="text-accent-600">
                  {stats?.averagePositiveRate || 0}%
                </strong>
              </span>
            </div>
          </div>
        </Card>
      )}
      {/* Empty State */}
      {!loading && !error && districtData.length === 0 && (
        <Card className="p-8 text-center border-l-4 border-l-gray-300">
          <FiMapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {t('locationStats.emptyStateTitle')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('locationStats.emptyStateMessage')}
          </p>
          <button
            onClick={() => fetchLocationData()}
            className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
          >
            {t('locationStats.emptyStateRefreshButton')}
          </button>
        </Card>
      )}
    </motion.div>
  );
}