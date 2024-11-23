import { Alert, Platform, Linking } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

// Permission settings configuration
const PERMISSION_SETTINGS = {
  camera: {
    title: "Camera Permission Required",
    message: "Please enable camera permission in Settings to use this feature.",
    cancelText: "Not Now",
    settingsText: "Open Settings",
  },
  location: {
    title: "Location Permission Required",
    message: "Please enable location permission in Settings to use this feature.",
    cancelText: "Not Now",
    settingsText: "Open Settings",
  },
  notifications: {
    title: "Notifications Permission Required",
    message: "Please enable notifications permission in Settings to use this feature.",
    cancelText: "Not Now",
    settingsText: "Open Settings",
  },
};

// Open specific settings for each permission type
const openSettings = async (permissionType) => {
  try {
    // Fallback to opening the general settings
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
      console.log(`Opened settings for ${permissionType} successfully ios`);
    } else {
      await Linking.openSettings();
      console.log(`Opened settings for ${permissionType} successfully android`);
    }

    return true;
  } catch (error) {
    console.error(`Error opening settings for ${permissionType}: error`, error);
    return false;
  }
};

// Generic permission request function
const requestPermission = async (
  permissionType,
  checkPermission,
  requestPermission
) => {
  try {
    // Check if permission has already been granted
    const { status: existingStatus } = await checkPermission();
    if (existingStatus === 'granted') {
      return true;
    }

    // Request permission
    const { status } = await requestPermission();
    if (status === 'granted') {
      return true;
    }

    // Handle permission denied, show settings prompt
    const permissionConfig = PERMISSION_SETTINGS[permissionType];

    return new Promise((resolve) => {
      Alert.alert(
        permissionConfig.title,
        permissionConfig.message,
        [
          {
            text: permissionConfig.cancelText,
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: permissionConfig.settingsText,
            onPress: async () => {
              await openSettings(permissionType);
              resolve(true);
            },
          },
        ],
        { cancelable: false }
      );
    });
  } catch (error) {
    console.error(`Error requesting ${permissionType} permission: `, error);
    return false;
  }
};

// Location permission request
export const requestLocationPermission = async () => {
  return requestPermission(
    'location',
    async () => {
      return await Location.getForegroundPermissionsAsync();
    },
    async () => await Location.requestForegroundPermissionsAsync()
  );
};

// Notifications permission request
export const requestNotificationsPermission = async () => {
  return requestPermission(
    'notifications',
    async () => {
      return await Notifications.getPermissionsAsync();
    },
    async () => await Notifications.requestPermissionsAsync()
  );
};
