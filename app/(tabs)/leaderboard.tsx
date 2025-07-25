import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Medal, Star, Crown } from 'lucide-react-native';
import { DatabaseService } from '../../utils/databaseService';

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState('collectors');
  const [topCollectors, setTopCollectors] = useState<any[]>([]);
  const [topDonors, setTopDonors] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      const collectors = await DatabaseService.getLeaderboard();
      setTopCollectors(collectors);
      
      const donors = await DatabaseService.getDonors();
      const formattedDonors = donors.map((donor, index) => ({
        id: donor.donor_id,
        name: donor.name,
        amount: donor.amount,
        rank: index + 1
      }));
      setTopDonors(formattedDonors);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Medal size={24} color="#CD7F32" />;
      default:
        return <Star size={20} color="#FF9933" />;
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return styles.firstPlace;
      case 2:
        return styles.secondPlace;
      case 3:
        return styles.thirdPlace;
      default:
        return styles.regularPlace;
    }
  };

  return (
    <LinearGradient
      colors={['#FF9933', '#FFD700', '#FFFFFF']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Trophy size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Top Devotees of Lord Ganesha</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'collectors' && styles.activeTab]}
          onPress={() => setActiveTab('collectors')}
        >
          <Text style={[styles.tabText, activeTab === 'collectors' && styles.activeTabText]}>
            Top Collectors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'donors' && styles.activeTab]}
          onPress={() => setActiveTab('donors')}
        >
          <Text style={[styles.tabText, activeTab === 'donors' && styles.activeTabText]}>
            Top Donors
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {activeTab === 'collectors' ? (
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>🏆 Sticker Collection Champions 🏆</Text>
            {topCollectors.map((collector) => (
              <View key={collector.id} style={[styles.leaderboardItem, getRankStyle(collector.rank)]}>
                <View style={styles.rankContainer}>
                  {getRankIcon(collector.rank)}
                  <Text style={styles.rankNumber}>#{collector.rank}</Text>
                </View>
                
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{collector.name}</Text>
                  <Text style={styles.memberStats}>
                    {collector.stickers} Ashtavinayak Stickers
                  </Text>
                </View>
                
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementText}>{collector.stickers}/8</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>🙏 Generous Donors 🙏</Text>
            {topDonors.map((donor) => (
              <View key={donor.id} style={[styles.leaderboardItem, getRankStyle(donor.rank)]}>
                <View style={styles.rankContainer}>
                  {getRankIcon(donor.rank)}
                  <Text style={styles.rankNumber}>#{donor.rank}</Text>
                </View>
                
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{donor.name}</Text>
                  <Text style={styles.memberStats}>Generous Contribution</Text>
                </View>
                
                <View style={styles.donationBadge}>
                  <Text style={styles.donationAmount}>₹{donor.amount.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Special Achievement Section */}
        <View style={styles.specialSection}>
          <Text style={styles.specialTitle}>🎁 Special Achievements 🎁</Text>
          
          <View style={styles.achievementCard}>
            <LinearGradient
              colors={['#FFD700', '#FF9933']}
              style={styles.achievementGradient}
            >
              <Crown size={40} color="#FFFFFF" />
              <Text style={styles.achievementCardTitle}>First Complete Set</Text>
              <Text style={styles.achievementCardText}>
                First member to collect all 8 Ashtavinayak stickers wins the grand prize!
              </Text>
              <Text style={styles.achievementStatus}>🎯 Still Available</Text>
            </LinearGradient>
          </View>

          <View style={styles.achievementCard}>
            <LinearGradient
              colors={['#333333', '#666666']}
              style={styles.achievementGradient}
            >
              <Text style={styles.mysteryIcon}>🎁</Text>
              <Text style={styles.achievementCardTitle}>Mystery Box Winner</Text>
              <Text style={styles.achievementCardText}>
                Lucky member who gets the rare Orion Bappa sticker!
              </Text>
              <Text style={styles.achievementStatus}>🔒 Available from Aug 20th</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Stats Footer */}
        <View style={styles.statsFooter}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>847</Text>
            <Text style={styles.statLabel}>Cards Scratched</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>₹1.2L</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5,
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeTabText: {
    color: '#FF9933',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CC0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  firstPlace: {
    borderLeftWidth: 5,
    borderLeftColor: '#FFD700',
  },
  secondPlace: {
    borderLeftWidth: 5,
    borderLeftColor: '#C0C0C0',
  },
  thirdPlace: {
    borderLeftWidth: 5,
    borderLeftColor: '#CD7F32',
  },
  regularPlace: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF9933',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  rankNumber: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    fontWeight: '500',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  memberStats: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  achievementBadge: {
    backgroundColor: '#FF9933',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  achievementText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  donationBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  donationAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  specialSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  specialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CC0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  achievementCard: {
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  achievementGradient: {
    padding: 20,
    alignItems: 'center',
  },
  mysteryIcon: {
    fontSize: 40,
  },
  achievementCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  achievementCardText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  achievementStatus: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 10,
    fontWeight: '600',
  },
  statsFooter: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9933',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 15,
  },
});