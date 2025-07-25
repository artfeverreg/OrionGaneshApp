import React, { useState, useRef } from 'react';
import {
  View,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 300;

interface ScratchCardProps {
  onScratchComplete: () => void;
  scratchThreshold?: number;
  children: React.ReactNode;
  overlayComponent: React.ReactNode;
}

export default function ScratchCard({
  onScratchComplete,
  scratchThreshold = 70,
  children,
  overlayComponent,
}: ScratchCardProps) {
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const scratchAnimation = useRef(new Animated.Value(1)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (!isRevealed) {
        const newProgress = Math.min(scratchProgress + 2, 100);
        setScratchProgress(newProgress);
        
        // Animate scratch effect
        Animated.timing(scratchAnimation, {
          toValue: 1 - newProgress / 200,
          duration: 50,
          useNativeDriver: false,
        }).start();
        
        // Reveal when threshold reached
        if (newProgress >= scratchThreshold && !isRevealed) {
          setIsRevealed(true);
          onScratchComplete();
        }
      }
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Background content */}
      <View style={styles.background}>
        {children}
      </View>
      
      {/* Scratch overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: scratchAnimation,
          },
        ]}
      >
        {overlayComponent}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  background: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});