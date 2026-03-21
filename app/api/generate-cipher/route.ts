import { NextRequest, NextResponse } from 'next/server';
import type { Difficulty } from '@/lib/gameState';
import * as easy from '@/lib/ciphers/easy';
import * as normal from '@/lib/ciphers/normal';
import * as hard from '@/lib/ciphers/hard';

// customSymbols was referenced in the old route but never existed - removed

interface CipherResult {
    cipher: string;
    answer: string;
    color?: string;
    altAnswers?: string[];
}

async function hashAnswer(answer: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(answer.toUpperCase().trim().replace(/^#/, ''));
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const recentHistory: Record<Difficulty, Set<number>> = {
    easy: new Set(), normal: new Set(), hard: new Set(),
};

function pickIndex(pool: (() => CipherResult)[], difficulty: Difficulty): number {
    const history = recentHistory[difficulty];
    if (history.size >= pool.length) history.clear();
    let idx = 0, attempts = 0;
    do { idx = Math.floor(Math.random() * pool.length); attempts++; }
    while (history.has(idx) && attempts < pool.length * 3);
    history.add(idx);
    return idx;
}

// Retries if cipher text equals the answer (can happen with leet/upsideDown occasionally)
function selectCipher(difficulty: Difficulty): CipherResult {
    for (let i = 0; i < 5; i++) {
        const result = selectCipherRaw(difficulty);
        if (result.cipher.toUpperCase().trim() !== result.answer.toUpperCase().trim()) return result;
    }
    return normal.binary();
}

function selectCipherRaw(difficulty: Difficulty): CipherResult {
    if (difficulty === 'easy') {
        const pool: (() => CipherResult)[] = [
            () => easy.unjumble(),
            () => easy.upsideDown(),
            () => easy.leetspeak(),
            () => easy.reverse(),
        ];
        return pool[pickIndex(pool, difficulty)]();
    }

    if (difficulty === 'normal') {
        const pool: (() => CipherResult)[] = [
            () => normal.binary(),
            () => normal.caesar(),
            () => normal.morse(),
            () => normal.base64Encode(),
            () => normal.rot13(),
            () => normal.atbash(),
        ];
        return pool[pickIndex(pool, difficulty)]();
    }

    const pool: (() => CipherResult)[] = [
        () => hard.railFence(),
        () => hard.hexAscii(),
        () => hard.hexAsciiMulti(),
        () => hard.base32Encode(),
        () => hard.base64Chain(),
        () => hard.binaryThenCaesar(),
        () => hard.morseThenReverse(),
    ];
    return pool[pickIndex(pool, difficulty)]();
}

export async function POST(request: NextRequest) {
    try {
        // level kept for API compatibility but not used - flat random is intentional
        const { difficulty, level } = await request.json() as { difficulty: Difficulty; level: number };
        void level;

        const result = selectCipher(difficulty);
        const hashedAnswer = await hashAnswer(result.answer);
        const altHashedAnswers = await Promise.all((result.altAnswers || []).map(a => hashAnswer(a)));

        return NextResponse.json({
            cipherText: result.cipher,
            cipherType: 'encrypted',
            hashedAnswer,
            altHashedAnswers,
            correctAnswer: result.answer,
            ...(result.color && { color: result.color }),
        });
    } catch (error) {
        console.error('Cipher generation error:', error);
        return NextResponse.json({ error: 'Failed to generate cipher' }, { status: 500 });
    }
}
