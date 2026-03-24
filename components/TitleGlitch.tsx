'use client';

import { useEffect, useRef } from 'react';

// Tab title glitch: one letter glitches, reverts to plain CYPHER, then waits
// Variant weighting deprioritizes recently used chars so repeats are rare
export default function TitleGlitch() {
    const levelRef = useRef<number | null>(null);

    useEffect(() => {
        const glitchMap: Record<string, string[]> = {
            'C': ['ℭ', 'ℂ', '𝘊'],
            'Y': ['¥', 'Ꭹ', 'Ψ', '𝕐', '𝘠'],
            'P': ['Þ', '𝒫', '₱', 'ℙ', 'Ꭾ', '𝘗'],
            'H': ['Ħ', 'ℌ', 'ℍ', '𝘏'],
            'E': ['€', '𝔈', 'ℰ', '𝔼', '𝘌'],
            'R': ['ℝ', 'ℜ', 'Я', 'ℛ', '𝘙'],
        };

        const currentChars = 'CYPHER'.split('');
        const originalChars = [...currentChars];
        let lastLetterIdx = -1;

        // track last 3 used variants per letter to deprioritize repeats
        const recentVariants: Record<string, string[]> = {};

        const updateTitle = () => {
            const base = currentChars.join('');
            const level = levelRef.current;
            document.title = level ? `${base} // Level ${level}` : base;
        };

        // avoid same letter twice in a row
        const pickLetterIdx = () => {
            let idx = Math.floor(Math.random() * 6);
            let attempts = 0;
            while (idx === lastLetterIdx && attempts < 10) {
                idx = Math.floor(Math.random() * 6);
                attempts++;
            }
            return idx;
        };

        // pick variant with weighted randomness (recent ones get much lower weight)
        const pickVariant = (letter: string): string => {
            const alts = glitchMap[letter];
            const recent = recentVariants[letter] || [];
            const weights = alts.map(v => {
                const age = recent.indexOf(v);
                if (age === -1) return 1.0;
                if (age === recent.length - 1) return 0.05;
                if (age === recent.length - 2) return 0.15;
                return 0.35;
            });
            const total = weights.reduce((a, b) => a + b, 0);
            let roll = Math.random() * total;
            for (let i = 0; i < alts.length; i++) {
                roll -= weights[i];
                if (roll <= 0) return alts[i];
            }
            return alts[alts.length - 1];
        };

        const recordVariant = (letter: string, variant: string) => {
            if (!recentVariants[letter]) recentVariants[letter] = [];
            recentVariants[letter].push(variant);
            if (recentVariants[letter].length > 3) recentVariants[letter].shift();
        };

        let mainTimer: ReturnType<typeof setTimeout>;

        const scheduleGlitch = () => {
            const waitDelay = 400 + Math.random() * 400;
            mainTimer = setTimeout(() => {
                const idx = pickLetterIdx();
                const letter = originalChars[idx];
                const variant = pickVariant(letter);

                recordVariant(letter, variant);
                lastLetterIdx = idx;

                currentChars[idx] = variant;
                updateTitle();

                // hold glitch then revert to plain CYPHER
                const holdDelay = 150 + Math.random() * 150;
                mainTimer = setTimeout(() => {
                    currentChars[idx] = originalChars[idx];
                    updateTitle();
                    scheduleGlitch();
                }, holdDelay);
            }, waitDelay);
        };

        scheduleGlitch();

        const handleLevelChange = (e: Event) => {
            levelRef.current = (e as CustomEvent).detail.level;
            updateTitle();
        };

        const handleGameEnd = () => {
            levelRef.current = null;
            updateTitle();
        };

        window.addEventListener('cypher-level-change', handleLevelChange);
        window.addEventListener('cypher-game-end', handleGameEnd);

        return () => {
            clearTimeout(mainTimer);
            window.removeEventListener('cypher-level-change', handleLevelChange);
            window.removeEventListener('cypher-game-end', handleGameEnd);
            document.title = 'CYPHER';
        };
    }, []);

    return null;
}
