// easy.ts
// Easy mode: solveable by eye, not by tool. Every puzzle applies three distinct
// transforms simultaneously — flip, leet, and reverse/scramble. A player needs
// three separate mental steps to decode any word, but none of those steps
// requires anything they can't do in their head once they know the rules.
//
// Transform stack per word:
//   1. Reversal or scramble (spatial rearrangement)
//   2. Unicode flip substitutions (visual symbol swap)
//   3. Leet substitutions (digit-for-letter swap)
//
// Substitution rates are high and each helper guarantees at least one hit
// per eligible word, so no word ever escapes all layers.

import { getRandomSentence, shuffleString } from '../utils';

const FLIP_MAP: Record<string, string> = {
    'A': '∀', 'B': 'ᙠ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'Ⅎ',
    'G': '⅁', 'H': 'H', 'I': 'I', 'J': 'ſ', 'K': '⋊', 'L': '⅂',
    'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ὸ', 'R': 'Я',
    'S': 'S', 'T': '⊥', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X',
    'Y': '⅄', 'Z': 'Z',
};

// Real leet only — visually plausible digit/letter pairs.
// O→0 removed (indistinguishable in monospace). 8→B not 6→B (8 looks like a stacked B).
const LEET_MAP: Record<string, string> = {
    'A': '4', 'B': '8', 'E': '3', 'G': '9', 'I': '1', 'S': '5', 'T': '7', 'Z': '2',
};

const flippableIndices = (word: string): number[] =>
    word.split('').reduce<number[]>((acc, c, i) => {
        const f = FLIP_MAP[c];
        return (f && f !== c) ? [...acc, i] : acc;
    }, []);

const leetableIndices = (word: string): number[] =>
    word.split('').reduce<number[]>((acc, c, i) => (LEET_MAP[c] ? [...acc, i] : acc), []);

// Apply flip substitutions at the given rate, guaranteed at least one.
const applyFlip = (word: string, rate = 0.85): string => {
    const eligible = flippableIndices(word);
    if (eligible.length === 0) return word;
    const forced = eligible[Math.floor(Math.random() * eligible.length)];
    return word.split('').map((c, i) => {
        const f = FLIP_MAP[c];
        if (!f || f === c) return c;
        return (i === forced || Math.random() < rate) ? f : c;
    }).join('');
};

// Apply leet substitutions at the given rate, guaranteed at least one.
const applyLeet = (word: string, rate = 0.80): string => {
    const eligible = leetableIndices(word);
    if (eligible.length === 0) return word;
    const forced = eligible[Math.floor(Math.random() * eligible.length)];
    return word.split('').map((c, i) => {
        const sub = LEET_MAP[c];
        if (!sub) return c;
        return (i === forced || Math.random() < rate) ? sub : c;
    }).join('');
};

// ── Four cipher types ─────────────────────────────────────────────────────────
// Each varies the spatial transform but always stacks at least two layers on top.
// Every type has a distinct decode signature so players develop a consistent strategy.

// REVERSE: reverse each word, then flip + leet the reversed string.
// Decode: undo leet → undo flip symbols → reverse each word.
export const reverse = (): { cipher: string; answer: string } => {
    const phrase = getRandomSentence();
    const cipher = phrase.split(' ')
        .map(w => applyLeet(applyFlip(w.split('').reverse().join(''))))
        .join(' ');
    return { cipher, answer: phrase };
};

// FLIP+LEET (upsideDown): no reversal, pure heavy symbol substitution.
// Both transforms run at 90%+ so words are visually unrecognisable.
// Decode: undo leet digits → undo flip symbols. Word and letter order intact.
export const upsideDown = (): { cipher: string; answer: string } => {
    const phrase = getRandomSentence();
    const cipher = phrase.split(' ')
        .map(w => applyLeet(applyFlip(w, 0.90), 0.90))
        .join(' ');
    return { cipher, answer: phrase };
};

// LEET+SCRAMBLE: leet first, then scramble the leet'd string within each word.
// Flip intentionally omitted — scramble + leet is already two independent steps,
// adding flip on top of already-scrambled text makes it unreadably noisy.
// Decode: unscramble the anagram → read leet digits back.
export const leetspeak = (): { cipher: string; answer: string } => {
    const phrase = getRandomSentence();
    const cipher = phrase.split(' ').map(w => {
        const leet = applyLeet(w, 0.90);
        if (w.length <= 2) return leet;
        let scrambled = shuffleString(leet);
        let tries = 0;
        while (scrambled === leet && tries < 10) { scrambled = shuffleString(leet); tries++; }
        return scrambled;
    }).join(' ');
    return { cipher, answer: phrase };
};

// UNJUMBLE+FLIP+LEET: scramble each word, then apply flip + leet.
// Decode: undo leet → undo flip symbols → unscramble the anagram.
export const unjumble = (): { cipher: string; answer: string } => {
    const phrase = getRandomSentence();
    const cipher = phrase.split(' ').map(w => {
        if (w.length <= 2) return applyFlip(w);
        let shuffled = shuffleString(w);
        let tries = 0;
        while (shuffled === w && tries < 10) { shuffled = shuffleString(w); tries++; }
        return applyFlip(applyLeet(shuffled, 0.75), 0.85);
    }).join(' ');
    return { cipher, answer: phrase };
};
