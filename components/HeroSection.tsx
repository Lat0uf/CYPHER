'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DifficultySelector from './DifficultySelector';
import type { Difficulty } from '@/lib/gameState';
import { getBest } from '@/lib/useHighScore';
import { playBeginDecryption, playGlitchBurst } from '@/lib/useSound';

interface HeroSectionProps {
    difficulty: Difficulty;
    onDifficultyChange: (difficulty: Difficulty) => void;
    onPlayClick: () => void;
    isPlaying: boolean;
}

interface GlitchLetter {
    char: string;
    isGlitched: boolean;
}

const GLITCH_MAP: Record<string, string[]> = {
    'C': ['¢', 'ℭ', 'ℂ', '𝘊', 'ᑕ'],
    'Y': ['¥', 'Ꭹ', 'Ψ', '𝕐', '𝘠', 'ꌩ'],
    'P': ['Þ', '𝒫', '₱', 'ℙ', 'Ꭾ', '𝘗', 'ꉣ'],
    'H': ['Ħ', 'ℌ', 'ℍ', '𝘏', 'ꃅ'],
    'E': ['€', '𝔈', 'ℰ', '𝔼', '𝘌'],
    'R': ['ℝ', 'ℜ', 'Я', 'ℛ', '𝘙', 'ꋪ'],
};

const GLITCH_TIMING: Record<Difficulty, [number, number]> = {
    easy: [5000, 10000],
    normal: [3000, 6000],
    hard: [1500, 4000],
};

const SUBTITLE = 'The answer is out there...';
const ELLIPSIS_START = SUBTITLE.length - 3;

