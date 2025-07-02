import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../../contexts/I18nContext';
import { useLogger } from '../../hooks/useLogger';
import Card from '../ui/Card';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { FiMapPin, FiAlertCircle, FiUser, FiHome } from 'react-icons/fi';
import {
  getProvinces,
  getDistricts,
  getSectors,
  getHealthFacilities,
  getLocationDetails,
} from '../../services/rwandaLocations';

export default function LocationSelector({
  selectedLocation,
  onLocationChange,
  error,
  required = true,
}) {
  const { t } = useI18n();
  const { logInteraction } = useLogger();

  const [provinces] = useState(getProvinces());
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [healthFacilities, setHealthFacilities] = useState([]);
  const [locationData, setLocationData] = useState({
    province: '',
    district: '',
    sector: '',
    facility: '',
    patientId: '',
  });
  const [patientIdError, setPatientIdError] = useState(false);

  // Initialize with selected location if provided
  useEffect(() => {
    if (selectedLocation) {
      console.log('Initializing with selectedLocation:', selectedLocation);
      
      // Extract IDs from the selected location object
      const provinceId = selectedLocation.province?.id || selectedLocation.province;
      const districtId = selectedLocation.district?.id || selectedLocation.district;
      const sectorId = selectedLocation.sector?.id || selectedLocation.sector;
      const facilityId = selectedLocation.facility?.id || selectedLocation.facility;
      const patientId = selectedLocation.patientId || '';

      setLocationData({
        province: provinceId,
        district: districtId,
        sector: sectorId,
        facility: facilityId,
        patientId: patientId,
      });

      // Set up dependent dropdowns
      if (provinceId) {
        const districtOptions = getDistricts(provinceId);
        setDistricts(districtOptions);
        
        if (districtId) {
          const sectorOptions = getSectors(provinceId, districtId);
          setSectors(sectorOptions);
          
          const facilityOptions = getHealthFacilities(provinceId, districtId);
          setHealthFacilities(facilityOptions);
        }
      }
    }
  }, [selectedLocation]);

  // Update districts when province changes - NO RESET OF OTHER FIELDS
  useEffect(() => {
    if (locationData.province) {
      const districtOptions = getDistricts(locationData.province);
      setDistricts(districtOptions);
      console.log('Updated districts for province:', locationData.province, districtOptions);
    } else {
      setDistricts([]);
    }
  }, [locationData.province]);

  // Update sectors and health facilities when district changes - NO RESET OF OTHER FIELDS
  useEffect(() => {
    if (locationData.province && locationData.district) {
      const sectorOptions = getSectors(locationData.province, locationData.district);
      setSectors(sectorOptions);

      const facilityOptions = getHealthFacilities(locationData.province, locationData.district);
      setHealthFacilities(facilityOptions);
      
      console.log('Updated sectors and facilities for district:', locationData.district, {
        sectors: sectorOptions,
        facilities: facilityOptions
      });
    } else {
      setSectors([]);
      setHealthFacilities([]);
    }
  }, [locationData.province, locationData.district]);

  // Notify parent component when location is complete
  useEffect(() => {
    if (
      locationData.province &&
      locationData.district &&
      locationData.sector &&
      locationData.facility &&
      locationData.patientId.length >= 5
    ) {
      const details = getLocationDetails(
        locationData.province,
        locationData.district,
        locationData.sector,
        locationData.facility
      );

      if (details) {
        const completeLocation = {
          ...details,
          patientId: locationData.patientId.trim(),
        };

        console.log('Sending complete location to parent:', completeLocation);
        onLocationChange(completeLocation);

        // Log location selection
        logInteraction('select', 'complete-location', {
          province: details.province.name,
          district: details.district.name,
          sector: details.sector.name,
          facility: details.facility.name,
          hasPatientId: !!locationData.patientId.trim(),
        });
      }
    } else {
      onLocationChange(null);
    }
  }, [locationData, onLocationChange, logInteraction]);

  const handleLocationChange = (field, value) => {
    console.log(`User selected ${field}:`, value);
    
    // Simply update the field - NO AUTOMATIC RESETS
    setLocationData((prev) => {
      const newData = { ...prev, [field]: value };
      console.log('Updated location data:', newData);
      return newData;
    });
  };

  const validatePatientId = (id) => {
    if (!id || id.length < 5) {
      setPatientIdError(true);
    } else {
      setPatientIdError(false);
    }
  };

  const isComplete =
    locationData.province &&
    locationData.district &&
    locationData.sector &&
    locationData.facility &&
    locationData.patientId.length >= 5;

  return (
    <Card className="p-6 border-l-4 border-l-medical-500">
      <div className="flex items-center mb-4">
        <FiMapPin
          className="text-medical-600 dark:text-medical-400 mr-2"
          size={20}
        />
        <h3 className="text-lg font-medium text-medical-800 dark:text-medical-200">
          Diagnosis Location {required && <span className="text-error-500">*</span>}
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Please provide complete location details and healthcare facility
        information for accurate regional data collection and mapping.
      </p>

      <div className="space-y-4">
        {/* Patient ID - Required */}
        <div className="bg-medical-50 dark:bg-medical-900/20 p-4 rounded-lg border border-medical-200 dark:border-medical-800">
          <div className="flex items-center mb-2">
            <FiUser
              className="text-medical-600 dark:text-medical-400 mr-2"
              size={16}
            />
            <h4 className="text-sm font-medium text-medical-700 dark:text-medical-300">
              Patient Information
            </h4>
          </div>
          <Input
            label="Patient ID (Required)"
            type="number"
            value={locationData.patientId}
            onChange={(e) => {
              handleLocationChange('patientId', e.target.value);
              validatePatientId(e.target.value);
            }}
            placeholder="Enter Patient ID (at least 5 digits)"
            className="bg-white dark:bg-gray-700"
            error={patientIdError ? 'Patient ID must be at least 5 digits' : ''}
          />
          <p className="text-xs text-medical-600 dark:text-medical-400 mt-1">
            Patient ID is required and must be at least 5 digits.
          </p>
        </div>

        {/* Administrative Location */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center mb-3">
            <FiMapPin
              className="text-blue-600 dark:text-blue-400 mr-2"
              size={16}
            />
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Administrative Location
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label={t('statistics.province')}
              value={locationData.province}
              onChange={(e) => handleLocationChange('province', e.target.value)}
              options={[
                { value: '', label: 'Select Province' },
                ...provinces,
              ]}
              required={required}
              error={
                error && !locationData.province ? 'Province is required' : ''
              }
            />

            <Select
              label={t('statistics.district')}
              value={locationData.district}
              onChange={(e) => handleLocationChange('district', e.target.value)}
              options={[
                {
                  value: '',
                  label: locationData.province
                    ? 'Select District'
                    : 'Select Province First',
                },
                ...districts,
              ]}
              disabled={!locationData.province}
              required={required}
              error={
                error && locationData.province && !locationData.district
                  ? 'District is required'
                  : ''
              }
            />

            <Select
              label={t('statistics.sector')}
              value={locationData.sector}
              onChange={(e) => handleLocationChange('sector', e.target.value)}
              options={[
                {
                  value: '',
                  label: locationData.district
                    ? 'Select Sector'
                    : 'Select District First',
                },
                ...sectors,
              ]}
              disabled={!locationData.district}
              required={required}
              error={
                error && locationData.district && !locationData.sector
                  ? 'Sector is required'
                  : ''
              }
            />
          </div>
        </div>

        {/* Healthcare Facility */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center mb-3">
            <FiHome
              className="text-green-600 dark:text-green-400 mr-2"
              size={16}
            />
            <h4 className="text-sm font-medium text-green-700 dark:text-green-300">
              Healthcare Facility
            </h4>
          </div>

          <Select
            label="Hospital/Clinic/Health Center"
            value={locationData.facility}
            onChange={(e) => handleLocationChange('facility', e.target.value)}
            options={[
              {
                value: '',
                label: locationData.district
                  ? 'Select Healthcare Facility'
                  : 'Select District First',
              },
              ...healthFacilities,
            ]}
            disabled={!locationData.district}
            required={required}
            error={
              error && locationData.district && !locationData.facility
                ? 'Healthcare facility is required'
                : ''
            }
          />
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Select the hospital, clinic, or health center where the diagnosis is
            being performed.
          </p>
        </div>
      </div>

      {error && !isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-md"
        >
          <div className="flex items-start">
            <FiAlertCircle className="text-error-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-error-700 dark:text-error-300 font-medium">
                Complete Location Required
              </p>
              <p className="text-sm text-error-600 dark:text-error-400 mt-1">
                Please select your complete location (Province, District,
                Sector, and Healthcare Facility) before proceeding with the
                diagnosis.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-md"
        >
          <div className="flex items-start">
            <FiMapPin className="text-success-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-success-700 dark:text-success-300 font-medium">
                Location Complete
              </p>
              <div className="text-sm text-success-600 dark:text-success-400 mt-1">
                <p>
                  <strong>Location:</strong> {selectedLocation?.sector.name},{' '}
                  {selectedLocation?.district.name},{' '}
                  {selectedLocation?.province.name}
                </p>
                <p>
                  <strong>Facility:</strong> {selectedLocation?.facility?.name}
                </p>
                {selectedLocation?.patientId && (
                  <p>
                    <strong>Patient ID:</strong> {selectedLocation.patientId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}