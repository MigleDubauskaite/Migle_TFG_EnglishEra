import React, { useEffect, useRef, useState } from 'react';
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
import { Colors } from '../theme/colors';
import type { AppEvent, QuizStatsDto, UserProfile } from '../types/api';

const LEVEL_THRESHOLDS: Record<string, [number, number, string]> = {
  A1: [0, 100, 'A2'], A2: [100, 250, 'B1'], B1: [250, 500, 'B2'],
  B2: [500, 800, 'C1'], C1: [800, 1200, 'C2'],
};

const CATEGORY_LABELS: Record<string, string> = {
  TALK: 'Talk', BOOK_CLUB: 'Book Club', FILM: 'Film', TRAVEL: 'Travel', OTHER: 'Event',
};

export default function HomeScreen({ navigation }: any) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<QuizStatsDto | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Animated XP bar
  const xpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Promise.all([
      apiGet<UserProfile>('/api/users/me').catch(() => null),
      apiGet<QuizStatsDto>('/api/quizzes/stats', false).catch(() => null),
      apiGet<AppEvent[]>('/api/events', false).catch(() => []),
    ]).then(([p, s, evs]) => {
      setProfile(p);
      setStats(s);
      const today = new Date().toDateString();
      const upcoming = (evs as AppEvent[])
        .filter(e => e.eventDate && new Date(e.eventDate) >= new Date(today))
        .slice(0, 3);
      setUpcomingEvents(upcoming);
      setLoading(false);

      // Animate XP bar
      if (p && p.currentLevel !== 'C2') {
        const thresh = LEVEL_THRESHOLDS[p.currentLevel];
        if (thresh) {
          const pct = Math.min(100, Math.round(((p.totalXp - thresh[0]) / (thresh[1] - thresh[0])) * 100));
          Animated.spring(xpAnim, { toValue: pct, useNativeDriver: false, friction: 6 }).start();
        }
      } else if (p) {
        Animated.timing(xpAnim, { toValue: 100, duration: 600, useNativeDriver: false }).start();
      }
    });
  }, []);

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={Colors.navy} size="large" /></View>;
  }

  const xpData = profile && profile.currentLevel !== 'C2'
    ? LEVEL_THRESHOLDS[profile.currentLevel]
    : null;

  const xpBarWidth = xpAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.container}>
      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.heroLabel}>ENGLISH LEARNING PLATFORM</Text>
        <Text style={s.heroTitle}>Real English,{'\n'}<Text style={s.heroAccent}>every day.</Text></Text>
        <Text style={s.heroSub}>
          Welcome,{' '}
          <Text style={s.heroName}>{profile?.username ?? 'there'}</Text>.{'\n'}
          Read, practise and join real events.
        </Text>

        {stats && (
          <View style={s.statsRow}>
            {[
              { v: String(stats.total), l: 'questions' },
              { v: '6', l: 'CEFR levels' },
              { v: '8', l: 'events' },
            ].map(({ v, l }) => (
              <View key={l} style={s.statItem}>
                <Text style={s.statVal}>{v}</Text>
                <Text style={s.statLbl}>{l}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Animated XP Bar */}
      {profile && (
        <View style={s.xpCard}>
          <View style={s.xpRow}>
            <Text style={s.xpLevel}>Level <Text style={{ color: Colors.navy }}>{profile.currentLevel}</Text></Text>
            <Text style={s.xpTotal}>{profile.totalXp} XP</Text>
          </View>
          <View style={s.xpTrack}>
            <Animated.View style={[s.xpFill, { width: xpBarWidth }]} />
          </View>
          {xpData ? (
            <Text style={s.xpHint}>{Math.max(0, xpData[1] - profile.totalXp)} XP to reach {xpData[2]}</Text>
          ) : (
            <Text style={[s.xpHint, { color: Colors.navy, fontWeight: '700' }]}>Maximum level — congratulations!</Text>
          )}
        </View>
      )}

      {/* Quick access cards */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>What do you want to do today?</Text>

        {/* Quiz — featured navy card */}
        <Pressable style={s.cardNavy} onPress={() => navigation.navigate('Quiz')}>
          <Text style={s.cardNavyLabel}>QUIZZES</Text>
          <Text style={s.cardNavyTitle}>
            {stats ? `${stats.total}+ questions by level` : '480+ questions by level'}
          </Text>
          <Text style={s.cardNavySub}>Grammar, vocabulary, reading and idioms — every round is different.</Text>
          <View style={s.cardNavyBtn}><Text style={s.cardNavyBtnText}>Practice now</Text></View>
        </Pressable>

        {/* Two-column: Events + Blog */}
        <View style={s.row}>
          <Pressable style={[s.cardTeal, { flex: 1 }]} onPress={() => navigation.navigate('Events')}>
            <Text style={s.cardTealLabel}>EVENTS</Text>
            <Text style={s.cardTealTitle}>Activities in Spain</Text>
            <Text style={s.cardTealSub}>Talks, book clubs and meetups.</Text>
          </Pressable>

          <Pressable style={[s.cardPeach, { flex: 1 }]} onPress={() => navigation.navigate('Blog')}>
            <Text style={s.cardPeachLabel}>BLOG</Text>
            <Text style={s.cardPeachTitle}>Tips & posts</Text>
            <Text style={s.cardPeachSub}>Read and leave a comment.</Text>
          </Pressable>
        </View>

        {/* Resources — sage card */}
        <Pressable style={s.cardSage} onPress={() => navigation.navigate('Resources')}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardSageLabel}>MATERIALS</Text>
            <Text style={s.cardSageTitle}>Grammar, vocabulary and dictionary</Text>
            <Text style={s.cardSageSub}>News, lyrics, PDF, video — filtered by your level.</Text>
          </View>
        </Pressable>
      </View>

      {/* Upcoming events strip */}
      {upcomingEvents.length > 0 && (
        <View style={s.eventsStrip}>
          <View style={s.eventsStripHeader}>
            <Text style={s.eventsStripTitle}>Upcoming events</Text>
            <Pressable onPress={() => navigation.navigate('Events')}>
              <Text style={s.eventsStripLink}>See all</Text>
            </Pressable>
          </View>
          {upcomingEvents.map(ev => (
            <View key={ev.id} style={s.evRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.evTitle} numberOfLines={1}>{ev.title}</Text>
                <Text style={s.evMeta}>
                  {ev.eventDate
                    ? new Date(ev.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
                    : ''
                  }{' · '}{ev.online ? 'Online' : ev.location}
                </Text>
              </View>
              <View style={s.evBadge}>
                <Text style={s.evBadgeTxt}>{CATEGORY_LABELS[ev.category] ?? 'Event'}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.stone100 },
  container: { paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  hero: { backgroundColor: Colors.navy, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 },
  heroLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 12 },
  heroTitle: { fontSize: 40, fontWeight: '900', color: Colors.white, lineHeight: 44, letterSpacing: -1 },
  heroAccent: { color: Colors.steel },
  heroSub: { marginTop: 12, color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 20 },
  heroName: { color: Colors.white, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginTop: 28, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', gap: 28 },
  statItem: {},
  statVal: { fontSize: 30, fontWeight: '900', color: Colors.sun },
  statLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },

  xpCard: { margin: 16, backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: Colors.stone200 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  xpLevel: { fontSize: 14, fontWeight: '800', color: Colors.stone900 },
  xpTotal: { fontSize: 14, fontWeight: '700', color: Colors.stone500 },
  xpTrack: { height: 10, backgroundColor: Colors.stone100, borderRadius: 99, overflow: 'hidden' },
  xpFill: { height: 10, backgroundColor: Colors.steel, borderRadius: 99 },
  xpHint: { fontSize: 12, color: Colors.stone400, marginTop: 6 },

  section: { paddingHorizontal: 16, gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: Colors.stone900, marginBottom: 4, marginTop: 4 },

  cardNavy: { backgroundColor: Colors.navy, borderRadius: 24, padding: 24 },
  cardNavyLabel: { fontSize: 9, fontWeight: '700', color: Colors.steel + 'AA', letterSpacing: 1.5, marginBottom: 8 },
  cardNavyTitle: { fontSize: 22, fontWeight: '900', color: Colors.white },
  cardNavySub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6, lineHeight: 18 },
  cardNavyBtn: { marginTop: 18, backgroundColor: Colors.white, borderRadius: 50, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'flex-start' },
  cardNavyBtnText: { color: Colors.navy, fontWeight: '800', fontSize: 13 },

  row: { flexDirection: 'row', gap: 12 },

  cardTeal: { backgroundColor: '#d8eee8', borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: '#b3d9cc' },
  cardTealLabel: { fontSize: 9, fontWeight: '700', color: Colors.navy + '80', letterSpacing: 1.5, marginBottom: 6 },
  cardTealTitle: { fontSize: 16, fontWeight: '900', color: Colors.stone900, marginBottom: 4 },
  cardTealSub: { fontSize: 12, color: Colors.stone500, lineHeight: 16 },

  cardPeach: { backgroundColor: Colors.peach, borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: Colors.apricot + '60' },
  cardPeachLabel: { fontSize: 9, fontWeight: '700', color: Colors.apricot + '99', letterSpacing: 1.5, marginBottom: 6 },
  cardPeachTitle: { fontSize: 16, fontWeight: '900', color: Colors.stone900, marginBottom: 4 },
  cardPeachSub: { fontSize: 12, color: Colors.stone500, lineHeight: 16 },

  cardSage: { backgroundColor: Colors.sage, borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: Colors.mint },
  cardSageLabel: { fontSize: 9, fontWeight: '700', color: Colors.navy + '80', letterSpacing: 1.5, marginBottom: 6 },
  cardSageTitle: { fontSize: 17, fontWeight: '900', color: Colors.stone900 },
  cardSageSub: { fontSize: 12, color: Colors.stone500, marginTop: 4, lineHeight: 16 },

  eventsStrip: { margin: 16, backgroundColor: Colors.cream, borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: Colors.sun + '66' },
  eventsStripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  eventsStripTitle: { fontSize: 14, fontWeight: '900', color: Colors.stone900 },
  eventsStripLink: { fontSize: 12, fontWeight: '700', color: Colors.navy },
  evRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.stone200 },
  evTitle: { fontSize: 13, fontWeight: '700', color: Colors.stone900 },
  evMeta: { fontSize: 11, color: Colors.stone400, marginTop: 2 },
  evBadge: { backgroundColor: Colors.steel + '33', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  evBadgeTxt: { fontSize: 10, fontWeight: '800', color: Colors.navy },
});
