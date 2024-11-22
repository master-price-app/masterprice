import * as Location from "expo-location";
import { requestLocationPermission } from "./permissionUtils";

const MAP_CONFIG = {
  PADDING: 2, // Padding multiplier for better zoom
  MIN_DELTA: 0.01,
};

const LOCATION_TRACKING_CONFIG = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 1000,   // Update every second
  distanceInterval: 1,  // Update every meter
};

// Calculate region for map
const calculateRegion = (points) => {
  // Check if points are valid
  if (!points || points.length === 0) {
    return null;
  }

  // Handle single point
  if (points.length === 1) {
    return {
      latitude: points[0].latitude,
      longitude: points[0].longitude,
      latitudeDelta: MAP_CONFIG.MIN_DELTA,
      longitudeDelta: MAP_CONFIG.MIN_DELTA,
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
  const latitudeDelta = (maxLat - minLat) * MAP_CONFIG.PADDING;
  const longitudeDelta = (maxLong - minLong) * MAP_CONFIG.PADDING;

  // Return region
  return {
    latitude: centerLatitude,
    longitude: centerLongitude,
    latitudeDelta: Math.max(latitudeDelta, MAP_CONFIG.MIN_DELTA),
    longitudeDelta: Math.max(longitudeDelta, MAP_CONFIG.MIN_DELTA),
  };
};

// Cleanup location subscription
const cleanupLocationSubscription = ({
  locationSubscription,
  setLocationSubscription,
  setUserLocation,
}) => {
  if (locationSubscription) {
    locationSubscription.remove();
    setLocationSubscription(null);
    setUserLocation(null);
    return true;
  }
  return false;
};

// Get current location
const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: LOCATION_TRACKING_CONFIG.accuracy,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    throw error;
  }
};

// Start location tracking
const startLocationTracking = async (setUserLocation) => {
  try {
    return await Location.watchPositionAsync(
      LOCATION_TRACKING_CONFIG,
      (newLocation) => {
        setUserLocation({
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        });
      },
    );
  } catch (error) {
    throw error;
  }
};

// Update map view
const updateMapView = (mapRef, points) => {
  const region = calculateRegion(points);
  if (region && mapRef.current) {
    mapRef.current.animateToRegion(region, 1000); // Animate duration in ms (1 second)
  }
};

// Handle location tracking
export const handleLocationTracking = async ({
  setUserLocation,
  setLocationSubscription,
  locationSubscription,
  mapRef,
  points = [],
}) => {
  try {
    // 1. Cleanup subscription, if it exists
    if (cleanupLocationSubscription({
      locationSubscription,
      setLocationSubscription,
      setUserLocation,
    })) {
      return;
    }

    // 2. Request permission
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Please allow location access to see your position on the map.");
      return;
    }

    // 3. Get current location
    const userCoords = await getCurrentLocation();
    setUserLocation(userCoords);

    // 4. Update map view
    updateMapView(mapRef, [userCoords, ...points]);

    // 5. Start location tracking
    const subscription = await startLocationTracking(setUserLocation);
    setLocationSubscription(subscription);
  } catch (error) {
    console.error("Error handling location: ", error);
    Alert.alert("Error", "Failed to get your location. Please try again.");
  }
};
