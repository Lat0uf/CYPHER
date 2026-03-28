'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import CipherDisplay from './CipherDisplay';
import InputField from './InputField';
import Timer from './Timer';
import GameOver from './GameOver';
import type { Difficulty, GameState } from '@/lib/gameState';
import { TIMER_DURATIONS } from '@/lib/gameState';
import { playCorrect, playWrong, playGameOver, playClick, startTimerTick, stopTimerTick } from '@/lib/useSound';
import { getBest, setBest, isNewBest as checkIsNewBest } from '@/lib/useHighScore';

import type { PrefetchedCipher } from '@/app/page';

interface GameAreaProps {
    sessionId: number;
    difficulty: Difficulty;
    onQuit: () => void;
    onGameOver: (sessionId: number) => void;
    onPlayAgain: () => void;
    onChangeDifficulty: () => void;
    reducedMotion?: boolean;
    activePage?: number;
    obscureCipher?: boolean;
    prefetchedCipherRef?: React.MutableRefObject<Promise<PrefetchedCipher | null>>;
    pendingCipher?: PrefetchedCipher | null;
}

export default function GameArea({
    sessionId,
    difficulty,
    onQuit,
    onGameOver,
    onPlayAgain,
    onChangeDifficulty,
    reducedMotion = false,
    activePage = 1,
    obscureCipher = false,
    prefetchedCipherRef,
    pendingCipher = null,
}: GameAreaProps) {
    const [gameState, setGameState] = useState<GameState>({
        difficulty,
        level: 1,
        score: 0,
        isPlaying: true,
        timeRemaining: TIMER_DURATIONS[difficulty],
        currentCipher:    pendingCipher?.cipherText    ?? null,
        cipherType:       pendingCipher?.cipherType    ?? null,
        hashedAnswer:     pendingCipher?.hashedAnswer  ?? null,
        altHashedAnswers: pendingCipher?.altHashedAnswers ?? [],
        gameOver: false,
    });

    const [cipherColor, setCipherColor]       = useState<string | undefined>(pendingCipher?.color);
    const [feedback, setFeedback]             = useState<'correct' | 'wrong' | null>(null);
    const [startTime]                         = useState(Date.now());
    const [isLoading, setIsLoading]           = useState(false);
    const [correctAnswer, setCorrectAnswer]   = useState(pendingCipher?.correctAnswer ?? '');
    const [showScorePopup, setShowScorePopup] = useState(false);
    const [isNewBest, setIsNewBest]           = useState(false);
    const [previousBest, setPreviousBest]     = useState<number | null>(null);
    const [lastPoints, setLastPoints]         = useState(0);

    const lastTickRef         = useRef(Date.now());
    const gameOverFiredRef    = useRef(false);
    const onGameOverRef       = useRef(onGameOver);
    const wrongAnswerTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const feedbackTimerRef    = useRef<ReturnType<typeof setTimeout>>();
    const popupTimerRef       = useRef<ReturnType<typeof setTimeout>>();
    const cipherTimerRef      = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => { onGameOverRef.current = onGameOver; });

    useEffect(() => {
        return () => {
            clearTimeout(wrongAnswerTimerRef.current);
            clearTimeout(feedbackTimerRef.current);
            clearTimeout(popupTimerRef.current);
            clearTimeout(cipherTimerRef.current);
            stopTimerTick();
        };
    }, []);

    useEffect(() => {
        if (gameState.isPlaying && !gameState.gameOver) {
            window.dispatchEvent(new CustomEvent('cypher-level-change', {
                detail: { level: gameState.level },
            }));
        }
    }, [gameState.level, gameState.isPlaying, gameState.gameOver]);

    useEffect(() => {
        if (!gameState.gameOver) return;
        if (gameOverFiredRef.current) return;
        gameOverFiredRef.current = true;

        stopTimerTick();

        const score   = gameState.score;
        const prev    = getBest(difficulty);
        const newBest = checkIsNewBest(difficulty, score);
        setPreviousBest(prev);
        setIsNewBest(newBest);
        if (newBest) setBest(difficulty, score);

        window.dispatchEvent(new CustomEvent('cypher-game-end'));
        onGameOverRef.current(sessionId);
        playGameOver();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState.gameOver]);

    const applyCipherData = useCallback((data: PrefetchedCipher) => {
        setGameState(prev => ({
            ...prev,
            currentCipher:    data.cipherText,
            cipherType:       data.cipherType,
            hashedAnswer:     data.hashedAnswer,
            altHashedAnswers: data.altHashedAnswers || [],
        }));
        setCorrectAnswer(data.correctAnswer || '');
        setCipherColor(data.color || undefined);
    }, []);

    const loadCipher = useCallback(async () => {
        try {
            setIsLoading(true);
            const resp = await fetch('/api/generate-cipher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty, level: gameState.level }),
            });
            if (!resp.ok) throw new Error('Failed to generate cipher');
            const data = await resp.json();
            applyCipherData(data);
        } catch (err) {
            console.error('Cipher load failed:', err);
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficulty, gameState.level, applyCipherData]);

    useEffect(() => {
        // pendingCipher already seeded state as a React prop — nothing to fetch
        if (pendingCipher) return;
        // Use the prefetched cipher promise if available, fall back to a fresh fetch
        const prefetchProm = prefetchedCipherRef?.current ?? Promise.resolve(null);
        setIsLoading(true);
        prefetchProm.then(data => {
            if (data) {
                applyCipherData(data);
                setIsLoading(false);
            } else {
                loadCipher();
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (gameState.gameOver || !gameState.isPlaying) return;
        const id = setInterval(() => {
            const now     = Date.now();
            const elapsed = now - lastTickRef.current;
            lastTickRef.current = now;
            setGameState(prev => {
                if (prev.gameOver) return prev;
                const newTime = Math.max(0, prev.timeRemaining - elapsed);
                if (newTime <= 10000 && newTime > 0) startTimerTick();
                else if (newTime > 10000)            stopTimerTick();
                if (newTime === 0) {
                    stopTimerTick();
                    return { ...prev, timeRemaining: 0, gameOver: true };
                }
                return { ...prev, timeRemaining: newTime };
            });
        }, 100);
        return () => clearInterval(id);
    }, [gameState.gameOver, gameState.isPlaying]);

    const handleSubmit = async (answer: string) => {
        if (!gameState.hashedAnswer || isLoading) return;
        try {
            setIsLoading(true);
            const resp = await fetch('/api/validate-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guess: answer,
                    hashedAnswer: gameState.hashedAnswer,
                    altHashedAnswers: gameState.altHashedAnswers,
                }),
            });
            const data = await resp.json();
            if (data.correct) {
                stopTimerTick();
                playCorrect();
                setFeedback('correct');
                const timeUsedSec = (TIMER_DURATIONS[difficulty] - gameState.timeRemaining) / 1000;
                const base        = difficulty === 'easy' ? 10 : difficulty === 'normal' ? 25 : 50;
                const multiplier  = timeUsedSec <= 20 ? 2 : timeUsedSec <= 40 ? 1.5 : 1;
                const points      = Math.round(base * multiplier);
                setLastPoints(points);
                setShowScorePopup(true);
                popupTimerRef.current    = setTimeout(() => setShowScorePopup(false), 800);
                feedbackTimerRef.current = setTimeout(() => setFeedback(null), 600);
                setGameState(prev => ({
                    ...prev,
                    level: prev.level + 1,
                    score: prev.score + points,
                    timeRemaining: TIMER_DURATIONS[difficulty],
                }));
                lastTickRef.current    = Date.now();
                cipherTimerRef.current = setTimeout(() => loadCipher(), 50);
            } else {
                stopTimerTick();
                playWrong();
                setFeedback('wrong');
                // Stop the timer interval immediately — no need to keep ticking through the vignette window
                setGameState(prev => ({ ...prev, isPlaying: false }));
                // Clear feedback at the same time as game over fires so border fades out cleanly
                feedbackTimerRef.current    = setTimeout(() => setFeedback(null), 1200);
                wrongAnswerTimerRef.current = setTimeout(() => {
                    setGameState(prev => ({ ...prev, gameOver: true }));
                }, 1200);
            }
        } catch (err) {
            console.error('Validation error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const feedbackClass = (() => {
        if (!feedback) return '';
        if (reducedMotion) return feedback === 'correct' ? 'input-feedback-correct' : 'input-feedback-wrong';
        return feedback === 'correct' ? 'flash-correct' : 'flash-wrong';
    })();

    const gamePageHidden = activePage !== 1;
    const lostPageHidden = activePage !== 2;

    const sectionClip = { clipPath: 'inset(0)' } as const;

    return (
        <div style={{ position: 'absolute', inset: 0 }}>

            {/* Fixed so the radial gradient centers on the actual viewport, not the 200vh container */}
            {feedback && !reducedMotion && (
                <div className={`fixed inset-0 pointer-events-none z-40 ${feedbackClass}`} />
            )}

            {/* Page 1: game */}
            <section
                style={{
                    height: '100vh',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '0 1.5rem', position: 'relative',
                    ...sectionClip,
                }}
                aria-hidden={gamePageHidden}
            >
                <div
                    className={`relative z-10 w-full max-w-4xl flex flex-col items-center ${feedback === 'wrong' && !reducedMotion ? 'wrong-shake' : ''}`}
                    style={{ pointerEvents: gamePageHidden ? 'none' : 'auto' }}
                >

                    <div className="w-full flex justify-between items-center mb-6">
                        <p className="font-mono text-sm text-matrix-200 uppercase tracking-widest">
                            Level {gameState.level} &bull; Score: {gameState.score}
                        </p>
                        <button
                            onClick={() => { const s = gameState.score; if (s > 0 && checkIsNewBest(difficulty, s)) setBest(difficulty, s); stopTimerTick(); playClick(); onQuit(); }}
                            tabIndex={gamePageHidden ? -1 : 0}
                            className="btn-press glass px-5 py-2 font-display text-sm font-semibold text-matrix-200 hover:text-white transition-colors duration-200"
                        >
                            QUIT
                        </button>
                    </div>

                    {/* Score popup lives here, anchored above the timer bar rather than
                        fixed to the viewport top-third which placed it too high. */}
                    <div className="mb-6 w-full flex justify-center" style={{ position: 'relative' }}>
                        {showScorePopup && !reducedMotion && (
                            <div
                                className="absolute z-50"
                                style={{
                                    bottom: 'calc(100% + 0.25rem)',
                                    left: 0, right: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    pointerEvents: 'none',
                                }}
                            >
                                <div className="score-popup">
                                    <span
                                        className="text-3xl font-display font-bold text-green-400"
                                        style={{ textShadow: '0 0 12px rgba(74,222,128,0.4)' }}
                                    >
                                        +{lastPoints}
                                    </span>
                                </div>
                            </div>
                        )}
                        <Timer
                            timeRemaining={gameState.timeRemaining}
                            difficulty={difficulty}
                            isActive={gameState.isPlaying && !gameState.gameOver}
                        />
                    </div>

                    <div className="mb-6 w-full">
                        {gameState.currentCipher && !obscureCipher ? (
                            <CipherDisplay
                                cipherText={gameState.currentCipher}
                                cipherType={gameState.cipherType || undefined}
                                color={cipherColor}
                            />
                        ) : (
                            <div className="glass p-10 min-h-[160px] flex items-center justify-center">
                                <p className="font-mono text-matrix-200 animate-pulse">LOADING CIPHER...</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full flex justify-center">
                        <InputField
                            onSubmit={handleSubmit}
                            disabled={isLoading || gameState.gameOver}
                            feedbackState={feedback}
                            reducedMotion={reducedMotion}
                        />
                    </div>
                </div>
            </section>

            {/* Page 2: connection lost */}
            <section
                style={{
                    height: '100vh',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '0 1.5rem',
                    pointerEvents: lostPageHidden ? 'none' : 'auto',
                    ...sectionClip,
                }}
                aria-hidden={lostPageHidden}
            >
                <GameOver
                    score={gameState.score}
                    level={gameState.level}
                    difficulty={difficulty}
                    timeSurvived={Date.now() - startTime}
                    correctAnswer={correctAnswer}
                    isNewBest={isNewBest}
                    previousBest={previousBest}
                    onPlayAgain={onPlayAgain}
                    onChangeDifficulty={onChangeDifficulty}
                />
            </section>
        </div>
    );
}
