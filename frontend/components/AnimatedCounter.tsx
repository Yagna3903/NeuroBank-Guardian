"use client";

import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
    value: number;
    currency?: string;
    duration?: number; // ms
    className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    currency = "$",
    duration = 1000,
    className = ""
}) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [colorState, setColorState] = useState<'neutral' | 'up' | 'down'>('neutral');

    // Store previous value to determine direction
    const prevValueRef = useRef(value);
    const startTimeRef = useRef<number | null>(null);
    const startValueRef = useRef(value);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        // If value hasn't effectively changed, do nothing
        if (value === prevValueRef.current) return;

        // Determine Direction for Color
        if (value > prevValueRef.current) {
            setColorState('up');
        } else {
            setColorState('down');
        }

        // Reset Color after animation
        const timeout = setTimeout(() => setColorState('neutral'), duration + 500);

        // Animation Loop
        startValueRef.current = displayValue; // Start from current animated state (in case interrupted)
        startTimeRef.current = null;

        const animate = (time: number) => {
            if (!startTimeRef.current) startTimeRef.current = time;
            const progress = time - startTimeRef.current;
            const percentage = Math.min(progress / duration, 1);

            // Ease Out Quartic function for "Speedometer" feel (starts fast, slows down)
            const ease = 1 - Math.pow(1 - percentage, 4);

            const current = startValueRef.current + (value - startValueRef.current) * ease;
            setDisplayValue(current);

            if (percentage < 1) {
                requestRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayValue(value); // Ensure exact final value
                prevValueRef.current = value;
            }
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            clearTimeout(timeout);
        };
    }, [value, duration]);

    // Dynamic coloring based on state
    // Dynamic coloring based on state
    let colorClass = "";
    let scaleClass = "";

    // We use ! to force override parent text colors during animation
    if (colorState === 'up') {
        colorClass = "!text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,1)]";
        scaleClass = "scale-110 origin-left";
    }
    if (colorState === 'down') {
        colorClass = "!text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)]";
        scaleClass = "scale-110 origin-left";
    }

    return (
        <span className={`tabular-nums inline-block transition-all duration-300 ${className} ${colorState !== 'neutral' ? `${colorClass} ${scaleClass}` : ''}`}>
            {currency}{displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );
};
