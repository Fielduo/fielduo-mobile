import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getCurrentUser } from '@/src/api/auth';
import { UserProfile } from '@/types/Worker';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/src/api/cilent';

/* ✅ User TYPE (NAME MUST BE THERE) */




const Profile = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const navigation = useNavigation();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const currentUser = await getCurrentUser();
            console.log('Logged-in user:', currentUser); // 👈 for debugging
            setUser(currentUser);
        } catch (error) {
            console.error('Profile load error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    if (!user) return null;


    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // 1️⃣ Clear API token
                            await api.clearToken();

                            // 2️⃣ Clear AsyncStorage
                            await AsyncStorage.removeItem('authToken');

                            // 3️⃣ Clear Zustand auth store
                            useAuthStore.getState().clearAuth();

                            // ❌ NO navigation.navigate needed
                            // AppNavigator will auto switch to AuthStack
                        } catch (e) {
                            console.log('Logout error:', e);
                        }
                    },
                },
            ],
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* HEADER */}
            <LinearGradient colors={['#6C63FF', '#4A47A3']} style={styles.header}>
                <Text style={styles.headerTitle}>My Profile</Text>
            </LinearGradient>

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
                    {user.first_name} {user.last_name}
                </Text>

                <Text style={styles.subtitle}>
                    {user.company || 'Fielduo'}{'\n'}
                    Joined on {formatDate(user.created_at)}
                </Text>

                <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}> {user.is_active ? 'Active' : 'Inactive'}</Text>
                    </View>

                    <TouchableOpacity style={styles.editBtn}>
                        <Ionicons name="create-outline" size={14} color="#fff" />
                        <Text style={styles.editText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* DETAILS */}
            <View style={styles.detailsCard}>
                <ProfileRow
                    icon="flag-outline"
                    label="Role"
                    value={user.role || '-'}
                />
                <ProfileRow icon="mail-outline" label="Email" value={user.email} />
                <ProfileRow icon="call-outline" label="Phone" value={user.phone} />
                <ProfileRow
                    icon="location-outline"
                    label="Address"
                    value={user.address || '-'}
                />


            </View>

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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    /* HEADER */
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

    /* PROFILE CARD */
    profileCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginTop: -60,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
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
        lineHeight: 16,
    },

    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C63FF',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginLeft: 10,
    },
    editText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 6,
    },

    /* DETAILS */
    detailsCard: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 18,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
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
        marginTop: 2,
    },
    logoutBtn: {
        marginTop: 6,
        backgroundColor: '#E53935',
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 20, // keep it visible
    },
    logoutText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },

});
