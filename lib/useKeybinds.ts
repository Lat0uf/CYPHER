// Global keyboard shortcut manager.
// Keybinds are suppressed when any input/textarea is focused.

import { useEffect } from 'react';
import type { Difficulty } from './gameState';

interface KeybindConfig {
    isPlaying: boolean;
    activePage: number;         // 0=main, 1=game, 2=connection lost
    showHowToPlay: boolean;
    difficulty: Difficulty;
    onBeginDecryption: () => void;
    onCycleDifficultyLeft: () => void;
    onCycleDifficultyRight: () => void;
    onToggleHowToPlay: () => void;
    onToggleTheme: () => void;
    onToggleMotion: () => void;
    onTryAgain: () => void;
    onChangeDifficulty: () => void;
}

export function useKeybinds(config: KeybindConfig) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (document.activeElement as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            const key = e.key;
            const {
                isPlaying, activePage, showHowToPlay,
                onBeginDecryption, onCycleDifficultyLeft, onCycleDifficultyRight,
                onToggleHowToPlay, onToggleTheme, onToggleMotion,
                onTryAgain, onChangeDifficulty,
            } = config;

            // Global
            if (key === 't' || key === 'T') { e.preventDefault(); onToggleTheme(); return; }
            if (key === 'm' || key === 'M') { e.preventDefault(); onToggleMotion(); return; }

            // ESC closes HTP if open, or exits connection lost — mutually exclusive states.
            if (key === 'Escape') {
                if (showHowToPlay)    { onToggleHowToPlay(); return; }
                if (activePage === 2) { e.preventDefault(); onChangeDifficulty(); return; }
                return;
            }

            // Main page (page 0, not playing). SPACE/arrows suppressed while HTP is open.
            if (!isPlaying && activePage === 0) {
                if (key === '/') { e.preventDefault(); onToggleHowToPlay(); return; }
                if (!showHowToPlay) {
                    if (key === ' ')                                         { e.preventDefault(); onBeginDecryption(); return; }
                    if (key === 'ArrowLeft'  || key === 'a' || key === 'A') { e.preventDefault(); onCycleDifficultyLeft(); return; }
                    if (key === 'ArrowRight' || key === 'd' || key === 'D') { e.preventDefault(); onCycleDifficultyRight(); return; }
                }
            }

            // Connection Lost (page 2), ESC handled above
            if (activePage === 2) {
                if (key === 'r' || key === 'R') { e.preventDefault(); onTryAgain(); return; }
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [config]);
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard'];

export function cycleDifficulty(current: Difficulty, dir: 'left' | 'right'): Difficulty {
    const idx = DIFFICULTY_ORDER.indexOf(current);
    const len = DIFFICULTY_ORDER.length;
    if (dir === 'left')  return DIFFICULTY_ORDER[(idx - 1 + len) % len];
    return DIFFICULTY_ORDER[(idx + 1) % len];
}
