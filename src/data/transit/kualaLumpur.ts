import type { TransitLine, TransitStation, TransitTransfer, TransitNetwork } from '@/types/transit'

// 换乘站定义（统一 ID，跨线路共享）
const interchangeStations: TransitStation[] = [
  { id: 'kl-sentral', name: 'KL Sentral', nameEn: 'KL Sentral', latitude: 3.1536, longitude: 101.7065, lineIds: ['kj', 'sbk', 'mrt'] },
  { id: 'pasar-seni', name: 'Pasar Seni', nameEn: 'Pasar Seni', latitude: 3.1973, longitude: 101.7131, lineIds: ['kj', 'mrt'] },
  { id: 'masjid-jamek', name: 'Masjid Jamek', nameEn: 'Masjid Jamek', latitude: 3.1918, longitude: 101.7118, lineIds: ['kj', 'mrt'] },
  { id: 'hang-tuah', name: 'Hang Tuah', nameEn: 'Hang Tuah', latitude: 3.1773, longitude: 101.7094, lineIds: ['kj', 'monorail'] },
  { id: 'titiwangsa', name: 'Titiwangsa', nameEn: 'Titiwangsa', latitude: 3.1589, longitude: 101.7056, lineIds: ['kj', 'monorail'] },
]

// KJ Line 独有站点
const kjOnly: TransitStation[] = [
  { id: 'kj-gombak', name: 'Gombak', nameEn: 'Gombak', latitude: 3.2631, longitude: 101.7517, lineIds: ['kj'] },
  { id: 'kj-taman-melati', name: 'Taman Melati', nameEn: 'Taman Melati', latitude: 3.2537, longitude: 101.7483, lineIds: ['kj'] },
  { id: 'kj-wangsa-maju', name: 'Wangsa Maju', nameEn: 'Wangsa Maju', latitude: 3.2439, longitude: 101.7437, lineIds: ['kj'] },
  { id: 'kj-setiawangsa', name: 'Setiawangsa', nameEn: 'Setiawangsa', latitude: 3.2337, longitude: 101.7389, lineIds: ['kj'] },
  { id: 'kj-ampang-park', name: 'Ampang Park', nameEn: 'Ampang Park', latitude: 3.2229, longitude: 101.7335, lineIds: ['kj'] },
  { id: 'kj-klcc', name: 'KLCC', nameEn: 'KLCC', latitude: 3.2167, longitude: 101.7287, lineIds: ['kj'] },
  { id: 'kj-ampang', name: 'Ampang', nameEn: 'Ampang', latitude: 3.2124, longitude: 101.7241, lineIds: ['kj'] },
  { id: 'kj-dang-wangi', name: 'Dang Wangi', nameEn: 'Dang Wangi', latitude: 3.1861, longitude: 101.7103, lineIds: ['kj'] },
  { id: 'kj-panchor', name: 'Panchor', nameEn: 'Panchor', latitude: 3.1701, longitude: 101.7085, lineIds: ['kj'] },
  { id: 'kj-chow-kit', name: 'Chow Kit', nameEn: 'Chow Kit', latitude: 3.1647, longitude: 101.7073, lineIds: ['kj'] },
  { id: 'kj-pasir-senai', name: 'Pasir Senai', nameEn: 'Pasir Senai', latitude: 3.1441, longitude: 101.7084, lineIds: ['kj'] },
  { id: 'kj-kg-rtu', name: 'KG RTU', nameEn: 'KG RTU', latitude: 3.1367, longitude: 101.7095, lineIds: ['kj'] },
  { id: 'kj-taman-jaya', name: 'Taman Jaya', nameEn: 'Taman Jaya', latitude: 3.1283, longitude: 101.7109, lineIds: ['kj'] },
  { id: 'kj-asia-jaya', name: 'Asia Jaya', nameEn: 'Asia Jaya', latitude: 3.1197, longitude: 101.7123, lineIds: ['kj'] },
  { id: 'kj-taman-dato-haru', name: 'Taman Dato Harun', nameEn: 'Taman Dato Harun', latitude: 3.1106, longitude: 101.7138, lineIds: ['kj'] },
  { id: 'kj-kelana-jaya', name: 'Kelana Jaya', nameEn: 'Kelana Jaya', latitude: 3.1023, longitude: 101.7152, lineIds: ['kj'] },
]

