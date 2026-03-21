'use client';

import { useEffect, useRef } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

function KeyChip({ children }: { children: React.ReactNode }) {
    return (
        <span
            className="font-mono text-[11px] text-matrix-200 inline-flex items-center justify-center px-2 py-0.5"
            style={{
                borderRadius: '5px',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                minWidth: '2rem',
                lineHeight: 1.6,
            }}
        >
            {children}
        </span>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="font-mono text-xs font-semibold mb-3" style={{ color: 'rgba(100,200,120,0.85)', textShadow: '0 0 8px rgba(74,222,128,0.3)', letterSpacing: '0.05em' }}>
            {children}
        </p>
    );
}

const body: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: '11px',
    lineHeight: 1.85,
    color: 'rgba(180,180,180,0.75)',
};

const pillBase: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '9.5px',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    padding: '2.5px 8px',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(190,190,190,0.65)',
    background: 'rgba(255,255,255,0.03)',
    textDecoration: 'none',
    display: 'inline-block',
};

const STEPS = [
    'Read the encoded cipher on screen',
    'For Normal and Hard, open a decoder in a new tab',
    'Type the decoded answer into the input box',
    'Hit DECRYPT or press Enter to submit',
    'Keep going until the clock hits zero',
];

const TOOLS: { label: string; href: string }[] = [
    { label: 'cyberchef',        href: 'https://gchq.github.io/CyberChef/'  },
    { label: 'cryptii.com',      href: 'https://cryptii.com'                },
    { label: 'base64decode.org', href: 'https://www.base64decode.org'        },
];

const DIFFICULTIES = [
    {
        label: 'EASY',   pts: 10,
        color: 'rgba(147,197,253,0.95)', accent: 'rgba(59,130,246,0.10)', border: 'rgba(96,165,250,0.30)',
        pillBorder: 'rgba(96,165,250,0.22)', pillColor: 'rgba(147,197,253,0.55)',
        desc: 'No tools needed. Everything here can be cracked just by looking at it. Scrambled words, reversed phrases, flipped text, leetspeak.',
        pills: ['JUMBLE', 'REVERSE', 'LEET', 'FLIP'],
    },
    {
        label: 'NORMAL', pts: 25,
        color: 'rgba(195,215,240,0.90)', accent: 'rgba(180,200,230,0.09)', border: 'rgba(180,200,230,0.22)',
        pillBorder: 'rgba(180,200,230,0.18)', pillColor: 'rgba(195,215,240,0.60)',
        desc: 'One decoder tool per puzzle. Fast fingers and a good decoder site will carry you through.',
        pills: ['BINARY', 'MORSE', 'CAESAR', 'BASE64', 'ROT13', 'ATBASH'],
    },
    {
        label: 'HARD',   pts: 50,
        color: 'rgba(252,165,165,0.95)', accent: 'rgba(239,68,68,0.10)', border: 'rgba(248,113,113,0.30)',
        pillBorder: 'rgba(248,113,113,0.22)', pillColor: 'rgba(252,165,165,0.55)',
        desc: 'Most ciphers here need two passes. Decode the output once, then run it through a second tool.',
        pills: ['HEX ASCII', 'BASE32', 'RAIL FENCE', 'BINARY + CAESAR', 'MORSE + REVERSE', 'REVERSE + CAESAR'],
    },
];

const CONTROLS: [string, string][] = [
    ['SPACE',     'Begin decryption'],
    ['ENTER',     'Submit answer'],
    ['R',         'Try again'],
    ['ESC',       'Change difficulty'],
    ['← / A',     'Previous difficulty'],
    ['→ / D',     'Next difficulty'],
    ['T',         'Toggle theme'],
    ['M',         'Toggle motion'],
    ['/',         'Open this panel'],
    ['ESC',       'Close this panel'],
];

