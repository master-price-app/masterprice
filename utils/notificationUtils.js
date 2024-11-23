import * as Notifications from "expo-notifications";

// Schedule a weekly notification
export const scheduleWeeklyNotification = async (content, schedule) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        weekday: schedule.weekday,  // 1-7, representing Sunday to Saturday
        hour: schedule.hour,        // 0-23
        minute: schedule.minute,    // 0-59
        repeats: true,
      },
    });
    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification: ", error);
    throw error;
  }
};

// Get a scheduled notification by chainId
export const getNotificationByChainId = async (chainId) => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    return scheduledNotifications.find(
      notification => notification.content.data?.chainId === chainId
    );
  } catch (error) {
    console.error("Error getting notification: ", error);
    return null;
  }
};

// Get all scheduled notifications
export const getAllNotifications = async () => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    return scheduledNotifications;
  } catch (error) {
    console.error("Error getting all notifications: ", error);
    return null;
  }
};

// Cancel a scheduled notification
export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch (error) {
    console.error("Error canceling notification: ", error);
    return false;
  }
};

export const formatScheduleTime = (schedule) => {
  return null;
};
