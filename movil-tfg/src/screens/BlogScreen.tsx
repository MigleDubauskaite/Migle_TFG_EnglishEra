import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View,
} from 'react-native';
import { apiGet, apiPost } from '../api/client';
import { Colors } from '../theme/colors';
import type { BlogComment, BlogPost, BlogPostDetail } from '../types/api';

export default function BlogScreen() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<BlogPostDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    apiGet<BlogPost[]>('/api/posts')
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => { setError('Could not load posts.'); setLoading(false); });
  };

  useEffect(load, []);

  const togglePost = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      setCommentText('');
      return;
    }
    setExpandedId(id);
    setDetail(null);
    setCommentText('');
    setDetailLoading(true);
    try {
      const d = await apiGet<BlogPostDetail>(`/api/posts/${id}`);
      setDetail(d);
    } catch {
      setError('Could not load post detail.');
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const postComment = async (postId: number) => {
    if (!commentText.trim()) return;
    setPosting(true);
    setError(null);
    try {
      await apiPost(`/api/posts/${postId}/comments`, { body: commentText.trim() });
      setCommentText('');
      const d = await apiGet<BlogPostDetail>(`/api/posts/${postId}`);
      setDetail(d);
    } catch {
      setError('Could not post comment — please try again.');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={Colors.navy} size="large" /></View>;
  }

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <Text style={s.eyebrow}>COMMUNITY</Text>
      <Text style={s.title}>Blog</Text>
      <Text style={s.sub}>Learning tips, cultural notes and community stories.</Text>

      <TextInput
        style={s.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search posts…"
        placeholderTextColor={Colors.stone400}
        clearButtonMode="while-editing"
      />

      <Text style={s.countTxt}>{filtered.length} post{filtered.length !== 1 ? 's' : ''}</Text>
      {error && <Text style={s.err}>{error}</Text>}

      {filtered.length === 0 && (
        <Text style={s.empty}>No posts match "{search}"</Text>
      )}

      {filtered.map(post => {
        const isOpen = expandedId === post.id;
        const date = new Date(post.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric',
        });
        return (
          <View key={post.id} style={s.card}>
            <View style={s.strip} />

            <View style={s.cardBody}>
              <Pressable onPress={() => togglePost(post.id)}>
                <Text style={s.postTitle}>{post.title}</Text>
                <Text style={s.meta}>{post.authorUsername} · {date}</Text>
                {isOpen && detail && (
                  <Text style={s.preview}>{detail.body}</Text>
                )}
                <View style={s.toggleRow}>
                  <Text style={s.toggle}>{isOpen ? 'Read less ↑' : 'Read more ↓'}</Text>
                  {isOpen && detail && detail.comments.length > 0 && (
                    <View style={s.commentCount}>
                      <Text style={s.commentCountTxt}>
                        💬 {detail.comments.length}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>

              {isOpen && (
                <View style={s.commentsSection}>
                  {detailLoading ? (
                    <ActivityIndicator color={Colors.navy} style={{ marginVertical: 12 }} />
                  ) : (
                    <>
                      <Text style={s.commentsHead}>
                        Comments <Text style={s.commentsCountLabel}>
                          {detail?.comments.length ?? 0}
                        </Text>
                      </Text>

                      {(detail?.comments.length ?? 0) === 0 && (
                        <Text style={s.noComments}>
                          No comments yet — be the first!
                        </Text>
                      )}

                      {(detail?.comments ?? []).map((c: BlogComment) => (
                        <View key={c.id} style={s.comment}>
                          <Text style={s.commentAuthor}>{c.authorUsername}</Text>
                          <Text style={s.commentText}>{c.body}</Text>
                        </View>
                      ))}

                      <View style={s.inputRow}>
                        <TextInput
                          style={s.commentBox}
                          value={commentText}
                          onChangeText={setCommentText}
                          placeholder="Add a comment…"
                          placeholderTextColor={Colors.stone400}
                          multiline
                        />
                        <Pressable
                          style={[s.commentBtn, (posting || !commentText.trim()) && { opacity: 0.4 }]}
                          onPress={() => postComment(post.id)}
                          disabled={posting || !commentText.trim()}
                        >
                          <Text style={s.commentBtnTxt}>{posting ? '…' : 'Post'}</Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.stone100 },
  pad: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  eyebrow: { fontSize: 10, fontWeight: '700', color: Colors.navy + '80', letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.stone900 },
  sub: { fontSize: 13, color: Colors.stone500, marginTop: 4, lineHeight: 18, marginBottom: 20 },
  search: {
    borderWidth: 2, borderColor: Colors.stone200, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: Colors.stone900, backgroundColor: Colors.white, marginBottom: 10,
  },
  countTxt: { fontSize: 12, fontWeight: '700', color: Colors.stone400, marginBottom: 16 },
  err: { color: Colors.coral, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  empty: { color: Colors.stone400, fontSize: 14, textAlign: 'center', marginTop: 24 },

  card: { backgroundColor: Colors.white, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.stone200, marginBottom: 14, overflow: 'hidden' },
  strip: { height: 4, width: '100%', backgroundColor: Colors.steel },
  cardBody: { padding: 20 },

  postTitle: { fontSize: 18, fontWeight: '900', color: Colors.stone900, marginBottom: 4 },
  meta: { fontSize: 11, color: Colors.stone400, marginBottom: 10, fontWeight: '600' },
  preview: { fontSize: 14, color: Colors.stone600, lineHeight: 20 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  toggle: { fontSize: 13, fontWeight: '700', color: Colors.navy, textDecorationLine: 'underline' },
  commentCount: { backgroundColor: Colors.steel + '22', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3 },
  commentCountTxt: { fontSize: 11, fontWeight: '700', color: Colors.navy },

  commentsSection: { marginTop: 18, borderTopWidth: 1.5, borderTopColor: Colors.stone100, paddingTop: 16 },
  commentsHead: { fontSize: 12, fontWeight: '900', color: Colors.stone900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  commentsCountLabel: { color: Colors.navy },
  noComments: { fontSize: 13, color: Colors.stone400, marginBottom: 12, fontStyle: 'italic' },
  comment: { backgroundColor: Colors.stone50, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.stone200 },
  commentAuthor: { fontSize: 12, fontWeight: '800', color: Colors.navy, marginBottom: 4 },
  commentText: { fontSize: 13, color: Colors.stone700, lineHeight: 18 },

  inputRow: { flexDirection: 'row', gap: 10, marginTop: 12, alignItems: 'flex-end' },
  commentBox: {
    flex: 1, borderWidth: 2, borderColor: Colors.stone200, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 13,
    color: Colors.stone900, backgroundColor: Colors.white, minHeight: 44, maxHeight: 100,
  },
  commentBtn: { backgroundColor: Colors.navy, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  commentBtnTxt: { color: Colors.white, fontWeight: '800', fontSize: 13 },
});
