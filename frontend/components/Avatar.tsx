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
        <div className="relative w-full h-[600px] bg-black/90 rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-sm group flex flex-col md:flex-row">

            {/* Left: Video Area */}
            <div className="relative flex-1 h-full">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                />

                {/* Overlay Status */}
                <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs text-white border border-white/20 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                    {status}
                </div>

                {/* Controls Overlay */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                        <button
                            onClick={startAvatar}
                            className="bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
                        >
                            <Video className="w-5 h-5" />
                            Initialize Guardian
                        </button>
                    </div>
                )}
            </div>

            {/* Right: Live Transcript Panel */}
            {isPlaying && (
                <div className="w-full md:w-80 bg-gray-900/80 border-l border-white/10 backdrop-blur-md flex flex-col">
                    <div className="p-4 border-b border-white/10 font-bold text-gray-400 text-xs uppercase tracking-wider">
                        Live Transcript
                    </div>

                    <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {transcript.length === 0 && (
                            <div className="text-gray-500 text-xs text-center italic mt-10">
                                Conversation started...<br />Try asking about your finances.
                            </div>
                        )}
                        {transcript.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white/10 text-gray-200 rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/10">
                        <button onClick={stopAvatar} className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-200 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                            <MicOff className="w-4 h-4" />
                            End Session
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
