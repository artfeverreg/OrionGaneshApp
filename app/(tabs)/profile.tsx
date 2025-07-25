import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Star, Calendar, Trophy, Gift, LogOut } from 'lucide-react-native';
import { StorageManager } from '../../utils/storage';
import { DatabaseService } from '../../utils/databaseService';
import { UserSession } from '../../types/database';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [member, setMember] = useState<UserSession | null>(null);
  const [collectedStickers, setCollectedStickers] = useState<string[]>([]);
  const [scratchCount, setScratchCount] = useState(15);
  const [rank, setRank] = useState(8);

  useEffect(() => {
    loadUserData();
    
    // Listen for focus to refresh data
    const unsubscribe = router.addListener?.('focus', () => {
      loadUserData();
    });
    
    return unsubscribe;
  }, []);

  const loadUserData = async () => {
    const session = await StorageManager.getUserSession();
    if (session) {
      const collected = await DatabaseService.getCollectedStickers(session.memberId);
      setCollectedStickers(collected);
    }
    setMember(session);
  };
  const stickerCollection = [
    { id: '1', name: 'Mayureshwar', collected: collectedStickers.includes('1'), date: '2024-08-02' },
    { id: '2', name: 'Siddhivinayak', collected: collectedStickers.includes('2'), date: '2024-08-05' },
    { id: '3', name: 'Ballaleshwar', collected: collectedStickers.includes('3'), date: '2024-08-10' },
    { id: '4', name: 'Varadavinayak', collected: collectedStickers.includes('4'), date: null },
    { id: '5', name: 'Chintamani', collected: collectedStickers.includes('5'), date: null },
    { id: '6', name: 'Girijatmaj', collected: collectedStickers.includes('6'), date: null },
    { id: '7', name: 'Vighnahar', collected: collectedStickers.includes('7'), date: null },
    { id: '8', name: 'Mahaganapati', collected: collectedStickers.includes('8'), date: null },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => {
          await StorageManager.clearUserSession();
          router.replace('/login');
        }},
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#FF9933', '#FFD700', '#FFFFFF']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#CC0000', '#FF4444']}
              style={styles.avatar}
            >
              <User size={40} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.memberName}>{member?.name || 'Loading...'}</Text>
          <Text style={styles.memberUsername}>@{member?.username || ''}</Text>
          <Text style={styles.memberId}>ID: {member?.memberId || ''}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Star size={24} color="#FFD700" />
              <Text style={styles.statNumber}>{collectedStickers.length}</Text>
              <Text style={styles.statLabel}>Stickers</Text>
            </View>
            <View style={styles.statCard}>
              <Trophy size={24} color="#FF9933" />
              <Text style={styles.statNumber}>#{rank}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Gift size={24} color="#CC0000" />
              <Text style={styles.statNumber}>{scratchCount}</Text>
              <Text style={styles.statLabel}>Total Scratches</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
          </View>
        </View>

        {/* Collection Status */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>My Ashtavinayak Collection</Text>
          <View style={styles.collectionGrid}>
            {stickerCollection.map((sticker) => (
              <View key={sticker.id} style={styles.stickerCard}>
                <View
                  style={[
                    styles.stickerIcon,
                    sticker.collected ? styles.collectedIcon : styles.lockedIcon,
                  ]}
                >
                  {sticker.collected ? (
                    <Star size={24} color="#FFD700" />
                  ) : (
                    <Text style={styles.stickerNumber}>{sticker.id}</Text>
                  )}
                </View>
                <Text style={[
                  styles.stickerName,
                  !sticker.collected && styles.lockedText
                ]}>
                  {sticker.name}
                </Text>
                {sticker.collected && (
                  <Text style={styles.collectionDate}>
                    {new Date(sticker.date).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Special Orion Bappa */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mystery Box - Orion Bappa</Text>
          <View style={styles.mysteryCard}>
            <LinearGradient
              colors={['#333333', '#666666']}
              style={styles.mysteryGradient}
            >
              <Text style={styles.mysteryIcon}>🎁</Text>
              <Text style={styles.mysteryTitle}>Orion Bappa</Text>
              <Text style={styles.mysterySubtitle}>Ultra Rare Mystery Sticker</Text>
              <Text style={styles.mysteryStatus}>Available from August 20th</Text>
              <Text style={styles.mysteryDescription}>
                Only one lucky devotee will receive this special blessing!
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since:</Text>
              <Text style={styles.infoValue}>
                August 1, 2024
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Scratch:</Text>
              <Text style={styles.infoValue}>
                {member?.lastScratchTime ? new Date(member.lastScratchTime).toLocaleDateString() : 'Never'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Collection Progress:</Text>
              <Text style={styles.infoValue}>
                {collectedStickers.length}/8 ({Math.round((collectedStickers.length / 8) * 100)}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Calendar size={20} color="#4CAF50" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>Daily Devotee</Text>
                <Text style={styles.achievementDesc}>Scratched cards for 7 consecutive days</Text>
              </View>
              <Text style={styles.achievementDate}>Aug 10</Text>
            </View>
            
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Star size={20} color="#FFD700" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>First Sticker</Text>
                <Text style={styles.achievementDesc}>Collected your first Ashtavinayak sticker</Text>
              </View>
              <Text style={styles.achievementDate}>Aug 2</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Blessing */}
        <View style={styles.blessingFooter}>
          <Text style={styles.blessingText}>
            "Ganapati Bappa Morya! Mangal murti morya!"
          </Text>
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
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  memberUsername: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 5,
  },
  memberId: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CC0000',
    marginBottom: 15,
    textAlign: 'center',
  },
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stickerCard: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 15,
  },
  stickerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectedIcon: {
    backgroundColor: '#FF9933',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  lockedIcon: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  stickerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  stickerName: {
    fontSize: 10,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  lockedText: {
    color: '#999999',
  },
  collectionDate: {
    fontSize: 8,
    color: '#666666',
    marginTop: 2,
  },
  mysteryCard: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  mysteryGradient: {
    padding: 20,
    alignItems: 'center',
  },
  mysteryIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  mysteryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mysterySubtitle: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 5,
  },
  mysteryStatus: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 10,
    opacity: 0.8,
  },
  mysteryDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  achievementsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: '#999999',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#CC0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  blessingFooter: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  blessingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CC0000',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});