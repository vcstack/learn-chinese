import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { PaperHeader } from './src/components/PaperHeader';
import { getLessonById } from './src/data/lessons';
import { ensureReminders, setupNotifications } from './src/notifications/reminders';
import { HomeScreen } from './src/screens/HomeScreen';
import { LessonScreen } from './src/screens/LessonScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { GrammarScreen } from './src/screens/GrammarScreen';
import { PatternsScreen } from './src/screens/PatternsScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { ReviewScreen } from './src/screens/ReviewScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { initTts } from './src/speech/tts';
import { getIntervalHours } from './src/storage';
import { navigationTheme, theme } from './src/theme';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    // Khởi động: cấu hình thông báo, quét giọng tiếng Trung, nạp lịch nhắc.
    setupNotifications();
    void initTts();
    void getIntervalHours().then((hours) => ensureReminders(hours));
  }, []);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            header: (props) => <PaperHeader {...props} />,
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false, title: 'Học Tiếng Trung' }}
          />
          <Stack.Screen
            name="Lesson"
            component={LessonScreen}
            options={({ route }) => {
              const lesson = getLessonById(route.params.lessonId);
              return {
                title: lesson ? `Bài ${lesson.id}: ${lesson.title}` : 'Bài học',
              };
            }}
          />
          <Stack.Screen
            name="Practice"
            component={PracticeScreen}
            options={{ title: 'Luyện nói' }}
          />
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ title: 'Từ yêu thích' }}
          />
          <Stack.Screen
            name="Review"
            component={ReviewScreen}
            options={{ title: 'Ôn tập hôm nay' }}
          />
          <Stack.Screen
            name="Grammar"
            component={GrammarScreen}
            options={{ title: 'Ngữ pháp HSK1' }}
          />
          <Stack.Screen
            name="Patterns"
            component={PatternsScreen}
            options={{ title: 'Mẫu câu giao tiếp' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Cài đặt' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
