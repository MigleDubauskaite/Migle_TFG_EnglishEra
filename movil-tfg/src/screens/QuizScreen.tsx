import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiGet, apiPost } from '../api/client';
import { addToHistory } from '../store/historyStore';
import { Colors } from '../theme/colors';
import type { QuizPublic, QuizResult } from '../types/api';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const COUNT_OPTIONS = [5, 10, 15];
const QUIZ_TYPES = [
  { key: 'RANDOM',     label: 'Random mix',  desc: 'Grammar, vocabulary, reading and idioms.' },
  { key: 'GRAMMAR',    label: 'Grammar',      desc: 'Verbs, tenses, conditionals and structure.' },
  { key: 'VOCABULARY', label: 'Vocabulary',   desc: 'Meanings, opposites, definitions and usage.' },
  { key: 'READING',    label: 'Reading',      desc: 'Short passages and inference questions.' },
  { key: 'IDIOMS',     label: 'Idioms',       desc: 'Common English expressions and phrases.' },
] as const;

type QuizTypeKey = (typeof QUIZ_TYPES)[number]['key'];

interface ShuffledQ {
  id: number;
  questionType: string;
  prompt: string;
  displayOptions: string[];
  displayToOriginal: number[];
}

function shuffle(q: QuizPublic): ShuffledQ {
  const idx = [0, 1, 2, 3];
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return {
    id: q.id, questionType: q.questionType, prompt: q.prompt,
    displayOptions: idx.map(i => q.options[i]),
    displayToOriginal: idx,
  };
}

type Screen = 'selector' | 'quiz' | 'result';

