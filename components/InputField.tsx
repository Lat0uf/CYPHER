'use client';

import { useState, useRef, useEffect } from 'react';

interface InputFieldProps {
    onSubmit: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    feedbackState?: 'correct' | 'wrong' | null;
    reducedMotion?: boolean;
}

export default function InputField({
    onSubmit,
    disabled = false,
    placeholder = 'Type your answer...',
    feedbackState = null,
    reducedMotion = false,
}: InputFieldProps) {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!disabled) {
            const id = setTimeout(() => { inputRef.current?.focus(); }, 250);
            return () => clearTimeout(id);
        }
    }, [disabled]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim() && !disabled) {
            onSubmit(value);
            setValue('');
        }
    };

    const feedbackClass = (() => {
        if (!feedbackState) return '';
        if (reducedMotion) {
            return feedbackState === 'wrong' ? 'input-feedback-wrong' : 'input-feedback-correct';
        }
        return feedbackState === 'wrong' ? 'input-flash-wrong' : 'input-flash-correct';
    })();

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 w-full max-w-2xl">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                autoComplete="off"
                className={`
                    flex-1 glass px-6 py-4
                    font-mono text-xl text-white light-adapt
                    placeholder:text-matrix-300
                    focus:outline-none focus:ring-2 focus:ring-white/15
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    ${feedbackClass}
                `}
            />
            <button
                type="submit"
                disabled={disabled || !value.trim()}
                className="btn-press glass px-8 py-4 font-display font-semibold text-white light-adapt
                    hover:bg-white/10
                    disabled:opacity-50 disabled:pointer-events-none
                    transition-all duration-200"
            >
                DECRYPT
            </button>
        </form>
    );
}
