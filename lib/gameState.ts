// Game state types and timer utilities

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GameState {
  difficulty: Difficulty;
  level: number;
  score: number;
  isPlaying: boolean;
  timeRemaining: number;
  currentCipher: string | null;
  cipherType: string | null;
  hashedAnswer: string | null;
  altHashedAnswers: string[];
  gameOver: boolean;
}

export interface CipherData {
  cipherText: string;
  cipherType: string;
  hashedAnswer: string;
  altHashedAnswers?: string[];
  hint?: string;
}

// 1 minute for all modes
export const TIMER_DURATIONS: Record<Difficulty, number> = {
  easy: 60 * 1000,
  normal: 60 * 1000,
  hard: 60 * 1000,
};

export const getInitialGameState = (): GameState => ({
  difficulty: 'normal',
  level: 1,
  score: 0,
  isPlaying: false,
  timeRemaining: TIMER_DURATIONS.normal,
  currentCipher: null,
  cipherType: null,
  hashedAnswer: null,
  altHashedAnswers: [],
  gameOver: false,
});

// Proper time formatting
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const getTimerPercentage = (remaining: number, difficulty: Difficulty): number => {
  const total = TIMER_DURATIONS[difficulty];
  return (remaining / total) * 100;
};
