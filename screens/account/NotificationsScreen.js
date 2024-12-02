import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from 'react-native-toast-message';
import { MaterialIcons } from "@expo/vector-icons";
import {
  cancelNotification,
  formatScheduleTime,
  getAllNotifications,
} from "../../utils/notificationUtils";
import PressableButton from "../../components/PressableButton";

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const allNotifications = await getAllNotifications();
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load notifications',
        text2: 'Please pull to refresh and try again',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle cancel notification
  const handleCancelNotification = useCallback(async (notification) => {
    Alert.alert(
      "Cancel Notification",
      "Are you sure you want to cancel this reminder?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            processCancelNotification(notification);
          },
        },
      ]
    );
  }, []);

  // Process the actual cancellation
  const processCancelNotification = async (notification) => {
    try {
      await cancelNotification(notification.identifier);
      // Refresh list
      fetchNotifications();
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Reminder cancelled successfully',
        text2: 'The reminder has been successfully removed',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Error canceling notification:", error);
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Failed to cancel reminder',
        text2: 'Please try again later',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  // Render notification item
  const renderNotificationItem = useCallback(({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationInfo}>
        <Text style={styles.storeName}>{item.content.title}</Text>
        <Text style={styles.scheduleTime}>
          Every {formatScheduleTime(item.trigger)}
        </Text>
      </View>
      <PressableButton
        onPress={() => handleCancelNotification(item)}
        componentStyle={styles.cancelButton}
      >
        <MaterialIcons name="notifications-off" size={24} color="#FF3B30" />
      </PressableButton>
    </View>
  ), [handleCancelNotification]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <MaterialIcons name="notifications-none" size={48} color="#999" />
      <Text style={styles.emptyStateText}>No notifications set</Text>
      <Text style={styles.emptyStateSubtext}>
        You haven't set any deal reminders yet
      </Text>
    </View>
  ), []);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.identifier}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: "#666",
  },
  cancelButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
});
