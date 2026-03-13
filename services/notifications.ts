import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

let Notifications: typeof import('expo-notifications') | null = null;

async function getNotifications() {
  if (isWeb) return null;
  if (!Notifications) {
    Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
  return Notifications;
}

export async function requestPermissions(): Promise<boolean> {
  const mod = await getNotifications();
  if (!mod) return false;

  const { status: existing } = await mod.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await mod.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBedtimeReminder(targetTime: string) {
  const mod = await getNotifications();
  if (!mod) return;

  await mod.cancelAllScheduledNotificationsAsync();

  const [hours, minutes] = targetTime.split(':').map(Number);

  let reminderHour = hours;
  let reminderMinute = minutes - 30;
  if (reminderMinute < 0) {
    reminderMinute += 60;
    reminderHour -= 1;
    if (reminderHour < 0) reminderHour += 24;
  }

  await mod.scheduleNotificationAsync({
    content: {
      title: 'おやすみん',
      body: 'そろそろおやすみ準備の時間だよ',
    },
    trigger: {
      type: mod.SchedulableTriggerInputTypes.DAILY,
      hour: reminderHour,
      minute: reminderMinute,
    },
  });
}

export async function cancelAll() {
  const mod = await getNotifications();
  if (!mod) return;
  await mod.cancelAllScheduledNotificationsAsync();
}
