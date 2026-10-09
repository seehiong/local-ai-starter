// voice-agent.js - Hands-Free Voice Activity Detection (VAD) & Voice Loop Engine

export class VoiceAgentEngine {
    constructor() {
        this.state = 'IDLE'; // IDLE, LISTENING, THINKING, SPEAKING
        this.audioCtx = null;
        this.analyser = null;
        this.micStream = null;
        this.animFrameId = null;

        // VAD Tuning Parameters
        this.silenceThreshold = 0.02;     // RMS energy threshold for silence
        this.speechStartThreshold = 0.04; // RMS energy threshold to trigger speech start
        this.silenceTimeoutMs = 1400;     // Pause length (ms) before auto-submitting speech

        this.silenceTimer = null;
        this.speechDetectedInSession = false;
        this.lastTranscript = '';
        this.recognition = null;

        // Callbacks
        this.onStateChange = null;
        this.onSpeechSubmitted = null;
        this.onBargeIn = null;
        this.onTranscriptUpdate = null;
    }

    // Initialize Web Audio Context and Microphone Stream
    async startVoiceMode(onStateChange, onSpeechSubmitted, onBargeIn, onTranscriptUpdate, recognitionLang) {
        this.onStateChange = onStateChange;
        this.onSpeechSubmitted = onSpeechSubmitted;
        this.onBargeIn = onBargeIn;
        this.onTranscriptUpdate = onTranscriptUpdate;
        this.recognitionLang = recognitionLang || 'en-US';

        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioCtx.createMediaStreamSource(this.micStream);
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 512;
            source.connect(this.analyser);

            this.initSpeechRecognition();
            this.setState('LISTENING');
            this.startVadAnalysis();
            return true;
        } catch (err) {
            console.error('[VoiceAgent] Microphone access denied or audio initialization failed:', err);
            this.setState('IDLE');
            throw err;
        }
    }

    stopVoiceMode() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }

        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) { /* ignore */ }
            this.recognition = null;
        }

        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }

        if (this.audioCtx) {
            try { this.audioCtx.close(); } catch (e) { /* ignore */ }
            this.audioCtx = null;
        }

        this.setState('IDLE');
    }

    setState(newState) {
        if (this.state === newState) return;
        console.log(`[VoiceAgent] State Transition: ${this.state} -> ${newState}`);
        this.state = newState;

        if (newState === 'LISTENING') {
            this.speechDetectedInSession = false;
            this.lastTranscript = '';
            if (this.onTranscriptUpdate) {
                this.onTranscriptUpdate('');
            }
            this.restartRecognition();
        }

        if (this.onStateChange) {
            this.onStateChange(this.state);
        }
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('[VoiceAgent] Web SpeechRecognition API is not supported in this browser.');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.recognitionLang;

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const currentText = (finalTranscript || interimTranscript).trim();
            if (currentText) {
                this.lastTranscript = currentText;
                if (this.onTranscriptUpdate) {
                    this.onTranscriptUpdate(currentText);
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.warn('[VoiceAgent] SpeechRecognition error:', event.error);
        };

        this.recognition.onend = () => {
            // Auto-restart speech recognition if still in LISTENING mode.
            // Small delay avoids hammering the backend with immediate reconnects,
            // which some browsers reject with a spurious "network" error.
            if (this.state === 'LISTENING' && this.recognition) {
                setTimeout(() => {
                    if (this.state === 'LISTENING' && this.recognition) {
                        try {
                            this.recognition.start();
                        } catch (e) { /* ignore if already active */ }
                    }
                }, 300);
            }
        };
    }

    restartRecognition() {
        if (!this.recognition) return;
        try {
            this.recognition.stop();
        } catch (e) { /* ignore */ }

        setTimeout(() => {
            if (this.state === 'LISTENING' && this.recognition) {
                try {
                    this.recognition.start();
                } catch (e) { /* ignore */ }
            }
        }, 150);
    }

    // Continuous VAD Energy Loop
    startVadAnalysis() {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);

        const analyze = () => {
            if (this.state === 'IDLE' || !this.analyser) return;

            this.analyser.getFloatTimeDomainData(dataArray);

            // Compute Root Mean Square (RMS) volume level
            let sumSq = 0;
            for (let i = 0; i < bufferLength; i++) {
                sumSq += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sumSq / bufferLength);

            this.handleVadVolume(rms);

            this.animFrameId = requestAnimationFrame(analyze);
        };

        analyze();
    }

    handleVadVolume(rms) {
        // 1. Check for Barge-In (Interrupt AI speech)
        if (this.state === 'SPEAKING' || this.state === 'THINKING') {
            if (rms > this.speechStartThreshold) {
                console.log('[VoiceAgent] Barge-In detected! User interrupted AI speech.');
                if (this.onBargeIn) {
                    this.onBargeIn();
                }
                this.setState('LISTENING');
            }
            return;
        }

        // 2. Listening mode: detect speech onset vs silence completion
        if (this.state === 'LISTENING') {
            if (rms > this.speechStartThreshold) {
                this.speechDetectedInSession = true;

                // Reset silence countdown timer
                if (this.silenceTimer) {
                    clearTimeout(this.silenceTimer);
                    this.silenceTimer = null;
                }
            } else if (this.speechDetectedInSession && rms < this.silenceThreshold) {
                // User was speaking and is now silent — start auto-submit timer
                if (!this.silenceTimer) {
                    this.silenceTimer = setTimeout(() => {
                        this.triggerAutoSubmit();
                    }, this.silenceTimeoutMs);
                }
            }
        }
    }

    triggerAutoSubmit() {
        if (this.state !== 'LISTENING') return;

        const textToSubmit = this.lastTranscript.trim();
        console.log('[VoiceAgent] VAD Silence timeout reached. Final transcript:', textToSubmit);

        if (textToSubmit && this.onSpeechSubmitted) {
            this.setState('THINKING');
            if (this.recognition) {
                try { this.recognition.stop(); } catch (e) { /* ignore */ }
            }
            this.onSpeechSubmitted(textToSubmit);
        } else {
            // Reset speech detection flag if no transcript was captured
            this.speechDetectedInSession = false;
        }

        this.silenceTimer = null;
    }

    // Called by app.js when AI begins speaking response via TTS
    notifyAISpeakingStart() {
        if (this.state !== 'IDLE') {
            this.setState('SPEAKING');
        }
    }

    // Called by app.js when AI finishes speaking response via TTS
    notifyAISpeakingEnd() {
        if (this.state !== 'IDLE') {
            this.setState('LISTENING');
        }
    }
}

export const voiceAgent = new VoiceAgentEngine();
