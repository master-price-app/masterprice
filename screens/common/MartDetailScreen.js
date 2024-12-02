import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Toast from 'react-native-toast-message';
import { MaterialIcons } from "@expo/vector-icons";
import { getLocationById, chainLogoMapping } from "../../services/martService";
import { requestNotificationsPermission } from "../../utils/permissionUtils";
import {
  cancelNotification,
  formatScheduleTime,
  getNotificationByChainId,
  scheduleWeeklyNotification
} from "../../utils/notificationUtils";
import { handleLocationTracking } from "../../utils/mapUtils";
import PressableButton from "../../components/PressableButton";

export default function MartDetailScreen({ navigation, route }) {
  const { locationId } = route.params;
  const [martData, setMartData] = useState(null);
  const [notificationId, setNotificationId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [selectedTime, setSelectedTime] = useState({
    weekday: 1,
    hour: 1,
    minute: 0,
    period: 'AM'
  });
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
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
        Toast.show({
          type: 'error',
          text1: 'Failed to load mart details',
          text2: 'Please try again later',
          position: 'top',
          visibilityTime: 3000,
        });
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
        setNotificationId(existingNotification?.identifier);
      } catch (error) {
        console.error("Error checking notification status:", error);
        setNotificationId(null);
      }
    };

    checkNotification();
  }, [martData]);

  const handleNotification = useCallback(async () => {
    try {
      // If already subscribed, handle unsubscribe
      if (notificationId) {
        Alert.alert(
          "Cancel Notification",
          "Are you sure you want to cancel this weekly deal reminder?",
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              style: "destructive",
              onPress: async () => {
                // Cancel notification
                try {
                  await cancelNotification(notificationId);
                  setNotificationId(null);
                  Toast.show({
                    type: 'success',
                    text1: 'Reminder Cancelled',
                    text2: 'Weekly deal reminder has been cancelled',
                    position: 'bottom',
                    visibilityTime: 2000,
                  });
                } catch (error) {
                  console.error("Error canceling notification:", error);
                  Toast.show({
                    type: 'error',
                    text1: 'Failed to cancel notification',
                    text2: 'Please try again later',
                    position: 'bottom',
                    visibilityTime: 3000,
                  });
                }
              }
            },
          ]
        );
        return;
      }

      // Check notification permission before showing time picker
      const hasPermission = await requestNotificationsPermission();
      if (!hasPermission) {
        return;
      }

      // Show time picker modal
      setIsTimePickerVisible(true);
    } catch (error) {
      console.error("Error handling notification: ", error);
      setNotificationId(null);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to process notification request. Please try again',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  }, [notificationId]);

  const handleScheduleNotification = useCallback(async (weekday, hour, minute) => {
    try {
      // Create notification content
      const content = {
        title: `Deal Reminder: ${martData.chain.chainName}`,
        body: "Time to check this week's deals",
        data: {
          chainId: martData.chain.chainId,
          type: "deal_reminder",
        },
      };

      // Set notification schedule
      const schedule = { weekday, hour, minute };

      // Schedule the notification
      const newNotificationId = await scheduleWeeklyNotification(content, schedule);

      // Update notification state
      setNotificationId(newNotificationId);

      // Close modal
      setIsTimePickerVisible(false);

      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Reminder Set',
        text2: `You will receive weekly deal alerts for ${martData.chain.chainName} every ${formatScheduleTime(schedule)}`,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error("Error scheduling notification:", error);
      Toast.show({
        type: 'error',
        text1: 'Failed to set reminder',
        text2: 'Please try again',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  }, [notificationId, martData]);

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
      Toast.show({
        type: 'error',
        text1: 'Failed to open map',
        text2: 'Please try again',
        position: 'bottom',
        visibilityTime: 3000,
      });
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
    return notificationId ? "Cancel Notification" : "Schedule Weekly Deal Notification";
  };

  const TimePickerModal = () => (
    <Modal
      visible={isTimePickerVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsTimePickerVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set Reminder Time</Text>

          {/* Weekday Picker */}
          <View style={styles.pickerSection}>
            <Text style={styles.pickerLabel}>Day of Week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <Pressable
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedTime?.weekday === index + 1 && styles.dayButtonSelected
                  ]}
                  onPress={() => setSelectedTime(prev => ({ ...prev, weekday: index + 1 }))}
                >
                  <Text style={[
                    styles.dayButtonText,
                    selectedTime?.weekday === index + 1 && styles.dayButtonTextSelected
                  ]}>{day}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Time Picker */}
          <View style={styles.pickerSection}>
            <Text style={styles.pickerLabel}>Time</Text>
            <View style={styles.timePickerContainer}>
              {/* Hour */}
              <ScrollView style={styles.timePickerColumn}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                  <Pressable
                    key={hour}
                    style={[
                      styles.timeButton,
                      selectedTime?.hour === hour && styles.timeButtonSelected
                    ]}
                    onPress={() => setSelectedTime(prev => ({ ...prev, hour }))}
                  >
                    <Text style={styles.timeButtonText}>{hour}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Minute */}
              <ScrollView style={styles.timePickerColumn}>
                {[0, 15, 30, 45].map(minute => (
                  <Pressable
                    key={minute}
                    style={[
                      styles.timeButton,
                      selectedTime?.minute === minute && styles.timeButtonSelected
                    ]}
                    onPress={() => setSelectedTime(prev => ({ ...prev, minute }))}
                  >
                    <Text style={styles.timeButtonText}>{minute.toString().padStart(2, '0')}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* AM/PM */}
              <View style={styles.periodContainer}>
                {['AM', 'PM'].map(period => (
                  <Pressable
                    key={period}
                    style={[
                      styles.periodButton,
                      selectedTime?.period === period && styles.periodButtonSelected
                    ]}
                    onPress={() => setSelectedTime(prev => ({ ...prev, period }))}
                  >
                    <Text style={styles.periodButtonText}>{period}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsTimePickerVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => {
                const hour = selectedTime?.period === 'PM' ?
                  (selectedTime?.hour % 12) + 12 :
                  selectedTime?.hour % 12;
                handleScheduleNotification(selectedTime?.weekday, hour, selectedTime?.minute);
                setIsTimePickerVisible(false);
              }}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

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

        {/* Notification Button */}
        <PressableButton
          onPress={handleNotification}
          componentStyle={[
            styles.unsubscribedNotificationButton,
            notificationId && styles.subscribedNotificationButton
          ]}
          pressableStyle={styles.notificationButtonPressable}
        >
          <MaterialIcons
            name={notificationId ? "notifications-active" : "notifications-none"}
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

      {/* Time Picker Modal */}
      <TimePickerModal />
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
    backgroundColor: "#E31837",
  },
  notificationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Time Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  pickerSection: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  dayButtonSelected: {
    backgroundColor: "#007AFF",
  },
  dayButtonText: {
    fontSize: 16,
    color: "#333",
  },
  dayButtonTextSelected: {
    color: "white",
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  timePickerColumn: {
    height: 200,
  },
  timeButton: {
    padding: 10,
    alignItems: "center",
  },
  timeButtonSelected: {
    backgroundColor: "#e6f2ff",
  },
  timeButtonText: {
    fontSize: 16,
  },
  periodContainer: {
    justifyContent: "center",
  },
  periodButton: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  periodButtonSelected: {
    backgroundColor: "#007AFF",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "white",
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
