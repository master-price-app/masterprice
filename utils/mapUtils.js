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

// Handle location tracking
export const handleLocationTracking = async ({
  setUserLocation,
  setLocationSubscription,
  locationSubscription,
  mapRef,
  points = [],
}) => {
  try {
    // Cleanup subscription, if it exists
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
      setUserLocation(null);
      return;
    }

    // Request permission
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Please allow location access to see your position on the map.");
      return;
    }

    // Get initial user location
    const location = await Location.getCurrentPositionAsync({
      accuracy: LOCATION_TRACKING_CONFIG.accuracy,
    });

    const userCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setUserLocation(userCoords);

    const allPoints = [userCoords, ...points];
    const region = calculateRegion(allPoints);
    mapRef.current?.animateToRegion(region, 1000); // Animate duration in ms (1 second)

    const subscription = await Location.watchPositionAsync(
      LOCATION_TRACKING_CONFIG,
      (newLocation) => {
        setUserLocation({
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        });
      },
    );

    // Set location subscription
    setLocationSubscription(subscription);
  } catch (error) {
    console.error("Error handling location: ", error);
    Alert.alert("Error", "Failed to get your location. Please try again.");
  }
};
