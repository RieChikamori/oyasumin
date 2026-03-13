import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SettingsProvider, useSettings } from '../hooks/useSettings';
import { scheduleBedtimeReminder } from '../services/notifications';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

function RootNavigator() {
  const { settings, loading } = useSettings();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    if (Platform.OS !== 'web') SplashScreen.hideAsync();

    const inOnboarding = segments[0] === 'onboarding';

    if (!settings.onboardingDone && !inOnboarding) {
      router.replace('/onboarding/welcome');
    } else if (settings.onboardingDone && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [loading, settings.onboardingDone, segments]);

  useEffect(() => {
    if (settings.onboardingDone && settings.targetTime) {
      scheduleBedtimeReminder(settings.targetTime);
    }
  }, [settings.onboardingDone, settings.targetTime]);

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SettingsProvider>
  );
}
