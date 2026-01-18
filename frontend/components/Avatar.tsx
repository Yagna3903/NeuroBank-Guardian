"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';
import { Mic, MicOff, Video, Loader2 } from 'lucide-react';

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

    const videoRef = useRef<HTMLVideoElement>(null);
    const transcriptRef = useRef<HTMLDivElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const synthesizerRef = useRef<SpeechSDK.AvatarSynthesizer | null>(null);
    const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
    const websocketRef = useRef<WebSocket | null>(null);

    // Auto-scroll transcript
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [transcript]);

    const startAvatar = async () => {
        setStatus("Initializing...");
        try {
            const response = await axios.post('http://localhost:8000/api/v1/avatar/session');
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
                    setStatus("Connected");
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
        const ws = new WebSocket(`ws://localhost:8000/api/v1/avatar/ws?user_id=${uid}`);
        ws.onopen = () => console.log("WS Connected");
        ws.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "avatar_response") {
                setTranscript(prev => [...prev, { role: 'ai', text: msg.text }]);

                if (synthesizerRef.current) {
                    setStatus("Speaking...");
                    await synthesizerRef.current.speakTextAsync(msg.text);
                    setStatus("Listening...");
                }
            }
        };
        websocketRef.current = ws;
    };

    const startMicrophone = (speechConfig: SpeechSDK.SpeechConfig) => {
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizing = (s, e) => {
            setStatus(`Listening: ${e.result.text}`);
        };

        recognizer.recognized = (s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                const text = e.result.text;
                setTranscript(prev => [...prev, { role: 'user', text }]);

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
        setIsPlaying(false);
        setStatus("Stopped");
    };

    useEffect(() => {
        return () => {
            stopAvatar();
        }
    }, []);

    return (
        <div className={`relative w-full h-[700px] rounded-[3rem] overflow-hidden border-4 shadow-2xl backdrop-blur-sm group flex flex-col md:flex-row transition-all duration-500 ${status === 'Connected' ? 'border-emerald-500/50 shadow-emerald-500/20' : 'border-white/10 shadow-black/50'}`}>

            {/* Left: Video Area */}
            <div className="relative flex-1 h-full bg-black">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover opacity-90"
                    autoPlay
                    playsInline
                />

                {/* Status Indicator (Subtle Top Left) */}
                <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] ${status === 'Connected' ? 'bg-emerald-500 shadow-emerald-500 animate-pulse' : 'bg-amber-500 shadow-amber-500'}`} />
                    <span className="text-white font-mono text-xs tracking-widest uppercase opacity-80">{status}</span>
                </div>

                {/* Controls Overlay (Initial State) */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[4px]">
                        <button
                            onClick={startAvatar}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-full font-bold text-xl flex items-center gap-4 hover:scale-105 transition-all shadow-[0_0_40px_rgba(59,130,246,0.5)] group/btn"
                        >
                            <div className="p-2 bg-white/20 rounded-full">
                                <Video className="w-6 h-6" />
                            </div>
                            Initialize Guardian
                        </button>
                    </div>
                )}
            </div>

            {/* Right: Live Transcript Panel */}
            {isPlaying && (
                <div className="w-full md:w-[400px] bg-gray-900/95 border-l border-white/10 backdrop-blur-xl flex flex-col shadow-2xl">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <span className="font-bold text-blue-200 text-sm uppercase tracking-widest">Live Transcript</span>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Recording"></span>
                    </div>

                    <div ref={transcriptRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                        {transcript.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                                <div className="text-blue-100 text-sm italic">
                                    Establishing secure line...<br />Guardian is listening.
                                </div>
                            </div>
                        )}
                        {transcript.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-[1.5rem] px-6 py-4 text-base leading-relaxed shadow-lg ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-white/10 text-gray-100 rounded-bl-sm border border-white/5'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/20">
                        <button
                            onClick={stopAvatar}
                            className="w-full bg-red-500/10 hover:bg-red-500/90 hover:text-white border border-red-500/50 text-red-100 text-lg font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group/end shadow-lg"
                        >
                            <MicOff className="w-6 h-6 group-hover/end:animate-bounce" />
                            End Secure Session
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
