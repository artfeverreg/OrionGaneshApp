import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, Trophy, Star } from 'lucide-react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [member, setMember] = useState({
    name: 'Devotee Name',
    collectedStickers: 3,
    totalStickers: 9,
  });

  const [donors, setDonors] = useState([
    { name: 'Ramesh Patil', amount: 5000 },
    { name: 'Priya Sharma', amount: 3000 },
    { name: 'Suresh Kumar', amount: 2500 },
    { name: 'Anjali Desai', amount: 2000 },
  ]);

  const [canScratchToday, setCanScratchToday] = useState(true);

  const ashtavinayakStickers = [
    { id: 1, name: 'Mayureshwar', collected: true },
    { id: 2, name: 'Siddhivinayak', collected: true },
    { id: 3, name: 'Ballaleshwar', collected: true },
    { id: 4, name: 'Varadavinayak', collected: false },
    { id: 5, name: 'Chintamani', collected: false },
    { id: 6, name: 'Girijatmaj', collected: false },
    { id: 7, name: 'Vighnahar', collected: false },
    { id: 8, name: 'Mahaganapati', collected: false },
  ];

  return (
    <LinearGradient
      colors={['#FF9933', '#FFD700', '#FFFFFF']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>🙏 Ganpati Bappa Morya 🙏</Text>
          <Text style={styles.memberName}>Welcome, {member.name}</Text>
        </View>

        {/* Donor Flash Banner */}
        <View style={styles.donorBanner}>
          <LinearGradient
            colors={['#CC0000', '#FF4444']}
            style={styles.donorGradient}
          >
            <Text style={styles.donorTitle}>🎗️ Today's Donors 🎗️</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {donors.map((donor, index) => (
                <View key={index} style={styles.donorItem}>
                  <Text style={styles.donorName}>{donor.name}</Text>
                  <Text style={styles.donorAmount}>₹{donor.amount}</Text>
                </View>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>

        {/* Today's Scratch Card */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Today's Blessing</Text>
          <TouchableOpacity
            style={[styles.scratchCard, !canScratchToday && styles.disabledCard]}
            onPress={() => router.push('/scratch')}
            disabled={!canScratchToday}
          >
            <LinearGradient
              colors={canScratchToday ? ['#FFD700', '#FF9933'] : ['#CCCCCC', '#999999']}
              style={styles.scratchCardGradient}
            >
              <Gift size={48} color="#FFFFFF" />
              <Text style={styles.scratchCardText}>
                {canScratchToday ? 'Scratch Your Card' : 'Come Back Tomorrow'}
              </Text>
              <Text style={styles.scratchCardSubtext}>
                {canScratchToday ? 'Tap to reveal your blessing' : 'Already scratched today'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Collection Status */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Ashtavinayak Collection</Text>
          <View style={styles.collectionGrid}>
            {ashtavinayakStickers.map((sticker) => (
              <View key={sticker.id} style={styles.stickerSlot}>
                <View
                  style={[
                    styles.stickerCircle,
                    sticker.collected ? styles.collectedSticker : styles.emptySticker,
                  ]}
                >
                  {sticker.collected ? (
                    <Star size={24} color="#FFD700" />
                  ) : (
                    <Text style={styles.stickerNumber}>{sticker.id}</Text>
                  )}
                </View>
                <Text style={styles.stickerName}>{sticker.name}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.mysteryBoxSection}>
            <Text style={styles.mysteryBoxTitle}>Mystery Box - Orion Bappa</Text>
            <View style={styles.mysteryBox}>
              <Text style={styles.mysteryBoxText}>?</Text>
              <Text style={styles.mysteryBoxSubtext}>Available from Aug 20th</Text>
            </View>
          </View>
        </View>

        {/* Progress Summary */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{member.collectedStickers}</Text>
              <Text style={styles.progressLabel}>Stickers Collected</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{member.totalStickers - member.collectedStickers}</Text>
              <Text style={styles.progressLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/leaderboard')}
          >
            <Trophy size={24} color="#FF9933" />
            <Text style={styles.actionButtonText}>Leaderboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/profile')}
          >
            <Star size={24} color="#FF9933" />
            <Text style={styles.actionButtonText}>My Collection</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CC0000',
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  donorBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  donorGradient: {
    padding: 15,
  },
  donorTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  donorItem: {
    marginRight: 20,
    alignItems: 'center',
  },
  donorName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  donorAmount: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#CC0000',
    marginBottom: 15,
    textAlign: 'center',
  },
  scratchCard: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledCard: {
    opacity: 0.6,
  },
  scratchCardGradient: {
    padding: 30,
    alignItems: 'center',
  },
  scratchCardText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  scratchCardSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
  },
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stickerSlot: {
    width: (width - 60) / 4,
    alignItems: 'center',
    marginBottom: 15,
  },
  stickerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectedSticker: {
    backgroundColor: '#FF9933',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  emptySticker: {
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#CCCCCC',
  },
  stickerNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  stickerName: {
    fontSize: 10,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  mysteryBoxSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  mysteryBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CC0000',
    marginBottom: 10,
  },
  mysteryBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mysteryBoxText: {
    fontSize: 32,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  mysteryBoxSubtext: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 5,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9933',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#EEEEEE',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    flexDirection: 'row',
  },
  actionButtonText: {
    color: '#FF9933',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});