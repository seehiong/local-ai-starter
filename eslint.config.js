import js from '@eslint/js';

const browserGlobals = {
    window: 'readonly', document: 'readonly', navigator: 'readonly',
    console: 'readonly', localStorage: 'readonly', sessionStorage: 'readonly',
    indexedDB: 'readonly', IDBKeyRange: 'readonly',
    fetch: 'readonly', caches: 'readonly', Worker: 'readonly',
    requestAnimationFrame: 'readonly', cancelAnimationFrame: 'readonly',
    setTimeout: 'readonly', clearTimeout: 'readonly',
    setInterval: 'readonly', clearInterval: 'readonly',
    Audio: 'readonly', URL: 'readonly', URLSearchParams: 'readonly',
    Blob: 'readonly', FileReader: 'readonly', Response: 'readonly',
    SpeechSynthesisUtterance: 'readonly',
    AudioContext: 'readonly', webkitAudioContext: 'readonly',
    SpeechRecognition: 'readonly', webkitSpeechRecognition: 'readonly',
    self: 'readonly', location: 'readonly',
    prompt: 'readonly', confirm: 'readonly', alert: 'readonly',
};

const nodeGlobals = {
    process: 'readonly', Buffer: 'readonly',
    __dirname: 'readonly', __filename: 'readonly',
    console: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly',
    URL: 'readonly',
};

const serviceWorkerGlobals = {
    self: 'readonly', caches: 'readonly', fetch: 'readonly',
    console: 'readonly', URL: 'readonly', Promise: 'readonly',
};

export default [
    js.configs.recommended,
    {
        files: ['app.js', 'voice-agent.js', 'db.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: browserGlobals,
        },
        rules: {
            complexity: ['warn', 15],
            'max-lines-per-function': ['warn', 80],
            'max-depth': ['warn', 4],
            'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
        },
    },
    {
        files: ['server.js', 'eslint.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: nodeGlobals,
        },
    },
    {
        files: ['sw.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: serviceWorkerGlobals,
        },
    },
];
