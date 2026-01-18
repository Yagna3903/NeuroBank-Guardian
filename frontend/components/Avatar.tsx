"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';
import { Mic, MicOff, Video, Loader2 } from 'lucide-react';
import SuggestionPrompts from './SuggestionPrompts';

interface AvatarProps {
    userId: string;
}

interface TranscriptMessage {
    role: 'user' | 'ai';
    text: string;
}

export default function Avatar({ userId }: AvatarProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [status, setStatus] = useState("Idle");
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([
        "Hello AI",
        "Check my balance",
        "Recent transactions",
        "Spending analysis",
        "Investment update"
    ]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const transcriptRef = useRef<HTMLDivElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const synthesizerRef = useRef<SpeechSDK.AvatarSynthesizer | null>(null);
    const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
    const websocketRef = useRef<WebSocket | null>(null);

    const isSessionActive = useRef(false);
    const isSpeakingRef = useRef(false);

    // Auto-scroll transcript
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [transcript]);

    const startAvatar = async () => {
        if (status === "Initializing..." || status === "Connected") return;

        // Ensure prompt cleanup of any previous session artifacts
        if (websocketRef.current || recognizerRef.current || peerConnectionRef.current) {
            stopAvatar();
        }

        setStatus("Initializing...");
        try {
            const response = await axios.post('https://backend-1093567910779.us-central1.run.app/api/v1/avatar/session');
            const { token, ice_servers, region } = response.data;

            const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
            speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural";

            const iceServerConfig = {
                urls: ice_servers.Urls,
                username: ice_servers.Username,
                credential: ice_servers.Password
            };

            const peerConnection = new RTCPeerConnection({
                iceServers: [iceServerConfig]
            });
            peerConnectionRef.current = peerConnection;

            peerConnection.ontrack = (event) => {
                if (event.track.kind === 'video' && videoRef.current) {
                    videoRef.current.srcObject = event.streams[0];
                    videoRef.current.play();
                    setIsPlaying(true);
                    setStatus("Waiting for 'Hello AI'...");
                }
            };

            peerConnection.addTransceiver('video', { direction: 'sendrecv' });
            peerConnection.addTransceiver('audio', { direction: 'sendrecv' });

            const videoFormat = new SpeechSDK.AvatarVideoFormat();
            const avatarConfig = new SpeechSDK.AvatarConfig("lisa", "casual-sitting", videoFormat);
            const avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(speechConfig, avatarConfig);
            synthesizerRef.current = avatarSynthesizer;

            await avatarSynthesizer.startAvatarAsync(peerConnection);
            console.log("Avatar Started!");

            connectWebSocket(userId);
            startMicrophone(speechConfig);

        } catch (error) {
            console.error("Failed to start avatar:", error);
            setStatus("Error: " + (error as any).message);
        }
    };

    const connectWebSocket = (uid: string) => {
        if (websocketRef.current) {
            console.log("Closing existing WebSocket before reconnecting...");
            websocketRef.current.close();
        }
        const ws = new WebSocket(`wss://backend-1093567910779.us-central1.run.app/api/v1/avatar/ws?user_id=${uid}`);
        ws.onopen = () => console.log("WS Connected");
        ws.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "avatar_response") {
                setTranscript(prev => [...prev, { role: 'ai', text: msg.text }]);

                // Dynamic suggestions based on AI response context
                updateSuggestions(msg.text);

                if (synthesizerRef.current) {
                    setStatus("Speaking...");
                    isSpeakingRef.current = true;
                    await synthesizerRef.current.speakTextAsync(msg.text);
                    isSpeakingRef.current = false;
                    setStatus("Listening...");
                }
            }
        };
        websocketRef.current = ws;
    };

    const updateSuggestions = (text: string) => {
        const lowerText = text.toLowerCase();

        if (lowerText.includes("transfer") || lowerText.includes("send")) {
            setSuggestions(["Confirm transfer", "Change amount", "Cancel transaction"]);
        } else if (lowerText.includes("balance") || lowerText.includes("money")) {
            setSuggestions(["Show details", "Spending analysis", "Transfer money"]);
        } else if (lowerText.includes("transaction") || lowerText.includes("spent")) {
            setSuggestions(["Filter by date", "Report issue", "Export statement"]);
        } else if (lowerText.includes("hello") || lowerText.includes("hi")) {
            setSuggestions(["Check my balance", "Pay a bill", "Financial advice"]);
        } else {
            // Default refresh
            setSuggestions(["Account summary", "Security settings", "Contact support"]);
        }
    };

    const handleSuggestionSelect = (text: string) => {
        // Send selected suggestion as user input
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            setTranscript(prev => [...prev, { role: 'user', text }]);
            websocketRef.current.send(JSON.stringify({
                type: "text_input",
                text: text
            }));
        } else {
            // If not connected, treating it as a wake word or initial command
            if (text === "Hello AI") {
                startAvatar();
            }
        }
    };

    const startMicrophone = (speechConfig: SpeechSDK.SpeechConfig) => {
        if (recognizerRef.current) {
            recognizerRef.current.stopContinuousRecognitionAsync();
            recognizerRef.current.close();
        }

        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizing = (s, e) => {
            // Only show listening status if we are actually active
            if (isSessionActive.current && !isSpeakingRef.current) {
                setStatus(`Listening: ${e.result.text}`);
            }
        };

        recognizer.recognized = (s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                const text = e.result.text;
                const lowerText = text.toLowerCase();

                if (!text) return;

                // 1. Check for Disconnect
                if (lowerText.includes("goodbye") || lowerText.includes("good bye")) {
                    setTranscript(prev => [...prev, { role: 'user', text: text + " (Ending Session)" }]);
                    stopAvatar();
                    return;
                }

                // 2. Check for Wake Word
                if (lowerText.includes("hello ai") || lowerText.includes("hello a.i")) {
                    isSessionActive.current = true;
                    setStatus("Listening...");
                    setTranscript(prev => [...prev, { role: 'user', text: text + " (Session Activated)" }]);
                    // Optionally send the first hello to the backend? Or just activate. 
                    // Let's send it so the AI says hello back.
                }

                // 3. Voice Isolation & Active Check
                // If not active, or if avatar is currently speaking, IGNORE input.
                if (!isSessionActive.current) return;
                if (isSpeakingRef.current) return;

                setTranscript(prev => [...prev, { role: 'user', text }]);

                // Ensure we only send if the socket is open
                if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                    websocketRef.current.send(JSON.stringify({
                        type: "text_input",
                        text: text
                    }));
                }
            }
        };

        recognizer.startContinuousRecognitionAsync();
        recognizerRef.current = recognizer;
    };

    const stopAvatar = () => {
        synthesizerRef.current?.close();
        peerConnectionRef.current?.close();
        recognizerRef.current?.stopContinuousRecognitionAsync();
        websocketRef.current?.close();

        websocketRef.current = null;
        recognizerRef.current = null;
        peerConnectionRef.current = null;
        synthesizerRef.current = null;

        setIsPlaying(false);
        setStatus("Stopped");
    };

    useEffect(() => {
        return () => {
            stopAvatar();
        }
    }, []);

    return (
        <div className={`relative w-full h-full rounded-[2.5rem] overflow-hidden border-4 shadow-2xl backdrop-blur-sm group flex flex-col md:flex-row transition-all duration-500 font-chakra ${status === 'Connected' ? 'border-emerald-500/50 shadow-emerald-500/20' : 'border-white/10 shadow-black/50'}`}>

            {/* Left: Video Area */}
            <div className="relative flex-1 h-full bg-gradient-to-b from-gray-900 to-black">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover opacity-90"
                    autoPlay
                    playsInline
                />

                {/* Status Indicator (Subtle Top Left) */}
                <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] ${status === 'Connected' ? 'bg-emerald-500 shadow-emerald-500 animate-pulse' : 'bg-amber-500 shadow-amber-500'}`} />
                    <span className="text-white font-chakra text-xs tracking-widest uppercase opacity-80">{status}</span>
                </div>

                {/* Controls Overlay (Initial State) */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[4px]">
                        <button
                            onClick={startAvatar}
                            disabled={status === "Initializing..."}
                            className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-full font-bold text-xl flex items-center gap-4 transition-all shadow-[0_0_40px_rgba(59,130,246,0.5)] group/btn border border-white/20 ${status === "Initializing..." ? 'opacity-70 cursor-wait' : 'hover:scale-105 hover:shadow-cyan-500/50'}`}
                        >
                            {status === "Initializing..." ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Initializing Guardian...
                                </>
                            ) : (
                                <>
                                    <div className="p-2 bg-white/20 rounded-full">
                                        <Video className="w-6 h-6" />
                                    </div>
                                    Initialize Guardian
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Right: Live Transcript Panel */}
            {isPlaying && (
                <div className="w-full md:w-[400px] bg-gray-900/95 border-l border-white/10 backdrop-blur-xl flex flex-col shadow-2xl">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <span className="font-bold text-cyan-200 text-sm uppercase tracking-widest font-chakra">Live Transcript</span>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" title="Recording"></span>
                    </div>

                    <div ref={transcriptRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                        {transcript.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                                <div className="text-cyan-100 text-sm italic font-mono">
                                    Establishing secure line...<br />Guardian is listening.
                                </div>
                            </div>
                        )}
                        {transcript.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-[1.5rem] px-6 py-4 text-sm leading-relaxed shadow-lg font-mono ${msg.role === 'user'
                                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-br-sm'
                                    : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Integrated Suggestions Panel */}
                    <div className="border-t border-white/5 bg-black/40 backdrop-blur-md">
                        <SuggestionPrompts
                            suggestions={suggestions}
                            onSelect={handleSuggestionSelect}
                        />
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/20">
                        <button
                            onClick={stopAvatar}
                            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-200 text-base font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 group/end shadow-lg"
                        >
                            <MicOff className="w-5 h-5 group-hover/end:scale-110 transition-transform" />
                            End Secure Session
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
