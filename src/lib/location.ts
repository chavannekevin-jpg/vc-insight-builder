export type CityCoordinates = { lat: number; lng: number; country: string; region: MapRegion };

export type MapRegion = "europe" | "asia";

export const REGION_CONFIG: Record<MapRegion, {
  label: string;
  center: [number, number];
  scale: number;
  zoom: number;
}> = {
  europe: { label: "Europe", center: [15, 54], scale: 700, zoom: 1 },
  asia: { label: "Asia Pacific", center: [105, 15], scale: 450, zoom: 1 },
};

export const normalizeCityKey = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    // Split on comma to handle values like "Tallinn, Estonia"
    .split(",")[0]
    .trim()
    // Remove diacritics (handles e.g. "İstanbul" -> "istanbul")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Normalize apostrophes and whitespace
    .replace(/[''`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const normalizeCountryKey = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Remove emojis / punctuation, keep letters and spaces
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// European capitals + a few high-frequency major cities
export const CITY_COORDINATES: Record<string, CityCoordinates> = {
  // ============ EUROPE ============
  // Nordics
  "oslo": { lat: 59.9139, lng: 10.7522, country: "Norway", region: "europe" },
  "stockholm": { lat: 59.3293, lng: 18.0686, country: "Sweden", region: "europe" },
  "copenhagen": { lat: 55.6761, lng: 12.5683, country: "Denmark", region: "europe" },
  "helsinki": { lat: 60.1699, lng: 24.9384, country: "Finland", region: "europe" },
  "reykjavik": { lat: 64.1466, lng: -21.9426, country: "Iceland", region: "europe" },

  // Baltics
  "vilnius": { lat: 54.6872, lng: 25.2797, country: "Lithuania", region: "europe" },
  "riga": { lat: 56.9496, lng: 24.1052, country: "Latvia", region: "europe" },
  "tallinn": { lat: 59.4370, lng: 24.7536, country: "Estonia", region: "europe" },

  // Western / Central Europe
  "london": { lat: 51.5074, lng: -0.1278, country: "UK", region: "europe" },
  "dublin": { lat: 53.3498, lng: -6.2603, country: "Ireland", region: "europe" },
  "paris": { lat: 48.8566, lng: 2.3522, country: "France", region: "europe" },
  "brussels": { lat: 50.8503, lng: 4.3517, country: "Belgium", region: "europe" },
  "amsterdam": { lat: 52.3676, lng: 4.9041, country: "Netherlands", region: "europe" },
  "luxembourg": { lat: 49.6116, lng: 6.1319, country: "Luxembourg", region: "europe" },
  "berlin": { lat: 52.5200, lng: 13.4050, country: "Germany", region: "europe" },
  "vienna": { lat: 48.2082, lng: 16.3738, country: "Austria", region: "europe" },
  "bern": { lat: 46.9480, lng: 7.4474, country: "Switzerland", region: "europe" },
  "prague": { lat: 50.0755, lng: 14.4378, country: "Czech Republic", region: "europe" },
  "warsaw": { lat: 52.2297, lng: 21.0122, country: "Poland", region: "europe" },
  "bratislava": { lat: 48.1486, lng: 17.1077, country: "Slovakia", region: "europe" },
  "budapest": { lat: 47.4979, lng: 19.0402, country: "Hungary", region: "europe" },

  // Balkans
  "zagreb": { lat: 45.8150, lng: 15.9819, country: "Croatia", region: "europe" },
  "ljubljana": { lat: 46.0569, lng: 14.5058, country: "Slovenia", region: "europe" },
  "sarajevo": { lat: 43.8563, lng: 18.4131, country: "Bosnia and Herzegovina", region: "europe" },
  "belgrade": { lat: 44.7866, lng: 20.4489, country: "Serbia", region: "europe" },
  "podgorica": { lat: 42.4304, lng: 19.2594, country: "Montenegro", region: "europe" },
  "skopje": { lat: 41.9973, lng: 21.4280, country: "North Macedonia", region: "europe" },
  "tirana": { lat: 41.3275, lng: 19.8187, country: "Albania", region: "europe" },
  "pristina": { lat: 42.6629, lng: 21.1655, country: "Kosovo", region: "europe" },

  // Southern / Eastern Europe
  "lisbon": { lat: 38.7223, lng: -9.1393, country: "Portugal", region: "europe" },
  "madrid": { lat: 40.4168, lng: -3.7038, country: "Spain", region: "europe" },
  "rome": { lat: 41.9028, lng: 12.4964, country: "Italy", region: "europe" },
  "athens": { lat: 37.9838, lng: 23.7275, country: "Greece", region: "europe" },
  "sofia": { lat: 42.6977, lng: 23.3219, country: "Bulgaria", region: "europe" },
  "bucharest": { lat: 44.4268, lng: 26.1025, country: "Romania", region: "europe" },
  "chisinau": { lat: 47.0105, lng: 28.8638, country: "Moldova", region: "europe" },
  "kyiv": { lat: 50.4501, lng: 30.5234, country: "Ukraine", region: "europe" },
  "minsk": { lat: 53.9006, lng: 27.5590, country: "Belarus", region: "europe" },
  "moscow": { lat: 55.7558, lng: 37.6173, country: "Russia", region: "europe" },

  // Turkey (partly Europe) + frequent city
  "ankara": { lat: 39.9334, lng: 32.8597, country: "Turkey", region: "europe" },
  "istanbul": { lat: 41.0082, lng: 28.9784, country: "Turkey", region: "europe" },

  // Common non-capital European hubs
  "barcelona": { lat: 41.3851, lng: 2.1734, country: "Spain", region: "europe" },
  "milan": { lat: 45.4642, lng: 9.1900, country: "Italy", region: "europe" },
  "zurich": { lat: 47.3769, lng: 8.5417, country: "Switzerland", region: "europe" },
  "geneva": { lat: 46.2044, lng: 6.1432, country: "Switzerland", region: "europe" },

  // France secondary cities
  "lyon": { lat: 45.7640, lng: 4.8357, country: "France", region: "europe" },
  "marseille": { lat: 43.2965, lng: 5.3698, country: "France", region: "europe" },
  "nice": { lat: 43.7102, lng: 7.2620, country: "France", region: "europe" },
  "toulouse": { lat: 43.6047, lng: 1.4442, country: "France", region: "europe" },
  "bordeaux": { lat: 44.8378, lng: -0.5792, country: "France", region: "europe" },
  "strasbourg": { lat: 48.5734, lng: 7.7521, country: "France", region: "europe" },
  "nantes": { lat: 47.2184, lng: -1.5536, country: "France", region: "europe" },
  "lille": { lat: 50.6292, lng: 3.0573, country: "France", region: "europe" },

  // Spain secondary cities
  "valencia": { lat: 39.4699, lng: -0.3763, country: "Spain", region: "europe" },
  "seville": { lat: 37.3891, lng: -5.9845, country: "Spain", region: "europe" },
  "bilbao": { lat: 43.2630, lng: -2.9350, country: "Spain", region: "europe" },
  "malaga": { lat: 36.7213, lng: -4.4214, country: "Spain", region: "europe" },
  "zaragoza": { lat: 41.6488, lng: -0.8891, country: "Spain", region: "europe" },

  // Italy secondary cities
  "naples": { lat: 40.8518, lng: 14.2681, country: "Italy", region: "europe" },
  "turin": { lat: 45.0703, lng: 7.6869, country: "Italy", region: "europe" },
  "florence": { lat: 43.7696, lng: 11.2558, country: "Italy", region: "europe" },
  "bologna": { lat: 44.4949, lng: 11.3426, country: "Italy", region: "europe" },
  "venice": { lat: 45.4408, lng: 12.3155, country: "Italy", region: "europe" },
  "genoa": { lat: 44.4056, lng: 8.9463, country: "Italy", region: "europe" },

  // Germany secondary cities
  "munich": { lat: 48.1351, lng: 11.5820, country: "Germany", region: "europe" },
  "frankfurt": { lat: 50.1109, lng: 8.6821, country: "Germany", region: "europe" },
  "hamburg": { lat: 53.5511, lng: 9.9937, country: "Germany", region: "europe" },
  "cologne": { lat: 50.9375, lng: 6.9603, country: "Germany", region: "europe" },
  "dusseldorf": { lat: 51.2277, lng: 6.7735, country: "Germany", region: "europe" },
  "stuttgart": { lat: 48.7758, lng: 9.1829, country: "Germany", region: "europe" },
  "leipzig": { lat: 51.3397, lng: 12.3731, country: "Germany", region: "europe" },

  // UK secondary cities
  "manchester": { lat: 53.4808, lng: -2.2426, country: "UK", region: "europe" },
  "birmingham": { lat: 52.4862, lng: -1.8904, country: "UK", region: "europe" },
  "edinburgh": { lat: 55.9533, lng: -3.1883, country: "UK", region: "europe" },
  "glasgow": { lat: 55.8642, lng: -4.2518, country: "UK", region: "europe" },
  "bristol": { lat: 51.4545, lng: -2.5879, country: "UK", region: "europe" },
  "leeds": { lat: 53.8008, lng: -1.5491, country: "UK", region: "europe" },
  "liverpool": { lat: 53.4084, lng: -2.9916, country: "UK", region: "europe" },
  "cambridge": { lat: 52.2053, lng: 0.1218, country: "UK", region: "europe" },
  "oxford": { lat: 51.7520, lng: -1.2577, country: "UK", region: "europe" },

  // Netherlands secondary cities
  "rotterdam": { lat: 51.9244, lng: 4.4777, country: "Netherlands", region: "europe" },
  "the hague": { lat: 52.0705, lng: 4.3007, country: "Netherlands", region: "europe" },
  "utrecht": { lat: 52.0907, lng: 5.1214, country: "Netherlands", region: "europe" },
  "eindhoven": { lat: 51.4416, lng: 5.4697, country: "Netherlands", region: "europe" },

  // Belgium secondary cities
  "antwerp": { lat: 51.2194, lng: 4.4025, country: "Belgium", region: "europe" },
  "ghent": { lat: 51.0543, lng: 3.7174, country: "Belgium", region: "europe" },
  "liege": { lat: 50.6326, lng: 5.5797, country: "Belgium", region: "europe" },

  // Portugal secondary cities
  "porto": { lat: 41.1579, lng: -8.6291, country: "Portugal", region: "europe" },
  "braga": { lat: 41.5518, lng: -8.4229, country: "Portugal", region: "europe" },

  // Switzerland secondary cities
  "basel": { lat: 47.5596, lng: 7.5886, country: "Switzerland", region: "europe" },
  "lausanne": { lat: 46.5197, lng: 6.6323, country: "Switzerland", region: "europe" },

  // Austria secondary cities
  "salzburg": { lat: 47.8095, lng: 13.0550, country: "Austria", region: "europe" },
  "innsbruck": { lat: 47.2692, lng: 11.4041, country: "Austria", region: "europe" },
  "graz": { lat: 47.0707, lng: 15.4395, country: "Austria", region: "europe" },

  // Ireland secondary cities
  "cork": { lat: 51.8969, lng: -8.4863, country: "Ireland", region: "europe" },
  "galway": { lat: 53.2707, lng: -9.0568, country: "Ireland", region: "europe" },

  // ============ ASIA PACIFIC ============
  // Southeast Asia
  "singapore": { lat: 1.3521, lng: 103.8198, country: "Singapore", region: "asia" },
  "kuala lumpur": { lat: 3.1390, lng: 101.6869, country: "Malaysia", region: "asia" },
  "bangkok": { lat: 13.7563, lng: 100.5018, country: "Thailand", region: "asia" },
  "jakarta": { lat: -6.2088, lng: 106.8456, country: "Indonesia", region: "asia" },
  "ho chi minh city": { lat: 10.8231, lng: 106.6297, country: "Vietnam", region: "asia" },
  "hanoi": { lat: 21.0285, lng: 105.8542, country: "Vietnam", region: "asia" },
  "manila": { lat: 14.5995, lng: 120.9842, country: "Philippines", region: "asia" },
  "phnom penh": { lat: 11.5564, lng: 104.9282, country: "Cambodia", region: "asia" },
  "yangon": { lat: 16.8661, lng: 96.1951, country: "Myanmar", region: "asia" },

  // East Asia
  "hong kong": { lat: 22.3193, lng: 114.1694, country: "Hong Kong", region: "asia" },
  "tokyo": { lat: 35.6762, lng: 139.6503, country: "Japan", region: "asia" },
  "osaka": { lat: 34.6937, lng: 135.5023, country: "Japan", region: "asia" },
  "kyoto": { lat: 35.0116, lng: 135.7681, country: "Japan", region: "asia" },
  "seoul": { lat: 37.5665, lng: 126.9780, country: "South Korea", region: "asia" },
  "busan": { lat: 35.1796, lng: 129.0756, country: "South Korea", region: "asia" },
  "taipei": { lat: 25.0330, lng: 121.5654, country: "Taiwan", region: "asia" },
  "beijing": { lat: 39.9042, lng: 116.4074, country: "China", region: "asia" },
  "shanghai": { lat: 31.2304, lng: 121.4737, country: "China", region: "asia" },
  "shenzhen": { lat: 22.5431, lng: 114.0579, country: "China", region: "asia" },
  "guangzhou": { lat: 23.1291, lng: 113.2644, country: "China", region: "asia" },
  "hangzhou": { lat: 30.2741, lng: 120.1551, country: "China", region: "asia" },

  // South Asia
  "mumbai": { lat: 19.0760, lng: 72.8777, country: "India", region: "asia" },
  "bangalore": { lat: 12.9716, lng: 77.5946, country: "India", region: "asia" },
  "bengaluru": { lat: 12.9716, lng: 77.5946, country: "India", region: "asia" },
  "delhi": { lat: 28.7041, lng: 77.1025, country: "India", region: "asia" },
  "new delhi": { lat: 28.6139, lng: 77.2090, country: "India", region: "asia" },
  "hyderabad": { lat: 17.3850, lng: 78.4867, country: "India", region: "asia" },
  "chennai": { lat: 13.0827, lng: 80.2707, country: "India", region: "asia" },
  "pune": { lat: 18.5204, lng: 73.8567, country: "India", region: "asia" },
  "kolkata": { lat: 22.5726, lng: 88.3639, country: "India", region: "asia" },
  "colombo": { lat: 6.9271, lng: 79.8612, country: "Sri Lanka", region: "asia" },
  "dhaka": { lat: 23.8103, lng: 90.4125, country: "Bangladesh", region: "asia" },
  "karachi": { lat: 24.8607, lng: 67.0011, country: "Pakistan", region: "asia" },
  "lahore": { lat: 31.5497, lng: 74.3436, country: "Pakistan", region: "asia" },
  "islamabad": { lat: 33.6844, lng: 73.0479, country: "Pakistan", region: "asia" },

  // Oceania
  "sydney": { lat: -33.8688, lng: 151.2093, country: "Australia", region: "asia" },
  "melbourne": { lat: -37.8136, lng: 144.9631, country: "Australia", region: "asia" },
  "brisbane": { lat: -27.4698, lng: 153.0251, country: "Australia", region: "asia" },
  "perth": { lat: -31.9505, lng: 115.8605, country: "Australia", region: "asia" },
  "auckland": { lat: -36.8509, lng: 174.7645, country: "New Zealand", region: "asia" },
  "wellington": { lat: -41.2866, lng: 174.7756, country: "New Zealand", region: "asia" },
};

export const COUNTRY_CAPITAL_COORDINATES: Record<string, { lat: number; lng: number; region: MapRegion }> = {
  // Common aliases
  "uk": { lat: 51.5074, lng: -0.1278, region: "europe" },
  "united kingdom": { lat: 51.5074, lng: -0.1278, region: "europe" },
  "usa": { lat: 38.9072, lng: -77.0369, region: "europe" }, // Default to europe for now
  "us": { lat: 38.9072, lng: -77.0369, region: "europe" },
  "united states": { lat: 38.9072, lng: -77.0369, region: "europe" },
  "united states of america": { lat: 38.9072, lng: -77.0369, region: "europe" },

  // Europe
  "norway": { lat: 59.9139, lng: 10.7522, region: "europe" },
  "sweden": { lat: 59.3293, lng: 18.0686, region: "europe" },
  "denmark": { lat: 55.6761, lng: 12.5683, region: "europe" },
  "finland": { lat: 60.1699, lng: 24.9384, region: "europe" },
  "iceland": { lat: 64.1466, lng: -21.9426, region: "europe" },
  "lithuania": { lat: 54.6872, lng: 25.2797, region: "europe" },
  "latvia": { lat: 56.9496, lng: 24.1052, region: "europe" },
  "estonia": { lat: 59.4370, lng: 24.7536, region: "europe" },
  "ireland": { lat: 53.3498, lng: -6.2603, region: "europe" },
  "france": { lat: 48.8566, lng: 2.3522, region: "europe" },
  "belgium": { lat: 50.8503, lng: 4.3517, region: "europe" },
  "netherlands": { lat: 52.3676, lng: 4.9041, region: "europe" },
  "luxembourg": { lat: 49.6116, lng: 6.1319, region: "europe" },
  "germany": { lat: 52.5200, lng: 13.4050, region: "europe" },
  "austria": { lat: 48.2082, lng: 16.3738, region: "europe" },
  "switzerland": { lat: 46.9480, lng: 7.4474, region: "europe" },
  "czech republic": { lat: 50.0755, lng: 14.4378, region: "europe" },
  "czechia": { lat: 50.0755, lng: 14.4378, region: "europe" },
  "poland": { lat: 52.2297, lng: 21.0122, region: "europe" },
  "slovakia": { lat: 48.1486, lng: 17.1077, region: "europe" },
  "hungary": { lat: 47.4979, lng: 19.0402, region: "europe" },
  "croatia": { lat: 45.8150, lng: 15.9819, region: "europe" },
  "slovenia": { lat: 46.0569, lng: 14.5058, region: "europe" },
  "bosnia and herzegovina": { lat: 43.8563, lng: 18.4131, region: "europe" },
  "serbia": { lat: 44.7866, lng: 20.4489, region: "europe" },
  "montenegro": { lat: 42.4304, lng: 19.2594, region: "europe" },
  "north macedonia": { lat: 41.9973, lng: 21.4280, region: "europe" },
  "macedonia": { lat: 41.9973, lng: 21.4280, region: "europe" },
  "albania": { lat: 41.3275, lng: 19.8187, region: "europe" },
  "kosovo": { lat: 42.6629, lng: 21.1655, region: "europe" },
  "portugal": { lat: 38.7223, lng: -9.1393, region: "europe" },
  "spain": { lat: 40.4168, lng: -3.7038, region: "europe" },
  "italy": { lat: 41.9028, lng: 12.4964, region: "europe" },
  "greece": { lat: 37.9838, lng: 23.7275, region: "europe" },
  "bulgaria": { lat: 42.6977, lng: 23.3219, region: "europe" },
  "romania": { lat: 44.4268, lng: 26.1025, region: "europe" },
  "moldova": { lat: 47.0105, lng: 28.8638, region: "europe" },
  "ukraine": { lat: 50.4501, lng: 30.5234, region: "europe" },
  "belarus": { lat: 53.9006, lng: 27.5590, region: "europe" },
  "russia": { lat: 55.7558, lng: 37.6173, region: "europe" },
  "turkey": { lat: 39.9334, lng: 32.8597, region: "europe" },

  // Asia Pacific
  "singapore": { lat: 1.3521, lng: 103.8198, region: "asia" },
  "malaysia": { lat: 3.1390, lng: 101.6869, region: "asia" },
  "thailand": { lat: 13.7563, lng: 100.5018, region: "asia" },
  "indonesia": { lat: -6.2088, lng: 106.8456, region: "asia" },
  "vietnam": { lat: 21.0285, lng: 105.8542, region: "asia" },
  "philippines": { lat: 14.5995, lng: 120.9842, region: "asia" },
  "cambodia": { lat: 11.5564, lng: 104.9282, region: "asia" },
  "myanmar": { lat: 16.8661, lng: 96.1951, region: "asia" },
  "hong kong": { lat: 22.3193, lng: 114.1694, region: "asia" },
  "japan": { lat: 35.6762, lng: 139.6503, region: "asia" },
  "south korea": { lat: 37.5665, lng: 126.9780, region: "asia" },
  "korea": { lat: 37.5665, lng: 126.9780, region: "asia" },
  "taiwan": { lat: 25.0330, lng: 121.5654, region: "asia" },
  "china": { lat: 39.9042, lng: 116.4074, region: "asia" },
  "india": { lat: 28.6139, lng: 77.2090, region: "asia" },
  "sri lanka": { lat: 6.9271, lng: 79.8612, region: "asia" },
  "bangladesh": { lat: 23.8103, lng: 90.4125, region: "asia" },
  "pakistan": { lat: 33.6844, lng: 73.0479, region: "asia" },
  "australia": { lat: -33.8688, lng: 151.2093, region: "asia" },
  "new zealand": { lat: -41.2866, lng: 174.7756, region: "asia" },
};

export const resolveLocation = (args: { city?: string | null; country?: string | null }) => {
  const city = args.city?.trim() || "";
  const country = args.country?.trim() || "";

  if (city) {
    const cityKey = normalizeCityKey(city);
    const cityCoords = CITY_COORDINATES[cityKey];
    if (cityCoords) {
      return { lat: cityCoords.lat, lng: cityCoords.lng, country: cityCoords.country, region: cityCoords.region, source: "city" as const };
    }
  }

  if (country) {
    const countryKey = normalizeCountryKey(country);
    const capitalCoords = COUNTRY_CAPITAL_COORDINATES[countryKey];
    if (capitalCoords) {
      return { lat: capitalCoords.lat, lng: capitalCoords.lng, country: country || null, region: capitalCoords.region, source: "country_capital" as const };
    }
  }

  return { lat: null, lng: null, country: country || null, region: null, source: "none" as const };
};

// Helper to get region for a city/country
export const getRegionForLocation = (args: { city?: string | null; country?: string | null }): MapRegion | null => {
  const result = resolveLocation(args);
  return result.region || null;
};
