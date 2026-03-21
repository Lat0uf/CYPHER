'use client';

import { useEffect, useState, MutableRefObject } from 'react';
import { playAccessibilityTick } from '@/lib/useSound';

interface SettingsToggleProps {
    onMotionChange: (enabled: boolean) => void;
    onThemeChange: (theme: 'dark' | 'light') => void;
    isPlaying?: boolean;
    onThemeToggleRef?: MutableRefObject<() => void>;
    onMotionToggleRef?: MutableRefObject<() => void>;
}

export default function SettingsToggle({
    onMotionChange,
    onThemeChange,
    isPlaying = false,
    onThemeToggleRef,
    onMotionToggleRef,
}: SettingsToggleProps) {
    const [reducedMotion, setReducedMotion] = useState(false);
    const [theme, setTheme]                 = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const mediaQuery     = window.matchMedia('(prefers-reduced-motion: reduce)');
        const storedMotion   = localStorage.getItem('reducedMotion');
        const storedTheme    = localStorage.getItem('theme') as 'dark' | 'light' | null;
        const shouldReduce   = storedMotion ? storedMotion === 'true' : mediaQuery.matches;
        const preferredTheme = storedTheme || 'dark';
        setReducedMotion(shouldReduce);
        setTheme(preferredTheme);
        onMotionChange(shouldReduce);
        onThemeChange(preferredTheme);
        if (shouldReduce)               document.body.classList.add('reduced-motion');
        if (preferredTheme === 'light') document.body.classList.add('light-mode');
    }, [onMotionChange, onThemeChange]);

    const toggleTheme = () => {
        playAccessibilityTick();
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        onThemeChange(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.classList.toggle('light-mode', newTheme === 'light');
    };

    const toggleMotion = () => {
        playAccessibilityTick();
        const newVal = !reducedMotion;
        setReducedMotion(newVal);
        localStorage.setItem('reducedMotion', String(newVal));
        setTimeout(() => {
            onMotionChange(newVal);
            document.body.classList.toggle('reduced-motion', newVal);
        }, 50);
    };

    useEffect(() => { if (onThemeToggleRef)  onThemeToggleRef.current  = toggleTheme;  });
    useEffect(() => { if (onMotionToggleRef) onMotionToggleRef.current = toggleMotion; });

    const btnClass = `btn-press flex items-center gap-2 group px-3 py-2 rounded-lg
        focus-visible:outline-none focus-visible:bg-white/[0.08]
        transition-colors duration-200`.trim();

    return (
        // No outer padding — pill sizing comes entirely from inner button padding.
        <div className={`fixed bottom-6 right-6 z-50 glass flex items-center gap-1 settings-pill ${isPlaying ? 'hidden-pill' : ''}`}>
            <button onClick={toggleTheme} className={btnClass}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                <span className="text-sm leading-none" aria-hidden="true">{theme === 'light' ? '☀' : '☾'}</span>
                <span className="font-mono text-xs text-matrix-200 group-hover:text-white transition-colors duration-200">
                    {theme === 'light' ? 'Light' : 'Dark'}
                </span>
            </button>

            <div className="w-px h-4 bg-matrix-300/40" />

            <button onClick={toggleMotion} className={btnClass}
                aria-label={`Turn motion ${reducedMotion ? 'on' : 'off'}`}>
                {/* SVG icons keep both symbols pixel-identical in size and vertical position.
                    Unicode ▶ and ⏸ have different font metrics across platforms. */}
                <svg aria-hidden="true" width="11" height="11" viewBox="0 0 11 11" fill="currentColor" style={{ display: 'block', flexShrink: 0 }}>
                    {reducedMotion ? (
                        /* Pause: two equal rectangles */
                        <>
                            <rect x="1.5" y="1" width="3" height="9" rx="0.5" />
                            <rect x="6.5" y="1" width="3" height="9" rx="0.5" />
                        </>
                    ) : (
                        /* Play: solid triangle */
                        <polygon points="1.5,0.5 1.5,10.5 10.5,5.5" />
                    )}
                </svg>
                <span className="font-mono text-xs text-matrix-200 group-hover:text-white transition-colors duration-200">
                    {reducedMotion ? 'Motion Off' : 'Motion On'}
                </span>
            </button>
        </div>
    );
}
