export interface Destination {
  value: string;
  label: string;
  lat: number;
  lng: number;
}

export const POPULAR_DESTINATIONS: Destination[] = [
  // --- EUROPE ---
  { value: 'paris', label: 'Paris, France', lat: 48.8566, lng: 2.3522 },
  { value: 'london', label: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { value: 'rome', label: 'Rome, Italy', lat: 41.9028, lng: 12.4964 },
  { value: 'barcelona', label: 'Barcelona, Spain', lat: 41.3851, lng: 2.1734 },
  { value: 'amsterdam', label: 'Amsterdam, Netherlands', lat: 52.3676, lng: 4.9041 },
  { value: 'prague', label: 'Prague, Czech Republic', lat: 50.0755, lng: 14.4378 },
  { value: 'lisbon', label: 'Lisbon, Portugal', lat: 38.7223, lng: -9.1393 },
  { value: 'santorini', label: 'Santorini, Greece', lat: 36.3932, lng: 25.4615 },
  { value: 'venice', label: 'Venice, Italy', lat: 45.4408, lng: 12.3155 },
  { value: 'florence', label: 'Florence, Italy', lat: 43.7696, lng: 11.2558 },
  { value: 'athens', label: 'Athens, Greece', lat: 37.9838, lng: 23.7275 },
  { value: 'berlin', label: 'Berlin, Germany', lat: 52.52, lng: 13.405 },
  { value: 'vienna', label: 'Vienna, Austria', lat: 48.2082, lng: 16.3738 },
  { value: 'dublin', label: 'Dublin, Ireland', lat: 53.3498, lng: -6.2603 },
  { value: 'edinburgh', label: 'Edinburgh, Scotland', lat: 55.9533, lng: -3.1883 },
  { value: 'budapest', label: 'Budapest, Hungary', lat: 47.4979, lng: 19.0402 },
  { value: 'istanbul', label: 'Istanbul, Turkey', lat: 41.0082, lng: 28.9784 },
  { value: 'reykjavik', label: 'Reykjavik, Iceland', lat: 64.1466, lng: -21.9426 },
  { value: 'zurich', label: 'Zurich, Switzerland', lat: 47.3769, lng: 8.5417 },
  { value: 'copenhagen', label: 'Copenhagen, Denmark', lat: 55.6761, lng: 12.5683 },

  // --- ASIA ---
  { value: 'tokyo', label: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { value: 'kyoto', label: 'Kyoto, Japan', lat: 35.0116, lng: 135.7681 },
  { value: 'osaka', label: 'Osaka, Japan', lat: 34.6937, lng: 135.5023 },
  { value: 'bali', label: 'Bali, Indonesia', lat: -8.4095, lng: 115.1889 },
  { value: 'bangkok', label: 'Bangkok, Thailand', lat: 13.7563, lng: 100.5018 },
  { value: 'phuket', label: 'Phuket, Thailand', lat: 7.8804, lng: 98.3923 },
  { value: 'singapore', label: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { value: 'seoul', label: 'Seoul, South Korea', lat: 37.5665, lng: 126.978 },
  { value: 'dubai', label: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
  { value: 'hanoi', label: 'Hanoi, Vietnam', lat: 21.0285, lng: 105.8542 },
  { value: 'ho-chi-minh', label: 'Ho Chi Minh City, Vietnam', lat: 10.8231, lng: 106.6297 },
  { value: 'hong-kong', label: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { value: 'marrakech', label: 'Marrakech, Morocco', lat: 31.6295, lng: -7.9811 },
  { value: 'mumbai', label: 'Mumbai, India', lat: 19.076, lng: 72.8777 },
  { value: 'delhi', label: 'New Delhi, India', lat: 28.6139, lng: 77.209 },
  { value: 'jaipur', label: 'Jaipur, India', lat: 26.9124, lng: 75.7873 },
  { value: 'maldives', label: 'Maldives', lat: 3.2028, lng: 73.2207 },

  // --- NORTH AMERICA ---
  { value: 'new-york', label: 'New York, USA', lat: 40.7128, lng: -74.006 },
  { value: 'los-angeles', label: 'Los Angeles, USA', lat: 34.0522, lng: -118.2437 },
  { value: 'san-francisco', label: 'San Francisco, USA', lat: 37.7749, lng: -122.4194 },
  { value: 'las-vegas', label: 'Las Vegas, USA', lat: 36.1699, lng: -115.1398 },
  { value: 'miami', label: 'Miami, USA', lat: 25.7617, lng: -80.1918 },
  { value: 'orlando', label: 'Orlando, USA', lat: 28.5383, lng: -81.3792 },
  { value: 'chicago', label: 'Chicago, USA', lat: 41.8781, lng: -87.6298 },
  { value: 'honolulu', label: 'Honolulu, Hawaii', lat: 21.3069, lng: -157.8583 },
  { value: 'vancouver', label: 'Vancouver, Canada', lat: 49.2827, lng: -123.1207 },
  { value: 'toronto', label: 'Toronto, Canada', lat: 43.651, lng: -79.347 },
  { value: 'montreal', label: 'Montreal, Canada', lat: 45.5017, lng: -73.5673 },
  { value: 'mexico-city', label: 'Mexico City, Mexico', lat: 19.4326, lng: -99.1332 },
  { value: 'cancun', label: 'Cancun, Mexico', lat: 21.1619, lng: -86.8515 },

  // --- SOUTH AMERICA ---
  { value: 'rio-de-janeiro', label: 'Rio de Janeiro, Brazil', lat: -22.9068, lng: -43.1729 },
  { value: 'buenos-aires', label: 'Buenos Aires, Argentina', lat: -34.6037, lng: -58.3816 },
  { value: 'cusco', label: 'Cusco, Peru', lat: -13.532, lng: -71.9675 },
  { value: 'lima', label: 'Lima, Peru', lat: -12.0464, lng: -77.0428 },
  { value: 'cartagena', label: 'Cartagena, Colombia', lat: 10.391, lng: -75.4794 },

  // --- OCEANIA & AFRICA ---
  { value: 'sydney', label: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
  { value: 'melbourne', label: 'Melbourne, Australia', lat: -37.8136, lng: 144.9631 },
  { value: 'auckland', label: 'Auckland, New Zealand', lat: -36.8485, lng: 174.7633 },
  { value: 'queenstown', label: 'Queenstown, New Zealand', lat: -45.0312, lng: 168.6626 },
  { value: 'cape-town', label: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241 },
  { value: 'cairo', label: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357 },
];
