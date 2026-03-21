import { getRandomWord, getRandomWords, MORSE_MAP } from '../utils';

function caesarShift(word: string, shift: number): string {
    return word.split('').map(c => {
        const code = c.charCodeAt(0);
        return (code >= 65 && code <= 90)
            ? String.fromCharCode(((code - 65 + shift) % 26) + 65)
            : c;
    }).join('');
}

// Rail Fence — zigzag across N rails, N is random and not shown
export const railFence = (): { cipher: string; answer: string } => {
    const word  = getRandomWord(6, 9);
    const rails = Math.floor(Math.random() * 3) + 2;
    const railArrays: string[][] = Array.from({ length: rails }, () => []);
    let rail = 0, direction = 1;
    for (const char of word) {
        railArrays[rail].push(char);
        if (rail === 0) direction = 1;
        else if (rail === rails - 1) direction = -1;
        rail += direction;
    }
    return { cipher: railArrays.map(r => r.join('')).join(''), answer: word };
};

// Hex ASCII — each letter as its hex ASCII value
export const hexAscii = (): { cipher: string; answer: string } => {
    const word   = getRandomWord(4, 6);
    const cipher = word.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase()).join(' ');
    return { cipher, answer: word };
};

// Hex ASCII Multi — two words separated by / for a clear boundary
export const hexAsciiMulti = (): { cipher: string; answer: string } => {
    const words  = getRandomWords(2, 4, 5);
    const cipher = words
        .map(w => w.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase()).join(' '))
        .join(' / ');
    return { cipher, answer: words.join(' ') };
};

// Base32 — encodes bytes into A–Z + 2–7 alphabet
export const base32Encode = (): { cipher: string; answer: string } => {
    const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const word   = getRandomWord(4, 6);
    const bytes  = Array.from(new TextEncoder().encode(word));
    let bits     = bytes.map(b => b.toString(2).padStart(8, '0')).join('');
    while (bits.length % 5 !== 0) bits += '0';
    let result   = '';
    for (let i = 0; i < bits.length; i += 5) result += BASE32[parseInt(bits.slice(i, i + 5), 2)];
    while (result.length % 8 !== 0) result += '=';
    return { cipher: result, answer: word };
};

// Base64 + Caesar — caesar shifted first, then base64 encoded on top
export const base64Chain = (): { cipher: string; answer: string } => {
    const word  = getRandomWord(5, 7);
    const shift = Math.floor(Math.random() * 20) + 3;
    return { cipher: btoa(caesarShift(word, shift)), answer: word };
};

// Binary + Caesar — caesar shifted first, then converted to binary
export const binaryThenCaesar = (): { cipher: string; answer: string } => {
    const word  = getRandomWord(4, 6);
    const shift = Math.floor(Math.random() * 20) + 3;
    const cipher = caesarShift(word, shift)
        .split('')
        .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ');
    return { cipher, answer: word };
};

// Morse + Reverse — word reversed first, then encoded as morse
export const morseThenReverse = (): { cipher: string; answer: string } => {
    const word   = getRandomWord(4, 7);
    const cipher = word.split('').reverse().join('').split('').map(c => MORSE_MAP[c] || c).join('  ');
    return { cipher, answer: word };
};

// Reverse + Caesar — word reversed first, then caesar shifted on top.
// Moved here from Normal: player decodes caesar, gets a backwards word,
// then has to reverse it — two distinct tool steps.
export const reverseThenCaesar = (): { cipher: string; answer: string } => {
    const word    = getRandomWord(5, 8);
    const shift   = Math.floor(Math.random() * 20) + 3;
    const reversed = word.split('').reverse().join('');
    return { cipher: caesarShift(reversed, shift), answer: word };
};
