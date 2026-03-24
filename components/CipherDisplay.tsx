'use client';

interface CipherDisplayProps {
    cipherText: string;
    cipherType?: string;
    color?: string;
}

export default function CipherDisplay({ cipherText, color }: CipherDisplayProps) {
    const isColorCipher = cipherText.includes('[COLOR SWATCH]');

    // Thresholds raised so easy-mode phrases (typically 15–28 chars) still get the
    // large font. The old < 20 cutoff was too tight and dropped them to 2xl.
    const len      = cipherText.length;
    const isShort  = len < 30;
    const isMedium = len >= 30 && len < 70;

    const containerPadding = isShort ? 'p-8' : isMedium ? 'p-10' : 'p-12';
    const minHeight        = isShort ? 'min-h-[140px]' : isMedium ? 'min-h-[180px]' : 'min-h-[220px]';
    const textSize         = isShort
        ? 'text-4xl md:text-5xl'
        : isMedium
            ? 'text-2xl md:text-3xl'
            : 'text-xl md:text-2xl';

    return (
        <div className={`glass ${containerPadding} ${minHeight} flex items-center justify-center transition-all duration-500`}>
            {isColorCipher && color ? (
                <div className="flex flex-col items-center gap-6 select-none">
                    <div
                        className="w-36 h-36 rounded-2xl border-2 border-white/20 shadow-2xl"
                        style={{ backgroundColor: color }}
                    />
                    <p className="font-mono text-matrix-200 text-sm no-select">
                        What is this color&apos;s hex code?
                    </p>
                </div>
            ) : (
                // line-height: 1.4 keeps unicode symbols (⊥, ∩, Я, etc) from clipping
                // against each other, some occupy a different portion of the em box
                // than standard uppercase Latin
                <p
                    className={`font-mono ${textSize} text-white no-select text-center tracking-wide`}
                    style={{ lineHeight: 1.4 }}
                >
                    {cipherText}
                </p>
            )}
        </div>
    );
}