export default function QuizScreen() {
  const [screen, setScreen] = useState<Screen>('selector');
  const [level, setLevel] = useState('A1');
  const [count, setCount] = useState(5);
  const [selectedType, setSelectedType] = useState<QuizTypeKey | null>(null);
  const [questions, setQuestions] = useState<ShuffledQ[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [step, setStep] = useState(0);
  const [loadingType, setLoadingType] = useState<QuizTypeKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const usedIds = useRef<Set<number>>(new Set());

  const startRound = async (typeKey: QuizTypeKey) => {
    setLoadingType(typeKey);
    setSelectedType(typeKey);
    setError(null);
    setResult(null);
    setAnswers({});
    setStep(0);
    setExpandedReview(null);
    try {
      const typeParam = typeKey === 'RANDOM' ? '' : `&type=${typeKey}`;
      const excParam = usedIds.current.size > 0 ? `&excludeIds=${[...usedIds.current].join(',')}` : '';
      const qs = await apiGet<QuizPublic[]>(
        `/api/quizzes/random?level=${level}&limit=${count}${typeParam}${excParam}`
      );
      if (qs.length === 0) { setError('No questions available for this level and type.'); setSelectedType(null); return; }
      qs.forEach(q => usedIds.current.add(q.id));
      setQuestions(qs.map(shuffle));
      setScreen('quiz');
    } catch {
      setError('Could not load questions. Are you signed in?');
      setSelectedType(null);
    } finally {
      setLoadingType(null);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        level,
        answers: questions.map(q => {
          const di = answers[q.id] ?? -1;
          return { questionId: q.id, selectedIndex: di >= 0 ? q.displayToOriginal[di] : -1 };
        }),
      };
      let enriched: QuizResult;

      try {
        const res = await apiPost<QuizResult>('/api/quizzes/submit', payload);
        const enrichedReview = (res.review ?? []).map((item, i) => {
          const q = questions[i];
          if (!q) return item;
          const di = answers[q.id] ?? -1;
          return { ...item, options: q.displayOptions, selectedIndex: di, correctIndex: q.displayToOriginal.indexOf(item.correctIndex) };
        });
        enriched = { ...res, review: enrichedReview };
      } catch {
        // Sin conexión: guardamos lo que respondió el usuario
        // No podemos saber qué era correcto sin el backend
        const review = questions.map(q => {
          const di = answers[q.id] ?? -1;
          return {
            prompt: q.prompt,
            options: q.displayOptions,
            selectedIndex: di,
            correctIndex: -1,   // desconocido sin conexión
            wasCorrect: false,
          };
        });
        enriched = { correct: 0, total: questions.length, xpEarned: 0, newTotalXp: 0, review };
        setError('Sin conexión — respuestas guardadas localmente, XP no añadido.');
      }

      setResult(enriched);
      addToHistory({
        date: new Date().toISOString(),
        level,
        type: selectedType ?? 'RANDOM',
        correct: enriched.correct,
        total: enriched.total,
        xpEarned: enriched.xpEarned,
        review: enriched.review,
      });
      setScreen('result');
    } catch { setError('Error submitting answers.'); }
    finally { setSubmitting(false); }
  };

  const next = () => step < questions.length - 1 ? setStep(s => s + 1) : submit();
  const reset = () => { setScreen('selector'); setResult(null); setQuestions([]); setAnswers({}); setStep(0); setError(null); setExpandedReview(null); };
  const resetAll = () => { reset(); usedIds.current.clear(); };

  // ── RESULT ──
  if (screen === 'result' && result) {
    const pct = Math.round((result.correct / result.total) * 100);
    const pctColor = pct >= 80 ? Colors.navy : pct >= 50 ? Colors.steel : Colors.coral;
    return (
      <ScrollView style={s.bg} contentContainerStyle={s.pad}>
        <Text style={s.title}>Round complete</Text>

        <View style={s.scoreCard}>
          <Text style={[s.scoreNum, { color: pctColor }]}>{result.correct}<Text style={s.scoreTotal}>/{result.total}</Text></Text>
          <View style={s.track}><View style={[s.fill, { width: `${pct}%`, backgroundColor: pctColor }]} /></View>
          <Text style={s.pctTxt}>{pct}% correct</Text>
          <Text style={s.xpText}>+{result.xpEarned} XP · Total: {result.newTotalXp} XP</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <Pressable style={s.btnNavy} onPress={reset}><Text style={s.btnNavyTxt}>Next round</Text></Pressable>
            <Pressable style={s.btnOutline} onPress={resetAll}><Text style={s.btnOutlineTxt}>Reset session</Text></Pressable>
          </View>
        </View>

        <Text style={s.reviewHeading}>Full review</Text>
        {(result.review ?? []).map((item, i) => {
          const isOpen = expandedReview === i;
          return (
            <Pressable
              key={i}
              style={[s.reviewCard, { borderColor: item.wasCorrect ? Colors.steel : '#fca5a5' }]}
              onPress={() => setExpandedReview(isOpen ? null : i)}
            >
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: isOpen ? 10 : 0 }}>
                <View style={[s.badge, { backgroundColor: item.wasCorrect ? Colors.steel + '33' : '#fee2e2' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: item.wasCorrect ? Colors.navy : '#b91c1c' }}>
                    {item.wasCorrect ? '✓ Correct' : '✗ Wrong'}
                  </Text>
                </View>
                <Text style={s.qNum}>Q{i + 1}</Text>
                <Text style={[s.qNum, { marginLeft: 'auto' }]}>{isOpen ? '▲' : '▼'}</Text>
              </View>
              <Text style={s.reviewPrompt} numberOfLines={isOpen ? undefined : 2}>{item.prompt}</Text>
              {isOpen && (
                <View style={{ gap: 6, marginTop: 10 }}>
                  {item.options.map((opt, oi) => {
                    const isCorrect = oi === item.correctIndex;
                    const isSelected = oi === item.selectedIndex;
                    const bg = isCorrect ? Colors.mint + '88' : isSelected ? '#fee2e2' : Colors.stone50;
                    const border = isCorrect ? Colors.mint : isSelected ? '#fca5a5' : Colors.stone200;
                    return (
                      <View key={oi} style={[s.optRow, { backgroundColor: bg, borderColor: border }]}>
                        <Text style={s.optLetter}>{String.fromCharCode(65 + oi)}.</Text>
                        <Text style={[s.optText, (isCorrect || isSelected) && { fontWeight: '700' }]}>{opt}</Text>
                        {isCorrect && <Text style={[s.tag, { color: '#2e7d32' }]}>✓</Text>}
                        {isSelected && !isCorrect && <Text style={[s.tag, { color: '#b91c1c' }]}>✗</Text>}
                      </View>
                    );
                  })}
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  // ── QUIZ ──
  if (screen === 'quiz' && questions.length > 0) {
    const cur = questions[step];
    const isLast = step === questions.length - 1;
    const progress = (step / questions.length) * 100;
    return (
      <View style={[s.bg, { flex: 1 }]}>
        <ScrollView contentContainerStyle={s.pad}>
          <Pressable onPress={reset} style={{ marginBottom: 16 }}>
            <Text style={s.back}>← Back</Text>
          </Pressable>
          <View style={s.quizCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={s.stepBadge}><Text style={s.stepTxt}>{step + 1} / {questions.length}</Text></View>
              <Text style={s.qType}>{cur.questionType}</Text>
            </View>
            <View style={s.track}>
              <View style={[s.fill, { width: `${progress}%` }]} />
            </View>
            <Text style={s.prompt}>{cur.prompt}</Text>
            <View style={{ gap: 10, marginTop: 8 }}>
              {cur.displayOptions.map((opt, i) => {
                const selected = answers[cur.id] === i;
                return (
                  <Pressable
                    key={i}
                    style={[s.optBtn, selected && s.optBtnSelected]}
                    onPress={() => setAnswers(prev => ({ ...prev, [cur.id]: i }))}
                  >
                    <Text style={[s.optLetterInline, selected && { color: Colors.navy }]}>{String.fromCharCode(65 + i)}.</Text>
                    <Text style={[s.optBtnText, selected && { color: Colors.stone900, fontWeight: '700' }]}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
            {error && <Text style={s.err}>{error}</Text>}
            <Pressable
              style={[s.submitBtn, (answers[cur.id] === undefined || submitting) && { opacity: 0.4 }]}
              onPress={next}
              disabled={answers[cur.id] === undefined || submitting}
            >
              {submitting
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={s.submitTxt}>{isLast ? 'Submit answers' : 'Next question'}</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── SELECTOR ──
  return (
    <ScrollView style={s.bg} contentContainerStyle={s.pad}>
      <Text style={s.title}>Quizzes</Text>
      <Text style={s.sub}>Choose your level, number of questions and type.</Text>
      {error && <Text style={s.err}>{error}</Text>}

      <Text style={s.groupLabel}>Level</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {LEVELS.map(l => (
            <Pressable key={l} style={[s.pill, level === l && s.pillActive]} onPress={() => setLevel(l)}>
              <Text style={[s.pillTxt, level === l && s.pillActiveTxt]}>{l}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Text style={s.groupLabel}>Questions per round</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
        {COUNT_OPTIONS.map(n => (
          <Pressable key={n} style={[s.pill, count === n && s.pillSun]} onPress={() => setCount(n)}>
            <Text style={[s.pillTxt, count === n && { color: Colors.stone900 }]}>{n}</Text>
          </Pressable>
        ))}
        {usedIds.current.size > 0 && (
          <Pressable onPress={resetAll} style={{ justifyContent: 'center' }}>
            <Text style={{ fontSize: 12, color: Colors.navy, textDecorationLine: 'underline' }}>
              Reset ({usedIds.current.size} seen)
            </Text>
          </Pressable>
        )}
      </View>

      {/* Random card */}
      <Pressable
        style={[s.typeCardNavy, loadingType !== null && { opacity: 0.5 }]}
        onPress={() => startRound('RANDOM')}
        disabled={loadingType !== null}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={s.typeCardNavyTitle}>Random mix</Text>
            <Text style={s.typeCardNavySub}>Grammar, vocabulary, reading and idioms — all mixed.</Text>
          </View>
          <View style={s.countBadgeWhite}><Text style={s.countBadgeWhiteTxt}>{count} q.</Text></View>
        </View>
        <Text style={s.typeCardNavyStart}>{loadingType === 'RANDOM' ? 'Loading…' : 'Start round'}</Text>
      </Pressable>

      {/* Other types */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
        {QUIZ_TYPES.filter(t => t.key !== 'RANDOM').map(qt => (
          <Pressable
            key={qt.key}
            style={[s.typeCardSmall, loadingType !== null && { opacity: 0.5 }]}
            onPress={() => startRound(qt.key)}
            disabled={loadingType !== null}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={s.typeCardSmallTitle}>{qt.label}</Text>
              <View style={s.countBadgeBlue}><Text style={s.countBadgeBlueTxt}>{count}</Text></View>
            </View>
            <Text style={s.typeCardSmallDesc}>{qt.desc}</Text>
            <Text style={s.typeCardSmallStart}>{loadingType === qt.key ? 'Loading…' : 'Start'}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.stone100 },
  pad: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.stone900, marginBottom: 4 },
  sub: { fontSize: 14, color: Colors.stone500, marginBottom: 20 },
  err: { color: Colors.coral, fontSize: 13, fontWeight: '600', marginVertical: 8 },
  groupLabel: { fontSize: 11, fontWeight: '700', color: Colors.stone500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 12 },
  back: { color: Colors.stone400, fontWeight: '600', fontSize: 14 },

  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, borderWidth: 2, borderColor: Colors.stone200, backgroundColor: Colors.white },
  pillActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  pillSun: { backgroundColor: Colors.sun, borderColor: Colors.sun },
  pillTxt: { fontWeight: '700', fontSize: 13, color: Colors.stone600 },
  pillActiveTxt: { color: Colors.white },

  typeCardNavy: { backgroundColor: Colors.navy, borderRadius: 20, padding: 20, marginTop: 16 },
  typeCardNavyTitle: { fontSize: 20, fontWeight: '900', color: Colors.white },
  typeCardNavySub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, lineHeight: 18 },
  typeCardNavyStart: { marginTop: 14, fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textDecorationLine: 'underline' },
  countBadgeWhite: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  countBadgeWhiteTxt: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },

  typeCardSmall: { backgroundColor: Colors.white, borderRadius: 20, padding: 18, borderWidth: 2, borderColor: Colors.stone200, flex: 1, minWidth: '45%' },
  typeCardSmallTitle: { fontSize: 15, fontWeight: '900', color: Colors.stone900 },
  typeCardSmallDesc: { fontSize: 12, color: Colors.stone500, marginTop: 4, lineHeight: 16 },
  typeCardSmallStart: { marginTop: 12, fontSize: 12, fontWeight: '700', color: Colors.navy, textDecorationLine: 'underline' },
  countBadgeBlue: { backgroundColor: Colors.steel + '44', borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2 },
  countBadgeBlueTxt: { fontSize: 11, fontWeight: '800', color: Colors.navy },

  quizCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 2, borderColor: Colors.stone200, gap: 12 },
  stepBadge: { backgroundColor: Colors.navy, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  stepTxt: { color: Colors.white, fontWeight: '900', fontSize: 11 },
  qType: { fontSize: 11, fontWeight: '700', color: Colors.stone400, textTransform: 'uppercase', letterSpacing: 1 },
  track: { height: 6, backgroundColor: Colors.stone100, borderRadius: 99, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: Colors.steel, borderRadius: 99 },
  prompt: { fontSize: 16, fontWeight: '600', color: Colors.stone900, lineHeight: 22 },

  optBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: Colors.stone200, backgroundColor: Colors.white },
  optBtnSelected: { borderColor: Colors.navy, backgroundColor: Colors.navy + '12' },
  optLetterInline: { fontSize: 13, fontWeight: '800', color: Colors.stone400, width: 18 },
  optBtnText: { flex: 1, fontSize: 14, color: Colors.stone700 },

  submitBtn: { backgroundColor: Colors.navy, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  submitTxt: { color: Colors.white, fontWeight: '800', fontSize: 15 },

  scoreCard: { backgroundColor: Colors.cream, borderRadius: 20, padding: 24, borderWidth: 2, borderColor: Colors.sun + '66', marginVertical: 16, alignItems: 'center', gap: 6 },
  scoreNum: { fontSize: 64, fontWeight: '900', color: Colors.navy },
  scoreTotal: { fontSize: 24, fontWeight: '700', color: Colors.stone400 },
  pctTxt: { fontSize: 14, fontWeight: '800', color: Colors.stone600 },
  xpText: { fontSize: 13, fontWeight: '600', color: Colors.stone500 },
  btnNavy: { backgroundColor: Colors.navy, borderRadius: 50, paddingVertical: 10, paddingHorizontal: 20 },
  btnNavyTxt: { color: Colors.white, fontWeight: '800', fontSize: 13 },
  btnOutline: { borderWidth: 2, borderColor: Colors.stone200, borderRadius: 50, paddingVertical: 10, paddingHorizontal: 20 },
  btnOutlineTxt: { color: Colors.stone600, fontWeight: '700', fontSize: 13 },

  reviewHeading: { fontSize: 16, fontWeight: '900', color: Colors.stone900, marginBottom: 12 },
  reviewCard: { borderWidth: 2, borderRadius: 16, padding: 16, marginBottom: 10, backgroundColor: Colors.white },
  badge: { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  qNum: { fontSize: 11, fontWeight: '700', color: Colors.stone400, textTransform: 'uppercase', letterSpacing: 1 },
  reviewPrompt: { fontSize: 14, fontWeight: '600', color: Colors.stone900, lineHeight: 20, marginTop: 4 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  optLetter: { fontSize: 12, fontWeight: '800', color: Colors.stone400, width: 16 },
  optText: { flex: 1, fontSize: 13, color: Colors.stone700 },
  tag: { fontSize: 13, fontWeight: '900' },
});
