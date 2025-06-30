import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../contexts/I18nContext';
import { useLogger } from '../hooks/useLogger';
import { FiUploadCloud, FiCheckCircle, FiXCircle, FiInfo, FiRefreshCw, FiMapPin, FiUser, FiClock, FiImage, FiDatabase, FiBarChart } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LocationSelector from '../components/detection/LocationSelector';

export default function MalariaDetection() {
  const { t } = useI18n();
  const { logDetection, logInteraction, logError, logPerformance } = useLogger();

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [combinedData, setCombinedData] = useState(null);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    logInteraction('upload', 'image-file', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    setResult(null);
    setError(null);
    setCombinedData(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Please select a valid image file (JPEG or PNG)';
      setError(errorMsg);
      logError(new Error(errorMsg), 'Image validation', {
        fileName: file.name,
        fileType: file.type,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'File size exceeds 5MB limit';
      setError(errorMsg);
      logError(new Error(errorMsg), 'Image validation', {
        fileName: file.name,
        fileSize: file.size,
      });
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };


const handleLocationChange = (location) => {
  // Only proceed if we have a valid location object with all required fields
  if (!location || typeof location !== 'object') {
    return;
  }

 
  console.log('Location received in handleLocationChange:', location);

 
  const getLocationValue = (value) => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && value.name) return value.name;
    if (value && typeof value === 'object' && value.value) return value.value;
    return null;
  };

  const newProvince = getLocationValue(location.province);
  const newDistrict = getLocationValue(location.district);
  const newSector = getLocationValue(location.sector);
  // Handle both 'hospital' and 'facility' fields
  const newHospital = getLocationValue(location.hospital) || getLocationValue(location.facility);

  // Debug what we extracted
  console.log('Extracted values:', {
    province: newProvince,
    district: newDistrict,
    sector: newSector,
    hospital: newHospital,
    originalFacility: location.facility,
    originalHospital: location.hospital
  });

  // All fields including hospital/facility are required
  if (!newProvince || !newDistrict || !newSector || !newHospital) {
    // Don't reset existing location if new data is incomplete
    // Only log if we have some data but it's incomplete
    if (newProvince || newDistrict || newSector || newHospital) {
      console.warn('Incomplete location data received, keeping existing location:', {
        received: { province: newProvince, district: newDistrict, sector: newSector, hospital: newHospital },
        current: selectedLocation,
        missingFields: {
          province: !newProvince,
          district: !newDistrict,
          sector: !newSector,
          hospital: !newHospital
        }
      });
    }
    return;
  }

  // Create normalized location object - all fields are required
  const normalizedLocation = {
    province: newProvince,
    district: newDistrict,
    sector: newSector,
    hospital: newHospital // Hospital is now required, no fallback to null
  };

  // Prevent unnecessary updates if the location hasn't actually changed
  if (selectedLocation) {
    const currentProvince = getLocationValue(selectedLocation.province);
    const currentDistrict = getLocationValue(selectedLocation.district);
    const currentSector = getLocationValue(selectedLocation.sector);
    const currentHospital = getLocationValue(selectedLocation.hospital);

    if (
      currentProvince === newProvince &&
      currentDistrict === newDistrict &&
      currentSector === newSector &&
      currentHospital === newHospital
    ) {
      return; 
    }
  }

 
  setSelectedLocation(normalizedLocation);
  setLocationError(false);

  
  logInteraction('select', 'complete-location', {
    userId: '1750600866432',
    province: newProvince,
    district: newDistrict,
    sector: newSector,
    hospital: newHospital, 
  });
};

const handleAnalyze = async () => {
  if (!selectedImage) {
    setError('Please select an image first');
    return;
  }

  if (!selectedLocation) {
    setLocationError(true);
    setError('Please complete all location fields before analyzing the image');
    return;
  }

  const startTime = Date.now();
  setIsAnalyzing(true);
  setError(null);
  setLocationError(false);

  logInteraction('click', 'analyze-button', {
    fileName: selectedImage.name,
    fileSize: selectedImage.size,
    location: selectedLocation,
  });

  try {
    // Create FormData and append the file with the exact field name expected by backend
    const formData = new FormData();
    formData.append('file', selectedImage, selectedImage.name);
    
    // Log what we're sending
    console.log('Sending request with:', {
      fileName: selectedImage.name,
      fileSize: selectedImage.size,
      fileType: selectedImage.type,
      location: selectedLocation
    });

    // Verify FormData content
    for (let [key, value] of formData.entries()) {
      console.log('FormData entry:', key, value);
    }

    const response = await fetch('https://safecell-3.onrender.com/predict/', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it automatically with boundary
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = 'Failed to analyze the image';
      try {
        const errorData = await response.json();
        console.error('Backend error details:', errorData);
        
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const fieldErrors = errorData.detail.map(err => 
            `${err.loc.join('.')}: ${err.msg}`
          ).join(', ');
          errorMessage = `Validation error: ${fieldErrors}`;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        const errorText = await response.text();
        console.error('Backend error text:', errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const data = await response.json();
    console.log('Success response:', data);
    
    const processingTime = Date.now() - startTime;

    // Transform backend response to match frontend expectations
    const transformedResult = {
      result: data.result === 'Parasitized' ? 'positive' : 'negative',
      confidenceLevel: Math.round(data.confidence * 100), // Convert to percentage
      rawResult: data.result, // Keep original for debugging
      rawConfidence: data.confidence
    };

    // ENHANCED: Create comprehensive date/time data for backend processing
    const currentDate = new Date();
    const utcDate = new Date(currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000));
    
    const combinedResult = {
      // Basic identification
      element: "complete-location",
      userId: "1750600866432",
      
      // Location data
      province: selectedLocation.province,
      district: selectedLocation.district,
      sector: selectedLocation.sector,
      hospital: selectedLocation.hospital,
      
      // COMPREHENSIVE DATE/TIME FIELDS FOR BACKEND PROCESSING
      
      // Primary timestamps (ISO format for database storage)
      timestamp: currentDate.toISOString(), // 2025-06-28T14:30:45.123Z
      timestampUTC: utcDate.toISOString(), // UTC equivalent
      dateCreated: currentDate.toISOString(), // Explicit creation timestamp
      
      // Date components (for easy querying and filtering)
      predictionDate: currentDate.toISOString().split('T')[0], // 2025-06-28
      predictionTime: currentDate.toTimeString().split(' ')[0], // 14:30:45
      predictionDateTime: currentDate.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(',', ''), // 06/28/2025 14:30:45
      
      // Numeric timestamps (for calculations and comparisons)
      unixTimestamp: currentDate.getTime(), // 1719584245123
      unixTimestampSeconds: Math.floor(currentDate.getTime() / 1000), // 1719584245
      
      // Timezone information
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // America/New_York
      timezoneOffset: currentDate.getTimezoneOffset(), // -240 (minutes)
      timezoneOffsetHours: currentDate.getTimezoneOffset() / -60, // 4
      
      // Formatted date strings for different use cases
      dateFormatted: {
        // Various common formats for reporting/display
        iso: currentDate.toISOString().split('T')[0], // 2025-06-28
        us: currentDate.toLocaleDateString('en-US'), // 6/28/2025
        european: currentDate.toLocaleDateString('en-GB'), // 28/06/2025
        long: currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }), // Friday, June 28, 2025
        short: currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }), // Jun 28, 2025
        compact: currentDate.toISOString().split('T')[0].replace(/-/g, ''), // 20250628
        yearMonth: currentDate.toISOString().substring(0, 7), // 2025-06
        timeOnly: currentDate.toLocaleTimeString('en-US', { hour12: false }), // 14:30:45
        time12h: currentDate.toLocaleTimeString('en-US', { hour12: true }), // 2:30:45 PM
      },
      
      // Calendar components (useful for analytics and reporting)
      calendar: {
        year: currentDate.getFullYear(), // 2025
        month: currentDate.getMonth() + 1, // 6 (June)
        monthName: currentDate.toLocaleDateString('en-US', { month: 'long' }), // June
        monthNameShort: currentDate.toLocaleDateString('en-US', { month: 'short' }), // Jun
        day: currentDate.getDate(), // 28
        dayOfWeek: currentDate.getDay(), // 5 (Friday, 0=Sunday)
        dayOfWeekName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }), // Friday
        dayOfWeekNameShort: currentDate.toLocaleDateString('en-US', { weekday: 'short' }), // Fri
        quarter: Math.floor((currentDate.getMonth() + 3) / 3), // 2 (Q2)
        weekOfYear: Math.ceil((currentDate.getDate() + new Date(currentDate.getFullYear(), 0, 1).getDay()) / 7), // Approximate week number
        dayOfYear: Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / 86400000), // Day number in year
        hour: currentDate.getHours(), // 14
        minute: currentDate.getMinutes(), // 30
        second: currentDate.getSeconds(), // 45
        millisecond: currentDate.getMilliseconds(), // 123
      },
      
      // Session and processing metadata
      sessionData: {
        processingStartTime: startTime,
        processingEndTime: Date.now(),
        processingDuration: processingTime,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      
      // Prediction results with embedded timestamps
      predictionResults: {
        result: transformedResult.result,
        confidenceLevel: transformedResult.confidenceLevel,
        rawResult: transformedResult.rawResult,
        rawConfidence: transformedResult.rawConfidence,
        processingTime: processingTime,
        
        // Image metadata
        imageInfo: {
          fileName: selectedImage.name,
          fileSize: selectedImage.size,
          fileType: selectedImage.type,
          uploadTimestamp: currentDate.toISOString(),
        },
        
        // Analysis metadata
        analysisMetadata: {
          analysisTimestamp: currentDate.toISOString(),
          analysisDate: currentDate.toISOString().split('T')[0],
          analysisTime: currentDate.toTimeString().split(' ')[0],
          backendResponseTime: processingTime,
          frontendProcessingTime: Date.now() - startTime,
        }
      },
      
      // Additional fields for future analytics and reporting
      analytics: {
        // Useful for time-based analysis
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        isBusinessHours: currentDate.getHours() >= 9 && currentDate.getHours() < 17,
        timeOfDayCategory: (() => {
          const hour = currentDate.getHours();
          if (hour >= 6 && hour < 12) return 'morning';
          if (hour >= 12 && hour < 17) return 'afternoon';
          if (hour >= 17 && hour < 21) return 'evening';
          return 'night';
        })(),
        
        // Data versioning
        dataVersion: '1.0',
        schemaVersion: '2025.1',
        
        // Processing environment
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        
        // Location metadata
        locationString: `${selectedLocation.sector}, ${selectedLocation.district}, ${selectedLocation.province}`,
        locationHash: btoa(`${selectedLocation.province}-${selectedLocation.district}-${selectedLocation.sector}-${selectedLocation.hospital}`),
      }
    };

    // Log the comprehensive data structure
    console.log('Comprehensive Detection Data with Enhanced Date Fields:', combinedResult);
    console.log('Date fields summary:', {
      primaryTimestamp: combinedResult.timestamp,
      processingTime: combinedResult.sessionData.processingDuration,
      calendar: combinedResult.calendar,
      timezone: combinedResult.timezone
    });

    logDetection(transformedResult, {
      processingTime,
      imageSize: selectedImage.size,
      fileName: selectedImage.name,
      location: selectedLocation,
    });

    logPerformance('detection_processing_time', processingTime, {
      unit: 'ms',
      imageSize: selectedImage.size,
      location: selectedLocation,
    });

    setResult(transformedResult);
    setCombinedData(combinedResult);

    // Send comprehensive data to database - NOW WITH ALL ENHANCED DATE FIELDS
    try {
      const saveResponse = await fetch('https://safecell-3.onrender.com/detection-data/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(combinedResult), // Now includes comprehensive date/time data
      });

      if (!saveResponse.ok) {
        console.error('Failed to save detection data:', saveResponse.status);
        const errorText = await saveResponse.text();
        console.error('Save error details:', errorText);
        // Don't throw error here - we still want to show results even if save fails
      } else {
        console.log('Detection data with comprehensive timestamps saved successfully to database');
        const saveResult = await saveResponse.json();
        console.log('Save response:', saveResult);
      }
    } catch (saveError) {
      console.error('Error saving detection data to database:', saveError);
      // Don't throw error here - we still want to show results even if save fails
    }

  } catch (err) {
    console.error('Analysis error:', err);
    const errorMsg = err.message || 'An error occurred during analysis';
    setError(errorMsg);
    logError(err, 'Detection analysis', {
      fileName: selectedImage.name,
      fileSize: selectedImage.size,
      location: selectedLocation,
    });
  } finally {
    setIsAnalyzing(false);
  }
};
  const handleReset = () => {
    logInteraction('click', 'reset-button');
    setSelectedImage(null);
    setPreviewUrl(null);
    setSelectedLocation(null); 
    setResult(null);
    setError(null);
    setLocationError(false);
    setCombinedData(null);
    
   
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

 
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <div className="bg-gradient-to-r from-medical-600 to-primary-600 dark:from-medical-800 dark:to-primary-800 rounded-xl p-6 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <FiMapPin className="mr-3" />
            Detection Page
          </h1>
          <p className="mt-2 text-medical-100 dark:text-medical-200">
            AI-powered malaria detection system for healthcare professionals
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          <LocationSelector
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
            error={locationError}
            required={true}
          />

          <Card className="p-6 border-l-4 border-l-medical-500">
            <h3 className="text-lg font-medium mb-4 text-medical-800 dark:text-medical-200 flex items-center">
              <FiUploadCloud className="mr-2" />
              {previewUrl ? 'Selected Image' : 'Upload Blood Smear Image'}
            </h3>

            {!previewUrl ? (
              <div
                className="border-2 border-dashed border-medical-300 dark:border-medical-700 rounded-lg p-8 text-center cursor-pointer hover:border-medical-500 dark:hover:border-medical-400 transition-colors bg-medical-50 dark:bg-medical-900/20"
                onClick={() => document.getElementById('image-upload').click()}
              >
                <FiUploadCloud size={48} className="mx-auto text-medical-400 dark:text-medical-500" />
                <p className="mt-4 text-medical-600 dark:text-medical-400 font-medium">
                  {t('detection.dropzone') || 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-medical-500 dark:text-medical-500 mt-2">
                  Supported formats: JPEG, PNG (Max 5MB)
                </p>
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                />
                <Button
                  variant="primary"
                  className="mt-4 bg-medical-600 hover:bg-medical-700"
                  icon={<FiUploadCloud />}
                >
                  {t('detection.uploadButton') || 'Upload Image'}
                </Button>
              </div>
            ) : (
              <div>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-medical-200 dark:border-medical-700">
                  <img
                    src={previewUrl}
                    alt="Selected blood smear"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-medical-600 text-white px-2 py-1 rounded text-xs font-medium">
                    Ready for Analysis
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
<Button
  variant="primary"
  onClick={handleAnalyze}
  disabled={isAnalyzing || !selectedLocation || !selectedImage || result !== null}
  icon={isAnalyzing ? <FiRefreshCw className="animate-spin" /> : <FiMapPin />}
  className={`bg-medical-600 hover:bg-medical-700 disabled:bg-green-50 disabled:text-green-800 disabled:cursor-not-allowed`}
>
  {isAnalyzing ? (t('detection.analyzing') || 'Analyzing...') : 'Analyze Blood Smear'}
</Button>
                  <Button variant="outline" onClick={handleReset} disabled={isAnalyzing}>
                    Reset
                  </Button>
                </div>
                {error && (
                  <div className="mt-3 text-error-600 dark:text-error-400 text-sm bg-error-50 dark:bg-error-900/20 p-3 rounded-md border border-error-200 dark:border-error-800">
                    <div className="flex items-start">
                      <FiXCircle className="mr-2 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          {result ? (
            <div className="space-y-6">
              <Card className="p-6 border-l-4 border-l-medical-500">
                <h2 className="text-xl font-semibold mb-4 text-medical-800 dark:text-medical-200 flex items-center">
                  <FiCheckCircle className="mr-2" />
                  Malaria Detection Results
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-medical-200 dark:border-medical-700">
                    <img
                      src={previewUrl}
                      alt="Analyzed blood smear"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                      result.result === 'positive' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {result.result === 'positive' ? <FiXCircle className="mr-1" /> : <FiCheckCircle className="mr-1" />}
                      {result.result === 'positive'
                        ? 'POSITIVE - Malaria Detected'
                        : 'NEGATIVE - No Malaria Detected'}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Confidence Level:</strong> {result.confidenceLevel}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Location:</strong> {selectedLocation.sector}, {selectedLocation.district}, {selectedLocation.province}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Image:</strong> {selectedImage.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      <strong>Raw Result:</strong> {result.rawResult} (Confidence: {(result.rawConfidence * 100).toFixed(2)}%)
                    </p>
                    
                    {result.result === 'positive' && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                        <div className="flex items-start">
                          <FiInfo className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                          <div className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Recommendation:</strong> Please consult with a healthcare professional immediately for proper diagnosis and treatment.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Enhanced Combined Data Display */}
              {combinedData && (
                <Card className="p-6 border-l-4 border-l-blue-500">
                  <h3 className="text-lg font-semibold mb-6 text-blue-800 dark:text-blue-200 flex items-center">
                    <FiDatabase className="mr-2" />
                    Detection Summary & Details
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Location Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                        <FiMapPin className="mr-2" />
                        Location Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Province:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{combinedData.province}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">District:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{combinedData.district}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Sector:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{combinedData.sector}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                          <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{combinedData.userId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Prediction Results */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                        <FiBarChart className="mr-2" />
                        Analysis Results
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Result:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            combinedData.predictionResults.result === 'positive'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {combinedData.predictionResults.result.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{combinedData.predictionResults.confidenceLevel}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Processing Time:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{combinedData.predictionResults.processingTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Raw Result:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{combinedData.predictionResults.rawResult}</span>
                        </div>
                      </div>
                    </div>

                    {/* Image Information */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center">
                        <FiImage className="mr-2" />
                        Image Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">File Name:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-32" title={combinedData.predictionResults.imageInfo.fileName}>
                            {combinedData.predictionResults.imageInfo.fileName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">File Size:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatFileSize(combinedData.predictionResults.imageInfo.fileSize)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">File Type:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{combinedData.predictionResults.imageInfo.fileType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center">
                        <FiClock className="mr-2" />
                        Timestamp Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-600 dark:text-gray-400 mb-1">Analysis Completed:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatTimestamp(combinedData.predictionResults.timestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Element Type:</span>
                          <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{combinedData.element}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details Toggle */}
                  <div className="mt-6">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <FiInfo className="mr-2" />
                          Technical Details (JSON)
                        </span>
                        <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-3 bg-gray-900 dark:bg-gray-950 rounded-lg p-4 font-mono text-sm overflow-x-auto border">
                        <pre className="text-green-400 whitespace-pre-wrap">
                          {JSON.stringify(combinedData, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-6 border-l-4 border-l-gray-300 dark:border-l-gray-600">
              <div className="text-center py-12">
                <FiUploadCloud size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Ready for Analysis
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Upload a blood smear image and select your location to begin malaria detection analysis.
                </p>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}