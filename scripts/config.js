/**
 * Pipeline configuration - reads from environment variables
 */

// Env vars - validated when needed by specific scripts
const TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const TRAVELPAYOUTS_MARKER = process.env.TRAVELPAYOUTS_MARKER || '605276';

/**
 * Validate required env vars for scout/normalize
 * Call this at the start of scripts that need the token
 */
function validatePipelineEnv() {
  if (!TRAVELPAYOUTS_TOKEN) {
    console.error('ERROR: TRAVELPAYOUTS_TOKEN environment variable is required');
    console.error('Get your token from: https://www.travelpayouts.com/developers/api');
    process.exit(1);
  }

  if (!TRAVELPAYOUTS_MARKER) {
    console.error('ERROR: TRAVELPAYOUTS_MARKER environment variable is required');
    console.error('Get your marker from: https://www.travelpayouts.com/programs');
    process.exit(1);
  }
}

// Optional env vars with defaults
const BFD_ORIGINS = (process.env.BFD_ORIGINS || 'YYZ,YUL,YVR').split(',').map(s => s.trim().toUpperCase());
const BFD_CURRENCY = process.env.BFD_CURRENCY || 'CAD';
const BFD_LIMIT = parseInt(process.env.BFD_LIMIT || '200', 10);

// File paths
const DATA_DIR = new URL('../src/data/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const RAW_DEALS_PATH = `${DATA_DIR}raw_deals.json`;
const CANONICAL_DEALS_PATH = `${DATA_DIR}deals.json`;

// IATA code to city name mapping
const CITY_NAMES = {
  // Canadian origins
  YYZ: 'Toronto',
  YUL: 'Montreal',
  YVR: 'Vancouver',
  YYC: 'Calgary',
  YOW: 'Ottawa',
  YEG: 'Edmonton',
  YWG: 'Winnipeg',
  YHZ: 'Halifax',
  // Common destinations
  LIS: 'Lisbon',
  CDG: 'Paris',
  LHR: 'London',
  AMS: 'Amsterdam',
  BER: 'Berlin',
  FCO: 'Rome',
  NRT: 'Tokyo',
  HND: 'Tokyo',
  IST: 'Istanbul',
  ATH: 'Athens',
  MAD: 'Madrid',
  BCN: 'Barcelona',
  DUB: 'Dublin',
  MUC: 'Munich',
  VIE: 'Vienna',
  PRG: 'Prague',
  CPH: 'Copenhagen',
  ZRH: 'Zurich',
  BRU: 'Brussels',
  OSL: 'Oslo',
  ARN: 'Stockholm',
  HEL: 'Helsinki',
  WAW: 'Warsaw',
  BUD: 'Budapest',
  LGW: 'London',
  STN: 'London',
  ORY: 'Paris',
  MXP: 'Milan',
  FCO: 'Rome',
  NAP: 'Naples',
  VCE: 'Venice',
  FLR: 'Florence',
  AGP: 'Malaga',
  PMI: 'Palma',
  // Asia
  HKG: 'Hong Kong',
  SIN: 'Singapore',
  BKK: 'Bangkok',
  ICN: 'Seoul',
  PEK: 'Beijing',
  PVG: 'Shanghai',
  DEL: 'Delhi',
  BOM: 'Mumbai',
  // Americas
  CUN: 'Cancun',
  MEX: 'Mexico City',
  GRU: 'Sao Paulo',
  EZE: 'Buenos Aires',
  BOG: 'Bogota',
  LIM: 'Lima',
  SCL: 'Santiago',
  // Caribbean
  MBJ: 'Montego Bay',
  PUJ: 'Punta Cana',
  SJU: 'San Juan',
  NAS: 'Nassau',
  // US (for connections)
  JFK: 'New York',
  LAX: 'Los Angeles',
  ORD: 'Chicago',
  MIA: 'Miami',
  SFO: 'San Francisco',
  BOS: 'Boston',
  SEA: 'Seattle',
  DFW: 'Dallas',
  ATL: 'Atlanta',
  DEN: 'Denver',
};

function getCityName(iataCode) {
  return CITY_NAMES[iataCode.toUpperCase()] || iataCode;
}

export {
  TRAVELPAYOUTS_TOKEN,
  TRAVELPAYOUTS_MARKER,
  BFD_ORIGINS,
  BFD_CURRENCY,
  BFD_LIMIT,
  DATA_DIR,
  RAW_DEALS_PATH,
  CANONICAL_DEALS_PATH,
  CITY_NAMES,
  getCityName,
  validatePipelineEnv,
};
