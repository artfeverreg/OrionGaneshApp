import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { StorageManager } from '../utils/storage';
import { router } from 'expo-router';

export default function RootLayout() {
  useFrameworkReady();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      console.log('Environment variables loaded:', {
        supabaseUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      });
      
      const session = await StorageManager.getUserSession();
      console.log('Session found:', !!session);
      
      // Set auth checked first to ensure Stack is mounted
      setIsAuthChecked(true);
      
      // Always show login screen initially for better UX
      console.log('Redirecting to login screen');
      router.replace('/login');
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('Failed to check authentication status');
      setIsAuthChecked(true);
    }
  };

  if (!isAuthChecked) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#FF0000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});