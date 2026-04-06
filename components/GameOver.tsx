'use client';

import type { Difficulty } from '@/lib/gameState';
import { formatTime } from '@/lib/gameState';
import { playClick } from '@/lib/useSound';
import { useState, useEffect } from 'react';

interface GameOverModalProps {
    score: number;
    level: number;
    difficulty: Difficulty;
    timeSurvived: number;
    correctAnswer?: string;
    isNewBest?: boolean;
    previousBest?: number | null;
    onPlayAgain: () => void;
    onChangeDifficulty: () => void;
}

export default function GameOver({
    score, level, difficulty, timeSurvived, correctAnswer,
    isNewBest = false, previousBest = null,
    onPlayAgain, onChangeDifficulty,
}: GameOverModalProps) {
    const [isLight, setIsLight] = useState(false);
    useEffect(() => {
        const check = () => setIsLight(document.body.classList.contains('light-mode'));
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    const btnBorder = isLight ? undefined : '1px solid rgba(255,255,255,0.38)';
    const btnShadow = isLight
        ? undefined
        : '0 0 18px rgba(255,255,255,0.07), inset 0 1px 0 var(--glass-highlight)';
    const btnTextShadow = isLight ? 'none' : '0 0 12px rgba(255,255,255,0.15)';
    const cardBorder = isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.09)';

    return (
        <div
            className="w-full flex flex-col items-center max-w-xl mx-auto px-4"
            style={{ gap: 0, animation: 'fadeIn 0.5s ease-out' }}
        >
            {/* Title — tight internal unit */}
            <div
                className="text-center"
                style={{ marginBottom: '1.5rem', animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}
            >
                <h2 className="connection-lost-glow font-display text-4xl md:text-5xl font-bold mb-1">
                    CONNECTION LOST
                </h2>
                <p className="font-mono text-matrix-200 text-sm tracking-widest uppercase">
                    System error detected...
                </p>
            </div>

            {/* Answer reveal — 1rem below title, 0.75rem above stats */}
            {correctAnswer && (
                <div
                    className="glass w-full text-center px-8 py-4"
                    style={{ marginBottom: '0.75rem', animation: 'statFadeIn 0.4s ease-out 0.15s both' }}
                >
                    <p className="text-matrix-300 text-xs uppercase tracking-widest mb-1">The answer was</p>
                    <p className="font-mono text-xl text-white font-semibold tracking-widest">{correctAnswer}</p>
                </div>
            )}

            {/* Stat cards — tight internal gap, they're a grouped unit */}
            <div
                className="grid grid-cols-4 gap-2 w-full"
                style={{ marginBottom: '1.75rem', animation: 'statFadeIn 0.4s ease-out 0.25s both' }}
            >
                <div
                    className="glass flex flex-col items-center justify-center py-5 px-2 text-center"
                    style={{
                        borderRadius: '1.25rem',
                        border: cardBorder,
                        animation: 'statFadeIn 0.4s ease-out 0.25s both',
                    }}
                >
                    <p className="text-matrix-300 text-[11px] uppercase tracking-wider mb-2 leading-none">Score</p>
                    <p className={`font-display font-bold text-2xl leading-none ${isNewBest ? 'new-best-glow' : 'text-white'}`}>
                        {score}
                    </p>
                    {isNewBest ? (
                        <p className="font-mono text-[10px] mt-1.5 text-green-400 leading-none">▲ NEW BEST</p>
                    ) : previousBest !== null ? (
                        <p className="font-mono text-[10px] mt-1.5 leading-none" style={{ color: 'rgba(150,150,150,0.7)' }}>
                            BEST: {previousBest}
                        </p>
                    ) : null}
                </div>

                {[
                    { label: 'Level', value: String(level) },
                    { label: 'Mode', value: difficulty, cap: true },
                    { label: 'Survived', value: formatTime(timeSurvived) },
                ].map((stat, i) => (
                    <div
                        key={stat.label}
                        className="glass flex flex-col items-center justify-center py-5 px-2 text-center"
                        style={{
                            borderRadius: '1.25rem',
                            border: cardBorder,
                            animation: `statFadeIn 0.4s ease-out ${0.32 + i * 0.07}s both`,
                        }}
                    >
                        <p className="text-matrix-300 text-[11px] uppercase tracking-wider mb-2 leading-none">{stat.label}</p>
                        <p className={`font-display font-bold text-white text-2xl leading-none ${stat.cap ? 'capitalize' : ''}`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Buttons */}
            <div
                className="flex gap-3 w-full"
                style={{ animation: 'statFadeIn 0.4s ease-out 0.45s both' }}
            >
                <button
                    onClick={() => { playClick(); onPlayAgain(); }}
                    className="btn-press btn-begin flex-1 py-4 font-display font-semibold text-white text-base tracking-widest relative overflow-hidden group"
                    style={{
                        borderRadius: '1.25rem',
                        background: 'var(--glass-bg)',
                        border: btnBorder,
                        boxShadow: btnShadow,
                        willChange: 'transform',
                        textShadow: btnTextShadow,
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative z-10">TRY AGAIN</span>
                </button>

                <button
                    onClick={() => { playClick(); onChangeDifficulty(); }}
                    className="btn-press btn-begin flex-1 py-4 font-display font-semibold text-white text-base tracking-widest relative overflow-hidden group"
                    style={{
                        borderRadius: '1.25rem',
                        background: 'var(--glass-bg)',
                        border: btnBorder,
                        boxShadow: btnShadow,
                        willChange: 'transform',
                        textShadow: btnTextShadow,
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative z-10">CHANGE DIFFICULTY</span>
                </button>
            </div>
        </div>
    );
}
