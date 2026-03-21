'use client';

import { useState, useCallback, useRef } from 'react';
import MatrixRain from '@/components/MatrixRain';
import HeroSection from '@/components/HeroSection';
import GameArea from '@/components/GameArea';
import SettingsToggle from '@/components/SettingsToggle';
import HowToPlay from '@/components/HowToPlay';
import type { Difficulty } from '@/lib/gameState';
import { useKeybinds, cycleDifficulty } from '@/lib/useKeybinds';
import { playDifficultyChange, playAccessibilityTick } from '@/lib/useSound';

const TRANSITION_MS = 850;

export default function Home() {
    const [difficulty, setDifficulty]       = useState<Difficulty>('normal');
    const [reducedMotion, setReducedMotion] = useState(false);
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    // theme state is consumed by SettingsToggle via onThemeChange callback
    const setTheme = useState<'dark' | 'light'>('dark')[1];

    const [page, setPage]         = useState(0);
    const [gameKey, setGameKey]   = useState(0);
    const [showGame, setShowGame] = useState(false);

    const gameOverAllowedRef = useRef(false);
    const sessionIdRef       = useRef(0);
    const unmountTimerRef    = useRef<ReturnType<typeof setTimeout>>();
    const keyTimerRef        = useRef<ReturnType<typeof setTimeout>>();
    const toggleThemeRef     = useRef<() => void>(() => {});
    const toggleMotionRef    = useRef<() => void>(() => {});
    const lastDiffChangeRef  = useRef(0);

    const matrixSpeed = difficulty === 'easy' ? 0.7 : difficulty === 'hard' ? 1.15 : 0.9;

    const startNewGame = useCallback(() => {
        clearTimeout(unmountTimerRef.current);
        clearTimeout(keyTimerRef.current);
        const next = sessionIdRef.current + 1;
        sessionIdRef.current       = next;
        gameOverAllowedRef.current = true;
        // All three state updates batch in the same React 18 render, so GameArea
        // mounts exactly once with the correct key. No delayed key change means no
        // second loadCipher call and no cipher flash during the slide.
        setGameKey(next);
        setShowGame(true);
        setPage(1);
    }, []);

    const handleGameOver = useCallback((fromSession: number) => {
        if (!gameOverAllowedRef.current) return;
        if (fromSession !== sessionIdRef.current) return;
        gameOverAllowedRef.current = false;
        setPage(2);
    }, []);

    const goToHero = useCallback(() => {
        gameOverAllowedRef.current = false;
        clearTimeout(keyTimerRef.current);
        window.dispatchEvent(new CustomEvent('cypher-game-end'));
        setPage(0);
        clearTimeout(unmountTimerRef.current);
        unmountTimerRef.current = setTimeout(() => setShowGame(false), TRANSITION_MS + 100);
    }, []);

    const handleDifficultyChange = useCallback((d: Difficulty) => {
        const now = Date.now();
        if (now - lastDiffChangeRef.current < 250) return;
        lastDiffChangeRef.current = now;
        playDifficultyChange();
        setDifficulty(d);
    }, []);

    useKeybinds({
        isPlaying: showGame,
        activePage: page,
        showHowToPlay,
        difficulty,
        onBeginDecryption:      startNewGame,
        onCycleDifficultyLeft:  () => handleDifficultyChange(cycleDifficulty(difficulty, 'left')),
        onCycleDifficultyRight: () => handleDifficultyChange(cycleDifficulty(difficulty, 'right')),
        onToggleHowToPlay:      () => setShowHowToPlay(v => !v),
        onToggleTheme:          () => toggleThemeRef.current(),
        onToggleMotion:         () => toggleMotionRef.current(),
        onTryAgain:             startNewGame,
        onChangeDifficulty:     goToHero,
    });

    const openHTP  = useCallback(() => {
        playAccessibilityTick();
        // Blur immediately on open so the button has no focus when it slides back
        // into view on close. It was never unfocused after the mouse click.
        (document.activeElement as HTMLElement)?.blur();
        setShowHowToPlay(true);
    }, []);
    const closeHTP = useCallback(() => { playAccessibilityTick(); setShowHowToPlay(false); }, []);

    return (
        <div style={{ position: 'fixed', inset: 0, clipPath: 'inset(0)' }}>
            <MatrixRain
                speed={matrixSpeed}
                reducedMotion={reducedMotion}
                difficulty={difficulty}
                pageIndex={page}
                transitionMs={TRANSITION_MS}
                htpOpen={showHowToPlay}
            />

            <div
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '200vw',
                    height: '100%',
                    display: 'flex',
                    transform: showHowToPlay ? 'translateX(0)' : 'translateX(-100vw)',
                    transition: reducedMotion ? 'none' : `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                    zIndex: 10,
                }}
            >
                <div style={{ width: '100vw', flexShrink: 0, height: '100%' }}>
                    <HowToPlay isOpen={showHowToPlay} onClose={closeHTP} />
                </div>

                <div style={{ width: '100vw', flexShrink: 0, position: 'relative', height: '100%' }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            transform: `translateY(calc(${-page} * 100vh))`,
                            transition: reducedMotion ? 'none' : `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                        }}
                    >
                        <section style={{
                            height: '100vh',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '0 1.5rem',
                        }}>
                            <div className="w-full flex flex-col items-center">
                                <HeroSection
                                    difficulty={difficulty}
                                    onDifficultyChange={handleDifficultyChange}
                                    onPlayClick={startNewGame}
                                    isPlaying={showGame}
                                />
                            </div>
                        </section>

                        <div style={{ height: '200vh', position: 'relative' }}>
                            {showGame && (
                                <GameArea
                                    key={gameKey}
                                    sessionId={gameKey}
                                    difficulty={difficulty}
                                    onQuit={goToHero}
                                    onGameOver={handleGameOver}
                                    onPlayAgain={startNewGame}
                                    onChangeDifficulty={goToHero}
                                    reducedMotion={reducedMotion}
                                    activePage={page}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="fixed bottom-6 left-6 z-50 glass flex items-center settings-pill"
                style={(showGame || showHowToPlay)
                    ? { transform: 'translateX(calc(-100% - 2rem))', opacity: 0, pointerEvents: 'none' }
                    : undefined}
            >
                <button
                    onClick={openHTP}
                    className="btn-press flex items-center gap-2 group px-3 py-2 rounded-lg
                               focus-visible:outline-none focus-visible:bg-white/[0.08] transition-colors duration-200"
                    aria-label="How to play"
                >
                    <span className="text-sm leading-none text-matrix-200 group-hover:text-white transition-colors duration-200" aria-hidden="true">?</span>
                    <span className="font-mono text-xs text-matrix-200 group-hover:text-white transition-colors duration-200">
                        How to Play
                    </span>
                </button>
            </div>

            <div className={`fixed bottom-6 right-6 z-50 glass flex items-center settings-pill ${!showHowToPlay ? 'hidden-pill' : ''}`}>
                <button
                    onClick={closeHTP}
                    className="btn-press flex items-center gap-2 group px-3 py-2 rounded-lg
                               focus-visible:outline-none focus-visible:bg-white/[0.08] transition-colors duration-200"
                    aria-label="Back to main page"
                >
                    <span className="font-mono text-xs text-matrix-200 group-hover:text-white transition-colors duration-200">Back</span>
                    <span className="text-sm leading-none text-matrix-200 group-hover:text-white transition-colors duration-200" aria-hidden="true">→</span>
                </button>
            </div>

            <SettingsToggle
                onMotionChange={(v) => setReducedMotion(v)}
                onThemeChange={(t) => setTheme(t)}
                isPlaying={showGame || showHowToPlay}
                onThemeToggleRef={toggleThemeRef}
                onMotionToggleRef={toggleMotionRef}
            />
        </div>
    );
}
