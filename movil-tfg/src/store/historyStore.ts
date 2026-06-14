/**
 * Persistent quiz history store backed by expo-file-system.
 * History is stored as a JSON file in the app's document directory,
 * keyed per user email so different users on the same device each
 * see only their own results.
 *
 * Usage:
 *   1. Call `await loadHistory(email)` once after the user profile loads.
 *   2. Call `addToHistory(entry)` after each quiz — persists immediately.
 *   3. Call `getHistory()` anywhere to read the in-memory snapshot (sync).
 *   4. Call `clearHistory()` only on account deletion — NOT on sign-out,
 *      so history survives logout/login of the same account.
 */

import * as FileSystem from 'expo-file-system';
import type { QuizReviewItem } from '../types/api';

export interface HistoryEntry {
  date: string;        // ISO timestamp
  level: string;       // e.g. "B1"
  type: string;        // e.g. "GRAMMAR" | "RANDOM"
  correct: number;
  total: number;
  xpEarned: number;
  review: QuizReviewItem[];
}

const MAX_ENTRIES = 50;

// In-memory cache — always in sync with the file on disk
let _history: HistoryEntry[] = [];
let _filePath = `${FileSystem.documentDirectory}quiz_history_anonymous.json`;

/** Sanitise email into a safe filename component */
function safeEmail(email: string): string {
  return email.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Load history for the given user from the file system.
 * Must be called once after the user profile is available.
 */
export async function loadHistory(email: string): Promise<void> {
  _filePath = `${FileSystem.documentDirectory}quiz_history_${safeEmail(email)}.json`;
  try {
    const info = await FileSystem.getInfoAsync(_filePath);
    if (info.exists) {
      const raw = await FileSystem.readAsStringAsync(_filePath, { encoding: 'utf8' as any });
      _history = JSON.parse(raw) as HistoryEntry[];
    } else {
      _history = [];
    }
  } catch {
    _history = [];
  }
}

/** Persist the in-memory cache to disk (fire-and-forget). */
function persist(): void {
  FileSystem.writeAsStringAsync(
    _filePath,
    JSON.stringify(_history),
    { encoding: 'utf8' as any },
  ).catch(() => {});
}

/**
 * Prepend a new entry and persist to disk immediately.
 * Synchronous from the caller's perspective; disk write is async.
 */
export function addToHistory(entry: HistoryEntry): void {
  _history.unshift(entry);
  if (_history.length > MAX_ENTRIES) _history.length = MAX_ENTRIES;
  persist();
}

/**
 * Return a copy of the in-memory history (newest first).
 * Synchronous — only accurate after loadHistory() has resolved.
 */
export function getHistory(): HistoryEntry[] {
  return [..._history];
}

/**
 * Wipe the in-memory cache without touching the file on disk.
 * Call this on sign-out so the next user doesn't see stale history.
 */
export function clearMemoryHistory(): void {
  _history = [];
}

/**
 * Wipe this user's history from memory and disk.
 * Call this on account deletion, NOT on regular sign-out.
 */
export async function clearHistory(): Promise<void> {
  _history = [];
  try {
    const info = await FileSystem.getInfoAsync(_filePath);
    if (info.exists) await FileSystem.deleteAsync(_filePath, { idempotent: true });
  } catch {}
}
