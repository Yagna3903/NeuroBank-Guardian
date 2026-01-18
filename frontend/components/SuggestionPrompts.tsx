import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SuggestionPromptsProps {
    suggestions: string[];
    onSelect: (text: string) => void;
}

export default function SuggestionPrompts({ suggestions, onSelect }: SuggestionPromptsProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation when suggestions change
        setIsVisible(false);
        const timeout = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timeout);
    }, [suggestions]);

    return (
        <div className="w-full px-6 py-4">
            <div className="flex items-center gap-2 mb-3 opacity-90">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/80">Magic Prompts</span>
            </div>

            {/* Marquee Styles */}
            <style>{`
                @keyframes marqueePrompts {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); } 
                }
            `}</style>

            <div className="relative w-full overflow-hidden">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-8 z-20 bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 z-20 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>

                <div className="flex w-max gap-3 hover:[animation-play-state:paused]"
                    style={{ animation: 'marqueePrompts 40s linear infinite' }}>
                    {[...suggestions, ...suggestions, ...suggestions, ...suggestions].map((text, index) => (
                        <button
                            key={`${text}-${index}`}
                            onClick={() => onSelect(text)}
                            className="group relative flex-shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5 py-2.5 px-5 text-left transition-all duration-300 hover:border-cyan-400/60 hover:bg-cyan-900/40 hover:scale-105 active:scale-95"
                        >
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:animate-shimmer" />

                            <div className="flex items-center gap-3 relative z-10">
                                <span className="text-xs font-medium text-cyan-100/90 group-hover:text-white transition-colors whitespace-nowrap">
                                    {text}
                                </span>
                                <ArrowRight className="w-3 h-3 text-cyan-400 opacity-50 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Scroll Indication Fade */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
