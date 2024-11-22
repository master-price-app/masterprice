export const calculateRegion = (points) => {
  const PADDING = 2;  // Padding multiplier for better zoom
  const MIN_DELTA = 0.01;

  // Check if points are valid
  if (!points || points.length === 0) {
    return null;
  }

  // Handle single point
  if (points.length === 1) {
    return {
      latitude: points[0].latitude,
      longitude: points[0].longitude,
      latitudeDelta: MIN_DELTA,
      longitudeDelta: MIN_DELTA,
    };
  }

  // Get latitudes and longitudes
  const latitudes = points.map(point => point.latitude);
  const longitudes = points.map(point => point.longitude);

  // Calculate min and max latitudes and longitudes
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLong = Math.min(...longitudes);
  const maxLong = Math.max(...longitudes);

  // Calculate center coordinates
  const centerLatitude = (minLat + maxLat) / 2;
  const centerLongitude = (minLong + maxLong) / 2;

  // Calculate padding
  const latitudeDelta = (maxLat - minLat) * PADDING;
  const longitudeDelta = (maxLong - minLong) * PADDING;

  // Return region
  return {
    latitude: centerLatitude,
    longitude: centerLongitude,
    latitudeDelta: Math.max(latitudeDelta, MIN_DELTA),
    longitudeDelta: Math.max(longitudeDelta, MIN_DELTA),
  };
};
