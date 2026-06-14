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
import { API_BASE } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

export default function RegisterScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!username || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Could not create account — please try again');
      }
      const data = await res.json();
      const token = data.token ?? data.accessToken ?? data.jwt;
      if (!token) throw new Error('No token received');
      await signIn(token);
    } catch (e: any) {
      setError(e.message ?? 'Registration error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.eyebrow}>ENGLISH LEARNING PLATFORM</Text>
          <Text style={s.brand}>English Era</Text>
          <Text style={s.subtitle}>Create your account</Text>
        </View>

        <View style={s.card}>
          {error && <Text style={s.error}>{error}</Text>}

          <Text style={s.label}>Username</Text>
          <TextInput
            style={s.input}
            value={username}
            onChangeText={setUsername}
            placeholder="johndoe"
            placeholderTextColor={Colors.stone400}
            autoCapitalize="none"
          />

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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={s.btnText}>Create account</Text>}
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Login')} style={s.link}>
            <Text style={s.linkText}>Already have an account? <Text style={s.linkBold}>Sign in</Text></Text>
          </Pressable>
        </View>

        <Text style={s.footnote}>
          Free · No ads · 6 CEFR levels{'\n'}Grammar, vocabulary, reading and idioms
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
