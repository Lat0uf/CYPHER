'use client';

import { formatTime, getTimerPercentage, type Difficulty } from '@/lib/gameState';

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

function getTimerColor(pct: number): string {
    for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
        const [hiPct, hiRGB] = COLOR_STOPS[i];
        const [loPct, loRGB] = COLOR_STOPS[i + 1];
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

// isActive kept in props for future use.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Timer({ timeRemaining, difficulty, isActive }: TimerProps) {
    const percentage = getTimerPercentage(timeRemaining, difficulty);
    const isCritical = percentage < 16;
    const color      = getTimerColor(percentage);

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

            {/* Track: rounded-full clips the bar's left end cleanly.
                The bar has its own rounded right end via border-radius.
                With the width approach (not scaleX), border-radius renders correctly
                at all fill levels and never conflicts with the width transition. */}
            <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.08)' }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${percentage}%`,
                        minWidth: percentage > 0 ? '0.75rem' : 0, // keep pill shape at very low %
                        backgroundColor: color,
                        borderRadius: '0 999px 999px 0',
                        boxShadow: `0 0 10px ${color.replace('rgb', 'rgba').replace(')', ', 0.45)')}`,
                        transition: 'width 0.12s linear, background-color 0.3s ease, box-shadow 0.3s ease',
                        animation: isCritical ? 'timerBlink 1s ease-in-out infinite' : 'none',
                    }}
                />
            </div>
        </div>
    );
}
