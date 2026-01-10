import { getCurrentUser } from '@/src/api/auth';
import { api } from '@/src/api/cilent';
import { useAuthStore } from '@/store/useAuthStore';
import { UserProfile } from '@/types/Worker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../common/Header';

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log('Profile load error:', error);
      setUser(null); //  important
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.clearToken();
            await AsyncStorage.removeItem('authToken');
            useAuthStore.getState().clearAuth();
          } catch (e) {
            console.log('Logout error:', e);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
     
      <LinearGradient colors={['#6C63FF', '#4A47A3']} style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </LinearGradient>

      {/* LOADER */}
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      )}

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.name}>
          {user?.first_name || 'User'} {user?.last_name || ''}
        </Text>



        <Text style={styles.subtitle}>
          {user?.company || 'Fielduo'}
          {'\n'}
          Joined on {formatDate(user?.created_at)}
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {user?.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>

      {/* DETAILS */}
      <View style={styles.detailsCard}>
        <ProfileRow icon="flag-outline" label="Role" value={user?.role || '-'} />
        <ProfileRow icon="mail-outline" label="Email" value={user?.email || '-'} />
        <ProfileRow icon="call-outline" label="Phone" value={user?.phone || '-'} />
        <ProfileRow
          icon="location-outline"
          label="Address"
          value={user?.address || '-'}
        />

        {!user && !loading && (
          <Text style={styles.warningText}>
            Unable to load profile details. You can still logout.
          </Text>
        )}
      </View>

      {/*  LOGOUT – ALWAYS VISIBLE */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ProfileRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={20} color="#6C63FF" />
    <View style={styles.rowText}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

export default Profile;

const styles = StyleSheet.create({
  loader: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 90,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: -60,
    elevation: 6,
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: '#6234E2',
    borderRadius: 50,
    padding: 4,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  badgeRow: {
    marginTop: 14,
  },
  badge: {
    backgroundColor: '#EEF1FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    color: '#6C63FF',
    fontSize: 11,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 18,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  rowText: {
    marginLeft: 12,
  },
  label: {
    fontSize: 12,
    color: '#888',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  warningText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
    fontSize: 12,
  },
  logoutBtn: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
