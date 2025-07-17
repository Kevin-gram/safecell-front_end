/**
 * Rwanda Administrative Divisions Service
 * Provides access to provinces, districts, and sectors data with healthcare facilities
 */

// Rwanda administrative data with healthcare facilities
const RWANDA_LOCATIONS = {
  provinces: [
    {
      id: 'kigali',
      name: 'Kigali City',
      districts: [
        {
          id: 'gasabo',
          name: 'Gasabo',
          coordinates: { lat: -1.9403, lng: 30.0615 },
          healthFacilities: [
            { id: 'kigali_hospital', name: 'Kigali University Teaching Hospital (CHUK)', type: 'hospital' },
            { id: 'king_faisal', name: 'King Faisal Hospital', type: 'hospital' },
            { id: 'gasabo_hc', name: 'Gasabo Health Center', type: 'health_center' },
            { id: 'kimisagara_hc', name: 'Kimisagara Health Center', type: 'health_center' },
            { id: 'remera_clinic', name: 'Remera Medical Clinic', type: 'clinic' }
          ],
          sectors: [
            { id: 'bumbogo', name: 'Bumbogo' },
            { id: 'gatsata', name: 'Gatsata' },
            { id: 'gikomero', name: 'Gikomero' },
            { id: 'gisozi', name: 'Gisozi' },
            { id: 'jabana', name: 'Jabana' },
            { id: 'jali', name: 'Jali' },
            { id: 'kacyiru', name: 'Kacyiru' },
            { id: 'kimihurura', name: 'Kimihurura' },
            { id: 'kimisagara', name: 'Kimisagara' },
            { id: 'kinyinya', name: 'Kinyinya' },
            { id: 'ndera', name: 'Ndera' },
            { id: 'nduba', name: 'Nduba' },
            { id: 'remera', name: 'Remera' },
            { id: 'rusororo', name: 'Rusororo' },
            { id: 'rutunga', name: 'Rutunga' }
          ]
        },
        {
          id: 'kicukiro',
          name: 'Kicukiro',
          coordinates: { lat: -1.9659, lng: 30.1032 },
          healthFacilities: [
            { id: 'kanombe_hospital', name: 'Kanombe Military Hospital', type: 'hospital' },
            { id: 'kicukiro_hc', name: 'Kicukiro Health Center', type: 'health_center' },
            { id: 'gatenga_clinic', name: 'Gatenga Medical Clinic', type: 'clinic' },
            { id: 'nyarugunga_hc', name: 'Nyarugunga Health Center', type: 'health_center' }
          ],
          sectors: [
            { id: 'gahanga', name: 'Gahanga' },
            { id: 'gatenga', name: 'Gatenga' },
            { id: 'gikondo', name: 'Gikondo' },
            { id: 'kagarama', name: 'Kagarama' },
            { id: 'kanombe', name: 'Kanombe' },
            { id: 'kicukiro', name: 'Kicukiro' },
            { id: 'masaka', name: 'Masaka' },
            { id: 'niboye', name: 'Niboye' },
            { id: 'nyarugunga', name: 'Nyarugunga' },
          ]
        },
        {
          id: 'nyarugenge',
          name: 'Nyarugenge',
          coordinates: { lat: -1.9441, lng: 30.0619 },
          healthFacilities: [
            { id: 'central_hospital', name: 'Central Hospital of Kigali (CHK)', type: 'hospital' },
            { id: 'muhima_hospital', name: 'Muhima District Hospital', type: 'hospital' },
            { id: 'nyamirambo_hc', name: 'Nyamirambo Health Center', type: 'health_center' },
            { id: 'kigali_clinic', name: 'Kigali Medical Clinic', type: 'clinic' }
          ],
          sectors: [
            { id: 'gitega', name: 'Gitega' },
            { id: 'kanyinya', name: 'Kanyinya' },
            { id: 'kigali', name: 'Kigali' },
            { id: 'kimisagara', name: 'Kimisagara' },
            { id: 'mageragere', name: 'Mageragere' },
            { id: 'muhima', name: 'Muhima' },
            { id: 'nyakabanda', name: 'Nyakabanda' },
            { id: 'nyamirambo', name: 'Nyamirambo' },
            { id: 'nyarugenge', name: 'Nyarugenge' },
            { id: 'rwezamenyo', name: 'Rwezamenyo' }
          ]
        }
      ]
    },
    {
      id: 'eastern',
      name: 'Eastern Province',
      districts: [
        {
          id: 'bugesera',
          name: 'Bugesera',
          coordinates: { lat: -2.2167, lng: 30.2833 },
          healthFacilities: [
            { id: 'nyamata_hospital', name: 'Nyamata District Hospital', type: 'hospital' },
            { id: 'bugesera_hc', name: 'Bugesera Health Center', type: 'health_center' },
            { id: 'rilima_clinic', name: 'Rilima Medical Clinic', type: 'clinic' }
          ],
          sectors: [
            { id: 'gashora', name: 'Gashora' },
            { id: 'juru', name: 'Juru' },
            { id: 'kamabuye', name: 'Kamabuye' },
            { id: 'ntarama', name: 'Ntarama' },
            { id: 'nyamata', name: 'Nyamata' },
            { id: 'nyarugenge', name: 'Nyarugenge' },
            { id: 'rilima', name: 'Rilima' },
            { id: 'ruhuha', name: 'Ruhuha' },
            { id: 'rweru', name: 'Rweru' }
          ]
        },
        {
          id: 'nyagatare',
          name: 'Nyagatare',
          coordinates: { lat: -1.2938, lng: 30.3275 },
          healthFacilities: [
            { id: 'nyagatare_hospital', name: 'Nyagatare District Hospital', type: 'hospital' },
            { id: 'matimba_hc', name: 'Matimba Health Center', type: 'health_center' },
            { id: 'gatunda_clinic', name: 'Gatunda Border Clinic', type: 'clinic' }
          ],
          sectors: [
            { id: 'gatunda', name: 'Gatunda' },
            { id: 'karangazi', name: 'Karangazi' },
            { id: 'katabagemu', name: 'Katabagemu' },
            { id: 'kiyombe', name: 'Kiyombe' },
            { id: 'matimba', name: 'Matimba' },
            { id: 'mimuli', name: 'Mimuli' },
            { id: 'mukama', name: 'Mukama' },
            { id: 'musheri', name: 'Musheri' },
            { id: 'nyagatare', name: 'Nyagatare' },
            { id: 'rukomo', name: 'Rukomo' },
            { id: 'rwimiyaga', name: 'Rwimiyaga' },
            { id: 'tabagwe', name: 'Tabagwe' }
          ]
        },
        {
          id: 'gatsibo',
          name: 'Gatsibo',
          coordinates: { lat: -1.5833, lng: 30.4167 },
          healthFacilities: [
            { id: 'gatsibo_hospital', name: 'Gatsibo District Hospital', type: 'hospital' },
            { id: 'kabarore_hc', name: 'Kabarore Health Center', type: 'health_center' },
            { id: 'muhura_clinic', name: 'Muhura Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'gatsibo', name: 'Gatsibo' },
            { id: 'gitoki', name: 'Gitoki' },
            { id: 'kabarore', name: 'Kabarore' },
            { id: 'kageyo', name: 'Kageyo' },
            { id: 'kiramuruzi', name: 'Kiramuruzi' },
            { id: 'kiziguro', name: 'Kiziguro' },
            { id: 'muhura', name: 'Muhura' },
            { id: 'murambi', name: 'Murambi' },
            { id: 'ngarama', name: 'Ngarama' },
            { id: 'nyagihanga', name: 'Nyagihanga' },
            { id: 'remera', name: 'Remera' },
            { id: 'rugarama', name: 'Rugarama' },
            { id: 'rwimbogo', name: 'Rwimbogo' }
          ]
        },
        {
          id: 'kayonza',
          name: 'Kayonza',
          coordinates: { lat: -1.8833, lng: 30.6167 },
          healthFacilities: [
            { id: 'kayonza_hospital', name: 'Kayonza District Hospital', type: 'hospital' },
            { id: 'rwinkwavu_hc', name: 'Rwinkwavu Health Center', type: 'health_center' },
            { id: 'gahini_clinic', name: 'Gahini Medical Clinic', type: 'clinic' }
          ],
          sectors: [
            { id: 'gahini', name: 'Gahini' },
            { id: 'kabare', name: 'Kabare' },
            { id: 'mukarange', name: 'Mukarange' },
            { id: 'murama', name: 'Murama' },
            { id: 'murundi', name: 'Murundi' },
            { id: 'ndego', name: 'Ndego' },
            { id: 'nyamirama', name: 'Nyamirama' },
            { id: 'rukara', name: 'Rukara' },
            { id: 'ruramira', name: 'Ruramira' },
            { id: 'rwinkwavu', name: 'Rwinkwavu' }
          ]
        },
        {
          id: 'kirehe',
          name: 'Kirehe',
          coordinates: { lat: -2.2167, lng: 30.7833 },
          healthFacilities: [
            { id: 'kirehe_hospital', name: 'Kirehe District Hospital', type: 'hospital' },
            { id: 'mpanga_hc', name: 'Mpanga Health Center', type: 'health_center' },
            { id: 'nasho_clinic', name: 'Nasho Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'gatore', name: 'Gatore' },
            { id: 'jarama', name: 'Jarama' },
            { id: 'kigarama', name: 'Kigarama' },
            { id: 'kirehe', name: 'Kirehe' },
            { id: 'mahama', name: 'Mahama' },
            { id: 'mpanga', name: 'Mpanga' },
            { id: 'mushikiri', name: 'Mushikiri' },
            { id: 'nasho', name: 'Nasho' },
            { id: 'nyamugari', name: 'Nyamugari' },
            { id: 'nyarubuye', name: 'Nyarubuye' }
          ]
        },
        {
          id: 'ngoma',
          name: 'Ngoma',
          coordinates: { lat: -2.1500, lng: 30.5833 },
          healthFacilities: [
            { id: 'ngoma_hospital', name: 'Ngoma District Hospital', type: 'hospital' },
            { id: 'kibungo_hc', name: 'Kibungo Health Center', type: 'health_center' },
            { id: 'zaza_clinic', name: 'Zaza Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'gashanda', name: 'Gashanda' },
            { id: 'jarama', name: 'Jarama' },
            { id: 'karembo', name: 'Karembo' },
            { id: 'kibungo', name: 'Kibungo' },
            { id: 'mugesera', name: 'Mugesera' },
            { id: 'murama', name: 'Murama' },
            { id: 'remera', name: 'Remera' },
            { id: 'rukira', name: 'Rukira' },
            { id: 'rukumberi', name: 'Rukumberi' },
            { id: 'sake', name: 'Sake' },
            { id: 'zaza', name: 'Zaza' }
          ]
        },
        {
          id: 'rwamagana',
          name: 'Rwamagana',
          coordinates: { lat: -1.9500, lng: 30.4333 },
          healthFacilities: [
            { id: 'rwamagana_hospital', name: 'Rwamagana District Hospital', type: 'hospital' },
            { id: 'fumbwe_hc', name: 'Fumbwe Health Center', type: 'health_center' },
            { id: 'kigabiro_clinic', name: 'Kigabiro Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'fumbwe', name: 'Fumbwe' },
            { id: 'gahengeri', name: 'Gahengeri' },
            { id: 'gishari', name: 'Gishari' },
            { id: 'karenge', name: 'Karenge' },
            { id: 'kigabiro', name: 'Kigabiro' },
            { id: 'muhazi', name: 'Muhazi' },
            { id: 'munyaga', name: 'Munyaga' },
            { id: 'munyiginya', name: 'Munyiginya' },
            { id: 'musha', name: 'Musha' },
            { id: 'nzige', name: 'Nzige' },
            { id: 'nyakariro', name: 'Nyakariro' },
            { id: 'rubona', name: 'Rubona' },
            { id: 'rurenge', name: 'Rurenge' },
            { id: 'rwamagana', name: 'Rwamagana' }
          ]
        }
      ]
    },
    {
      id: 'northern',
      name: 'Northern Province',
      districts: [
        {
          id: 'musanze',
          name: 'Musanze',
          coordinates: { lat: -1.4995, lng: 29.6335 },
          healthFacilities: [
            { id: 'ruhengeri_hospital', name: 'Ruhengeri Referral Hospital', type: 'hospital' },
            { id: 'musanze_hc', name: 'Musanze Health Center', type: 'health_center' },
            { id: 'kinigi_clinic', name: 'Kinigi Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'busogo', name: 'Busogo' },
            { id: 'cyuve', name: 'Cyuve' },
            { id: 'gacaca', name: 'Gacaca' },
            { id: 'gashaki', name: 'Gashaki' },
            { id: 'gataraga', name: 'Gataraga' },
            { id: 'kimonyi', name: 'Kimonyi' },
            { id: 'kinigi', name: 'Kinigi' },
            { id: 'muhoza', name: 'Muhoza' },
            { id: 'muko', name: 'Muko' },
            { id: 'musanze', name: 'Musanze' },
            { id: 'nkotsi', name: 'Nkotsi' },
            { id: 'nyange', name: 'Nyange' },
            { id: 'remera', name: 'Remera' },
            { id: 'rwaza', name: 'Rwaza' },
            { id: 'shingiro', name: 'Shingiro' }
          ]
        },
        {
          id: 'burera',
          name: 'Burera',
          coordinates: { lat: -1.4667, lng: 29.8833 },
          healthFacilities: [
            { id: 'butaro_hospital', name: 'Butaro Cancer Center of Excellence', type: 'hospital' },
            { id: 'burera_hc', name: 'Burera Health Center', type: 'health_center' },
            { id: 'cyanika_clinic', name: 'Cyanika Border Clinic', type: 'clinic' }
          ],
          sectors: [
            { id: 'bungwe', name: 'Bungwe' },
            { id: 'butaro', name: 'Butaro' },
            { id: 'cyanika', name: 'Cyanika' },
            { id: 'cyeru', name: 'Cyeru' },
            { id: 'gahunga', name: 'Gahunga' },
            { id: 'gatebe', name: 'Gatebe' },
            { id: 'gitovu', name: 'Gitovu' },
            { id: 'kagogo', name: 'Kagogo' },
            { id: 'kinoni', name: 'Kinoni' },
            { id: 'kinyababa', name: 'Kinyababa' },
            { id: 'kivuye', name: 'Kivuye' },
            { id: 'nemba', name: 'Nemba' },
            { id: 'rugarama', name: 'Rugarama' },
            { id: 'rugendabari', name: 'Rugendabari' },
            { id: 'ruhunde', name: 'Ruhunde' },
            { id: 'rusarabuye', name: 'Rusarabuye' },
            { id: 'rwerere', name: 'Rwerere' }
          ]
        },
        {
          id: 'gakenke',
          name: 'Gakenke',
          coordinates: { lat: -1.6833, lng: 29.7833 },
          healthFacilities: [
            { id: 'gakenke_hospital', name: 'Gakenke District Hospital', type: 'hospital' },
            { id: 'kivuruga_hc', name: 'Kivuruga Health Center', type: 'health_center' },
            { id: 'mugunga_clinic', name: 'Mugunga Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'busengo', name: 'Busengo' },
            { id: 'coko', name: 'Coko' },
            { id: 'cyabingo', name: 'Cyabingo' },
            { id: 'gakenke', name: 'Gakenke' },
            { id: 'gashenyi', name: 'Gashenyi' },
            { id: 'mugunga', name: 'Mugunga' },
            { id: 'janja', name: 'Janja' },
            { id: 'kamubuga', name: 'Kamubuga' },
            { id: 'karambo', name: 'Karambo' },
            { id: 'kivuruga', name: 'Kivuruga' },
            { id: 'mataba', name: 'Mataba' },
            { id: 'minazi', name: 'Minazi' },
            { id: 'muhondo', name: 'Muhondo' },
            { id: 'muyongwe', name: 'Muyongwe' },
            { id: 'muzo', name: 'Muzo' },
            { id: 'nemba', name: 'Nemba' },
            { id: 'ruli', name: 'Ruli' },
            { id: 'rusasa', name: 'Rusasa' },
            { id: 'rushashi', name: 'Rushashi' }
          ]
        },
        {
          id: 'rulindo',
          name: 'Rulindo',
          coordinates: { lat: -1.7667, lng: 30.0667 },
          healthFacilities: [
            { id: 'rulindo_hospital', name: 'Rulindo District Hospital', type: 'hospital' },
            { id: 'base_hc', name: 'Base Health Center', type: 'health_center' },
            { id: 'kinihira_clinic', name: 'Kinihira Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'base', name: 'Base' },
            { id: 'burega', name: 'Burega' },
            { id: 'bushoki', name: 'Bushoki' },
            { id: 'cyinzuzi', name: 'Cyinzuzi' },
            { id: 'cyungo', name: 'Cyungo' },
            { id: 'kinihira', name: 'Kinihira' },
            { id: 'kisaro', name: 'Kisaro' },
            { id: 'mbogo', name: 'Mbogo' },
            { id: 'murambi', name: 'Murambi' },
            { id: 'ngoma', name: 'Ngoma' },
            { id: 'ntarabana', name: 'Ntarabana' },
            { id: 'rukozo', name: 'Rukozo' },
            { id: 'rusiga', name: 'Rusiga' },
            { id: 'shyorongi', name: 'Shyorongi' },
            { id: 'tumba', name: 'Tumba' }
          ]
        },
        {
          id: 'gicumbi',
          name: 'Gicumbi',
          coordinates: { lat: -1.5500, lng: 30.1833 },
          healthFacilities: [
            { id: 'gicumbi_hospital', name: 'Gicumbi District Hospital', type: 'hospital' },
            { id: 'byumba_hc', name: 'Byumba Health Center', type: 'health_center' },
            { id: 'miyove_clinic', name: 'Miyove Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'bukure', name: 'Bukure' },
            { id: 'bwisige', name: 'Bwisige' },
            { id: 'byumba', name: 'Byumba' },
            { id: 'cyumba', name: 'Cyumba' },
            { id: 'gicumbi', name: 'Gicumbi' },
            { id: 'kaniga', name: 'Kaniga' },
            { id: 'manyagiro', name: 'Manyagiro' },
            { id: 'miyove', name: 'Miyove' },
            { id: 'mukure', name: 'Mukure' },
            { id: 'mutete', name: 'Mutete' },
            { id: 'nyamiyaga', name: 'Nyamiyaga' },
            { id: 'nyankenke', name: 'Nyankenke' },
            { id: 'rubaya', name: 'Rubaya' },
            { id: 'rukomo', name: 'Rukomo' },
            { id: 'rushaki', name: 'Rushaki' },
            { id: 'rutare', name: 'Rutare' },
            { id: 'ruvune', name: 'Ruvune' },
            { id: 'rwamiko', name: 'Rwamiko' },
            { id: 'shangasha', name: 'Shangasha' }
          ]
        }
      ]
    },
    {
      id: 'southern',
      name: 'Southern Province',
      districts: [
        {
          id: 'huye',
          name: 'Huye',
          coordinates: { lat: -2.6399, lng: 29.7406 },
          healthFacilities: [
            { id: 'butare_hospital', name: 'Butare University Teaching Hospital (CHUB)', type: 'hospital' },
            { id: 'huye_hc', name: 'Huye Health Center', type: 'health_center' },
            { id: 'tumba_clinic', name: 'Tumba College Clinic', type: 'clinic' }
          ],
          sectors: [
            { id: 'gishamvu', name: 'Gishamvu' },
            { id: 'karama', name: 'Karama' },
            { id: 'kigoma', name: 'Kigoma' },
            { id: 'kinazi', name: 'Kinazi' },
            { id: 'maraba', name: 'Maraba' },
            { id: 'mbazi', name: 'Mbazi' },
            { id: 'mukura', name: 'Mukura' },
            { id: 'ngoma', name: 'Ngoma' },
            { id: 'ruhashya', name: 'Ruhashya' },
            { id: 'rusatira', name: 'Rusatira' },
            { id: 'rwaniro', name: 'Rwaniro' },
            { id: 'simbi', name: 'Simbi' },
            { id: 'tumba', name: 'Tumba' }
          ]
        },
        {
          id: 'nyanza',
          name: 'Nyanza',
          coordinates: { lat: -2.3500, lng: 29.7500 },
          healthFacilities: [
            { id: 'nyanza_hospital', name: 'Nyanza District Hospital', type: 'hospital' },
            { id: 'busoro_hc', name: 'Busoro Health Center', type: 'health_center' },
            { id: 'mukingo_clinic', name: 'Mukingo Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'busasamana', name: 'Busasamana' },
            { id: 'busoro', name: 'Busoro' },
            { id: 'cyabakamyi', name: 'Cyabakamyi' },
            { id: 'kibirizi', name: 'Kibirizi' },
            { id: 'kigoma', name: 'Kigoma' },
            { id: 'mukingo', name: 'Mukingo' },
            { id: 'muyira', name: 'Muyira' },
            { id: 'ntyazo', name: 'Ntyazo' },
            { id: 'nyagisozi', name: 'Nyagisozi' },
            { id: 'rwabicuma', name: 'Rwabicuma' }
          ]
        },
        {
          id: 'gisagara',
          name: 'Gisagara',
          coordinates: { lat: -2.5500, lng: 29.8500 },
          healthFacilities: [
            { id: 'gisagara_hospital', name: 'Gisagara District Hospital', type: 'hospital' },
            { id: 'save_hc', name: 'Save Health Center', type: 'health_center' },
            { id: 'mugombwa_clinic', name: 'Mugombwa Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'gishubi', name: 'Gishubi' },
            { id: 'kansi', name: 'Kansi' },
            { id: 'kibirizi', name: 'Kibirizi' },
            { id: 'kigembe', name: 'Kigembe' },
            { id: 'muganza', name: 'Muganza' },
            { id: 'mugombwa', name: 'Mugombwa' },
            { id: 'mukindo', name: 'Mukindo' },
            { id: 'ndora', name: 'Ndora' },
            { id: 'nyanza', name: 'Nyanza' },
            { id: 'rweru', name: 'Rweru' },
            { id: 'save', name: 'Save' }
          ]
        },
        {
          id: 'nyaruguru',
          name: 'Nyaruguru',
          coordinates: { lat: -2.7000, lng: 29.5500 },
          healthFacilities: [
            { id: 'nyaruguru_hospital', name: 'Nyaruguru District Hospital', type: 'hospital' },
            { id: 'kibeho_hc', name: 'Kibeho Health Center', type: 'health_center' },
            { id: 'munini_clinic', name: 'Munini Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'busanze', name: 'Busanze' },
            { id: 'cyahinda', name: 'Cyahinda' },
            { id: 'kibeho', name: 'Kibeho' },
            { id: 'kibumbwe', name: 'Kibumbwe' },
            { id: 'kivu', name: 'Kivu' },
            { id: 'mata', name: 'Mata' },
            { id: 'munini', name: 'Munini' },
            { id: 'ngera', name: 'Ngera' },
            { id: 'ngoma', name: 'Ngoma' },
            { id: 'nyabimata', name: 'Nyabimata' },
            { id: 'ruramba', name: 'Ruramba' },
            { id: 'rusenge', name: 'Rusenge' },
            { id: 'ryamanyonza', name: 'Ryamanyonza' }
          ]
        },
        {
          id: 'nyamagabe',
          name: 'Nyamagabe',
          coordinates: { lat: -2.5167, lng: 29.4167 },
          healthFacilities: [
            { id: 'nyamagabe_hospital', name: 'Nyamagabe District Hospital', type: 'hospital' },
            { id: 'gasaka_hc', name: 'Gasaka Health Center', type: 'health_center' },
            { id: 'mushubi_clinic', name: 'Mushubi Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'buruhukiro', name: 'Buruhukiro' },
            { id: 'cyanika', name: 'Cyanika' },
            { id: 'gasaka', name: 'Gasaka' },
            { id: 'gatare', name: 'Gatare' },
            { id: 'kaduha', name: 'Kaduha' },
            { id: 'kamegeri', name: 'Kamegeri' },
            { id: 'kibago', name: 'Kibago' },
            { id: 'kitabi', name: 'Kitabi' },
            { id: 'mbazi', name: 'Mbazi' },
            { id: 'mushubi', name: 'Mushubi' },
            { id: 'musange', name: 'Musange' },
            { id: 'nkomane', name: 'Nkomane' },
            { id: 'tare', name: 'Tare' },
            { id: 'uwinkingi', name: 'Uwinkingi' }
          ]
        },
        {
          id: 'nyarugenge',
          name: 'Nyarugenge',
          coordinates: { lat: -2.4667, lng: 29.9833 },
          healthFacilities: [
            { id: 'nyarugenge_hospital', name: 'Nyarugenge District Hospital', type: 'hospital' },
            { id: 'gitarama_hc', name: 'Gitarama Health Center', type: 'health_center' },
            { id: 'muhanga_clinic', name: 'Muhanga Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'cyeza', name: 'Cyeza' },
            { id: 'gitarama', name: 'Gitarama' },
            { id: 'kabacuzi', name: 'Kabacuzi' },
            { id: 'kamonyi', name: 'Kamonyi' },
            { id: 'kiyumba', name: 'Kiyumba' },
            { id: 'muhanga', name: 'Muhanga' },
            { id: 'mukura', name: 'Mukura' },
            { id: 'nyabinoni', name: 'Nyabinoni' },
            { id: 'nyamabuye', name: 'Nyamabuye' },
            { id: 'nyarubaka', name: 'Nyarubaka' },
            { id: 'rongi', name: 'Rongi' },
            { id: 'rugendabari', name: 'Rugendabari' }
          ]
        },
        {
          id: 'kamonyi',
          name: 'Kamonyi',
          coordinates: { lat: -2.0667, lng: 29.8833 },
          healthFacilities: [
            { id: 'kamonyi_hospital', name: 'Kamonyi District Hospital', type: 'hospital' },
            { id: 'runda_hc', name: 'Runda Health Center', type: 'health_center' },
            { id: 'gacurabwenge_clinic', name: 'Gacurabwenge Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'gacurabwenge', name: 'Gacurabwenge' },
            { id: 'karama', name: 'Karama' },
            { id: 'kayenzi', name: 'Kayenzi' },
            { id: 'kayumbu', name: 'Kayumbu' },
            { id: 'mugina', name: 'Mugina' },
            { id: 'musambira', name: 'Musambira' },
            { id: 'nyamiyaga', name: 'Nyamiyaga' },
            { id: 'nyarubaka', name: 'Nyarubaka' },
            { id: 'runda', name: 'Runda' },
            { id: 'ruzo', name: 'Ruzo' }
          ]
        },
        {
          id: 'ruhango',
          name: 'Ruhango',
          coordinates: { lat: -2.2833, lng: 29.7833 },
          healthFacilities: [
            { id: 'ruhango_hospital', name: 'Ruhango District Hospital', type: 'hospital' },
            { id: 'kinazi_hc', name: 'Kinazi Health Center', type: 'health_center' },
            { id: 'byimana_clinic', name: 'Byimana Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'bweramana', name: 'Bweramana' },
            { id: 'byimana', name: 'Byimana' },
            { id: 'kabagali', name: 'Kabagali' },
            { id: 'kinazi', name: 'Kinazi' },
            { id: 'kinihira', name: 'Kinihira' },
            { id: 'mbuye', name: 'Mbuye' },
            { id: 'ntongwe', name: 'Ntongwe' },
            { id: 'ruhango', name: 'Ruhango' }
          ]
        }
      ]
    },
    {
      id: 'western',
      name: 'Western Province',
      districts: [
        {
          id: 'rubavu',
          name: 'Rubavu',
          coordinates: { lat: -1.6777, lng: 29.2505 },
          healthFacilities: [
            { id: 'gisenyi_hospital', name: 'Gisenyi District Hospital', type: 'hospital' },
            { id: 'rubavu_hc', name: 'Rubavu Health Center', type: 'health_center' },
            { id: 'mudende_clinic', name: 'Mudende Refugee Camp Clinic', type: 'clinic' }
          ],
          sectors: [
            { id: 'bugeshi', name: 'Bugeshi' },
            { id: 'busasamana', name: 'Busasamana' },
            { id: 'cyanzarwe', name: 'Cyanzarwe' },
            { id: 'gisenyi', name: 'Gisenyi' },
            { id: 'kanama', name: 'Kanama' },
            { id: 'kanzenze', name: 'Kanzenze' },
            { id: 'mudende', name: 'Mudende' },
            { id: 'nyakiliba', name: 'Nyakiliba' },
            { id: 'nyakiriba', name: 'Nyakiriba' },
            { id: 'nyundo', name: 'Nyundo' },
            { id: 'rubavu', name: 'Rubavu' },
            { id: 'rugerero', name: 'Rugerero' }
          ]
        },
        {
          id: 'karongi',
          name: 'Karongi',
          coordinates: { lat: -1.9500, lng: 29.3833 },
          healthFacilities: [
            { id: 'kibuye_hospital', name: 'Kibuye Hope Hospital', type: 'hospital' },
            { id: 'karongi_hc', name: 'Karongi Health Center', type: 'health_center' },
            { id: 'bwishyura_clinic', name: 'Bwishyura Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'bwishyura', name: 'Bwishyura' },
            { id: 'gashari', name: 'Gashari' },
            { id: 'gitesi', name: 'Gitesi' },
            { id: 'gishyita', name: 'Gishyita' },
            { id: 'gisovu', name: 'Gisovu' },
            { id: 'kivumu', name: 'Kivumu' },
            { id: 'mahembe', name: 'Mahembe' },
            { id: 'murambi', name: 'Murambi' },
            { id: 'murundi', name: 'Murundi' },
            { id: 'mutuntu', name: 'Mutuntu' },
            { id: 'rugabano', name: 'Rugabano' },
            { id: 'ruganda', name: 'Ruganda' },
            { id: 'rwankuba', name: 'Rwankuba' }
          ]
        },
        {
          id: 'nyabihu',
          name: 'Nyabihu',
          coordinates: { lat: -1.6500, lng: 29.5167 },
          healthFacilities: [
            { id: 'nyabihu_hospital', name: 'Nyabihu District Hospital', type: 'hospital' },
            { id: 'mukamira_hc', name: 'Mukamira Health Center', type: 'health_center' },
            { id: 'jenda_clinic', name: 'Jenda Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'bigogwe', name: 'Bigogwe' },
            { id: 'jenda', name: 'Jenda' },
            { id: 'jomba', name: 'Jomba' },
            { id: 'kabatwa', name: 'Kabatwa' },
            { id: 'karago', name: 'Karago' },
            { id: 'kintobo', name: 'Kintobo' },
            { id: 'mukamira', name: 'Mukamira' },
            { id: 'nyabihu', name: 'Nyabihu' },
            { id: 'rurembo', name: 'Rurembo' },
            { id: 'ruyanza', name: 'Ruyanza' },
            { id: 'shyira', name: 'Shyira' }
          ]
        },
        {
          id: 'ngororero',
          name: 'Ngororero',
          coordinates: { lat: -1.7833, lng: 29.5333 },
          healthFacilities: [
            { id: 'ngororero_hospital', name: 'Ngororero District Hospital', type: 'hospital' },
            { id: 'bwira_hc', name: 'Bwira Health Center', type: 'health_center' },
            { id: 'kavumu_clinic', name: 'Kavumu Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'bwira', name: 'Bwira' },
            { id: 'gasiza', name: 'Gasiza' },
            { id: 'hindiro', name: 'Hindiro' },
            { id: 'kabaya', name: 'Kabaya' },
            { id: 'kageyo', name: 'Kageyo' },
            { id: 'kavumu', name: 'Kavumu' },
            { id: 'matyazo', name: 'Matyazo' },
            { id: 'muhanda', name: 'Muhanda' },
            { id: 'muhororo', name: 'Muhororo' },
            { id: 'ndaro', name: 'Ndaro' },
            { id: 'ngororero', name: 'Ngororero' },
            { id: 'nyange', name: 'Nyange' },
            { id: 'sovu', name: 'Sovu' }
          ]
        },
        {
          id: 'rusizi',
          name: 'Rusizi',
          coordinates: { lat: -2.4833, lng: 28.9167 },
          healthFacilities: [
            { id: 'rusizi_hospital', name: 'Rusizi District Hospital', type: 'hospital' },
            { id: 'kamembe_hc', name: 'Kamembe Health Center', type: 'health_center' },
            { id: 'gihundwe_clinic', name: 'Gihundwe Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'butare', name: 'Butare' },
            { id: 'bugarama', name: 'Bugarama' },
            { id: 'gashonga', name: 'Gashonga' },
            { id: 'giheke', name: 'Giheke' },
            { id: 'gihundwe', name: 'Gihundwe' },
            { id: 'gitambi', name: 'Gitambi' },
            { id: 'gikundamvura', name: 'Gikundamvura' },
            { id: 'kamembe', name: 'Kamembe' },
            { id: 'muganza', name: 'Muganza' },
            { id: 'mururu', name: 'Mururu' },
            { id: 'nkanka', name: 'Nkanka' },
            { id: 'nkungu', name: 'Nkungu' },
            { id: 'nyakabuye', name: 'Nyakabuye' },
            { id: 'nyakarenzo', name: 'Nyakarenzo' },
            { id: 'ruganda', name: 'Ruganda' },
            { id: 'rwimbogo', name: 'Rwimbogo' }
          ]
        },
        {
          id: 'nyamasheke',
          name: 'Nyamasheke',
          coordinates: { lat: -2.2167, lng: 29.1500 },
          healthFacilities: [
            { id: 'nyamasheke_hospital', name: 'Nyamasheke District Hospital', type: 'hospital' },
            { id: 'kagano_hc', name: 'Kagano Health Center', type: 'health_center' },
            { id: 'bushekeri_clinic', name: 'Bushekeri Health Post', type: 'clinic' }
          ],
          sectors: [
            { id: 'bushekeri', name: 'Bushekeri' },
            { id: 'bushenge', name: 'Bushenge' },
            { id: 'cyato', name: 'Cyato' },
            { id: 'gihombo', name: 'Gihombo' },
            { id: 'kagano', name: 'Kagano' },
            { id: 'kanjongo', name: 'Kanjongo' },
            { id: 'karambi', name: 'Karambi' },
            { id: 'karengera', name: 'Karengera' },
            { id: 'kirimbi', name: 'Kirimbi' },
            { id: 'macuba', name: 'Macuba' },
            { id: 'mahembe', name: 'Mahembe' },
            { id: 'makoma', name: 'Makoma' },
            { id: 'rangiro', name: 'Rangiro' },
            { id: 'ruharambuga', name: 'Ruharambuga' }
          ]
        }
      ]
    }
  ]
}

/**
 * Get all provinces
 */
export const getProvinces = () => {
  return RWANDA_LOCATIONS.provinces.map(province => ({
    value: province.id,
    label: province.name
  }))
}

/**
 * Get districts for a specific province
 */
export const getDistricts = (provinceId) => {
  const province = RWANDA_LOCATIONS.provinces.find(p => p.id === provinceId)
  if (!province) return []
  
  return province.districts.map(district => ({
    value: district.id,
    label: district.name
  }))
}

/**
 * Get sectors for a specific district
 */
export const getSectors = (provinceId, districtId) => {
  const province = RWANDA_LOCATIONS.provinces.find(p => p.id === provinceId)
  if (!province) return []
  
  const district = province.districts.find(d => d.id === districtId)
  if (!district) return []
  
  return district.sectors.map(sector => ({
    value: sector.id,
    label: sector.name
  }))
}

/**
 * Get health facilities for a specific district
 */
export const getHealthFacilities = (provinceId, districtId) => {
  const province = RWANDA_LOCATIONS.provinces.find(p => p.id === provinceId)
  if (!province) return []
  
  const district = province.districts.find(d => d.id === districtId)
  if (!district) return []
  
  return district.healthFacilities.map(facility => ({
    value: facility.id,
    label: `${facility.name} (${facility.type.replace('_', ' ').toUpperCase()})`
  }))
}

/**
 * Get location details by IDs
 */
export const getLocationDetails = (provinceId, districtId, sectorId, facilityId = null) => {
  const province = RWANDA_LOCATIONS.provinces.find(p => p.id === provinceId)
  if (!province) return null
  
  const district = province.districts.find(d => d.id === districtId)
  if (!district) return null
  
  const sector = district.sectors.find(s => s.id === sectorId)
  if (!sector) return null
  
  let facility = null
  if (facilityId) {
    facility = district.healthFacilities.find(f => f.id === facilityId)
  }
  
  return {
    province: { id: province.id, name: province.name },
    district: { id: district.id, name: district.name, coordinates: district.coordinates },
    sector: { id: sector.id, name: sector.name },
    facility: facility ? { id: facility.id, name: facility.name, type: facility.type } : null
  }
}

/**
 * Get coordinates for a district (more accurate than province-level)
 */
export const getDistrictCoordinates = (provinceId, districtId) => {
  const province = RWANDA_LOCATIONS.provinces.find(p => p.id === provinceId)
  if (!province) return { lat: -1.9403, lng: 29.8739 }
  
  const district = province.districts.find(d => d.id === districtId)
  return district?.coordinates || { lat: -1.9403, lng: 29.8739 }
}

/**
 * Get all districts with their coordinates for mapping
 */
export const getAllDistrictsWithCoordinates = () => {
  const districts = []
  
  RWANDA_LOCATIONS.provinces.forEach(province => {
    province.districts.forEach(district => {
      districts.push({
        id: district.id,
        name: district.name,
        province: province.name,
        coordinates: district.coordinates
      })
    })
  })
  
  return districts
}