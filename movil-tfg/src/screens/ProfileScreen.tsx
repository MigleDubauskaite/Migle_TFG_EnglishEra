import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Animated,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiGet } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getHistory, type HistoryEntry } from '../store/historyStore';
import { Colors } from '../theme/colors';
import type { UserProfile } from '../types/api';

const LEVEL_THRESHOLDS: Record<string, [number, number, string]> = {
  A1: [0, 500, 'A2'], A2: [500, 1500, 'B1'], B1: [1500, 3000, 'B2'],
  B2: [3000, 5000, 'C1'], C1: [5000, 8000, 'C2'],
};

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);

  // Animated XP bar
  const xpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    apiGet<UserProfile>('/api/users/me')
      .then(p => {
        setProfile(p);
        setHistory(getHistory());
        setLoading(false);

        // Animate XP bar
        if (p.currentLevel !== 'C2') {
          const thresh = LEVEL_THRESHOLDS[p.currentLevel];
          if (thresh) {
            const pct = Math.min(100, Math.round(((p.totalXp - thresh[0]) / (thresh[1] - thresh[0])) * 100));
            Animated.spring(xpAnim, { toValue: pct, useNativeDriver: false, friction: 6 }).start();
          }
        } else {
          Animated.timing(xpAnim, { toValue: 100, duration: 600, useNativeDriver: false }).start();
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // Refresh history every time this tab is focused (picks up new quiz results)
  useFocusEffect(
    useCallback(() => {
      if (profile) {
        setHistory(getHistory());
      }
    }, [profile])
  );

  // Sign out without wiping history — it persists for next login
  const handleSignOut = () => {
    signOut();
  };

  if (loading) return <View style={s.center}><ActivityIndicator color={Colors.navy} size="large" /></View>;
  if (!profile) return (
    <View style={s.center}>
      <Text style={s.err}>Could not load profile.</Text>
      <Pressable style={s.signOutBtn} onPress={handleSignOut}><Text style={s.signOutTxt}>Sign out</Text></Pressable>
    </View>
  );

  const xpData = profile.currentLevel !== 'C2' ? LEVEL_THRESHOLDS[profile.currentLevel] : null;
  const xpBarWidth = xpAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  const totalCorrect = history.reduce((s, e) => s + e.correct, 0);
  const totalAnswered = history.reduce((s, e) => s + e.total, 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.pad}>
      {/* Avatar + name */}
      <View style={s.avatarWrap}>
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>{profile.username.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={s.username}>{profile.username}</Text>
        <Text style={s.email}>{profile.email}</Text>
        {profile.role === 'ADMIN' && (
          <View style={s.adminBadge}><Text style={s.adminTxt}>Admin</Text></View>
        )}
      </View>

      {/* Animated XP card */}
      <View style={s.xpCard}>
        <View style={s.xpRow}>
          <Text style={s.xpLabel}>Level <Text style={{ color: Colors.navy }}>{profile.currentLevel}</Text></Text>
          <Text style={s.xpVal}>{profile.totalXp} XP</Text>
        </View>
        <View style={s.track}>
          <Animated.View style={[s.fill, { width: xpBarWidth }]} />
        </View>
        {xpData ? (
          <Text style={s.xpHint}>{Math.max(0, xpData[1] - profile.totalXp)} XP to reach {xpData[2]}</Text>
        ) : (
          <Text style={[s.xpHint, { color: Colors.navy, fontWeight: '700' }]}>Maximum level — congratulations!</Text>
        )}
      </View>

      {/* Stats grid */}
      <View style={s.statsGrid}>
        {[
          { label: 'Current level', value: profile.currentLevel },
          { label: 'Total XP', value: String(profile.totalXp) },
          { label: 'Rounds played', value: String(history.length) },
          { label: 'Session accuracy', value: accuracy !== null ? `${accuracy}%` : '—' },
        ].map(({ label, value }) => (
          <View key={label} style={s.statCard}>
            <Text style={s.statVal}>{value}</Text>
            <Text style={s.statLbl}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Quiz History */}
      <Text style={s.sectionTitle}>Quiz history</Text>
      {history.length === 0 ? (
        <View style={s.emptyHistory}>
          <Text style={s.emptyHistoryTitle}>No rounds played yet</Text>
          <Text style={s.emptyHistoryDesc}>Complete a quiz and your results will appear here.</Text>
        </View>
      ) : (
        history.map((entry, idx) => {
          const isOpen = expandedIdx === idx;
          const pct = Math.round((entry.correct / entry.total) * 100);
          const mistakes = (entry.review ?? []).filter(r => !r.wasCorrect).length;
          const date = new Date(entry.date);
          const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          return (
            <Pressable key={idx} style={s.historyCard} onPress={() => { setExpandedIdx(isOpen ? null : idx); setExpandedReview(null); }}>
              <View style={s.historyHeader}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                    <View style={s.levelBadge}><Text style={s.levelBadgeTxt}>{entry.level}</Text></View>
                    <View style={s.typeBadge}><Text style={s.typeBadgeTxt}>{entry.type}</Text></View>
                  </View>
                  <Text style={s.historyScore}>{entry.correct}/{entry.total} correct · {pct}%</Text>
                  <Text style={s.historyMeta}>{dateStr} at {timeStr} · +{entry.xpEarned} XP{mistakes > 0 ? ` · ${mistakes} wrong` : ''}</Text>
                </View>
                <Text style={s.expandArrow}>{isOpen ? '▲' : '▼'}</Text>
              </View>

              {/* Progress bar */}
              <View style={[s.track, { marginTop: 8 }]}>
                <View style={[s.fill, { width: `${pct}%`, backgroundColor: pct >= 80 ? Colors.steel : pct >= 50 ? Colors.sun : Colors.coral }]} />
              </View>

              {/* Expanded review */}
              {isOpen && (
                <View style={{ marginTop: 14 }}>
                  <Text style={s.reviewSubHead}>Questions — tap to expand</Text>
                  {(entry.review ?? []).map((item, ri) => {
                    const isRevOpen = expandedReview === ri * 1000 + idx;
                    return (
                      <Pressable
                        key={ri}
                        style={[s.reviewItem, { borderColor: item.wasCorrect ? Colors.steel : '#fca5a5' }]}
                        onPress={e => { e.stopPropagation?.(); setExpandedReview(isRevOpen ? null : ri * 1000 + idx); }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 13, color: item.wasCorrect ? '#2e7d32' : '#b91c1c', fontWeight: '900' }}>
                            {item.wasCorrect ? '✓' : '✗'}
                          </Text>
                          <Text style={s.reviewItemPrompt} numberOfLines={isRevOpen ? undefined : 1}>{item.prompt}</Text>
                          <Text style={s.qNum}>{isRevOpen ? '▲' : '▼'}</Text>
                        </View>
                        {isRevOpen && (
                          <View style={{ gap: 6, marginTop: 10 }}>
                            {(item.options ?? []).map((opt, oi) => {
                              const isCorrect = oi === item.correctIndex;
                              const isSelected = oi === item.selectedIndex;
                              const bg = isCorrect ? Colors.mint + '88' : isSelected ? '#fee2e2' : Colors.stone50;
                              const border = isCorrect ? Colors.mint : isSelected ? '#fca5a5' : Colors.stone200;
                              return (
                                <View key={oi} style={[s.optRow, { backgroundColor: bg, borderColor: border }]}>
                                  <Text style={s.optLetter}>{String.fromCharCode(65 + oi)}.</Text>
                                  <Text style={[s.optText, (isCorrect || isSelected) && { fontWeight: '700' }]}>{opt}</Text>
                                  {isCorrect && <Text style={{ fontSize: 13, color: '#2e7d32', fontWeight: '900' }}>✓</Text>}
                                  {isSelected && !isCorrect && <Text style={{ fontSize: 13, color: '#b91c1c', fontWeight: '900' }}>✗</Text>}
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </Pressable>
          );
        })
      )}

      <Pressable style={s.signOutBtn} onPress={handleSignOut}>
        <Text style={s.signOutTxt}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.stone100 },
  pad: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  err: { color: Colors.coral, fontSize: 14, fontWeight: '600', marginBottom: 16 },

  avatarWrap: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.navy, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarTxt: { fontSize: 36, fontWeight: '900', color: Colors.white },
  username: { fontSize: 24, fontWeight: '900', color: Colors.stone900 },
  email: { fontSize: 13, color: Colors.stone400, marginTop: 2 },
  adminBadge: { marginTop: 8, backgroundColor: Colors.sun, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 4 },
  adminTxt: { fontSize: 11, fontWeight: '900', color: Colors.stone900, textTransform: 'uppercase', letterSpacing: 1 },

  xpCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: Colors.stone200, marginBottom: 16 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  xpLabel: { fontSize: 14, fontWeight: '800', color: Colors.stone900 },
  xpVal: { fontSize: 14, fontWeight: '700', color: Colors.stone500 },
  track: { height: 10, backgroundColor: Colors.stone100, borderRadius: 99, overflow: 'hidden' },
  fill: { height: 10, backgroundColor: Colors.steel, borderRadius: 99 },
  xpHint: { fontSize: 12, color: Colors.stone400, marginTop: 6 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: Colors.stone200, alignItems: 'center', minWidth: '45%', flex: 1 },
  statVal: { fontSize: 20, fontWeight: '900', color: Colors.navy },
  statLbl: { fontSize: 10, fontWeight: '700', color: Colors.stone400, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4, textAlign: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: Colors.stone900, marginBottom: 12 },

  emptyHistory: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, borderWidth: 1.5, borderColor: Colors.stone200, alignItems: 'center', marginBottom: 24 },
  emptyHistoryTitle: { fontSize: 15, fontWeight: '800', color: Colors.stone600, marginBottom: 4 },
  emptyHistoryDesc: { fontSize: 13, color: Colors.stone400, textAlign: 'center', lineHeight: 18 },

  historyCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: Colors.stone200, marginBottom: 10 },
  historyHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  levelBadge: { backgroundColor: Colors.navy, borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3 },
  levelBadgeTxt: { fontSize: 10, fontWeight: '900', color: Colors.white },
  typeBadge: { backgroundColor: Colors.steel + '33', borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3 },
  typeBadgeTxt: { fontSize: 10, fontWeight: '800', color: Colors.navy },
  historyScore: { fontSize: 15, fontWeight: '900', color: Colors.stone900 },
  historyMeta: { fontSize: 11, color: Colors.stone400, marginTop: 2 },
  expandArrow: { fontSize: 12, color: Colors.stone400, paddingLeft: 8, paddingTop: 4 },

  reviewSubHead: { fontSize: 11, fontWeight: '700', color: Colors.stone500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  reviewItem: { borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 8, backgroundColor: Colors.stone50 },
  reviewItemPrompt: { flex: 1, fontSize: 13, color: Colors.stone700, fontWeight: '600' },
  qNum: { fontSize: 10, fontWeight: '700', color: Colors.stone400 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  optLetter: { fontSize: 12, fontWeight: '800', color: Colors.stone400, width: 16 },
  optText: { flex: 1, fontSize: 13, color: Colors.stone700 },

  signOutBtn: { backgroundColor: Colors.white, borderRadius: 50, borderWidth: 2, borderColor: Colors.coral + '60', paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  signOutTxt: { color: Colors.coral, fontWeight: '800', fontSize: 14 },
});
