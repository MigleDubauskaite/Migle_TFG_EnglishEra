import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiGet } from '../api/client';
import { Colors } from '../theme/colors';

interface AdminStats {
  totalUsers: number;
  totalQuizzes: number;
  totalPosts: number;
  totalEvents: number;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  currentLevel: string;
  totalXp: number;
}

export default function AdminScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<AdminStats>('/api/admin/stats'),
      apiGet<AdminUser[]>('/api/admin/users'),
    ])
      .then(([s, u]) => {
        setStats(s);
        setUsers(u);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={Colors.navy} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.center}>
        <Text style={s.err}>Could not load admin data.</Text>
        </View>
    );
  }

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.pad}>
      <Text style={s.title}>Admin Panel</Text>

      {/* Stats */}
      {stats && (
        <View style={s.statsGrid}>
          {[
            { label: 'Users', value: stats.totalUsers },
            { label: 'Quizzes', value: stats.totalQuizzes },
            { label: 'Posts', value: stats.totalPosts },
            { label: 'Events', value: stats.totalEvents },
          ].map(({ label, value }) => (
            <View key={label} style={s.statCard}>
              <Text style={s.statVal}>{value}</Text>
              <Text style={s.statLbl}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Users list */}
      <Text style={s.sectionTitle}>Users ({users.length})</Text>
      {users.map(u => (
        <View key={u.id} style={s.userCard}>
          <View style={s.userRow}>
            <View style={[s.avatar, u.role === 'ADMIN' && s.avatarAdmin]}>
              <Text style={s.avatarTxt}>{u.username.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.nameRow}>
                <Text style={s.username}>{u.username}</Text>
                {u.role === 'ADMIN' && (
                  <View style={s.adminBadge}><Text style={s.adminTxt}>ADMIN</Text></View>
                )}
              </View>
              <Text style={s.email}>{u.email}</Text>
            </View>
            <View style={s.levelBadge}>
              <Text style={s.levelTxt}>{u.currentLevel}</Text>
            </View>
          </View>
          <Text style={s.xpTxt}>{u.totalXp} XP</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.stone100 },
  pad: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  err: { color: Colors.coral, fontSize: 14, fontWeight: '600', marginBottom: 16 },

  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backTxt: { color: Colors.navy, fontWeight: '700', fontSize: 14 },

  title: { fontSize: 26, fontWeight: '900', color: Colors.stone900, marginBottom: 20 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  statCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: Colors.stone200,
    alignItems: 'center', minWidth: '45%', flex: 1,
  },
  statVal: { fontSize: 28, fontWeight: '900', color: Colors.navy },
  statLbl: {
    fontSize: 10, fontWeight: '700', color: Colors.stone400,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4,
  },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: Colors.stone900, marginBottom: 12 },

  userCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: Colors.stone200, marginBottom: 10,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.navy, justifyContent: 'center', alignItems: 'center',
  },
  avatarAdmin: { backgroundColor: Colors.sun },
  avatarTxt: { fontSize: 18, fontWeight: '900', color: Colors.white },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  username: { fontSize: 15, fontWeight: '800', color: Colors.stone900 },
  email: { fontSize: 12, color: Colors.stone400 },
  adminBadge: {
    backgroundColor: Colors.sun, borderRadius: 50,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  adminTxt: { fontSize: 9, fontWeight: '900', color: Colors.stone900, letterSpacing: 0.5 },
  levelBadge: {
    backgroundColor: Colors.navy, borderRadius: 50,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  levelTxt: { fontSize: 11, fontWeight: '900', color: Colors.white },
  xpTxt: { fontSize: 11, color: Colors.stone400, marginTop: 8, fontWeight: '600' },
});
