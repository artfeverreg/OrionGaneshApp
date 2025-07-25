import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Gift, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { StorageManager } from '../../utils/storage';
import { ScratchCardAlgorithm } from '../../utils/scratchAlgorithm';
import { ScratchResult } from '../../types/database';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 300;

export default function ScratchScreen() {
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [scratchResult, setScratchResult] = useState<ScratchResult | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [canScratch, setCanScratch] = useState(false);
  
  const scratchAnimation = useRef(new Animated.Value(1)).current;
  const revealAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkScratchAvailability();
  }, []);

  const checkScratchAvailability = async () => {
    const canScratchToday = await StorageManager.canScratchToday();
    setCanScratch(canScratchToday);
    
    if (!canScratchToday) {
      Alert.alert(
        'Already Scratched Today',
        'You can only scratch one card per day. Come back tomorrow!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      if (canScratch) {
        setIsScratching(true);
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (isScratching && !isRevealed && canScratch) {
        const newProgress = Math.min(scratchProgress + 2, 100);
        setScratchProgress(newProgress);
        
        // Animate scratch effect
        Animated.timing(scratchAnimation, {
          toValue: 1 - newProgress / 200,
          duration: 50,
          useNativeDriver: false,
        }).start();
        
        // Reveal sticker when 70% scratched
        if (newProgress >= 70 && !isRevealed) {
          revealSticker();
        }
      }
    },
    onPanResponderRelease: () => {
      setIsScratching(false);
    },
  });

  const revealSticker = async () => {
    setIsRevealed(true);
    
    // Execute scratch algorithm
    const algorithm = new ScratchCardAlgorithm(ScratchCardAlgorithm.getDefaultStickers());
    const collectedStickers = await StorageManager.getCollectedStickers();
    const result = algorithm.executeScatch(collectedStickers);
    
    setScratchResult(result);
    
    // Update last scratch time
    await StorageManager.updateLastScratchTime();
    
    // If successful, add to collection
    if (result.success && result.sticker) {
      await StorageManager.addCollectedSticker(result.sticker.sticker_id);
    }
    
    // Animate reveal
    Animated.sequence([
      Animated.timing(scratchAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(revealAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Show congratulations
    setTimeout(() => {
      if (result.success) {
        Alert.alert(
          '🎉 Ganpati Bappa Morya! 🎉',
          `${result.message}\nProbability: ${result.probability}%`,
          [{ text: 'Collect', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          result.betterLuckNextTime ? '🍀 Better Luck Next Time!' : 'Oops!',
          `${result.message}\nChance of getting sticker: ${100 - (result.probability || 0)}%`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    }, 1000);
  };

  const resetCard = () => {
    setScratchProgress(0);
    setScratchResult(null);
    setIsRevealed(false);
    scratchAnimation.setValue(1);
    revealAnimation.setValue(0);
    checkScratchAvailability();
  };

  return (
    <LinearGradient
      colors={['#FF9933', '#FFD700', '#FFFFFF']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scratch Your Blessing</Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          🙏 Scratch gently to reveal your blessing from Lord Ganesha 🙏
        </Text>
      </View>

      {/* Scratch Card */}
      <View style={styles.cardContainer}>
        <View style={styles.scratchCard} {...panResponder.panHandlers}>
          {/* Background with revealed sticker */}
          <LinearGradient
            colors={scratchResult?.success ? ['#FFD700', '#FF9933', '#CC0000'] : ['#CCCCCC', '#999999', '#666666']}
            style={styles.cardBackground}
          >
            {scratchResult && (
              <Animated.View
                style={[
                  styles.revealedContent,
                  {
                    opacity: revealAnimation,
                    transform: [
                      {
                        scale: revealAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {scratchResult.success ? (
                  <>
                    <Star size={80} color="#FFD700" />
                    <Text style={styles.stickerName}>{scratchResult.sticker?.name}</Text>
                    <Text style={styles.stickerType}>{scratchResult.sticker?.type}</Text>
                    <Text style={styles.probabilityText}>Probability: {scratchResult.probability}%</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.sadEmoji}>😔</Text>
                    <Text style={styles.betterLuckText}>Better Luck Next Time!</Text>
                    <Text style={styles.probabilityText}>Success Rate: {100 - (scratchResult.probability || 0)}%</Text>
                  </>
                )}
              </Animated.View>
            )}
          </LinearGradient>

          {/* Scratch overlay */}
          <Animated.View
            style={[
              styles.scratchOverlay,
              {
                opacity: scratchAnimation,
              },
            ]}
          >
            <LinearGradient
              colors={['#CCCCCC', '#999999']}
              style={styles.overlayGradient}
            >
              <Gift size={60} color="#FFFFFF" />
              <Text style={styles.scratchText}>Scratch Here</Text>
              <Text style={styles.scratchSubtext}>
                {scratchProgress > 0 ? `${Math.round(scratchProgress)}% revealed` : 'Use your finger to scratch'}
              </Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${scratchProgress}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Scratch Progress: {Math.round(scratchProgress)}%</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {isRevealed ? (
          <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
            <Text style={styles.actionButtonText}>Back to Home</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.hintButton]}
            onPress={() => {
              Alert.alert(
                'Scratching Tips',
                '• Scratch gently with your finger\n• Reveal at least 70% to see your blessing\n• Each member gets one free scratch per day\n• Premium scratches can be assigned by admin'
              );
            }}
          >
            <Text style={styles.actionButtonText}>Need Help?</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Daily Blessing Message */}
      <View style={styles.blessingContainer}>
        <Text style={styles.blessingText}>
          "Vakratunda Mahakaya Suryakoti Samaprabha"
        </Text>
        <Text style={styles.blessingSubtext}>
          May Lord Ganesha bless you with wisdom and prosperity
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginRight: 40,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 16,
    color: '#CC0000',
    textAlign: 'center',
    fontWeight: '500',
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scratchCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revealedContent: {
    alignItems: 'center',
  },
  stickerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  stickerType: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5,
    opacity: 0.9,
  },
  probabilityText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 10,
    opacity: 0.8,
  },
  sadEmoji: {
    fontSize: 80,
  },
  betterLuckText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  scratchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scratchText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  scratchSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#CC0000',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#CC0000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  hintButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  blessingContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  blessingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CC0000',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  blessingSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 5,
  },
});