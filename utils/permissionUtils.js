import { Alert, Linking } from "react-native";
import * as Location from 'expo-location';

// Permission alerts
const PERMISSION_ALERTS = {
  camera: {
    title: "Camera Permission Required",
    message: "Please enable camera permission in Settings to use this feature.",
    cancelText: "Cancel",
    settingsText: "Open Settings",
  },
  location: {
    title: "Location Permission Required",
    message: "Please enable location permission in Settings to use this feature.",
    cancelText: "Cancel",
    settingsText: "Open Settings",
  },
  notifications: {
    title: "Notifications Permission Required",
    message: "Please enable notifications permission in Settings to use this feature.",
    cancelText: "Cancel",
    settingsText: "Open Settings",
  },
};

// Generic permission request function
const requestPermission = async (
  permissionType,
  checkPermission,
  requestPermission
) => {
  try {
    // Check if permission has already been granted
    const existingStatus = await checkPermission();
    if (existingStatus === 'granted') {
      return true;
    }

    // Request permission
    const { status } = await requestPermission();
    if (status === 'granted') {
      return true;
    }

    const alert = PERMISSION_ALERTS[permissionType];

    return new Promise((resolve) => {
      Alert.alert(alert.title, alert.message, [
        {
          text: alert.cancelText,
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: alert.settingsText,
          onPress: async () => {
            await Linking.openSettings();
            resolve(true);
          },
        },
      ]);
    });
  } catch (error) {
    console.error(`Error requesting ${permissionType} permission: `, error);
    return false;
  }
};

// Location permission
export const requestLocationPermission = async () => {
  return requestPermission(
    'location',
    async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status;
    },
    async () => await Location.requestForegroundPermissionsAsync()
  );
};
