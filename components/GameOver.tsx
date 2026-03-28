'use client';

import type { Difficulty } from '@/lib/gameState';
import { formatTime } from '@/lib/gameState';
import { playClick } from '@/lib/useSound';

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
    return (
        <div
            className="w-full flex flex-col items-center gap-6 max-w-xl mx-auto px-4"
            style={{ animation: 'fadeIn 0.5s ease-out' }}
        >
            {/* Title - slow red glow pulse */}
            <div
                className="text-center"
                style={{ animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}
            >
                <h2 className="connection-lost-glow font-display text-4xl md:text-5xl font-bold mb-2">
                    CONNECTION LOST
                </h2>
                <p className="font-mono text-matrix-200 text-sm tracking-widest uppercase">
                    System error detected...
                </p>
            </div>

            {/* Answer reveal */}
            {correctAnswer && (
                <div
                    className="glass w-full text-center px-8 py-4"
                    style={{ animation: 'statFadeIn 0.4s ease-out 0.15s both' }}
                >
                    <p className="text-matrix-300 text-xs uppercase tracking-widest mb-1">The answer was</p>
                    <p className="font-mono text-xl text-white font-semibold tracking-widest">{correctAnswer}</p>
                </div>
            )}

            {/* 4 stat squares — score card has high score sub-label */}
            <div
                className="grid grid-cols-4 gap-3 w-full"
                style={{ animation: 'statFadeIn 0.4s ease-out 0.25s both' }}
            >
                {/* Score card */}
                <div
                    className="glass flex flex-col items-center justify-center py-5 px-2 text-center"
                    style={{
                        borderRadius: '1.25rem',
                        animation: 'statFadeIn 0.4s ease-out 0.25s both',
                    }}
                >
                    <p className="text-matrix-300 text-[11px] uppercase tracking-wider mb-2 leading-none">Score</p>
                    <p className={`font-display font-bold text-2xl leading-none ${isNewBest ? 'new-best-glow' : 'text-white'}`}>
                        {score}
                    </p>
                    {/* high score sub-label */}
                    {isNewBest ? (
                        <p className="font-mono text-[10px] mt-1.5 text-green-400 leading-none">▲ NEW BEST</p>
                    ) : previousBest !== null ? (
                        <p className="font-mono text-[10px] mt-1.5 leading-none" style={{ color: 'rgba(150,150,150,0.7)' }}>
                            BEST: {previousBest}
                        </p>
                    ) : null}
                </div>

                {/* Remaining 3 stats */}
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

            {/* Action buttons — mt-3 adds extra breathing room vs the stat cards above */}
            <div
                className="flex gap-3 w-full mt-3"
                style={{ animation: 'statFadeIn 0.4s ease-out 0.45s both' }}
            >
                {/* Try Again — green accent signals primary action, shimmer on hover */}
                <button
                    onClick={() => { playClick(); onPlayAgain(); }}
                    className="btn-press flex-1 py-4 font-display font-semibold text-white text-base tracking-widest relative overflow-hidden group"
                    style={{
                        borderRadius: '1.25rem',
                        background: 'rgba(74, 222, 128, 0.10)',
                        border: '1px solid rgba(74, 222, 128, 0.42)',
                        backdropFilter: 'blur(20px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                        boxShadow: '0 0 16px rgba(74, 222, 128, 0.08)',
                        textShadow: '0 0 10px rgba(74, 222, 128, 0.22)',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.65)';
                        e.currentTarget.style.boxShadow = '0 0 24px rgba(74, 222, 128, 0.16)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.42)';
                        e.currentTarget.style.boxShadow = '0 0 16px rgba(74, 222, 128, 0.08)';
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent
                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative z-10">TRY AGAIN</span>
                </button>

                {/* Change Difficulty — same weight, neutral white accent, equal sibling not subordinate */}
                <button
                    onClick={() => { playClick(); onChangeDifficulty(); }}
                    className="btn-press flex-1 py-4 font-display font-semibold text-white text-base tracking-widest relative overflow-hidden group"
                    style={{
                        borderRadius: '1.25rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.22)',
                        backdropFilter: 'blur(20px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.40)';
                        e.currentTarget.style.boxShadow = '0 0 16px rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent
                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative z-10">CHANGE DIFFICULTY</span>
                </button>
            </div>
        </div>
    );
}
