import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Linking, Pressable, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { apiGet } from '../api/client';
import { Colors } from '../theme/colors';
import type { Lesson } from '../types/api';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Level = (typeof LEVELS)[number];

const TYPES = ['ALL', 'NEWS', 'LYRICS', 'PDF', 'VIDEO'] as const;
type LessonType = (typeof TYPES)[number];

const TYPE_LABELS: Record<LessonType, string> = {
  ALL: 'All', NEWS: 'News', LYRICS: 'Lyrics', PDF: 'PDF', VIDEO: 'Video',
};

const TYPE_COLORS: Record<string, string> = {
  NEWS:   Colors.mint,
  LYRICS: Colors.apricot,
  PDF:    Colors.navy,
  VIDEO:  Colors.steel,
};

const EXTERNAL: Array<{ section: string; color: string; items: Array<{ title: string; desc: string; url: string }> }> = [
  {
    section: 'Practice & Tests',
    color: Colors.steel + '33',
    items: [
      {
        title: 'English Practice (A1–C2)',
        desc: 'Grammar and vocabulary exercises for every CEFR level — free and ad-free.',
        url: 'http://www.english-practice.at/index.htm',
      },
      {
        title: 'TrackTest B2 Practice Paper',
        desc: 'Full B2 exam simulation with answer key — great for self-assessment.',
        url: 'https://tracktest.eu/download/english-tests/B2-English-test-with-answers.pdf',
      },
      {
        title: 'Exam English',
        desc: 'Free practice tests for Cambridge, IELTS, TOEFL and more.',
        url: 'https://www.examenglish.com',
      },
    ],
  },
  {
    section: 'Learning Platforms',
    color: Colors.navy + '18',
    items: [
      {
        title: 'British Council — Learn English',
        desc: 'Official British Council platform with grammar, listening, reading and speaking practice.',
        url: 'https://learnenglish.britishcouncil.org/',
      },
      {
        title: 'Campus Bernat i Ferrer',
        desc: 'Course materials and resources from Escola Bernat i Ferrer.',
        url: 'https://www.campus.bernatelferrer.cat/mod/folder/view.php?id=70028',
      },
    ],
  },
  {
    section: 'Grammar & Reference',
    color: Colors.mint,
    items: [
      {
        title: 'Perfect English Grammar',
        desc: 'Clear grammar explanations and free exercises for every tense and structure.',
        url: 'https://www.perfect-english-grammar.com',
      },
    ],
  },
  {
    section: 'Vocabulary & Dictionary',
    color: Colors.apricot + '44',
    items: [
      {
        title: 'Cambridge Dictionary',
        desc: 'Definitions, pronunciation, examples and Spanish translations.',
        url: 'https://dictionary.cambridge.org',
      },
      {
        title: 'IELTS Technology Vocabulary',
        desc: 'Topic word lists for IELTS writing and speaking tasks.',
        url: 'https://ieltsliz.com/',
      },
    ],
  },
];

