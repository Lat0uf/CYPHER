// localStorage high score manager. One key per difficulty, never resets automatically.

import type { Difficulty } from './gameState';

const KEYS: Record<Difficulty, string> = {
    easy: 'cypher-best-easy',
    normal: 'cypher-best-normal',
    hard: 'cypher-best-hard',
};

export function getBest(difficulty: Difficulty): number | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(KEYS[difficulty]);
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return isNaN(n) ? null : n;
}

export function setBest(difficulty: Difficulty, score: number): void {
    if (typeof window === 'undefined') return;
    const current = getBest(difficulty);
    if (current === null || score > current) {
        localStorage.setItem(KEYS[difficulty], String(score));
    }
}

export function isNewBest(difficulty: Difficulty, score: number): boolean {
    const current = getBest(difficulty);
    return score > 0 && (current === null || score > current);
}
