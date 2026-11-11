import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { brand, spacing } from '../theme';

/** Hiện đủ 2 giây, mờ dần 0,5 giây — tổng cộng khoảng 2,5 giây. */
const SPLASH_VISIBLE_MS = 2000;
const FADE_MS = 500;

/**
 * Màn hình mở đầu khi mở app: logo 中, tên app, tác giả, và một câu vui.
 * Tự mờ dần rồi gọi onFinish để App gỡ nó ra, lộ màn hình chính bên dưới.
 */
export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const finished = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(() => {
        if (!finished.current) {
          finished.current = true;
          onFinish();
        }
      });
    }, SPLASH_VISIBLE_MS);
    return () => clearTimeout(timer);
    // Chỉ chạy một lần khi mount; onFinish của App là hàm setState ổn định.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity }]}>
      <LinearGradient
        colors={[brand.green700, brand.green800]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.logo}>中</Text>
          <Text style={styles.appName}>Học Tiếng Trung</Text>
          <Text style={styles.author}>by C Tool</Text>
        </View>
        <View style={styles.funText}>
          <Text style={styles.funZh}>每天学一点，越学越有意思！</Text>
          <Text style={styles.funVi}>Mỗi ngày học một chút, càng học càng thú vị!</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Phủ kín màn hình, nằm trên Navigation (render sau nên đè lên trên).
  root: {
    ...StyleSheet.absoluteFill,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 96,
    fontWeight: '800',
    lineHeight: 110,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  author: {
    color: '#BBF7D0',
    fontSize: 16,
    marginTop: spacing.sm,
  },
  funText: {
    position: 'absolute',
    bottom: spacing.xxl * 2,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  funZh: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  funVi: {
    color: '#BBF7D0',
    fontSize: 15,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
