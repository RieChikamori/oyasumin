import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Settings } from '../constants/Types';
import type { ReactNode } from 'react';
import React from 'react';

const STORAGE_KEY = '@oyasumin_settings';

const defaultSettings: Settings = {
  name: '',
  targetTime: '23:00',
  onboardingDone: false,
};

type SettingsContextValue = {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  loading: boolean;
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: defaultSettings,
  updateSettings: async () => {},
  loading: true,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setSettings(JSON.parse(raw));
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [settings]);

  return React.createElement(
    SettingsContext.Provider,
    { value: { settings, updateSettings, loading } },
    children,
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