// SBK Line 独有站点
const sbkOnly: TransitStation[] = [
  { id: 'sbk-kwasa-damai', name: 'Kwasa Damai', nameEn: 'Kwasa Damai', latitude: 3.1795, longitude: 101.6816, lineIds: ['sbk'] },
  { id: 'sbk-kwasa-putra', name: 'Kwasa Putra', nameEn: 'Kwasa Putra', latitude: 3.1710, longitude: 101.6819, lineIds: ['sbk'] },
  { id: 'sbk-sri-petaling', name: 'Sri Petaling', nameEn: 'Sri Petaling', latitude: 3.1624, longitude: 101.6823, lineIds: ['sbk'] },
  { id: 'sbk-kinrara', name: 'Kinrara', nameEn: 'Kinrara', latitude: 3.1538, longitude: 101.6827, lineIds: ['sbk'] },
  { id: 'sbk-almesria', name: 'Al Mesria', nameEn: 'Al Mesria', latitude: 3.1452, longitude: 101.6831, lineIds: ['sbk'] },
  { id: 'sbk-sungai-jernih', name: 'Sungai Jernih', nameEn: 'Sungai Jernih', latitude: 3.1366, longitude: 101.6835, lineIds: ['sbk'] },
  { id: 'sbk-bukit-terigu', name: 'Bukit Terigu', nameEn: 'Bukit Terigu', latitude: 3.1280, longitude: 101.6839, lineIds: ['sbk'] },
  { id: 'sbk-tek-nasional', name: 'Teknologi Nasional', nameEn: 'Teknologi Nasional', latitude: 3.1194, longitude: 101.6843, lineIds: ['sbk'] },
  { id: 'sbk-taman-midah', name: 'Taman Midah', nameEn: 'Taman Midah', latitude: 3.1108, longitude: 101.6847, lineIds: ['sbk'] },
  { id: 'sbk-taman-connaught', name: 'Taman Connaught', nameEn: 'Taman Connaught', latitude: 3.1022, longitude: 101.6851, lineIds: ['sbk'] },
  { id: 'sbk-sungai-emas', name: 'Sungai Emas', nameEn: 'Sungai Emas', latitude: 3.0936, longitude: 101.6855, lineIds: ['sbk'] },
  { id: 'sbk-bandar-tun-hussein', name: 'Bandar Tun Hussein', nameEn: 'Bandar Tun Hussein', latitude: 3.0850, longitude: 101.6859, lineIds: ['sbk'] },
  { id: 'sbk-sungai-ramal', name: 'Sungai Ramal', nameEn: 'Sungai Ramal', latitude: 3.0764, longitude: 101.6863, lineIds: ['sbk'] },
  { id: 'sbk-kajang', name: 'Kajang', nameEn: 'Kajang', latitude: 3.0678, longitude: 101.6867, lineIds: ['sbk'] },
]

// Monorail 独有站点
const monorailOnly: TransitStation[] = [
  { id: 'ml-raja-chulan', name: 'Raja Chulan', nameEn: 'Raja Chulan', latitude: 3.1705, longitude: 101.7090, lineIds: ['monorail'] },
  { id: 'ml-bukit-nanas', name: 'Bukit Nanas', nameEn: 'Bukit Nanas', latitude: 3.1763, longitude: 101.7107, lineIds: ['monorail'] },
  { id: 'ml-medan-tuanku', name: 'Medan Tuanku', nameEn: 'Medan Tuanku', latitude: 3.1821, longitude: 101.7124, lineIds: ['monorail'] },
  { id: 'ml-pudu', name: 'Pudu', nameEn: 'Pudu', latitude: 3.1725, longitude: 101.7100, lineIds: ['monorail'] },
]

// MRT 独有站点
const mrtOnly: TransitStation[] = [
  { id: 'mrt-bukit-kiara', name: 'Bukit Kiara', nameEn: 'Bukit Kiara', latitude: 3.1700, longitude: 101.7180, lineIds: ['mrt'] },
  { id: 'mrt-taman-duta', name: 'Taman Duta', nameEn: 'Taman Duta', latitude: 3.1630, longitude: 101.7160, lineIds: ['mrt'] },
  { id: 'mrt-kerinchi', name: 'Kerinchi', nameEn: 'Kerinchi', latitude: 3.1560, longitude: 101.7140, lineIds: ['mrt'] },
  { id: 'mrt-mont-kiara', name: 'Mont Kiara', nameEn: 'Mont Kiara', latitude: 3.1420, longitude: 101.7100, lineIds: ['mrt'] },
  { id: 'mrt-sri-raya', name: 'Sri Raya', nameEn: 'Sri Raya', latitude: 3.1840, longitude: 101.7105, lineIds: ['mrt'] },
  { id: 'mrt-bukit-teruntum', name: 'Bukit Teruntum', nameEn: 'Bukit Teruntum', latitude: 3.1770, longitude: 101.7095, lineIds: ['mrt'] },
  { id: 'mrt-balakong', name: 'Balakong', nameEn: 'Balakong', latitude: 3.1700, longitude: 101.7085, lineIds: ['mrt'] },
  { id: 'mrt-ceras', name: 'Ceras', nameEn: 'Ceras', latitude: 3.1630, longitude: 101.7075, lineIds: ['mrt'] },
  { id: 'mrt-sungai-long', name: 'Sungai Long', nameEn: 'Sungai Long', latitude: 3.1560, longitude: 101.7065, lineIds: ['mrt'] },
]

