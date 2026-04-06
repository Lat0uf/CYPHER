'use client';

import { useState, useRef, useEffect } from 'react';
import type { Difficulty } from '@/lib/gameState';

interface Option {
    value: Difficulty;
    label: string;
    description: string;
    pills: string[];
    accent: string;
    labelColor: string;
    pillBorder: string;
    pillColor: string;
    cardShadow: string;
    lightAccent: string;
    lightLabelColor: string;
    lightPillBorder: string;
    lightPillColor: string;
    lightCardShadow: string;
}

const OPTIONS: Option[] = [
    {
        value: 'easy',
        label: 'Easy',
        description: 'Everything here can be cracked by looking at it long enough. No tools needed.',
        pills: ['JUMBLE', 'REVERSE', 'LEET', 'FLIP'],
        accent: 'rgba(59, 130, 246, 0.22)',
        labelColor: 'rgba(147, 197, 253, 0.95)',
        pillBorder: 'rgba(96, 165, 250, 0.28)',
        pillColor: 'rgba(147, 197, 253, 0.65)',
        cardShadow: '0 4px 14px rgba(0,0,0,0.50), 0 0 0 1px rgba(96,165,250,0.15)',
        // Light mode variants
        lightAccent: 'rgba(59, 130, 246, 0.10)',
        lightLabelColor: 'rgba(30, 80, 180, 0.95)',
        lightPillBorder: 'rgba(59, 130, 246, 0.25)',
        lightPillColor: 'rgba(30, 80, 180, 0.65)',
        lightCardShadow: '0 3px 12px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.05)',
    },
    {
        value: 'normal',
        label: 'Normal',
        description: 'One tool per puzzle. Fast fingers and a good decoder site will carry you.',
        pills: ['BINARY', 'MORSE', 'CAESAR', 'BASE64', 'ROT13', 'ATBASH'],
        accent: 'rgba(180, 200, 230, 0.14)',
        labelColor: 'rgba(195, 215, 240, 0.90)',
        pillBorder: 'rgba(180, 200, 230, 0.22)',
        pillColor: 'rgba(195, 215, 240, 0.60)',
        cardShadow: '0 4px 14px rgba(0,0,0,0.50), 0 0 0 1px rgba(180,200,230,0.12)',
        lightAccent: 'rgba(100, 120, 160, 0.08)',
        lightLabelColor: 'rgba(50, 60, 90, 0.90)',
        lightPillBorder: 'rgba(80, 100, 140, 0.22)',
        lightPillColor: 'rgba(50, 60, 90, 0.55)',
        lightCardShadow: '0 3px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
    },
    {
        value: 'hard',
        label: 'Hard',
        description: 'One tool will not be enough. Expect to decode twice per puzzle.',
        pills: ['HEX ASCII', 'BASE32', 'RAIL FENCE', 'BINARY + CAESAR', 'MORSE + REVERSE'],
        accent: 'rgba(239, 68, 68, 0.20)',
        labelColor: 'rgba(252, 165, 165, 0.95)',
        pillBorder: 'rgba(248, 113, 113, 0.28)',
        pillColor: 'rgba(252, 165, 165, 0.65)',
        cardShadow: '0 4px 14px rgba(0,0,0,0.50), 0 0 0 1px rgba(248,113,113,0.15)',
        lightAccent: 'rgba(220, 50, 50, 0.08)',
        lightLabelColor: 'rgba(180, 30, 30, 0.95)',
        lightPillBorder: 'rgba(220, 50, 50, 0.25)',
        lightPillColor: 'rgba(180, 30, 30, 0.60)',
        lightCardShadow: '0 3px 12px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.05)',
    },
];

// All measurements in px so the absolute card can calculate left/right exactly
const STUB_W      = 78;
const OUTER_R     = '1.2rem';
const BORDER      = '1px solid var(--glass-border)';
const SLIDE_MS    = 420;
const EASING      = 'cubic-bezier(0.16, 1, 0.3, 1)';
const THROTTLE_MS = 250;

interface Props {
    value: Difficulty;
    onChange: (d: Difficulty) => void;
    disabled?: boolean;
}

