import { NextRequest, NextResponse } from 'next/server';

// Match the same normalization as generate-cipher
async function hashAnswer(answer: string): Promise<string> {
    const encoder = new TextEncoder();
    const normalized = answer.toUpperCase().trim().replace(/^#/, '');
    const data = encoder.encode(normalized);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
    try {
        const { guess, hashedAnswer, altHashedAnswers = [] } = await request.json() as {
            guess: string;
            hashedAnswer: string;
            altHashedAnswers?: string[];
        };

        // Hash the user's guess with same normalization
        const hashedGuess = await hashAnswer(guess);

        // Check primary answer first
        let isCorrect = hashedGuess === hashedAnswer;

        // If not, check alternative valid answers (e.g. TON/NOT for anagram puzzles)
        if (!isCorrect && altHashedAnswers.length > 0) {
            isCorrect = altHashedAnswers.includes(hashedGuess);
        }

        return NextResponse.json({ correct: isCorrect });
    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json({ error: 'Failed to validate answer' }, { status: 500 });
    }
}
