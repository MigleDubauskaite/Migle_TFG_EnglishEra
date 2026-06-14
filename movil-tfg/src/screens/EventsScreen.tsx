import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Linking, Pressable, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { apiGet } from '../api/client';
import { Colors } from '../theme/colors';
import type { AppEvent } from '../types/api';

const CATEGORY_LABELS: Record<string, string> = {
  TALK: 'Talk', BOOK_CLUB: 'Book Club', FILM: 'Film', TRAVEL: 'Travel', OTHER: 'Other',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  TALK:      { bg: Colors.navy + '18', text: Colors.navy, bar: Colors.navy },
  BOOK_CLUB: { bg: Colors.steel + '44', text: Colors.navy, bar: Colors.steel },
  FILM:      { bg: Colors.sun + '66', text: Colors.stone900, bar: Colors.stone400 },
  TRAVEL:    { bg: Colors.apricot + '33', text: Colors.stone900, bar: Colors.apricot },
  OTHER:     { bg: Colors.stone100, text: Colors.stone600, bar: Colors.stone200 },
};

export default function EventsScreen() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    apiGet<AppEvent[]>('/api/events', false)
      .then(data => { setEvents(data); setLoading(false); })
      .catch(() => { setError('Could not load events.'); setLoading(false); });
  }, []);

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={Colors.navy} size="large" /></View>;
  }

  const today = new Date().toDateString();
  const upcoming = events.filter(e => e.eventDate && new Date(e.eventDate) >= new Date(today));
  const past = events.filter(e => !e.eventDate || new Date(e.eventDate) < new Date(today));

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.pad}>
      <Text style={s.eyebrow}>LIVE & IN-PERSON</Text>
      <Text style={s.title}>English Events</Text>
      <Text style={s.sub}>
        Talks, book clubs, film nights and walking routes across Spain — all in English.
      </Text>

      {error && <Text style={s.err}>{error}</Text>}

      <Text style={s.sectionHead}>
        Upcoming <Text style={s.count}>{upcoming.length}</Text>
      </Text>
      {upcoming.length === 0 && (
        <Text style={s.empty}>No upcoming events — check back soon!</Text>
      )}
      {upcoming.map(ev => (
        <EventCard
          key={ev.id}
          ev={ev}
          expanded={expandedId === ev.id}
          onToggle={() => setExpandedId(expandedId === ev.id ? null : ev.id)}
        />
      ))}

      {past.length > 0 && (
        <>
          <Text style={[s.sectionHead, { color: Colors.stone400, marginTop: 28 }]}>
            Past events
          </Text>
          {past.map(ev => (
            <EventCard
              key={ev.id}
              ev={ev}
              past
              expanded={expandedId === ev.id}
              onToggle={() => setExpandedId(expandedId === ev.id ? null : ev.id)}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

function EventCard({
  ev, past = false, expanded, onToggle,
}: {
  ev: AppEvent;
  past?: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cat = CATEGORY_COLORS[ev.category] ?? CATEGORY_COLORS.OTHER;
  const label = CATEGORY_LABELS[ev.category] ?? ev.category;
  const date = ev.eventDate ? new Date(ev.eventDate) : null;
  const day = date?.toLocaleDateString('en-GB', { day: 'numeric' });
  const month = date?.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
  const fullDate = date?.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const time = date?.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <Pressable
      style={[s.card, past && { opacity: 0.55 }]}
      onPress={onToggle}
    >
      {/* top accent strip */}
      <View style={[s.strip, { backgroundColor: cat.bar }]} />
      <View style={s.cardBody}>
        {/* date block */}
        {date && (
          <View style={s.dateBlock}>
            <Text style={s.dateDay}>{day}</Text>
            <Text style={s.dateMon}>{month}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={s.badgeRow}>
            <View style={[s.badge, { backgroundColor: cat.bg }]}>
              <Text style={[s.badgeTxt, { color: cat.text }]}>{label}</Text>
            </View>
            {ev.online && (
              <View style={[s.badge, { backgroundColor: Colors.steel + '22' }]}>
                <Text style={[s.badgeTxt, { color: Colors.navy }]}>Online</Text>
              </View>
            )}
          </View>
          <Text style={s.evTitle}>{ev.title}</Text>
          <Text style={s.evDesc} numberOfLines={expanded ? undefined : 2}>
            {ev.description}
          </Text>
          <View style={s.evFooter}>
            <Text style={s.evLoc}>📍 {ev.location}</Text>
            <Text style={s.expandHint}>{expanded ? '▲ less' : '▼ more'}</Text>
          </View>
        </View>
      </View>

      {/* Expanded detail panel */}
      {expanded && (
        <View style={s.detail}>
          <View style={s.detailDivider} />

          {fullDate && (
            <View style={s.detailRow}>
              <Text style={s.detailIcon}>🗓</Text>
              <Text style={s.detailText}>{fullDate}{time ? ` at ${time}` : ''}</Text>
            </View>
          )}

          {ev.location ? (
            <View style={s.detailRow}>
              <Text style={s.detailIcon}>📍</Text>
              <Text style={s.detailText}>{ev.location}</Text>
            </View>
          ) : null}

          {ev.online && (
            <View style={s.detailRow}>
              <Text style={s.detailIcon}>💻</Text>
              <Text style={s.detailText}>This event is available online.</Text>
            </View>
          )}

          {ev.registrationUrl ? (
            <Pressable
              style={s.registerBtn}
              onPress={() => Linking.openURL(ev.registrationUrl!)}
            >
              <Text style={s.registerBtnTxt}>Register / More info →</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.stone100 },
  pad: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  eyebrow: { fontSize: 10, fontWeight: '700', color: Colors.navy + '80', letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.stone900 },
  sub: { fontSize: 13, color: Colors.stone500, marginTop: 6, lineHeight: 18, marginBottom: 24 },
  err: { color: Colors.coral, fontSize: 13, fontWeight: '600', marginBottom: 12 },
  sectionHead: { fontSize: 12, fontWeight: '900', color: Colors.stone900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  count: { color: Colors.navy },
  empty: { color: Colors.stone400, fontSize: 13, marginBottom: 16 },

  card: { backgroundColor: Colors.white, borderRadius: 20, marginBottom: 14, overflow: 'hidden', borderWidth: 1.5, borderColor: Colors.stone200 },
  strip: { height: 4, width: '100%' },
  cardBody: { flexDirection: 'row' },
  dateBlock: { width: 70, backgroundColor: Colors.stone50, alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRightWidth: 1, borderRightColor: Colors.stone200 },
  dateDay: { fontSize: 26, fontWeight: '900', color: Colors.navy },
  dateMon: { fontSize: 10, fontWeight: '900', color: Colors.stone400, letterSpacing: 1, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8, padding: 14, paddingBottom: 0 },
  badge: { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3 },
  badgeTxt: { fontSize: 11, fontWeight: '800' },
  evTitle: { fontSize: 16, fontWeight: '900', color: Colors.stone900, paddingHorizontal: 14 },
  evDesc: { fontSize: 13, color: Colors.stone500, marginTop: 4, lineHeight: 18, paddingHorizontal: 14 },
  evFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 14, marginTop: 8 },
  evLoc: { fontSize: 11, color: Colors.stone400 },
  expandHint: { fontSize: 11, fontWeight: '700', color: Colors.navy },

  detail: { paddingHorizontal: 14, paddingBottom: 16 },
  detailDivider: { height: 1.5, backgroundColor: Colors.stone100, marginBottom: 14 },
  detailRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  detailIcon: { fontSize: 14, marginTop: 1 },
  detailText: { flex: 1, fontSize: 13, color: Colors.stone700, lineHeight: 18, fontWeight: '500' },
  registerBtn: { marginTop: 10, backgroundColor: Colors.navy, borderRadius: 50, paddingVertical: 10, alignItems: 'center' },
  registerBtnTxt: { color: Colors.white, fontWeight: '800', fontSize: 13 },
});
