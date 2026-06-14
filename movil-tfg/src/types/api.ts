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
  questionType: string;
  prompt: string;
  options: string[];
}

export interface QuizReviewItem {
  prompt: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  wasCorrect: boolean;
}

export interface QuizResult {
  correct: number;
  total: number;
  xpEarned: number;
  newTotalXp: number;
  review: QuizReviewItem[];
}

export interface QuizStatsDto {
  total: number;
  byLevel: Record<string, number>;
}

export interface AppEvent {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  online: boolean;
  eventDate: string | null;
  createdBy: string;
  registrationUrl?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  authorUsername: string;
  createdAt: string;
}

export interface BlogPostDetail {
  id: number;
  title: string;
  body: string;
  authorUsername: string;
  createdAt: string;
  comments: BlogComment[];
}

export interface BlogComment {
  id: number;
  body: string;
  authorUsername: string;
  createdAt: string;
}

export interface Lesson {
  id: number;
  level: string;
  sortOrder: number;
  resourceType: 'NEWS' | 'LYRICS' | 'PDF' | 'VIDEO';
  title: string;
  description: string;
  contentText: string | null;
  assetUrl: string | null;
  youtubeVideoId: string | null;
}
