import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Users, Gift, Plus, CreditCard as Edit, Trash2, Search, Calendar, Star, Crown } from 'lucide-react-native';
import { StorageManager } from '../../utils/storage';
import { UserSession } from '../../types/database';

interface MockUser {
  id: string;
  name: string;
  username: string;
  memberId: string;
  collectedStickers: string[];
  lastScratchTime: Date | null;
  paidScratchAvailable: boolean;
}

interface ScratchInventory {
  totalCards: number;
  usedCards: number;
  remainingCards: number;
  paidCards: number;
}

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  
  // Mock data - in real app this would come from database
  const [inventory, setInventory] = useState<ScratchInventory>({
    totalCards: 1000,
    usedCards: 156,
    remainingCards: 844,
    paidCards: 25,
  });

  const [users, setUsers] = useState<MockUser[]>([
    {
      id: '1',
      name: 'Arjun Patil',
      username: 'demo',
      memberId: 'ORN001',
      collectedStickers: ['1', '2', '3'],
      lastScratchTime: new Date('2024-08-15'),
      paidScratchAvailable: false,
    },
    {
      id: '2',
      name: 'Priya Sharma',
      username: 'priya',
      memberId: 'ORN002',
      collectedStickers: ['1', '2', '4', '5'],
      lastScratchTime: new Date('2024-08-14'),
      paidScratchAvailable: true,
    },
    {
      id: '3',
      name: 'Rajesh Kumar',
      username: 'rajesh',
      memberId: 'ORN003',
      collectedStickers: ['1', '3', '6'],
      lastScratchTime: new Date('2024-08-13'),
      paidScratchAvailable: false,
    },
    {
      id: '4',
      name: 'Sneha Desai',
      username: 'sneha',
      memberId: 'ORN004',
      collectedStickers: ['2', '4'],
      lastScratchTime: new Date('2024-08-12'),
      paidScratchAvailable: false,
    },
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.memberId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignScratchCard = (user: MockUser) => {
    setSelectedUser(user);
    setShowAssignModal(true);
  };

  const confirmAssignScratchCard = () => {
    if (selectedUser) {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === selectedUser.id
            ? { ...user, paidScratchAvailable: true }
            : user
        )
      );
      
      setInventory(prev => ({
        ...prev,
        paidCards: prev.paidCards + 1,
      }));

      Alert.alert(
        'Success',
        `Paid scratch card assigned to ${selectedUser.name}`,
        [{ text: 'OK' }]
      );
    }
    setShowAssignModal(false);
    setSelectedUser(null);
  };

  const handleRevokeScratchCard = (user: MockUser) => {
    Alert.alert(
      'Revoke Scratch Card',
      `Are you sure you want to revoke the paid scratch card from ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => {
            setUsers(prevUsers =>
              prevUsers.map(u =>
                u.id === user.id
                  ? { ...u, paidScratchAvailable: false }
                  : u
              )
            );
            
            setInventory(prev => ({
              ...prev,
              paidCards: Math.max(0, prev.paidCards - 1),
            }));
          }
        }
      ]
    );
  };

  const renderInventoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>📊 Scratch Card Inventory</Text>
      
      <View style={styles.inventoryGrid}>
        <View style={styles.inventoryCard}>
          <Gift size={32} color="#4CAF50" />
          <Text style={styles.inventoryNumber}>{inventory.totalCards}</Text>
          <Text style={styles.inventoryLabel}>Total Cards</Text>
        </View>
        
        <View style={styles.inventoryCard}>
          <Calendar size={32} color="#FF9933" />
          <Text style={styles.inventoryNumber}>{inventory.usedCards}</Text>
          <Text style={styles.inventoryLabel}>Used Cards</Text>
        </View>
        
        <View style={styles.inventoryCard}>
          <Star size={32} color="#2196F3" />
          <Text style={styles.inventoryNumber}>{inventory.remainingCards}</Text>
          <Text style={styles.inventoryLabel}>Remaining</Text>
        </View>
        
        <View style={styles.inventoryCard}>
          <Crown size={32} color="#FFD700" />
          <Text style={styles.inventoryNumber}>{inventory.paidCards}</Text>
          <Text style={styles.inventoryLabel}>Paid Cards</Text>
        </View>
      </View>

      <View style={styles.inventoryActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Add Cards</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Edit size={20} color="#FF9933" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Edit Inventory</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>📈 Usage Statistics</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Daily Average:</Text>
          <Text style={styles.statValue}>12 cards/day</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Peak Usage:</Text>
          <Text style={styles.statValue}>25 cards (Aug 10)</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Success Rate:</Text>
          <Text style={styles.statValue}>68%</Text>
        </View>
      </View>
    </View>
  );

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>👥 User Management</Text>
      
      <View style={styles.searchContainer}>
        <Search size={20} color="#666666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.usersList}>
        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userDetails}>@{user.username} • {user.memberId}</Text>
              <Text style={styles.userStats}>
                {user.collectedStickers.length}/8 stickers • 
                Last scratch: {user.lastScratchTime?.toLocaleDateString() || 'Never'}
              </Text>
            </View>
            
            <View style={styles.userActions}>
              {user.paidScratchAvailable ? (
                <TouchableOpacity
                  style={[styles.userActionButton, styles.revokeButton]}
                  onPress={() => handleRevokeScratchCard(user)}
                >
                  <Trash2 size={16} color="#FFFFFF" />
                  <Text style={styles.userActionText}>Revoke</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.userActionButton, styles.assignButton]}
                  onPress={() => handleAssignScratchCard(user)}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.userActionText}>Assign</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <LinearGradient
      colors={['#FF9933', '#FFD700', '#FFFFFF']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Settings size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Manage Scratch Cards & Users</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inventory' && styles.activeTab]}
          onPress={() => setActiveTab('inventory')}
        >
          <Text style={[styles.tabText, activeTab === 'inventory' && styles.activeTabText]}>
            Inventory
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'inventory' ? renderInventoryTab() : renderUsersTab()}

      {/* Assign Scratch Card Modal */}
      <Modal
        visible={showAssignModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Paid Scratch Card</Text>
            <Text style={styles.modalText}>
              Assign a paid scratch card to {selectedUser?.name}?
            </Text>
            <Text style={styles.modalSubtext}>
              This will allow them to scratch an additional card today.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAssignModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmAssignScratchCard}
              >
                <Text style={styles.confirmButtonText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CC0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  inventoryCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  inventoryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 10,
  },
  inventoryLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
    textAlign: 'center',
  },
  inventoryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#CC0000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF9933',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#FF9933',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 10,
    paddingLeft: 10,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  userDetails: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  userStats: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
  },
  userActions: {
    marginLeft: 10,
  },
  userActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  assignButton: {
    backgroundColor: '#4CAF50',
  },
  revokeButton: {
    backgroundColor: '#F44336',
  },
  userActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 30,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#CC0000',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});