import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, LogIn } from 'lucide-react-native';
import { router } from 'expo-router';
import { DatabaseService } from '../utils/databaseService';
import { StorageManager } from '../utils/storage';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting login process...');
      console.log('Environment check:', {
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      });
      
      const userSession = await DatabaseService.login(username, password);
      
      setIsLoading(false);
      
      if (!userSession) {
        Alert.alert('Login Failed', 'Invalid username or password. Please check your credentials and try again.');
        return;
      }
      
      console.log('Login successful, saving session...');
      await StorageManager.saveUserSession(userSession);
      console.log('Session saved, navigating to tabs...');
      router.replace('/(tabs)');
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      Alert.alert(
        'Connection Error', 
        'Unable to connect to the server. Please check your internet connection and try again.',
        [
          { text: 'OK' }
        ]
      );
    }
  };

  return (
    <LinearGradient
      colors={['#FF9933', '#FFD700', '#FFFFFF']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>🙏 Ganpati Bappa Morya 🙏</Text>
            <Text style={styles.appTitle}>Orion Star Ganeshotsav</Text>
            <Text style={styles.subtitle}>Scratch Card App</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.loginTitle}>Member Login</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#CCCCCC', '#999999'] : ['#CC0000', '#FF4444']}
                style={styles.loginGradient}
              >
                <LogIn size={20} color="#FFFFFF" />
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Demo Credentials */}
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>Demo Credentials:</Text>
              <Text style={styles.demoText}>User: demo / demo</Text>
              <Text style={styles.demoText}>Admin: admin / admin123</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              "Vakratunda Mahakaya Suryakoti Samaprabha"
            </Text>
            <Text style={styles.footerSubtext}>
              Nirvighnam Kuru Me Deva Sarva-Kaaryeshu Sarvada
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 80,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#CC0000',
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 30,
    marginVertical: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 15,
  },
  loginButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  demoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E8F0',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 2,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CC0000',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});