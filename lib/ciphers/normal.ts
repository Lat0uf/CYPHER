// normal.ts
// Normal mode - needs one external tool to solve per puzzle.
// Binary/Morse/Base64 stay single-word (output is long per character).
// Caesar/ROT13/Atbash encode two words — short enough to display, harder to brute-force.

import { getRandomWord, getRandomWords, MORSE_MAP } from '../utils';

function caesarShift(word: string, shift: number): string {
    return word.split('').map(c => {
        const code = c.charCodeAt(0);
        return (code >= 65 && code <= 90)
            ? String.fromCharCode(((code - 65 + shift) % 26) + 65)
            : c;
    }).join('');
}

// 8-bit binary — single word, already long output per character
export const binary = (): { cipher: string; answer: string } => {
    const word = getRandomWord(4, 6);
    const cipher = word.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    return { cipher, answer: word };
};

// Caesar shift — two words, random shift, player brute-forces all 25 with a tool
export const caesar = (): { cipher: string; answer: string } => {
    const words = getRandomWords(2, 4, 6);
    const shift  = Math.floor(Math.random() * 25) + 1;
    return { cipher: words.map(w => caesarShift(w, shift)).join(' '), answer: words.join(' ') };
};

// Morse code — single word, two spaces between letters so they don't blur together
export const morse = (): { cipher: string; answer: string } => {
    const word = getRandomWord(4, 7);
    const cipher = word.split('').map(c => MORSE_MAP[c] || c).join('  ');
    return { cipher, answer: word };
};

// Base64 — single word, already a recognizable encoding pattern
export const base64Encode = (): { cipher: string; answer: string } => {
    const word = getRandomWord(5, 8);
    return { cipher: btoa(word), answer: word };
};

// ROT13 — two words, caesar shift of exactly 13
export const rot13 = (): { cipher: string; answer: string } => {
    const words = getRandomWords(2, 4, 6);
    return { cipher: words.map(w => caesarShift(w, 13)).join(' '), answer: words.join(' ') };
};

// Atbash — two words, mirrors alphabet A=Z, B=Y etc.
export const atbash = (): { cipher: string; answer: string } => {
    const words  = getRandomWords(2, 4, 6);
    const cipher = words.map(w =>
        w.split('').map(c => {
            const code = c.charCodeAt(0);
            return (code >= 65 && code <= 90) ? String.fromCharCode(90 - (code - 65)) : c;
        }).join('')
    ).join(' ');
    return { cipher, answer: words.join(' ') };
};
