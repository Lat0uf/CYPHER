// Word and phrase generation + shared helpers for all cipher files
// Uses random-words package for single words (~5000 words)
// Uses procedural template generation for easy mode phrases

import randomWords from 'random-words';

// Morse map lives here so both normal.ts and hard.ts can import it
export const MORSE_MAP: Record<string, string> = {
    'A': '·−', 'B': '−···', 'C': '−·−·', 'D': '−··', 'E': '·',
    'F': '··−·', 'G': '−−·', 'H': '····', 'I': '··', 'J': '·−−−',
    'K': '−·−', 'L': '·−··', 'M': '−−', 'N': '−·', 'O': '−−−',
    'P': '·−−·', 'Q': '−−·−', 'R': '·−·', 'S': '···', 'T': '−',
    'U': '··−', 'V': '···−', 'W': '·−−', 'X': '−··−', 'Y': '−·−−',
    'Z': '−−··',
};

// Get a single random word within a length range
// Tries up to 20 times then falls back to using the minLength/maxLength options directly
export const getRandomWord = (minLen = 4, maxLen = 8): string => {
    for (let i = 0; i < 20; i++) {
        const word: string = (randomWords(1) as string[])[0].toUpperCase();
        if (word.length >= minLen && word.length <= maxLen) return word;
    }
    const word: string = (randomWords({ exactly: 1, minLength: minLen, maxLength: maxLen }) as string[])[0];
    return word.toUpperCase();
};

// Get N unique random words within a length range
export const getRandomWords = (count: number, minLen = 4, maxLen = 7): string[] => {
    const results: string[] = [];
    const seen = new Set<string>();
    let attempts = 0;
    while (results.length < count && attempts < 100) {
        const word = getRandomWord(minLen, maxLen);
        if (!seen.has(word)) { seen.add(word); results.push(word); }
        attempts++;
    }
    return results;
};

// Word banks for procedural phrase generation
const VERBS = [
    'BURN', 'CRACK', 'CHASE', 'BREAK', 'FIND', 'HIDE', 'HUNT',
    'LIFT', 'LOSE', 'MISS', 'PUSH', 'PULL', 'READ', 'RISE',
    'RISK', 'RUSH', 'SEAL', 'SKIP', 'TRACE', 'TRUST', 'WATCH',
    'WIPE', 'WAKE', 'BEND', 'DROP', 'FACE', 'HOLD', 'KNOW',
    'MOVE', 'OPEN', 'PASS', 'SAVE', 'SHOW', 'STOP', 'TAKE',
    'TURN', 'FLIP', 'LOCK', 'SHIFT', 'JUMP', 'CLIMB', 'CARRY',
];

const NOUNS = [
    'BRIDGE', 'CHAIN', 'CLOCK', 'CLOUD', 'DOOR', 'DREAM', 'EDGE',
    'FLAME', 'FLOOR', 'GHOST', 'GRID', 'HAND', 'HEART', 'LIGHT',
    'LINE', 'LOOP', 'MAP', 'MASK', 'MIND', 'MOON', 'PATH',
    'ROAD', 'ROPE', 'RULE', 'SHOT', 'SIGN', 'STORM', 'TIDE',
    'TIME', 'TRAIL', 'TRUTH', 'VOICE', 'WALL', 'WAVE', 'WIRE',
    'WORLD', 'ZONE', 'MIRROR', 'STAGE', 'STAR', 'RIVER', 'STONE',
];

const ADJECTIVES = [
    'BLIND', 'BOLD', 'BROKEN', 'CALM', 'COLD', 'DARK', 'DEAD',
    'DEEP', 'EMPTY', 'FALSE', 'FAST', 'FROZEN', 'HOLLOW', 'LAST',
    'LOST', 'LOUD', 'NARROW', 'NUMB', 'OLD', 'PALE', 'QUIET',
    'RAW', 'ROUGH', 'SHARP', 'SILENT', 'SLOW', 'STILL', 'THIN',
    'TRUE', 'WILD', 'WRONG', 'BRIGHT', 'BURNT', 'DISTANT', 'BRAVE',
];

// Prepositions that are NOT "the" so no middle-word pattern forms
const PREPS = [
    'ACROSS', 'AGAINST', 'ALONG', 'AROUND', 'BEFORE', 'BEHIND',
    'BELOW', 'BEYOND', 'DOWN', 'FROM', 'INSIDE', 'INTO',
    'OVER', 'PAST', 'THROUGH', 'UNDER', 'WITHOUT', 'WITHIN',
];

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Templates produce tens of thousands of unique combos procedurally
// Mix of 2, 3, and 4 word phrases
const TEMPLATES: Array<() => string> = [
    () => `${pick(VERBS)} ${pick(NOUNS)}`,
    () => `${pick(VERBS)} ${pick(ADJECTIVES)} ${pick(NOUNS)}`,
    () => `${pick(ADJECTIVES)} ${pick(NOUNS)} ${pick(VERBS)}`,
    () => `${pick(VERBS)} ${pick(NOUNS)} ${pick(PREPS)} ${pick(NOUNS)}`,
    () => `${pick(ADJECTIVES)} ${pick(NOUNS)} ${pick(PREPS)} ${pick(NOUNS)}`,
    () => `${pick(ADJECTIVES)} ${pick(ADJECTIVES)} ${pick(NOUNS)}`,
    () => `${pick(VERBS)} ${pick(PREPS)} ${pick(NOUNS)}`,
];

export const getRandomSentence = (): string => pick(TEMPLATES)();

// Fisher-Yates string shuffle
export const shuffleString = (str: string): string => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
};

export const normalizeAnswer = (answer: string): string =>
    answer.toUpperCase().trim().replace(/^#/, '');