export default function DifficultySelector({ value, onChange, disabled = false }: Props) {
    const [hovered,  setHovered]  = useState<Difficulty | null>(null);
    const [isLight,  setIsLight]  = useState(false);

    useEffect(() => {
        const check = () => setIsLight(document.body.classList.contains('light-mode'));
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    const lastChangeRef = useRef(0);
    const prevIdxRef    = useRef(OPTIONS.findIndex(o => o.value === value));
    const selIdx        = OPTIONS.findIndex(o => o.value === value);
    const selOpt        = OPTIONS[selIdx];

    const handleChange = (d: Difficulty) => {
        if (disabled || d === value) return;
        const now = Date.now();
        if (now - lastChangeRef.current < THROTTLE_MS) return;
        lastChangeRef.current = now;
        const newIdx = OPTIONS.findIndex(o => o.value === d);
        prevIdxRef.current = newIdx;
        onChange(d);
    };

    useEffect(() => { prevIdxRef.current = selIdx; }, [selIdx]);

    const pillStyle = (opt: Option): React.CSSProperties => ({
        fontFamily:    "'JetBrains Mono', monospace",
        fontSize:      '9.5px',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        padding:       '2px 8px',
        borderRadius:  '999px',
        border:        `1px solid ${isLight ? opt.lightPillBorder : opt.pillBorder}`,
        color:         isLight ? opt.lightPillColor : opt.pillColor,
        background:    isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
        whiteSpace:    'nowrap' as const,
    });

    return (
        <div style={{ width: '100%', maxWidth: '440px' }}>
            <style>{`
                @keyframes dsSlideFromRight {
                    from { opacity: 0; transform: translateX(12px); }
                    to   { opacity: 1; transform: translateX(0);    }
                }
                @keyframes dsSlideFromLeft {
                    from { opacity: 0; transform: translateX(-12px); }
                    to   { opacity: 1; transform: translateX(0);     }
                }
            `}</style>

            <p
                className="font-mono text-xs uppercase text-center mb-3"
                style={{ color: isLight ? 'rgba(80,80,80,0.65)' : 'rgba(150,150,150,0.65)', letterSpacing: '0.25em' }}
            >
                Select Difficulty
            </p>

            {/*
              position:relative is the positioning context for the sliding card.
              The flex items below are either stubs (clickable, visible) or a ghost
              (invisible, pointer-events:none) for the selected slot. The ghost has
              the exact same padding and content as the card so it naturally gives
              the container the right height. The actual card lives outside the flex
              flow as an absolutely-positioned element, this is what slides without
              touching any other DOM element
            */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>

                {/* Flex items: stubs + one ghost spacer for the selected slot */}
                {OPTIONS.map((opt, idx) => {
                    const sel     = opt.value === value;
                    const isFirst = idx === 0;
                    const isLast  = idx === OPTIONS.length - 1;
                    const isHov   = hovered === opt.value && !sel && !disabled;

                    if (sel) {
                        // Ghost div holds layout space while the selected card slides above it
                        return (
                            <div
                                key={opt.value}
                                aria-hidden="true"
                                style={{
                                    flex:          '1 1 0',
                                    minWidth:      0,
                                    pointerEvents: 'none',
                                    background:    'var(--glass-bg)',
                                    borderRadius:  OUTER_R,
                                    boxShadow:     'inset 0 1px 0 var(--glass-highlight)',
                                    padding:       '0.82rem 1.1rem 1rem',
                                }}
                            >
                                <div style={{ visibility: 'hidden' }}>
                                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.2rem', display: 'block', marginBottom: '0.4rem', lineHeight: 1.15 }}>
                                        Hard
                                    </span>
                                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10.5px', lineHeight: 1.72, marginBottom: '0.6rem' }}>
                                        One tool will not be enough. Expect to decode twice per puzzle.
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {['HEX ASCII', 'BASE32', 'RAIL FENCE', 'BINARY + CAESAR', 'MORSE + REVERSE'].map(p => <span key={p} style={{ fontSize: '9.5px', padding: '2px 8px', whiteSpace: 'nowrap' }}>{p}</span>)}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    const tl = isFirst ? OUTER_R : '0';
                    const tr = isLast  ? OUTER_R : '0';
                    const br = isLast  ? OUTER_R : '0';
                    const bl = isFirst ? OUTER_R : '0';

                    return (
                        <div
                            key={opt.value}
                            role="button"
                            aria-label={`${opt.label} difficulty`}
                            onClick={() => handleChange(opt.value)}
                            onMouseEnter={() => setHovered(opt.value)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                width:        `${STUB_W}px`,
                                flexShrink:   0,
                                background:   'var(--glass-bg)',
                                borderRadius: `${tl} ${tr} ${br} ${bl}`,
                                borderTop:    BORDER,
                                borderBottom: BORDER,
                                borderLeft:   isFirst ? BORDER : 'none',
                                borderRight:  isLast  ? BORDER : 'none',
                                boxShadow:    'inset 0 1px 0 var(--glass-highlight)',
                                display:      'flex',
                                alignItems:   'center',
                                justifyContent: 'center',
                                padding:      '0.88rem 0',
                                cursor:       disabled ? 'not-allowed' : 'pointer',
                                opacity:      disabled ? 0.38 : 1,
                                zIndex:       0,
                                transition:   'none',
                            }}
                        >
                            <span style={{
                                fontFamily:    "'Space Grotesk', sans-serif",
                                fontWeight:    600,
                                fontSize:      '0.82rem',
                                letterSpacing: '0.02em',
                                color:         isHov
                                    ? (isLight ? 'rgba(30,30,30,0.92)' : 'rgba(205,205,205,0.88)')
                                    : (isLight ? 'rgba(80,80,80,0.72)' : 'rgba(125,125,125,0.62)'),
                                transition:    'color 0.18s ease',
                                userSelect:    'none',
                                whiteSpace:    'nowrap',
                            }}>
                                {opt.label}
                            </span>
                        </div>
                    );
                })}

                {/* Sliding selected card — GPU-composited transform, zero layout reflow */}
                <div
                    style={{
                        position:             'absolute',
                        top:                  '-1px',
                        bottom:               '-1px',
                        left:                 '-1px',
                        width:                `calc(100% - ${2 * STUB_W - 2}px)`,
                        zIndex:               1,
                        borderRadius:         OUTER_R,
                        border:               BORDER,
                        boxShadow:            isLight ? selOpt.lightCardShadow : selOpt.cardShadow,
                        overflow:             'hidden',
                        // transform instead of left/right, GPU composited, no blur repaint
                        transform:            `translateX(${selIdx * STUB_W}px)`,
                        willChange:           'transform',
                        transition: [
                            `transform  ${SLIDE_MS}ms ${EASING}`,
                            `box-shadow 0.32s ease`,
                        ].join(', '),
                    }}
                >
                    <div
                        style={{
                            background:    isLight ? selOpt.lightAccent : selOpt.accent,
                            height:        '100%',
                            paddingTop:    '0.82rem',
                            paddingBottom: '1rem',
                            paddingLeft:   '1.1rem',
                            paddingRight:  '1.1rem',
                            display:       'flex',
                            flexDirection: 'column',
                            justifyContent:'flex-start',
                            transition:    'background 0.32s ease',
                        }}
                    >
                        <div>
                            <span style={{
                                fontFamily:    "'Space Grotesk', sans-serif",
                                fontWeight:    700,
                                fontSize:      '1.2rem',
                                letterSpacing: '-0.01em',
                                color:         isLight ? selOpt.lightLabelColor : selOpt.labelColor,
                                display:       'block',
                                marginBottom:  '0.4rem',
                                lineHeight:    1.15,
                                userSelect:    'none',
                                transition:    'color 0.28s ease',
                            }}>
                                {selOpt.label}
                            </span>

                            <p style={{
                                fontFamily:   "'JetBrains Mono', 'Courier New', monospace",
                                fontSize:     '10.5px',
                                color:        isLight ? 'rgba(80,80,80,0.75)' : 'rgba(175,175,175,0.70)',
                                lineHeight:   1.72,
                                marginBottom: '0.6rem',
                            }}>
                                {selOpt.description}
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {selOpt.pills.map(pill => (
                                    <span key={pill} style={pillStyle(selOpt)}>
                                        {pill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