const allStations: TransitStation[] = [
  ...interchangeStations,
  ...kjOnly,
  ...sbkOnly,
  ...monorailOnly,
  ...mrtOnly,
]

const lines: TransitLine[] = [
  {
    id: 'kj',
    shortName: 'KJ',
    name: 'Kelana Jaya Line',
    nameEn: 'Kelana Jaya Line',
    color: '#e53935',
    mode: 'light_rail',
    stationIds: [
      'kj-gombak', 'kj-taman-melati', 'kj-wangsa-maju', 'kj-setiawangsa',
      'kj-ampang-park', 'kj-klcc', 'kj-ampang', 'pasar-seni',
      'masjid-jamek', 'kj-dang-wangi', 'hang-tuah', 'kj-panchor',
      'kj-chow-kit', 'titiwangsa', 'kl-sentral', 'kj-pasir-senai',
      'kj-kg-rtu', 'kj-taman-jaya', 'kj-asia-jaya', 'kj-taman-dato-haru',
      'kj-kelana-jaya',
    ],
  },
  {
    id: 'sbk',
    shortName: 'SBK',
    name: 'Sungai Buloh-Kajang Line',
    nameEn: 'Sungai Buloh-Kajang Line',
    color: '#43a047',
    mode: 'light_rail',
    stationIds: [
      'sbk-kwasa-damai', 'sbk-kwasa-putra', 'sbk-sri-petaling',
      'sbk-kinrara', 'sbk-almesria', 'sbk-sungai-jernih',
      'sbk-bukit-terigu', 'sbk-tek-nasional', 'sbk-taman-midah',
      'sbk-taman-connaught', 'sbk-sungai-emas', 'sbk-bandar-tun-hussein',
      'sbk-sungai-ramal', 'sbk-kajang',
    ],
  },
  {
    id: 'monorail',
    shortName: 'MR',
    name: 'KL Monorail',
    nameEn: 'KL Monorail',
    color: '#fb8c00',
    mode: 'monorail',
    stationIds: [
      'titiwangsa', 'ml-medan-tuanku', 'ml-bukit-nanas',
      'ml-raja-chulan', 'ml-pudu', 'hang-tuah',
    ],
  },
  {
    id: 'mrt',
    shortName: 'MRT',
    name: 'MRT Circle Line',
    nameEn: 'MRT Circle Line',
    color: '#1e88e5',
    mode: 'subway',
    stationIds: [
      'mrt-bukit-kiara', 'mrt-taman-duta', 'mrt-kerinchi',
      'kl-sentral', 'mrt-mont-kiara', 'pasar-seni',
      'masjid-jamek', 'mrt-sri-raya', 'mrt-bukit-teruntum',
      'mrt-balakong', 'mrt-ceras', 'mrt-sungai-long',
    ],
  },
]

const transfers: TransitTransfer[] = [
  { fromStationId: 'kl-sentral', toStationId: 'kl-sentral', fromLineId: 'kj', toLineId: 'sbk', walkDistance: 120, duration: 150 },
  { fromStationId: 'pasar-seni', toStationId: 'pasar-seni', fromLineId: 'kj', toLineId: 'mrt', walkDistance: 80, duration: 100 },
  { fromStationId: 'masjid-jamek', toStationId: 'masjid-jamek', fromLineId: 'kj', toLineId: 'mrt', walkDistance: 60, duration: 80 },
  { fromStationId: 'hang-tuah', toStationId: 'hang-tuah', fromLineId: 'kj', toLineId: 'monorail', walkDistance: 100, duration: 120 },
  { fromStationId: 'titiwangsa', toStationId: 'titiwangsa', fromLineId: 'kj', toLineId: 'monorail', walkDistance: 90, duration: 110 },
  { fromStationId: 'kl-sentral', toStationId: 'kl-sentral', fromLineId: 'sbk', toLineId: 'mrt', walkDistance: 150, duration: 180 },
]

export const klTransitNetwork: TransitNetwork = {
  lines,
  stations: allStations,
  transfers,
}

export const klTransitStations = allStations
export const klTransitLines = lines
