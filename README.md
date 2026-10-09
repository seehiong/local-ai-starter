# Local AI Starter 🚀

[🔗 **Live Demo Link (GitHub Pages)**](https://seehiong.github.io/local-ai-starter/)

A zero-backend, 100% client-side, and offline-first starter template for building and deploying your own browser-based AI assistant. Powered by **WebGPU** and **Google LiteRT-LM**, it runs open models directly on the client. Fork, customize, and deploy to GitHub Pages in 5 minutes!

---

## 🌟 Key Features

* **Zero-Backend (GitHub Pages Friendly)**: Fully serverless. Host it free on GitHub Pages, Cloudflare Pages, or Netlify with zero setup.
* **Config-Only Customization (`config.json`)**: Customize the app name, default model, color themes, logo SVG, language options, and quick-action prompt buttons in a single configuration file. No JavaScript coding required!
* **Modular Persona Library**: Easily add or modify personas by editing JSON files in the `personas/` directory (comes preloaded with Coding Helper, Travel Guide, Language Tutor, Interviewer, and Math Tutor).
* **Multi-Language Support**: Preconfigured for English, Chinese (中文), Japanese (日本語), Korean (한국어), Tamil (தமிழ்), and Malay (Bahasa Melayu). Persona instructions automatically switch prompts to target strict output matching.
* **Text-to-Speech (TTS) & Voice Engines**:
  * Dual TTS Engine support: Browser SpeechSynthesis & **Fish Audio Cloud API** (featuring developer promo model `s2.1-pro-free`).
  * Multilingual speech synthesis with a sentence-splitting queue to avoid timeout bugs.
  * Self-healing local voice fallback if online voices or cloud APIs fail.
  * Real-time microphone input matching the active dialect.
* **Prompt Templates (Quick Actions)**: Clean buttons (Explain, Summarize, Correct, Quiz) to quickly run actions on text.
* **Chat Export Utility**: Easily export conversations to Markdown (`.md`), Text (`.txt`), or JSON (`.json`) with one click.
* **Progressive Web App (PWA)**: Desktop/mobile installable and operates fully offline after the first model caching load.

---

## 🚀 Quick Start in 5 Minutes (GitHub Pages)

### 1. Fork this Repository
Click the **"Fork"** button at the top right of this repository to create a copy in your own GitHub account.

### 2. Customize your AI (Optional)
Clone your fork locally, or edit the files directly on GitHub:
* **Change App Name, Theme, and Models**: Edit [`config.json`](./config.json) to set your app title, brand color codes, default model, and prompt templates.
* **Customize Personas**: Edit or add files in the [`personas/`](./personas/) folder to teach your assistant new roles or custom instructions.
* **Customize Logo**: Overwrite [`logo.svg`](./logo.svg) with your own vector design.

### 3. Deploy to GitHub Pages
1. Go to your forked repository's **Settings** on GitHub.
2. Select **Pages** on the left menu.
3. Under **Build and deployment**, set the source to **"Deploy from a branch"**.
4. Select the `main` branch and `/ (root)` folder, then click **Save**.
5. Wait 1–2 minutes, and your custom AI will be live at `https://<your-username>.github.io/<your-repo-name>/`!

---

## 📂 Project Structure

This template is kept intentionally clean, lightweight, and build-tool free:
```
├── index.html          # Dynamic application layout shell
├── style.css           # Glassmorphic UI styles powered by CSS theme variables
├── app.js              # Core LiteRT-LM, voice synthesis, export, and PWA registration logic
├── voice-agent.js      # Hands-free Voice Activity Detection (VAD) & barge-in engine
├── db.js               # Client-side IndexedDB storage (sessions, messages, memories)
├── server.js           # Zero-dependency local Node server with built-in Fish Audio CORS proxy
├── package.json        # Node.js start script configuration + dev dependencies
├── eslint.config.js    # ESLint flat config (lint + complexity checks)
├── config.json         # Central configuration for names, themes, and prompt templates
├── manifest.json       # Web App Manifest for PWA installability
├── sw.js               # Service Worker for offline static asset caching
├── logo.svg            # Central brand vector graphic
├── .github/workflows/  # CI: lint check on push/PR
├── docs/               # Developer guides (e.g. mobile device testing)
└── personas/           # External persona definitions
    ├── assistant.json
    ├── coding-helper.json
    ├── interviewer.json
    ├── language-tutor.json
    ├── math-tutor.json
    └── travel-guide.json
```

---

## 🛠️ How to Run and Test Locally

Because browsers enforce security restrictions on Web Workers and cross-origin fetch requests, you can run the project using the built-in local server:

### Option 1: Node.js (Recommended Zero-CORS Setup)
Open a terminal in the project directory and run:
```bash
npm start
```
*(or `node server.js`)*

This starts a lightweight Node server at `http://localhost:3000` with a built-in server-to-server proxy for Fish Audio TTS, completely bypassing browser CORS preflight blocks.

### Option 2: Live Server (VS Code) or `npx serve`
```bash
npx serve .
```
Open `http://localhost:3000` in your browser. (If using Fish Audio TTS under static servers, enable a browser CORS extension like "Allow CORS" or configure a CORS proxy in settings).

> **Note on Virtual Networks & Local IP**: If `npx serve .` shows a virtual adapter IP (like `192.168.56.1`), run `npx serve . -l tcp://0.0.0.0:3000` to bind to all local network interfaces.

> **Testing on your phone?** The easiest way is to deploy to GitHub Pages (free HTTPS). To test a *local* dev server from a phone or local network, see [docs/MOBILE-TESTING.md](./docs/MOBILE-TESTING.md) for HTTPS tunneling instructions (required for WebGPU and Microphone access).

---

## 🧹 Linting

The project uses [ESLint](https://eslint.org/) (flat config, [`eslint.config.js`](./eslint.config.js)) to catch bugs and flag overly complex functions. Run it locally with:
```bash
npm install
npm run lint
```
Every push and pull request to `main` also runs this via [GitHub Actions](./.github/workflows/lint.yml).

---

## 📱 Mobile Support Notes

* On phones, the app auto-selects the smallest model and hides larger ones (memory limits).
* Devices/browsers without WebGPU show a clear "not supported" notice instead of a failing download.
* iOS Safari limits browser storage and evicts it after 7 days of inactivity, so the model may re-download on iPhone — install the PWA (Share → Add to Home Screen) for reliable caching.

---

## 🧠 Supported Models

The starter kit runs WebGPU-optimized LiteRT-LM models hosted in the [Web LLM Models collection](https://huggingface.co/collections/litert-community/web-llm-models). The default configuration includes:
* **Gemma 4 E2B IT (Web-Optimized)**: Google's lightweight open model (~1.2 GB weights) designed for fast, browser-based GPU execution.
* **Gemma 4 E4B IT (Web-Optimized)**: A slightly larger version (~2.4 GB weights) offering higher quality generation on devices with capable GPUs.

To add other models from the Web LLM Models collection, append their Hugging Face URL endpoints to the `models` array in `config.json`.

---

## 🔊 Text-to-Speech (TTS) & Fish Audio Integration

The application supports two speech synthesis engines selectable under **Speech Voice**:
1. **Browser SpeechSynthesis**: Built-in browser voices (Google Neural, Microsoft Azure Online, Apple Siri, and offline OS system voices).
2. **Fish Audio Cloud API**: High-quality cloud neural TTS with default support for the developer promo model `s2.1-pro-free`.
   * **API Key input**: Paste your Fish API key with an optional **👁️** show/hide toggle.
   * **Automatic storage**: Settings are saved locally in `localStorage`.
   * **Self-healing fallback**: If a cloud TTS request encounters network or API issues, the app gracefully falls back to browser voice playback.

> ⚠️ **Fish Audio only works via `npm start`**: `api.fish.audio` does not send CORS headers for browser origins, so a direct browser request to it is always blocked — except through [`server.js`](./server.js), which proxies the request same-origin when you run `npm start` locally. **On GitHub Pages (or any static hosting) there is no server to proxy the request, so Fish Audio TTS is not available** — the app automatically and silently falls back to your browser's built-in `SpeechSynthesis` voice instead. There is intentionally no public-CORS-proxy workaround for this, since routing your API key and message text through a third-party relay would break the app's zero-leakage privacy guarantee. If you want Fish Audio on a public deployment, self-host your own proxy (e.g. a Cloudflare Worker mirroring `server.js`'s `/api/fish-tts` logic) and adapt `app.js` to call it.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
