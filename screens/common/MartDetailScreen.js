import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { getLocationById, chainLogoMapping } from "../../services/martService";
import { requestNotificationsPermission } from "../../utils/permissionUtils";
import { getNotificationByChainId, scheduleWeeklyNotification } from "../../utils/notificationUtils";
import { handleLocationTracking } from "../../utils/mapUtils";
import PressableButton from "../../components/PressableButton";

export default function MartDetailScreen({ navigation, route }) {
  const { locationId } = route.params;
  const [martData, setMartData] = useState(null);
  const [hasNotification, setHasNotification] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Fetch mart data
  useEffect(() => {
    const fetchMartData = async () => {
      try {
        setLoading(true);
        const data = await getLocationById(locationId);
        setMartData(data);
      } catch (err) {
        setError("Failed to load mart details");
        console.error("Error loading mart details: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMartData();
  }, [locationId]);

  // Check notification status
  useEffect(() => {
    const checkNotification = async () => {
      if (!martData?.chain?.chainId) return;

      try {
        const existingNotification = await getNotificationByChainId(martData.chain.chainId);
        setHasNotification(!!existingNotification);
        setNotification(existingNotification);
      } catch (error) {
        console.error("Error checking notification status:", error);
      }
    };

    checkNotification();
  }, [martData]);

  const handleNotification = useCallback(async () => {
    try {
      // 1. Check notification permission
      const hasPermission = await requestNotificationsPermission();
      if (!hasPermission) {
        return;
      }

      // 2. Create notification content
      const content = {
        title: `Deal Reminder: ${martData.chain.chainName}`,
        body: "Time to check this week's deals",
        data: {
          chainId: martData.chain.chainId,
          type: "deal_reminder",
        },
      };

      // 3. Set notification schedule (temporary fixed time)
      const schedule = {
        weekday: 3, // Tuesday
        hour: 10,   // 10 AM
        minute: 0,
      };

      // 4. Schedule the notification
      const notificationId = await scheduleWeeklyNotification(content, schedule);
      console.log(`Notification scheduled with ID: ${notificationId}`);

      // 5. Update notification state
      setHasNotification(true);
      setNotification({ id: notificationId });

      // 6. Alert success message
      Alert.alert(
        "Notification Set",
        `You will receive weekly deal alerts for ${martData.chain.chainName}`
      );
    } catch (error) {
      console.error("Error scheduling notification: ", error);
      Alert.alert("Error", "Failed to set notification. Please try again.");
    }
  }, [martData]);

  // Handle locating user
  const handleLocateUser = useCallback(async () => {
    const martCoords = [{
      latitude: martData.location.coordinates.latitude,
      longitude: martData.location.coordinates.longitude,
    }];

    await handleLocationTracking({
      setUserLocation,
      setLocationSubscription,
      locationSubscription,
      mapRef,
      points: martCoords,
    });
  }, [locationSubscription, martData]);

  // Handle navigation
  const handleNavigation = useCallback(() => {
    if (!martData?.location) return;

    const { latitude, longitude } = martData.location.coordinates;
    const label = encodeURIComponent(martData.location.name);

    // Universal map URLs (show location without starting navigation)
    const mapUrls = {
      // iOS Maps default
      ios: `maps:?q=${label}&ll=${latitude},${longitude}`,
      // Android default map handler
      android: `geo:${latitude},${longitude}?q=${label}`,

      // Fallback options: Direct navigation
      // iOS Google Navigation
      // iosNav: `maps://?daddr=${latitude},${longitude}&ll=${latitude},${longitude}&q=${label}`,
      // Android Google Navigation
      // androidNav: `google.navigation:q=${latitude},${longitude}&label=${label}`,

      // Final fallback: Google Maps Web version
      // https://developers.google.com/maps/documentation/urls/get-started
      web: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`,
    };

    const url = Platform.select({
      ios: mapUrls.ios,
      android: mapUrls.android,
      default: mapUrls.web,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        return Linking.openURL(mapUrls.web);
      }
    }).catch((err) => {
      console.error("Error opening navigation: ", err);
      Alert.alert("Error", "Failed to open map. Please try again.");
    });
  }, [martData]);

  // Helper function: Format time string to "HH:MM AM/PM"
  const formatHours = (timeStr) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-CA', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Get business hours component
  const BusinessHours = ({ hours }) => {
    // Get today's day of the week (0-6, Sunday is 0)
    const today = new Date().getDay();

    // If store is open 24 hours, display that
    if (hours.is24Hours) {
      return (
        <View style={styles.hoursContainer}>
          <Text style={styles.hours24Text}>Open 24 Hours</Text>
        </View>
      );
    }

    // Display regular hours
    return (
      <View style={styles.hoursContainer}>
        {Object.entries(hours.regularHours).map(([day, regularHours]) => {
          // Get day number (0-6)
          const dayNum = parseInt(day);
          // Check if today
          const isToday = dayNum === today;

          return (
            <View 
              key={day}
              style={[
                styles.hoursRow,
                isToday && styles.hoursRowHighlight
              ]}
            >
              {/* Display the day of the week */}
              <Text style={[
                styles.hoursLabel,
                isToday && styles.hoursLabelHighlight
              ]}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayNum]}
              </Text>
              {/* Display the hours */}
              <Text style={[
                styles.hoursText,
                isToday && styles.hoursTextHighlight,
              ]}>
                {`${formatHours(regularHours.open)} - ${formatHours(regularHours.close)}`}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Get notification button text
  const getNotificationButtonText = () => {
    return hasNotification ? "Cancel Notification" : "Schedule Weekly Deal Notification";
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={48} color="#666" />
        <Text style={styles.errorText}>{error}</Text>
        <PressableButton
          pressedHandler={() => navigation.goBack()}
          componentStyle={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Back</Text>
        </PressableButton>
      </View>
    );
  }

  // No data state
  if (!martData) {
    return (
      <View style={styles.centerContainer}>
        <Text>No data available</Text>
      </View>
    );
  }

  const { chain, location } = martData;

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Header */}
      <View style={styles.headerContainer}>
        {/* Chain Logo */}
        <Image
          source={chainLogoMapping[chain.chainId.toLowerCase()]}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Chain Name */}
        <Text style={styles.chainName}>{chain.chainName}</Text>

        <PressableButton
          onPress={handleNotification}
          componentStyle={[
            styles.unsubscribedNotificationButton,
            hasNotification && styles.subscribedNotificationButton
          ]}
          pressableStyle={styles.notificationButtonPressable}
        >
          <MaterialIcons
            name={hasNotification ? "notifications-active" : "notifications-none"}
            size={24}
            color="white"
          />
          <Text style={styles.notificationButtonText}>
            {getNotificationButtonText()}
          </Text>
        </PressableButton>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* Mart location */}
          <Marker
            coordinate={{
              latitude: location.coordinates.latitude,
              longitude: location.coordinates.longitude,
            }}
            title={location.name}
            description={location.address.street}
          />
          {/* User location */}
          {userLocation && (
            <Marker
              coordinate={userLocation}
            >
              <View style={styles.userLocationMarker}>
                <View style={styles.userLocationDot} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Location button */}
        <PressableButton
          onPress={handleLocateUser}
          componentStyle={[
            styles.locationButton,
            userLocation && styles.locationButtonActive
          ]}
        >
          <MaterialIcons
            name="my-location"
            size={24}
            color={userLocation ? "#007AFF" : "#666"}
          />
        </PressableButton>

        {/* Navigate button */}
        <PressableButton
          onPress={handleNavigation}
          componentStyle={styles.navigateButton}
          pressableStyle={styles.navigateButtonPressable}
        >
          <MaterialIcons name="directions" size={24} color="white" />
          <Text style={styles.navigateButtonText}>Navigate</Text>
        </PressableButton>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="location-on" size={24} color="#E31837" />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>
        <Text style={styles.locationName}>{location.name}</Text>
        <Text style={styles.address}>
          {location.address.street}
          {"\n"}
          {location.address.city}, {location.address.province}
          {"\n"}
          {location.address.postalCode}
        </Text>
      </View>

      {/* Hours Section */}
      {location.hours && (
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="access-time" size={24} color="#E31837" />
            <Text style={styles.sectionTitle}>Hours</Text>
          </View>
          <BusinessHours hours={location.hours} />
        </View>
      )}
    </ScrollView>
  );
}

// Temporary styles
const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  // Error Section
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorButton: {
    marginTop: 16,
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Header Section
  headerContainer: {
    backgroundColor: "white",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: "contain",
    marginBottom: 8,
  },
  chainName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  // Notification Button
  unsubscribedNotificationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  subscribedNotificationButton: {
    backgroundColor: "#34C759",
  },
  notificationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Map Section
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 122, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
    borderWidth: 2,
    borderColor: "white",
  },
  locationButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "white",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locationButtonActive: {
    backgroundColor: "#f0f9ff",
  },
  navigateButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navigateButtonPressable: {
    backgroundColor: "#0056b3",
    opacity: 0.9,
  },
  navigateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Info Section
  infoSection: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  // Hours Section
  hoursContainer: {
    marginTop: 8,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  hoursRowHighlight: {
    backgroundColor: "#f0f9ff",
  },
  hoursLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  hoursLabelHighlight: {
    color: "#0066cc",
    fontWeight: "600",
  },
  hoursText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  hoursTextHighlight: {
    color: "#0066cc",
    fontWeight: "600",
  },
  hours24Text: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    paddingVertical: 8,
  },
});
