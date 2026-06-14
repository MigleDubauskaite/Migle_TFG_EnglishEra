import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_BASE, saveToken } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message ?? 'Incorrect email or password');
      }
      const data = await res.json();
      const token = data.token ?? data.accessToken ?? data.jwt;
      if (!token) throw new Error('No token received');
      await signIn(token);
    } catch (e: any) {
      setError(e.message ?? 'Login error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <Text style={s.eyebrow}>ENGLISH LEARNING PLATFORM</Text>
          <Text style={s.brand}>English Era</Text>
          <Text style={s.subtitle}>Sign in to continue</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          {error && <Text style={s.error}>{error}</Text>}

          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={Colors.stone400}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={Colors.stone400}
            secureTextEntry
          />

          <Pressable
            style={({ pressed }) => [s.btn, pressed && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={s.btnText}>Sign in</Text>}
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Register')} style={s.link}>
            <Text style={s.linkText}>No account yet? <Text style={s.linkBold}>Create one</Text></Text>
          </Pressable>
        </View>

        <Text style={s.footnote}>
          Grammar · Vocabulary · Reading · Idioms{'\n'}6 CEFR levels · Real events in Spain
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.navy, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  eyebrow: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 10 },
  brand: { fontSize: 40, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 6 },
  card: { backgroundColor: Colors.white, borderRadius: 24, padding: 24, gap: 4 },
  label: { fontSize: 11, fontWeight: '700', color: Colors.stone600, marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 2, borderColor: Colors.stone200, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.stone900, backgroundColor: Colors.stone50,
  },
  btn: {
    backgroundColor: Colors.navy, borderRadius: 50, paddingVertical: 14,
    alignItems: 'center', marginTop: 20,
  },
  btnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: Colors.stone500, fontSize: 13 },
  linkBold: { color: Colors.navy, fontWeight: '700' },
  error: { color: Colors.coral, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  footnote: { marginTop: 28, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 18 },
});
