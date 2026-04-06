'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

function KeyChip({ children, isLight }: { children: React.ReactNode; isLight: boolean }) {
    return (
        <span
            className="font-mono text-[11px] text-matrix-200 inline-flex items-center justify-center px-2 py-0.5"
            style={{
                borderRadius: '5px',
                border: isLight ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.18)',
                background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                minWidth: '2rem',
                lineHeight: 1.6,
            }}
        >
            {children}
        </span>
    );
}

function SectionLabel({ children, isLight }: { children: React.ReactNode; isLight: boolean }) {
    return (
        <p className="font-mono text-xs font-semibold mb-3" style={{
            color: isLight ? 'rgba(20,120,60,0.90)' : 'rgba(100,200,120,0.85)',
            textShadow: isLight ? 'none' : '0 0 8px rgba(74,222,128,0.3)',
            letterSpacing: '0.05em',
        }}>
            {children}
        </p>
    );
}

// Base inline styles shared by both themes
const bodyDark: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: '11px',
    lineHeight: 1.85,
    color: 'rgba(180,180,180,0.75)',
};
const bodyLight: React.CSSProperties = {
    ...bodyDark,
    color: 'rgba(50,50,50,0.85)',
};

const pillDark: React.CSSProperties = {
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
const pillLightBase: React.CSSProperties = {
    ...pillDark,
    border: '1px solid rgba(0,0,0,0.12)',
    color: 'rgba(60,60,60,0.65)',
    background: 'rgba(0,0,0,0.03)',
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
        // Light mode
        lColor: 'rgba(30,80,180,0.95)', lAccent: 'rgba(59,130,246,0.06)', lBorder: 'rgba(59,130,246,0.22)',
        lPillBorder: 'rgba(59,130,246,0.20)', lPillColor: 'rgba(30,80,180,0.55)',
    },
    {
        label: 'NORMAL', pts: 25,
        color: 'rgba(195,215,240,0.90)', accent: 'rgba(180,200,230,0.09)', border: 'rgba(180,200,230,0.22)',
        pillBorder: 'rgba(180,200,230,0.18)', pillColor: 'rgba(195,215,240,0.60)',
        desc: 'One decoder tool per puzzle. Fast fingers and a good decoder site will carry you through.',
        pills: ['BINARY', 'MORSE', 'CAESAR', 'BASE64', 'ROT13', 'ATBASH'],
        lColor: 'rgba(50,60,90,0.90)', lAccent: 'rgba(100,120,160,0.05)', lBorder: 'rgba(80,100,140,0.18)',
        lPillBorder: 'rgba(80,100,140,0.16)', lPillColor: 'rgba(50,60,90,0.55)',
    },
    {
        label: 'HARD',   pts: 50,
        color: 'rgba(252,165,165,0.95)', accent: 'rgba(239,68,68,0.10)', border: 'rgba(248,113,113,0.30)',
        pillBorder: 'rgba(248,113,113,0.22)', pillColor: 'rgba(252,165,165,0.55)',
        desc: 'Most ciphers here need two passes. Decode the output once, then run it through a second tool.',
        pills: ['HEX ASCII', 'BASE32', 'RAIL FENCE', 'BINARY + CAESAR', 'MORSE + REVERSE', 'REVERSE + CAESAR'],
        lColor: 'rgba(180,30,30,0.95)', lAccent: 'rgba(220,50,50,0.05)', lBorder: 'rgba(220,50,50,0.22)',
        lPillBorder: 'rgba(220,50,50,0.18)', lPillColor: 'rgba(180,30,30,0.55)',
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
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        const check = () => setIsLight(document.body.classList.contains('light-mode'));
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (isOpen && scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [isOpen]);

    const body     = isLight ? bodyLight : bodyDark;
    const pillBase = isLight ? pillLightBase : pillDark;

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
                                        <SectionLabel isLight={isLight}>&gt; WHAT IS CYPHER</SectionLabel>
                                        <p style={body}>
                                            CYPHER is a cipher-breaking game against the clock. Sixty seconds, no pauses,
                                            no checkpoints. Solve as many encoded puzzles as you can, one wrong answer ends everything.
                                        </p>
                                    </div>

                                    <div style={{ marginBottom: '1.1rem' }}>
                                        <SectionLabel isLight={isLight}>&gt; HOW TO PLAY</SectionLabel>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                            {STEPS.map((step, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                    <span style={{ ...body, color: isLight ? 'rgba(20,120,60,0.65)' : 'rgba(100,200,120,0.55)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, minWidth: '1.4em' }}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <span style={body}>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Scoring: base points left, time bonuses right, vertical divider between */}
                                    <div>
                                        <SectionLabel isLight={isLight}>&gt; SCORING</SectionLabel>
                                        <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '1rem' }}>
                                                {DIFFICULTIES.map(d => (
                                                    <div key={d.label} style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                                                        <span style={{ ...body, color: isLight ? d.lColor : d.color, minWidth: '3.5em', fontWeight: 600 }}>{d.label}</span>
                                                        <span style={{ ...body, color: isLight ? 'rgba(50,50,50,0.65)' : 'rgba(180,180,180,0.65)' }}>{d.pts} points</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Vertical divider */}
                                            <div style={{ width: '1px', background: isLight ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.09)', flexShrink: 0, margin: '0.1rem 0' }} />

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                                                    <span style={{ ...body, color: isLight ? 'rgba(20,120,60,0.85)' : 'rgba(100,200,120,0.75)', minWidth: '5.5em' }}>under 20s</span>
                                                    <span style={{ ...body, color: isLight ? 'rgba(50,50,50,0.6)' : 'rgba(180,180,180,0.6)' }}>x2</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                                                    <span style={{ ...body, color: isLight ? 'rgba(160,120,30,0.85)' : 'rgba(240,200,100,0.75)', minWidth: '5.5em' }}>20 to 40s</span>
                                                    <span style={{ ...body, color: isLight ? 'rgba(50,50,50,0.6)' : 'rgba(180,180,180,0.6)' }}>x1.5</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                                                    <span style={{ ...body, color: isLight ? 'rgba(80,80,80,0.58)' : 'rgba(180,180,180,0.58)', minWidth: '5.5em' }}>after 40s</span>
                                                    <span style={{ ...body, color: isLight ? 'rgba(50,50,50,0.6)' : 'rgba(180,180,180,0.6)' }}>x1</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass" style={{ padding: '1.25rem 1.375rem' }}>
                                    <SectionLabel isLight={isLight}>&gt; CONTROLS</SectionLabel>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.4rem 1.25rem', alignItems: 'center' }}>
                                        {CONTROLS.map(([key, action], i) => (
                                            <div key={i} className="contents">
                                                <KeyChip isLight={isLight}>{key}</KeyChip>
                                                <span style={{ ...body, alignSelf: 'center' }}>{action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* RIGHT: Difficulty, then Tools + Note */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                                <div className="glass" style={{ padding: '1.25rem 1.375rem' }}>
                                    <SectionLabel isLight={isLight}>&gt; DIFFICULTY</SectionLabel>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        {DIFFICULTIES.map(d => (
                                            <div key={d.label} style={{ padding: '0.875rem 1rem', borderRadius: '0.875rem', background: isLight ? d.lAccent : d.accent, border: `1px solid ${isLight ? d.lBorder : d.border}` }}>
                                                <p className="font-mono text-xs font-semibold mb-1.5" style={{ color: isLight ? d.lColor : d.color, letterSpacing: '0.08em' }}>{d.label}</p>
                                                <p style={body}>{d.desc}</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '0.625rem' }}>
                                                    {d.pills.map(pill => (
                                                        <span key={pill} style={{ ...pillBase, borderColor: isLight ? d.lPillBorder : d.pillBorder, color: isLight ? d.lPillColor : d.pillColor }}>{pill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass" style={{ padding: '1.25rem 1.375rem' }}>
                                    <div style={{ marginBottom: '1.1rem' }}>
                                        <SectionLabel isLight={isLight}>&gt; TOOLS</SectionLabel>
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
                                        <SectionLabel isLight={isLight}>&gt; NOTE</SectionLabel>
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

                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '9rem',
                    background: isLight
                        ? 'linear-gradient(to top, rgba(240,236,228,0.94) 0%, rgba(240,236,228,0.72) 22%, rgba(240,236,228,0.38) 50%, rgba(240,236,228,0.10) 72%, transparent 100%)'
                        : 'linear-gradient(to top, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.72) 20%, rgba(10,10,10,0.40) 45%, rgba(10,10,10,0.14) 70%, transparent 100%)',
                    pointerEvents: 'none',
                }} />
            </div>
        </>
    );
}
