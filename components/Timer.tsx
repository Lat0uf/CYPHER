'use client';

import { formatTime, getTimerPercentage, type Difficulty } from '@/lib/gameState';
import { useState, useEffect } from 'react';

interface TimerProps {
    timeRemaining: number;
    difficulty: Difficulty;
    isActive: boolean;
}

const COLOR_STOPS: [number, [number, number, number]][] = [
    [100, [210, 210, 215]],
    [70,  [240, 200, 140]],
    [50,  [245, 160,  60]],
    [25,  [235,  70,  35]],
    [10,  [220,  30,  30]],
    [0,   [200,  20,  20]],
];

// Darker stops so the countdown reads clearly on a light bg
const LIGHT_COLOR_STOPS: [number, [number, number, number]][] = [
    [100, [100, 100, 110]],
    [70,  [180, 140,  40]],
    [50,  [200, 120,  20]],
    [25,  [200,  50,  20]],
    [10,  [190,  20,  20]],
    [0,   [170,  10,  10]],
];

function getTimerColor(pct: number, stops: typeof COLOR_STOPS): string {
    for (let i = 0; i < stops.length - 1; i++) {
        const [hiPct, hiRGB] = stops[i];
        const [loPct, loRGB] = stops[i + 1];
        if (pct >= loPct && pct <= hiPct) {
            const t = (pct - loPct) / (hiPct - loPct);
            const r = Math.round(loRGB[0] + t * (hiRGB[0] - loRGB[0]));
            const g = Math.round(loRGB[1] + t * (hiRGB[1] - loRGB[1]));
            const b = Math.round(loRGB[2] + t * (hiRGB[2] - loRGB[2]));
            return `rgb(${r}, ${g}, ${b})`;
        }
    }
    return 'rgb(200, 20, 20)';
}

// isActive kept in props for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Timer({ timeRemaining, difficulty, isActive }: TimerProps) {
    const percentage = getTimerPercentage(timeRemaining, difficulty);
    const isCritical = timeRemaining <= 10000 && timeRemaining > 0;

    const [isLight, setIsLight] = useState(false);
    useEffect(() => {
        const check = () => setIsLight(document.body.classList.contains('light-mode'));
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    const color = getTimerColor(percentage, isLight ? LIGHT_COLOR_STOPS : COLOR_STOPS);

    return (
        <div className="w-full max-w-2xl">
            <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-sm text-matrix-200 uppercase tracking-wider">
                    Time Remaining
                </span>
                <span
                    className="font-mono text-2xl font-bold"
                    style={{
                        color,
                        textShadow: isCritical
                            ? `0 0 8px ${color.replace('rgb', 'rgba').replace(')', ', 0.5)')}`
                            : 'none',
                        transition: 'color 0.3s ease',
                    }}
                >
                    {formatTime(timeRemaining)}
                </span>
            </div>

            {/* Track: rounded-full clips the bar's left end cleanly
                The bar has its own rounded right end via border-radius
                With the width approach (not scaleX), border-radius renders correctly
                at all fill levels and never conflicts with the width transition */}
            <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: color,
                        borderRadius: '0 999px 999px 0',
                        boxShadow: `0 0 10px ${color.replace('rgb', 'rgba').replace(')', ', 0.45)')}`,
                        transition: 'width 0.12s linear, background-color 0.3s ease, box-shadow 0.3s ease',
                        animation: isCritical ? 'timerBlink 1s ease-in-out -0.5s infinite' : 'none',
                    }}
                />
            </div>
        </div>
    );
}
