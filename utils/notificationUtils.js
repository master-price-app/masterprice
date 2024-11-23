import * as Notifications from "expo-notifications";

export const scheduleNotification = async (content, trigger) => {
  await Notifications.scheduleNotificationAsync({ content, trigger });
};

export const getNotification = async (notificationId) => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

export const getAllNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

export const cancelNotification = async (notificationId) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const formatScheduleTime = (schedule) => {
  return null;
};