export default function HeroSection({
    difficulty,
    onDifficultyChange,
    onPlayClick,
    isPlaying,
}: HeroSectionProps) {
    const [letters, setLetters] = useState<GlitchLetter[]>(
        'CYPHER'.split('').map(c => ({ char: c, isGlitched: false }))
    );
    const [isLightMode, setIsLightMode]       = useState(false);
    const [bestScore, setBestScore]           = useState<number | null>(null);
    // displayedScore holds the last known non-null value so the row shows a
    // real number during fade-out instead of blanking to "BEST SCORE: " midway
    const [displayedScore, setDisplayedScore] = useState<number | null>(null);
    const [subtitleDisplay, setSubtitleDisplay] = useState('');
    const [showCursor, setShowCursor]         = useState(true);
    const [showReset, setShowReset]           = useState(false);

    const subtitleTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const clickTimeoutsRef    = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
    const resetHideTimerRef   = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        const score = getBest(difficulty);
        setBestScore(score);
        if (score !== null) setDisplayedScore(score);
        setShowReset(false);
        const onReset = () => setBestScore(null);
        window.addEventListener('cypher-scores-reset', onReset);
        return () => window.removeEventListener('cypher-scores-reset', onReset);
    }, [difficulty]);

    // Re-read after a game ends. setBest runs before this event fires inside GameArea
    useEffect(() => {
        const onGameEnd = () => {
            const score = getBest(difficulty);
            setBestScore(score);
            if (score !== null) setDisplayedScore(score);
        };
        window.addEventListener('cypher-game-end', onGameEnd);
        return () => window.removeEventListener('cypher-game-end', onGameEnd);
    }, [difficulty]);

    useEffect(() => {
        const check = () => setIsLightMode(document.body.classList.contains('light-mode'));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        let charIdx = 0;
        let phase: 'typing' | 'pausing' | 'deleting' | 'waiting' = 'typing';

        const next = () => {
            if (phase === 'typing') {
                charIdx++;
                setSubtitleDisplay(SUBTITLE.slice(0, charIdx));
                if (charIdx < SUBTITLE.length) {
                    const atEllipsis = charIdx >= ELLIPSIS_START;
                    const delay = atEllipsis
                        ? 180 + Math.random() * 120
                        : 68 + Math.random() * 42;
                    subtitleTimerRef.current = setTimeout(next, delay);
                } else {
                    phase = 'pausing';
                    subtitleTimerRef.current = setTimeout(next, 1400 + Math.random() * 600);
                }
            } else if (phase === 'pausing') {
                phase = 'deleting';
                setShowCursor(true);
                next();
            } else if (phase === 'deleting') {
                charIdx--;
                setSubtitleDisplay(SUBTITLE.slice(0, charIdx));
                if (charIdx > 0) {
                    subtitleTimerRef.current = setTimeout(next, 28 + Math.random() * 22);
                } else {
                    phase = 'waiting';
                    setShowCursor(false);
                    subtitleTimerRef.current = setTimeout(next, 800 + Math.random() * 600);
                }
            } else {
                phase = 'typing';
                setShowCursor(true);
                next();
            }
        };

        subtitleTimerRef.current = setTimeout(next, 800);
        return () => { if (subtitleTimerRef.current) clearTimeout(subtitleTimerRef.current); };
    }, []);

    useEffect(() => {
        const originalChars = 'CYPHER'.split('');
        const timers: ReturnType<typeof setTimeout>[] = [];
        const [minDelay, maxDelay] = GLITCH_TIMING[difficulty];

        originalChars.forEach((original, idx) => {
            const scheduleGlitch = () => {
                const delay = minDelay + Math.random() * (maxDelay - minDelay);
                const timer = setTimeout(() => {
                    const alts = GLITCH_MAP[original];
                    if (!alts) return scheduleGlitch();
                    const glitchedChar = alts[Math.floor(Math.random() * alts.length)];
                    setLetters(prev => {
                        const copy = [...prev];
                        copy[idx] = { char: glitchedChar, isGlitched: true };
                        return copy;
                    });
                    setTimeout(() => {
                        setLetters(prev => {
                            const copy = [...prev];
                            copy[idx] = { char: original, isGlitched: false };
                            return copy;
                        });
                    }, 60 + Math.random() * 90);
                    scheduleGlitch();
                }, delay);
                timers.push(timer);
            };
            scheduleGlitch();
        });

        return () => timers.forEach(t => clearTimeout(t));
    }, [difficulty]);

    const handleLetterClick = useCallback((idx: number) => {
        playGlitchBurst();
        const originalChars = 'CYPHER'.split('');
        const original = originalChars[idx];
        const alts = GLITCH_MAP[original];
        if (!alts) return;
        const existing = clickTimeoutsRef.current.get(idx);
        if (existing) clearTimeout(existing);
        const flash = (step: number) => {
            if (step >= 3) {
                setLetters(prev => {
                    const copy = [...prev];
                    copy[idx] = { char: original, isGlitched: false };
                    return copy;
                });
                return;
            }
            const glitchedChar = alts[Math.floor(Math.random() * alts.length)];
            setLetters(prev => {
                const copy = [...prev];
                copy[idx] = { char: glitchedChar, isGlitched: true };
                return copy;
            });
            const t = setTimeout(() => flash(step + 1), 60);
            clickTimeoutsRef.current.set(idx, t);
        };
        flash(0);
    }, []);

    const handleReset = useCallback(() => {
        localStorage.removeItem(`cypher-best-${difficulty}`);
        setBestScore(null);
        setShowReset(false);
    }, [difficulty]);

    const getGlitchStyle = (isGlitched: boolean): React.CSSProperties => {
        if (!isGlitched) return { textShadow: '0 0 30px rgba(255,255,255,0.08)' };
        if (isLightMode) {
            return {
                WebkitTextFillColor: 'rgba(20, 20, 30, 0.95)',
                textShadow: '0 0 15px rgba(0,0,0,0.3), -2px 0 rgba(100,40,40,0.4), 2px 0 rgba(40,40,100,0.4)',
            };
        }
        return {
            WebkitTextFillColor: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 0 20px rgba(255,255,255,0.6), -2px 0 rgba(255,100,100,0.3), 2px 0 rgba(100,100,255,0.3)',
        };
    };

    const scoreVisible = !isPlaying && bestScore !== null;

    return (
        <>
            <div className="text-center mb-14">
                <h1
                    className="font-display text-8xl md:text-9xl font-bold mb-4 flex justify-center title-gradient"
                    style={{ letterSpacing: '-0.02em' }}
                >
                    {letters.map((letter, i) => (
                        <span
                            key={i}
                            onClick={() => handleLetterClick(i)}
                            className={`inline-block cursor-pointer select-none transition-transform duration-[60ms] text-center ${letter.isGlitched ? 'scale-[1.03]' : ''}`}
                            style={{ width: '0.62em', lineHeight: 0.95, ...getGlitchStyle(letter.isGlitched) }}
                        >
                            {letter.char}
                        </span>
                    ))}
                </h1>

                <p
                    className="font-mono text-matrix-100 text-lg tracking-wide"
                    style={{ minHeight: '1.75rem', color: isLightMode ? 'rgba(60,60,60,0.8)' : undefined }}
                >
                    {subtitleDisplay}
                    {showCursor && subtitleDisplay.length > 0 && (
                        <span
                            aria-hidden="true"
                            style={{ opacity: 0.5, animation: 'timerBlink 0.85s ease-in-out infinite', marginLeft: '1px' }}
                        >
                            _
                        </span>
                    )}
                </p>
            </div>

            <div className="mb-14">
                <DifficultySelector
                    value={difficulty}
                    onChange={onDifficultyChange}
                    disabled={isPlaying}
                />
            </div>

            <button
                onClick={() => { playBeginDecryption(); onPlayClick(); }}
                disabled={isPlaying}
                className="btn-press glass px-16 py-6 text-2xl font-display font-semibold
                    text-white hover:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed
                    relative overflow-hidden group btn-begin"
                style={isLightMode ? {
                    willChange: 'transform',
                } : {
                    border: '1px solid rgba(255,255,255,0.38)',
                    boxShadow: '0 8px 32px var(--glass-shadow), 0 0 18px rgba(255,255,255,0.07), inset 0 1px 0 var(--glass-highlight)',
                    textShadow: '0 0 12px rgba(255,255,255,0.2)',
                    willChange: 'transform',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative z-10">
                    {isPlaying ? 'GAME IN PROGRESS' : 'BEGIN DECRYPTION'}
                </span>
            </button>

            {/*
              Height always reserved so the button above never shifts
              Grace-period timer pattern: mouseLeave on the score text starts a
              150ms countdown to hide Reset?. mouseEnter on Reset? cancels it before
              it fires. This gives the cursor time to travel between two elements
              that are not in the same layout box without the button vanishing
              Reset? is absolutely positioned so it never affects the score centering
            */}
            <div style={{ height: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.75rem' }}>
                <div
                    style={{
                        opacity: scoreVisible ? 1 : 0,
                        transition: 'opacity 0.5s ease',
                        pointerEvents: scoreVisible ? 'auto' : 'none',
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                    }}
                >
                    <p
                        className="font-mono text-xs transition-colors duration-200"
                        style={{
                            color: showReset
                                ? (isLightMode ? 'rgba(50,50,50,0.85)' : 'rgba(200,200,200,0.85)')
                                : (isLightMode ? 'rgba(100,100,100,0.6)' : 'rgba(140,140,140,0.6)'),
                            letterSpacing: '0.08em',
                            whiteSpace: 'nowrap',
                            cursor: 'default',
                        }}
                        onMouseEnter={() => {
                            clearTimeout(resetHideTimerRef.current);
                            setShowReset(true);
                        }}
                        onMouseLeave={() => {
                            resetHideTimerRef.current = setTimeout(() => setShowReset(false), 150);
                        }}
                    >
                        BEST SCORE: {displayedScore}
                    </p>

                    {/* Absolutely positioned (no layout impact on score centering) */}
                    <button
                        onClick={handleReset}
                        className="font-mono text-xs"
                        style={{
                            position: 'absolute',
                            left: 'calc(100% + 0.6rem)',
                            color: 'rgba(239,68,68,0.65)',
                            opacity: showReset ? 1 : 0,
                            pointerEvents: showReset ? 'auto' : 'none',
                            letterSpacing: '0.08em',
                            transition: 'opacity 0.18s ease, color 0.18s ease',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                            clearTimeout(resetHideTimerRef.current);
                            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.9)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.65)';
                            resetHideTimerRef.current = setTimeout(() => setShowReset(false), 150);
                        }}
                    >
                        RESET?
                    </button>
                </div>
            </div>
        </>
    );
}