export default function HowToPlay({ isOpen }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [isOpen]);

    return (
        <>
            <style>{`
                .htp-scroll::-webkit-scrollbar { display: none; }
                .htp-scroll { scrollbar-width: none; -ms-overflow-style: none; }
                .tool-pill:hover { border-color: rgba(100,200,120,0.45) !important; color: rgba(134,239,172,0.9) !important; }
            `}</style>

            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                <div ref={scrollRef} className="htp-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(1.5rem,3vh,2.25rem) clamp(1rem,3vw,2rem)', paddingBottom: '6rem' }}>
                    <div style={{ width: '100%', maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        <div style={{ textAlign: 'center', paddingBottom: '0.25rem' }}>
                            <h2 className="green-title-gradient font-display font-bold text-3xl md:text-4xl">
                                HOW TO PLAY
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ alignItems: 'start' }}>

                            {/* LEFT: What is + How to Play + Scoring, then Controls */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                                <div className="glass" style={{ padding: '1.25rem 1.375rem' }}>
                                    <div style={{ marginBottom: '1.1rem' }}>
                                        <SectionLabel>&gt; WHAT IS CYPHER</SectionLabel>
                                        <p style={body}>
                                            CYPHER is a cipher-breaking game against the clock. Sixty seconds, no pauses,
                                            no checkpoints. Solve as many encoded puzzles as you can, one wrong answer ends everything.
                                        </p>
                                    </div>

                                    <div style={{ marginBottom: '1.1rem' }}>
                                        <SectionLabel>&gt; HOW TO PLAY</SectionLabel>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                            {STEPS.map((step, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                    <span style={{ ...body, color: 'rgba(100,200,120,0.55)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, minWidth: '1.4em' }}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <span style={body}>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Scoring: base pts left, time bonuses right, vertical divider between */}
                                    <div>
                                        <SectionLabel>&gt; SCORING</SectionLabel>
                                        <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '1rem' }}>
                                                {DIFFICULTIES.map(d => (
                                                    <div key={d.label} style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                                                        <span style={{ ...body, color: d.color, minWidth: '3.5em', fontWeight: 600 }}>{d.label}</span>
                                                        <span style={{ ...body, color: 'rgba(180,180,180,0.65)' }}>{d.pts} pts</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Vertical divider */}
                                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.09)', flexShrink: 0, margin: '0.1rem 0' }} />

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                                                    <span style={{ ...body, color: 'rgba(100,200,120,0.75)', minWidth: '5.5em' }}>under 20s</span>
                                                    <span style={{ ...body, color: 'rgba(180,180,180,0.6)' }}>x2</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                                                    <span style={{ ...body, color: 'rgba(240,200,100,0.75)', minWidth: '5.5em' }}>20 to 40s</span>
                                                    <span style={{ ...body, color: 'rgba(180,180,180,0.6)' }}>x1.5</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                                                    <span style={{ ...body, color: 'rgba(180,180,180,0.58)', minWidth: '5.5em' }}>after 40s</span>
                                                    <span style={{ ...body, color: 'rgba(180,180,180,0.6)' }}>x1</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass" style={{ padding: '1.25rem 1.375rem' }}>
                                    <SectionLabel>&gt; CONTROLS</SectionLabel>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.4rem 1.25rem', alignItems: 'center' }}>
                                        {CONTROLS.map(([key, action], i) => (
                                            <div key={i} className="contents">
                                                <KeyChip>{key}</KeyChip>
                                                <span style={{ ...body, alignSelf: 'center' }}>{action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* RIGHT: Difficulty, then Tools + Note */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                                <div className="glass" style={{ padding: '1.25rem 1.375rem' }}>
                                    <SectionLabel>&gt; DIFFICULTY</SectionLabel>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        {DIFFICULTIES.map(d => (
                                            <div key={d.label} style={{ padding: '0.875rem 1rem', borderRadius: '0.875rem', background: d.accent, border: `1px solid ${d.border}` }}>
                                                <p className="font-mono text-xs font-semibold mb-1.5" style={{ color: d.color, letterSpacing: '0.08em' }}>{d.label}</p>
                                                <p style={body}>{d.desc}</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '0.625rem' }}>
                                                    {d.pills.map(pill => (
                                                        <span key={pill} style={{ ...pillBase, borderColor: d.pillBorder, color: d.pillColor }}>{pill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass" style={{ padding: '1.25rem 1.375rem' }}>
                                    <div style={{ marginBottom: '1.1rem' }}>
                                        <SectionLabel>&gt; TOOLS</SectionLabel>
                                        <p style={{ ...body, marginBottom: '0.75rem' }}>
                                            Using external decoder websites is not just allowed, it is the intended
                                            way to play Normal and Hard. Open one in a separate tab before you start.
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                            {TOOLS.map(({ label, href }) => (
                                                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="tool-pill"
                                                    style={{ ...pillBase, transition: 'border-color 0.18s ease, color 0.18s ease', cursor: 'pointer' }}>
                                                    {label}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <SectionLabel>&gt; NOTE</SectionLabel>
                                        <p style={body}>
                                            Cipher text cannot be selected or copied. This is intentional.
                                            Type it manually into your decoder.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '7rem', background: 'linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.55) 50%, transparent 100%)', pointerEvents: 'none' }} />
            </div>
        </>
    );
}
