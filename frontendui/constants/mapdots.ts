const monitoringDots = [
  {
    // North America - New York
    start: { lat: 40.7128, lng: -74.006, label: "New York, US" },
    end: { lat: 50.1109, lng: 8.6821, label: "Frankfurt, DE (Server)" },
  },
  {
    // Asia Pacific - Singapore
    start: { lat: 1.3521, lng: 103.8198, label: "Singapore, SG" },
    end: { lat: 50.1109, lng: 8.6821, label: "Frankfurt, DE (Server)" },
  },
  {
    // South America - São Paulo
    start: { lat: -23.5505, lng: -46.6333, label: "São Paulo, BR" },
    end: { lat: 50.1109, lng: 8.6821, label: "Frankfurt, DE (Server)" },
  },
  {
    // Australia/Oceania - Sydney
    start: { lat: -33.8688, lng: 151.2093, label: "Sydney, AU" },
    end: { lat: 50.1109, lng: 8.6821, label: "Frankfurt, DE (Server)" },
  },
  {
    // Africa - Cape Town
    start: { lat: -33.9249, lng: 18.4241, label: "Cape Town, ZA" },
    end: { lat: 50.1109, lng: 8.6821, label: "Frankfurt, DE (Server)" },
  },
];

const monitoringDotsUSServer = [
  {
    // Europe - London
    start: { lat: 51.5074, lng: -0.1278, label: "London, UK" },
    end: { lat: 39.0458, lng: -77.5089, label: "Virginia, US (Server)" },
  },
  {
    // Asia - Tokyo
    start: { lat: 35.6762, lng: 139.6503, label: "Tokyo, JP" },
    end: { lat: 39.0458, lng: -77.5089, label: "Virginia, US (Server)" },
  },
  {
    // West Coast US - San Francisco
    start: { lat: 37.7749, lng: -122.4194, label: "San Francisco, US" },
    end: { lat: 39.0458, lng: -77.5089, label: "Virginia, US (Server)" },
  },
  {
    // India - Mumbai
    start: { lat: 19.076, lng: 72.8777, label: "Mumbai, IN" },
    end: { lat: 39.0458, lng: -77.5089, label: "Virginia, US (Server)" },
  },
  {
    // Canada - Toronto
    start: { lat: 43.6532, lng: -79.3832, label: "Toronto, CA" },
    end: { lat: 39.0458, lng: -77.5089, label: "Virginia, US (Server)" },
  },
];

export { monitoringDots, monitoringDotsUSServer };
