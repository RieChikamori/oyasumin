import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useSettings } from '../../hooks/useSettings';
import { requestPermissions, scheduleBedtimeReminder } from '../../services/notifications';

const c = Colors.dark;

const TIME_OPTIONS = ['22:00', '22:30', '23:00', '23:30', '00:00'];

export default function SetupScreen() {
  const router = useRouter();
  const { updateSettings } = useSettings();
  const [name, setName] = useState('');
  const [targetTime, setTargetTime] = useState('23:00');

  const handleStart = async () => {
    const granted = await requestPermissions();
    if (granted) {
      await scheduleBedtimeReminder(targetTime);
    }
    await updateSettings({
      name: name.trim() || 'ゲスト',
      targetTime,
      onboardingDone: true,
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>あなたのことを教えてね</Text>

        <Text style={styles.label}>ニックネーム</Text>
        <TextInput
          style={styles.input}
          placeholder="例：あゆみ"
          placeholderTextColor={c.textSecondary}
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <Text style={styles.label}>目標就寝時刻</Text>
        <View style={styles.timeRow}>
          {TIME_OPTIONS.map((t) => (
            <Pressable
              key={t}
              style={[styles.timeButton, targetTime === t && styles.timeSelected]}
              onPress={() => setTargetTime(t)}
            >
              <Text
                style={[styles.timeText, targetTime === t && styles.timeTextSelected]}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.hint}>
          {Platform.OS !== 'web'
            ? '就寝30分前にリマインダーを送るよ'
            : '目標時刻を設定しよう'}
        </Text>
      </ScrollView>

      <View style={styles.bottom}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            !name.trim() && styles.buttonDisabled,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleStart}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>スタート</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
  },
  scroll: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: c.text,
    marginBottom: 32,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: c.textSecondary,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: c.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 17,
    color: c.text,
    borderWidth: 1,
    borderColor: c.border,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
  },
  timeSelected: {
    backgroundColor: c.accent + '30',
    borderColor: c.accent,
  },
  timeText: {
    fontSize: 16,
    color: c.textSecondary,
    fontWeight: '500',
  },
  timeTextSelected: {
    color: c.accent,
  },
  hint: {
    fontSize: 13,
    color: c.textSecondary,
    marginTop: 12,
  },
  bottom: {
    padding: 24,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: c.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#120A26',
  },
});