export default function ResourcesScreen() {
  const [level, setLevel] = useState<Level>('B1');
  const [type, setType] = useState<LessonType>('ALL');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const typeParam = type === 'ALL' ? '' : `&type=${encodeURIComponent(type)}`;
    apiGet<Lesson[]>(`/api/lessons?level=${encodeURIComponent(level)}${typeParam}`, false)
      .then(data => { setLessons(data); setLoading(false); })
      .catch(() => { setError('Could not load materials.'); setLoading(false); });
  }, [level, type]);

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.pad}>
      <Text style={s.eyebrow}>MATERIALS</Text>
      <Text style={s.title}>Resources</Text>
      <Text style={s.sub}>
        Curated lessons, external links and practice tests — filtered by your level.
      </Text>

      {/* ── Level selector ── */}
      <View style={s.levelRow}>
        {LEVELS.map(l => (
          <Pressable
            key={l}
            style={[s.levelBtn, level === l && s.levelBtnActive]}
            onPress={() => setLevel(l)}
          >
            <Text style={[s.levelBtnTxt, level === l && s.levelBtnTxtActive]}>{l}</Text>
          </Pressable>
        ))}
      </View>

      {/* ── Type tabs ── */}
      <View style={s.typeRow}>
        {TYPES.map(t => (
          <Pressable
            key={t}
            style={[s.typeBtn, type === t && s.typeBtnActive]}
            onPress={() => setType(t)}
          >
            <Text style={[s.typeBtnTxt, type === t && s.typeBtnTxtActive]}>
              {TYPE_LABELS[t]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Lessons from API ── */}
      <Text style={s.sectionLabel}>
        Level {level} materials
      </Text>

      {loading && (
        <View style={s.loadRow}>
          <ActivityIndicator color={Colors.navy} size="small" />
        </View>
      )}
      {error && <Text style={s.err}>{error}</Text>}
      {!loading && lessons.length === 0 && !error && (
        <View style={s.emptyBox}>
          <Text style={s.emptyTxt}>Nothing here yet — try another level or type.</Text>
        </View>
      )}

      {lessons.map(lesson => {
        const barColor = TYPE_COLORS[lesson.resourceType] ?? Colors.stone200;
        return (
          <View key={lesson.id} style={s.lessonCard}>
            <View style={[s.lessonStrip, { backgroundColor: barColor }]} />
            <View style={s.lessonBody}>
              <View style={s.lessonBadgeRow}>
                <View style={[s.lessonBadge, { backgroundColor: Colors.navy }]}>
                  <Text style={[s.lessonBadgeTxt, { color: Colors.white }]}>{lesson.level}</Text>
                </View>
                <View style={[s.lessonBadge, { backgroundColor: barColor + '44' }]}>
                  <Text style={[s.lessonBadgeTxt, { color: Colors.navy }]}>{lesson.resourceType}</Text>
                </View>
              </View>
              <Text style={s.lessonTitle}>{lesson.title}</Text>
              {lesson.description ? (
                <Text style={s.lessonDesc}>{lesson.description}</Text>
              ) : null}
              {lesson.contentText ? (
                <View style={s.contentBox}>
                  <Text style={s.contentTxt} numberOfLines={6}>{lesson.contentText}</Text>
                </View>
              ) : null}
              {lesson.assetUrl ? (
                <Pressable
                  style={s.openBtn}
                  onPress={() => Linking.openURL(lesson.assetUrl!)}
                >
                  <Text style={s.openBtnTxt}>
                    {lesson.resourceType === 'PDF' ? 'Open PDF →' :
                     lesson.resourceType === 'VIDEO' ? 'Watch video →' : 'Open →'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}

      {/* ── External resources ── */}
      <Text style={[s.sectionLabel, { marginTop: 32 }]}>External resources</Text>
      <Text style={s.sectionSub}>
        Free websites and practice materials — opens in your browser.
      </Text>

      {EXTERNAL.map(group => (
        <View key={group.section} style={s.extGroup}>
          <Text style={s.extGroupLabel}>{group.section}</Text>
          {group.items.map(item => (
            <Pressable
              key={item.url}
              style={({ pressed }) => [s.extCard, { borderLeftColor: group.color.replace(/33|44/, 'ff'), opacity: pressed ? 0.75 : 1 }]}
              onPress={() => Linking.openURL(item.url)}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.extTitle}>{item.title}</Text>
                <Text style={s.extDesc}>{item.desc}</Text>
              </View>
              <Text style={s.extArrow}>→</Text>
            </Pressable>
          ))}
        </View>
      ))}

      <View style={s.note}>
        <Text style={s.noteTxt}>
          💡 External links open in your browser. All resources are free.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.stone100 },
  pad: { padding: 20, paddingBottom: 40 },
  eyebrow: { fontSize: 10, fontWeight: '700', color: Colors.navy + '80', letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.stone900 },
  sub: { fontSize: 13, color: Colors.stone500, marginTop: 6, lineHeight: 18, marginBottom: 20 },

  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  levelBtn: { borderRadius: 50, paddingHorizontal: 16, paddingVertical: 7, borderWidth: 2, borderColor: Colors.stone200, backgroundColor: Colors.white },
  levelBtnActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  levelBtnTxt: { fontSize: 12, fontWeight: '800', color: Colors.stone500 },
  levelBtnTxtActive: { color: Colors.white },

  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  typeBtn: { borderRadius: 50, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5, borderColor: Colors.stone200, backgroundColor: Colors.white },
  typeBtnActive: { backgroundColor: Colors.steel + '22', borderColor: Colors.steel },
  typeBtnTxt: { fontSize: 11, fontWeight: '700', color: Colors.stone500 },
  typeBtnTxtActive: { color: Colors.navy },

  sectionLabel: { fontSize: 13, fontWeight: '900', color: Colors.stone900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  sectionSub: { fontSize: 12, color: Colors.stone400, marginTop: -8, marginBottom: 14, lineHeight: 16 },
  loadRow: { paddingVertical: 16, alignItems: 'center' },
  err: { color: Colors.coral, fontSize: 13, fontWeight: '600', marginBottom: 12 },
  emptyBox: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, borderWidth: 1.5, borderColor: Colors.stone200, alignItems: 'center', marginBottom: 16 },
  emptyTxt: { fontSize: 13, color: Colors.stone400, textAlign: 'center' },

  lessonCard: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.stone200, marginBottom: 12, overflow: 'hidden' },
  lessonStrip: { height: 4, width: '100%' },
  lessonBody: { padding: 16 },
  lessonBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  lessonBadge: { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3 },
  lessonBadgeTxt: { fontSize: 10, fontWeight: '800' },
  lessonTitle: { fontSize: 16, fontWeight: '900', color: Colors.stone900, marginBottom: 4 },
  lessonDesc: { fontSize: 12, color: Colors.stone500, lineHeight: 16, marginBottom: 8 },
  contentBox: { backgroundColor: Colors.stone50, borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.stone200 },
  contentTxt: { fontSize: 12, color: Colors.stone700, lineHeight: 18 },
  openBtn: { backgroundColor: Colors.navy, borderRadius: 50, paddingVertical: 9, paddingHorizontal: 18, alignSelf: 'flex-start', marginTop: 4 },
  openBtnTxt: { color: Colors.white, fontWeight: '800', fontSize: 12 },

  extGroup: { marginBottom: 20 },
  extGroupLabel: { fontSize: 11, fontWeight: '900', color: Colors.stone900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  extCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: Colors.stone200,
    borderLeftWidth: 4, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  extTitle: { fontSize: 14, fontWeight: '800', color: Colors.stone900, marginBottom: 3 },
  extDesc: { fontSize: 12, color: Colors.stone500, lineHeight: 16 },
  extArrow: { fontSize: 18, color: Colors.navy, fontWeight: '700' },

  note: { backgroundColor: Colors.cream, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: Colors.sun + '66', marginTop: 8 },
  noteTxt: { fontSize: 12, color: Colors.stone600, lineHeight: 18 },
});
