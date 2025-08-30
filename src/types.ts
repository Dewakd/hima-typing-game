// TypeScript interfaces for the Campus Typing Game

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type ThemeKey = 
  | 'Ekonomi dan Bisnis'
  | 'Teknik dan Informatika'
  | 'Hukum'
  | 'Ilmu Sosial dan Humaniora'
  | 'Sekolah Pascasarjana'
  | 'Farmasi dan Ilmu Kesehatan';

export interface WordTheme {
  name: string;
  easy: string[];
  medium: string[];
  hard: string[];
}

export interface WordThemes {
  [key: string]: WordTheme;
}

export interface GameStats {
  wordsCompleted: number;
  totalTime: number;
  averageWPM: number;
}

export interface BaseScores {
  easy: number;
  medium: number;
  hard: number;
}

// Event handler types
export interface InputChangeEvent {
  target: {
    value: string;
  };
}

export interface KeyPressEvent {
  key: string;
}

// Function parameter types
export interface ComplexityScoreParams {
  word: string;
  difficulty: DifficultyLevel;
}

export interface SpeedBonusParams {
  word: string;
  timeTaken: number;
}

export interface StartGameParams {
  theme: ThemeKey;
}

// Ref types
export interface InputRef {
  focus: () => void;
}