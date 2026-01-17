export type CityCoordinates = { lat: number; lng: number; country: string };

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
    .replace(/[’'`]/g, "")
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
  // Nordics
  "oslo": { lat: 59.9139, lng: 10.7522, country: "Norway" },
  "stockholm": { lat: 59.3293, lng: 18.0686, country: "Sweden" },
  "copenhagen": { lat: 55.6761, lng: 12.5683, country: "Denmark" },
  "helsinki": { lat: 60.1699, lng: 24.9384, country: "Finland" },
  "reykjavik": { lat: 64.1466, lng: -21.9426, country: "Iceland" },

  // Baltics
  "vilnius": { lat: 54.6872, lng: 25.2797, country: "Lithuania" },
  "riga": { lat: 56.9496, lng: 24.1052, country: "Latvia" },
  "tallinn": { lat: 59.4370, lng: 24.7536, country: "Estonia" },

  // Western / Central Europe
  "london": { lat: 51.5074, lng: -0.1278, country: "UK" },
  "dublin": { lat: 53.3498, lng: -6.2603, country: "Ireland" },
  "paris": { lat: 48.8566, lng: 2.3522, country: "France" },
  "brussels": { lat: 50.8503, lng: 4.3517, country: "Belgium" },
  "amsterdam": { lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  "luxembourg": { lat: 49.6116, lng: 6.1319, country: "Luxembourg" },
  "berlin": { lat: 52.5200, lng: 13.4050, country: "Germany" },
  "vienna": { lat: 48.2082, lng: 16.3738, country: "Austria" },
  "bern": { lat: 46.9480, lng: 7.4474, country: "Switzerland" },
  "prague": { lat: 50.0755, lng: 14.4378, country: "Czech Republic" },
  "warsaw": { lat: 52.2297, lng: 21.0122, country: "Poland" },
  "bratislava": { lat: 48.1486, lng: 17.1077, country: "Slovakia" },
  "budapest": { lat: 47.4979, lng: 19.0402, country: "Hungary" },

  // Balkans
  "zagreb": { lat: 45.8150, lng: 15.9819, country: "Croatia" },
  "ljubljana": { lat: 46.0569, lng: 14.5058, country: "Slovenia" },
  "sarajevo": { lat: 43.8563, lng: 18.4131, country: "Bosnia and Herzegovina" },
  "belgrade": { lat: 44.7866, lng: 20.4489, country: "Serbia" },
  "podgorica": { lat: 42.4304, lng: 19.2594, country: "Montenegro" },
  "skopje": { lat: 41.9973, lng: 21.4280, country: "North Macedonia" },
  "tirana": { lat: 41.3275, lng: 19.8187, country: "Albania" },
  "pristina": { lat: 42.6629, lng: 21.1655, country: "Kosovo" },

  // Southern / Eastern Europe
  "lisbon": { lat: 38.7223, lng: -9.1393, country: "Portugal" },
  "madrid": { lat: 40.4168, lng: -3.7038, country: "Spain" },
  "rome": { lat: 41.9028, lng: 12.4964, country: "Italy" },
  "athens": { lat: 37.9838, lng: 23.7275, country: "Greece" },
  "sofia": { lat: 42.6977, lng: 23.3219, country: "Bulgaria" },
  "bucharest": { lat: 44.4268, lng: 26.1025, country: "Romania" },
  "chisinau": { lat: 47.0105, lng: 28.8638, country: "Moldova" },
  "kyiv": { lat: 50.4501, lng: 30.5234, country: "Ukraine" },
  "minsk": { lat: 53.9006, lng: 27.5590, country: "Belarus" },
  "moscow": { lat: 55.7558, lng: 37.6173, country: "Russia" },

  // Turkey (partly Europe) + frequent city
  "ankara": { lat: 39.9334, lng: 32.8597, country: "Turkey" },
  "istanbul": { lat: 41.0082, lng: 28.9784, country: "Turkey" },

  // Common non-capital European hubs
  "barcelona": { lat: 41.3851, lng: 2.1734, country: "Spain" },
  "milan": { lat: 45.4642, lng: 9.1900, country: "Italy" },
  "zurich": { lat: 47.3769, lng: 8.5417, country: "Switzerland" },
  "geneva": { lat: 46.2044, lng: 6.1432, country: "Switzerland" },

  // France secondary cities
  "lyon": { lat: 45.7640, lng: 4.8357, country: "France" },
  "marseille": { lat: 43.2965, lng: 5.3698, country: "France" },
  "nice": { lat: 43.7102, lng: 7.2620, country: "France" },
  "toulouse": { lat: 43.6047, lng: 1.4442, country: "France" },
  "bordeaux": { lat: 44.8378, lng: -0.5792, country: "France" },
  "strasbourg": { lat: 48.5734, lng: 7.7521, country: "France" },
  "nantes": { lat: 47.2184, lng: -1.5536, country: "France" },
  "lille": { lat: 50.6292, lng: 3.0573, country: "France" },

  // Spain secondary cities
  "valencia": { lat: 39.4699, lng: -0.3763, country: "Spain" },
  "seville": { lat: 37.3891, lng: -5.9845, country: "Spain" },
  "bilbao": { lat: 43.2630, lng: -2.9350, country: "Spain" },
  "malaga": { lat: 36.7213, lng: -4.4214, country: "Spain" },
  "zaragoza": { lat: 41.6488, lng: -0.8891, country: "Spain" },

  // Italy secondary cities
  "naples": { lat: 40.8518, lng: 14.2681, country: "Italy" },
  "turin": { lat: 45.0703, lng: 7.6869, country: "Italy" },
  "florence": { lat: 43.7696, lng: 11.2558, country: "Italy" },
  "bologna": { lat: 44.4949, lng: 11.3426, country: "Italy" },
  "venice": { lat: 45.4408, lng: 12.3155, country: "Italy" },
  "genoa": { lat: 44.4056, lng: 8.9463, country: "Italy" },

  // Germany secondary cities
  "munich": { lat: 48.1351, lng: 11.5820, country: "Germany" },
  "frankfurt": { lat: 50.1109, lng: 8.6821, country: "Germany" },
  "hamburg": { lat: 53.5511, lng: 9.9937, country: "Germany" },
  "cologne": { lat: 50.9375, lng: 6.9603, country: "Germany" },
  "dusseldorf": { lat: 51.2277, lng: 6.7735, country: "Germany" },
  "stuttgart": { lat: 48.7758, lng: 9.1829, country: "Germany" },
  "leipzig": { lat: 51.3397, lng: 12.3731, country: "Germany" },

  // UK secondary cities
  "manchester": { lat: 53.4808, lng: -2.2426, country: "UK" },
  "birmingham": { lat: 52.4862, lng: -1.8904, country: "UK" },
  "edinburgh": { lat: 55.9533, lng: -3.1883, country: "UK" },
  "glasgow": { lat: 55.8642, lng: -4.2518, country: "UK" },
  "bristol": { lat: 51.4545, lng: -2.5879, country: "UK" },
  "leeds": { lat: 53.8008, lng: -1.5491, country: "UK" },
  "liverpool": { lat: 53.4084, lng: -2.9916, country: "UK" },
  "cambridge": { lat: 52.2053, lng: 0.1218, country: "UK" },
  "oxford": { lat: 51.7520, lng: -1.2577, country: "UK" },

  // Netherlands secondary cities
  "rotterdam": { lat: 51.9244, lng: 4.4777, country: "Netherlands" },
  "the hague": { lat: 52.0705, lng: 4.3007, country: "Netherlands" },
  "utrecht": { lat: 52.0907, lng: 5.1214, country: "Netherlands" },
  "eindhoven": { lat: 51.4416, lng: 5.4697, country: "Netherlands" },

  // Belgium secondary cities
  "antwerp": { lat: 51.2194, lng: 4.4025, country: "Belgium" },
  "ghent": { lat: 51.0543, lng: 3.7174, country: "Belgium" },
  "liege": { lat: 50.6326, lng: 5.5797, country: "Belgium" },

  // Portugal secondary cities
  "porto": { lat: 41.1579, lng: -8.6291, country: "Portugal" },
  "braga": { lat: 41.5518, lng: -8.4229, country: "Portugal" },

  // Switzerland secondary cities
  "basel": { lat: 47.5596, lng: 7.5886, country: "Switzerland" },
  "lausanne": { lat: 46.5197, lng: 6.6323, country: "Switzerland" },

  // Austria secondary cities
  "salzburg": { lat: 47.8095, lng: 13.0550, country: "Austria" },
  "innsbruck": { lat: 47.2692, lng: 11.4041, country: "Austria" },
  "graz": { lat: 47.0707, lng: 15.4395, country: "Austria" },

  // Ireland secondary cities
  "cork": { lat: 51.8969, lng: -8.4863, country: "Ireland" },
  "galway": { lat: 53.2707, lng: -9.0568, country: "Ireland" },
};

export const COUNTRY_CAPITAL_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Common aliases
  "uk": { lat: 51.5074, lng: -0.1278 },
  "united kingdom": { lat: 51.5074, lng: -0.1278 },
  "usa": { lat: 38.9072, lng: -77.0369 },
  "us": { lat: 38.9072, lng: -77.0369 },
  "united states": { lat: 38.9072, lng: -77.0369 },
  "united states of america": { lat: 38.9072, lng: -77.0369 },

  // Europe
  "norway": { lat: 59.9139, lng: 10.7522 },
  "sweden": { lat: 59.3293, lng: 18.0686 },
  "denmark": { lat: 55.6761, lng: 12.5683 },
  "finland": { lat: 60.1699, lng: 24.9384 },
  "iceland": { lat: 64.1466, lng: -21.9426 },
  "lithuania": { lat: 54.6872, lng: 25.2797 },
  "latvia": { lat: 56.9496, lng: 24.1052 },
  "estonia": { lat: 59.4370, lng: 24.7536 },
  "ireland": { lat: 53.3498, lng: -6.2603 },
  "france": { lat: 48.8566, lng: 2.3522 },
  "belgium": { lat: 50.8503, lng: 4.3517 },
  "netherlands": { lat: 52.3676, lng: 4.9041 },
  "luxembourg": { lat: 49.6116, lng: 6.1319 },
  "germany": { lat: 52.5200, lng: 13.4050 },
  "austria": { lat: 48.2082, lng: 16.3738 },
  "switzerland": { lat: 46.9480, lng: 7.4474 },
  "czech republic": { lat: 50.0755, lng: 14.4378 },
  "czechia": { lat: 50.0755, lng: 14.4378 },
  "poland": { lat: 52.2297, lng: 21.0122 },
  "slovakia": { lat: 48.1486, lng: 17.1077 },
  "hungary": { lat: 47.4979, lng: 19.0402 },
  "croatia": { lat: 45.8150, lng: 15.9819 },
  "slovenia": { lat: 46.0569, lng: 14.5058 },
  "bosnia and herzegovina": { lat: 43.8563, lng: 18.4131 },
  "serbia": { lat: 44.7866, lng: 20.4489 },
  "montenegro": { lat: 42.4304, lng: 19.2594 },
  "north macedonia": { lat: 41.9973, lng: 21.4280 },
  "macedonia": { lat: 41.9973, lng: 21.4280 },
  "albania": { lat: 41.3275, lng: 19.8187 },
  "kosovo": { lat: 42.6629, lng: 21.1655 },
  "portugal": { lat: 38.7223, lng: -9.1393 },
  "spain": { lat: 40.4168, lng: -3.7038 },
  "italy": { lat: 41.9028, lng: 12.4964 },
  "greece": { lat: 37.9838, lng: 23.7275 },
  "bulgaria": { lat: 42.6977, lng: 23.3219 },
  "romania": { lat: 44.4268, lng: 26.1025 },
  "moldova": { lat: 47.0105, lng: 28.8638 },
  "ukraine": { lat: 50.4501, lng: 30.5234 },
  "belarus": { lat: 53.9006, lng: 27.5590 },
  "russia": { lat: 55.7558, lng: 37.6173 },
  "turkey": { lat: 39.9334, lng: 32.8597 },
};

export const resolveLocation = (args: { city?: string | null; country?: string | null }) => {
  const city = args.city?.trim() || "";
  const country = args.country?.trim() || "";

  if (city) {
    const cityKey = normalizeCityKey(city);
    const cityCoords = CITY_COORDINATES[cityKey];
    if (cityCoords) {
      return { lat: cityCoords.lat, lng: cityCoords.lng, country: cityCoords.country, source: "city" as const };
    }
  }

  if (country) {
    const countryKey = normalizeCountryKey(country);
    const capitalCoords = COUNTRY_CAPITAL_COORDINATES[countryKey];
    if (capitalCoords) {
      return { lat: capitalCoords.lat, lng: capitalCoords.lng, country: country || null, source: "country_capital" as const };
    }
  }

  return { lat: null, lng: null, country: country || null, source: "none" as const };
};
