export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  currentLevel: string;
  totalXP: number;
  token: string;
  role: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  currentLevel: string;
  totalXp: number;
  role: string;
}

export interface QuizPublic {
  id: number;
  questionType?: string;
  prompt: string;
  options: string[];
}

export interface QuizStatsDto {
  total: number;
  byLevel: Record<string, number>;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

export interface QuizReviewItem {
  prompt: string;
  options: string[];
  selectedIndex: number;   // -1 if unanswered
  correctIndex: number;
  wasCorrect: boolean;
}

export interface QuizResult {
  correct: number;
  total: number;
  xpEarned: number;
  newTotalXp: number;
  newLevel: string;
  review: QuizReviewItem[];
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  level: string;
  resourceType: string;
  contentText: string;
  assetUrl: string | null;
  youtubeVideoId: string | null;
}

export interface PostSummary {
  id: number;
  title: string;
  authorUsername: string;
  createdAt: string;
}

export interface PostDetail {
  id: number;
  title: string;
  body: string;
  authorUsername: string;
  createdAt: string;
  comments: { id: number; authorUsername: string; body: string; createdAt: string }[];
}
