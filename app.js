// app.js

import { Engine } from 'https://cdn.jsdelivr.net/npm/@litert-lm/core/+esm';
import { db } from './db.js';
import { voiceAgent } from './voice-agent.js';

// Keep in sync with package.json's "version" — lets testers confirm which build a device is running
console.log('[Local AI Starter] app.js build v1.0.1');

// UI Translations Dictionary for App Interface
const i18n = {
    en: {
        'brand-title': 'Local AI Starter',
        'hw-accel': 'Hardware Acceleration',
        'checking-webgpu': 'Checking WebGPU...',
        'model-config': 'Model Settings',
        'model-version': 'Model Version',
        'sys-settings': 'System Prompt',
        'audio-voice': 'Speech Voice',
        'voice-warning-text': '⚠️ Note: Online/Cloud voices require internet access and may occasionally time out.',
        'model-load-panel': 'Model Ingestion',
        'btn-load': 'Download Model',
        'btn-load-cached': 'Load Model (Cached)',
        'progress-wait': 'Waiting to load...',
        'header-model-name': 'LiteRT Engine (Local)',
        'header-model-status': 'Data stays 100% private and offline',
        'btn-reset': 'Reset Chat',
        'btn-speak-on': '🔊 Auto-Read: On',
        'btn-speak-off': '🔇 Auto-Read: Off',
        'input-placeholder': 'Type what you want to say...',
        'stat-speed': 'Speed:',
        'stat-time': 'Latency:',
        'footer-powered': 'Powered by Google LiteRT-LM & WebGPU',
        'welcome-message': 'Welcome! I am your browser-based private AI. Please load a model on the left to start chatting.',
        'reset-welcome': 'Chat history cleared. We can start fresh now.',
        'webgpu-available': 'WebGPU Active',
        'webgpu-unsupported': 'WebGPU Unsupported (Use Chrome/Edge)',
        'user-avatar': 'Me',
        'assistant-avatar': 'AI',
        'model-ready': 'Model Ready',
        'status-loading-db': 'Loading model from local browser cache...',
        'status-downloading': 'Downloading model weights from Hugging Face...',
        'status-compiling': 'Compiling WebGPU pipeline (loading into GPU)...',
        'status-ready': 'WebGPU pipeline ready and active!',
        'status-thinking': 'Thinking...',
        'direct-cache': 'Loaded from browser cache',
        'status-init': 'Initializing download...',
        'status-reset-done': 'Conversation history reset.',
        'error-file-protocol': 'Security Error: Modern browsers restrict running fetch requests under the file:// protocol. Please run this project via a local web server (e.g. VS Code Live Server or "npx serve .").',
        'warning-no-webgpu': '⚠️ Warning: WebGPU is disabled or unsupported. On-device inference requires WebGPU.',
        'status-ready-to-chat': 'Ready to chat',
        'persona-selection': 'Assistant Persona',
        'offline-app': 'Offline Application',
        'btn-install': 'Install to Desktop',
        'btn-export': 'Export',
        'chat-history': 'Conversations',
        'btn-new-chat': 'New Chat',
        'btn-memory': 'Memory',
        'btn-voice-mode': 'Voice Mode',
        'memory-intro': 'Facts and preferences saved here are automatically injected into the AI system prompt across all chat sessions.',
        'warning-cache-quota': '⚠️ Storage quota exceeded. The model was loaded but could not be cached locally. Next time, it will download again. Try freeing up device space.',
        'error-tts-coep': 'Speech synthesis failed. Cloud neural voices are blocked by security headers (COEP). Automatically falling back to an equivalent local offline voice.',
        'warning-mobile-model': '📱 Mobile device detected — the smallest model has been auto-selected. Larger models are hidden as they exceed typical phone memory.',
        'error-device-unsupported': '❌ This browser/device cannot run on-device AI: WebGPU is unavailable. This is a hardware/browser limitation, not an app bug. Try Chrome/Edge on desktop, Chrome on a recent Android phone, or Safari on iOS 26+.',
        'warning-no-cache-storage': '⚠️ Not enough browser storage to save the model on this device. It can still run now, but it will re-download on every visit — this is a device storage limitation, not a bug. Free up space or install the app (PWA) to enable caching.',
        'warning-storage-blocked': '⚠️ Browser storage is blocked (Private Browsing tab, or a non-trusted HTTPS certificate). The model cannot be saved, and large downloads may crash this tab. Open the app in a normal tab via a trusted HTTPS address (e.g. the deployed GitHub Pages URL), then retry.',
        'warning-load-interrupted': '⚠️ The previous model load did not finish — the page reloaded itself mid-way, which usually means the device ran out of memory. You may retry once; if it happens again, this device likely cannot handle this model.',
        'error-load-crash-loop': '❌ Loading this model has crashed the page twice on this device. This device/browser most likely cannot handle a model of this size — a hardware limitation, not a bug. Please try a desktop browser instead.',
        'error-device-incompatible': '❌ Not compatible: the model downloaded fully, but this device could not keep it — the page crashed before the model could be saved or compiled (insufficient memory). To avoid wasting your data with repeated downloads, loading is disabled on this device. Please use the desktop version instead.',
        'lbl-tts-engine': 'TTS Engine',
        'tts-engine-browser': 'Browser SpeechSynthesis (Local)',
        'tts-engine-fish': 'Fish Audio API (Free s2.1-pro)',
        'lbl-fish-api-key': 'Fish Audio API Key',
        'lbl-fish-model': 'Model Header',
        'lbl-fish-ref-id': 'Reference Voice ID (Optional)',
        'free-promo-badge': '🎉 Free API',
        'error-fish-api-key-missing': 'Please enter your Fish Audio API Key in the Voice settings card.',
        'error-fish-tts-failed': 'Fish Audio TTS request failed. Falling back to browser voice.',
        'fish-local-only-notice': '⚠️ Fish Audio cloud TTS only works when running this app via "npm start" (local server). On GitHub Pages or other static hosting, it will fall back to your browser\'s built-in voice.',
        'tts-last-used-idle': 'Last spoken: —',
        'persona-customization': 'Persona Customization'
    },
    zh: {
        'brand-title': '本地 AI 启动器',
        'hw-accel': '硬件加速状态',
        'checking-webgpu': '正在检查 WebGPU...',
        'model-config': '模型配置',
        'model-version': '模型版本',
        'sys-settings': '系统设定 (角色偏好)',
        'audio-voice': '朗读声音',
        'voice-warning-text': '⚠️ 提示：云端在线声音需要连接网络，网络不佳时可能会有延迟。',
        'model-load-panel': '大模型加载',
        'btn-load': '下载模型',
        'btn-load-cached': '加载模型 (已本地缓存)',
        'progress-wait': '等待加载...',
        'header-model-name': 'Gemma Web (本地运行)',
        'header-model-status': '数据不上传，完全本地隐私保护',
        'btn-reset': '重置对话',
        'btn-memory': '记忆',
        'btn-voice-mode': '语音模式',
        'btn-speak-on': '🔊 自动朗读: 开',
        'btn-speak-off': '🔇 自动朗读: 关',
        'input-placeholder': '输入你想说的话...',
        'stat-speed': '生成速度:',
        'stat-time': '处理时间:',
        'footer-powered': '基于 Google LiteRT-LM & WebGPU 驱动',
        'welcome-message': '你好！我是你的本地 AI 助手。请先在左侧点击“加载模型”。模型加载完成后，我们就可以开始聊天啦！',
        'reset-welcome': '你好！对话历史已清空，我们可以重新开始聊天了。',
        'webgpu-available': 'WebGPU 已启用',
        'webgpu-unsupported': 'WebGPU 未启用 (推荐 Chrome/Edge)',
        'user-avatar': '我',
        'assistant-avatar': '助',
        'model-ready': '模型就绪',
        'status-loading-db': '正在从本地浏览器缓存加载模型...',
        'status-downloading': '正在从 Hugging Face 下载模型...',
        'status-compiling': '正在编译 model (载入 GPU)...',
        'status-ready': '模型加载完成，WebGPU 管道就绪！',
        'status-thinking': '思考中...',
        'direct-cache': '直接从本地缓存加载',
        'status-init': '初始化模型下载...',
        'status-reset-done': '对话历史已重置。',
        'error-file-protocol': '安全错误：现代浏览器出于安全策略，禁止在本地 file:// 协议下发起数据获取 (fetch)。请使用本地 Web 服务器（如 VS Code 插件 Live Server 或命令行运行 "npx serve ."）启动此项目。',
        'warning-no-webgpu': '⚠️ 警告：您的浏览器或硬件不支持 WebGPU。LiteRT-LM 需要 WebGPU 才能运行本地大模型推理。',
        'status-ready-to-chat': '可以开始聊天了',
        'persona-selection': '选择助手角色',
        'offline-app': '离线应用',
        'btn-install': '安装到桌面',
        'btn-export': '导出',
        'warning-cache-quota': '⚠️ 浏览器存储空间不足，模型无法保存到本地。下一次使用时需要重新下载。请尝试清理手机存储空间。',
        'error-tts-coep': '语音朗读失败。云端在线声音已被安全策略 (COEP) 拦截，系统已自动切换为同性别的本地离线声音。',
        'warning-mobile-model': '📱 检测到移动设备 — 已自动选择最小的模型。较大的模型超出一般手机内存，已被隐藏。',
        'error-device-unsupported': '❌ 此浏览器/设备无法运行本地 AI：WebGPU 不可用。这是硬件/浏览器的限制，并非应用故障。请使用桌面版 Chrome/Edge、较新的 Android 手机上的 Chrome，或 iOS 26+ 的 Safari。',
        'warning-no-cache-storage': '⚠️ 浏览器存储空间不足，无法在本设备上保存模型。现在仍可运行，但每次访问都需要重新下载 — 这是设备存储限制，不是应用故障。请清理空间或安装此应用 (PWA) 以启用缓存。',
        'warning-storage-blocked': '⚠️ 浏览器存储被禁用（无痕/私密浏览标签页，或不受信任的 HTTPS 证书）。模型无法保存，大文件下载可能导致页面崩溃。请在普通标签页中通过受信任的 HTTPS 地址（如已部署的 GitHub Pages 网址）打开后重试。',
        'warning-load-interrupted': '⚠️ 上次模型加载未完成 — 页面中途自动刷新，通常表示设备内存不足。您可以再试一次；如果再次发生，说明此设备可能无法运行该模型。',
        'error-load-crash-loop': '❌ 加载此模型已导致页面两次崩溃。此设备/浏览器很可能无法承载此规模的模型 — 这是硬件限制，不是应用故障。请改用桌面浏览器。',
        'error-device-incompatible': '❌ 不兼容：模型已完整下载，但设备无法保存 — 页面在模型保存/编译前崩溃（内存不足）。为避免反复下载浪费流量，此设备已禁用模型加载。请改用桌面版。',
        'lbl-tts-engine': 'TTS 引擎',
        'tts-engine-browser': '浏览器内置声音 (本地)',
        'tts-engine-fish': 'Fish Audio 云端 API (免费 s2.1-pro)',
        'lbl-fish-api-key': 'Fish Audio API 密钥',
        'lbl-fish-model': 'Model 请求头',
        'lbl-fish-ref-id': '参考声音 ID (可选)',
        'free-promo-badge': '🎉 开发者限免',
        'error-fish-api-key-missing': '请先在右侧“朗读声音”卡片中填写 Fish Audio API 密钥。',
        'error-fish-tts-failed': 'Fish Audio TTS 转换失败，已自动切换为浏览器本地声音。',
        'fish-local-only-notice': '⚠️ Fish Audio 云端语音仅在通过 "npm start"（本地服务器）运行本应用时可用。在 GitHub Pages 或其他静态托管环境下，将自动回退为浏览器内置声音。',
        'chat-history': '对话历史',
        'btn-new-chat': '新建对话',
        'memory-intro': '此处保存的事实与偏好将自动注入到所有对话的系统提示词中。',
        'tts-last-used-idle': '上次朗读：—',
        'persona-customization': '角色自定义'
    },
    ja: {
        'brand-title': 'ローカル AI スターター',
        'hw-accel': 'ハードウェアアクセラレーション',
        'checking-webgpu': 'WebGPU を確認中...',
        'model-config': 'モデル設定',
        'model-version': 'モデルバージョン',
        'sys-settings': 'システム設定 (キャラクター)',
        'audio-voice': '読み上げ音声',
        'voice-warning-text': '⚠️ 注意：オンライン音声はインターネット接続が必要で、タイムアウトすることがあります。',
        'model-load-panel': 'モデルの読み込み',
        'btn-load': 'モデルをダウンロード',
        'btn-load-cached': 'モデルを読み込む (キャッシュ)',
        'progress-wait': '読み込み待機中...',
        'header-model-name': 'Gemma Web (ローカル実行)',
        'header-model-status': 'データ送信なし、100%ローカルなプライバシー保護',
        'btn-reset': '会話をリセット',
        'btn-memory': '記憶',
        'btn-voice-mode': '音声モード',
        'btn-speak-on': '🔊 自動読み上げ: オン',
        'btn-speak-off': '🔇 自動読み上げ: オフ',
        'input-placeholder': 'メッセージを入力してください...',
        'stat-speed': '速度:',
        'stat-time': '遅延時間:',
        'footer-powered': 'Google LiteRT-LM & WebGPU 駆動',
        'welcome-message': 'こんにちは！私はあなたのローカル AI アシスタントです。まず左パネルの「モデルを読み込む」をクリックしてください。読み込みが完了したら、チャットを開始できます！',
        'reset-welcome': '会話履歴がリセットされました。チャットを再開できます。',
        'webgpu-available': 'WebGPU 利用可能',
        'webgpu-unsupported': 'WebGPU 非対応 (Chrome/Edge推奨)',
        'user-avatar': '私',
        'assistant-avatar': 'アシ',
        'model-ready': 'モデル準備完了',
        'status-loading-db': 'ローカルブラウザキャッシュからモデルを読み込んでいます...',
        'status-downloading': 'Hugging Face からモデルをダウンロードしています...',
        'status-compiling': 'モデルをコンパイルしています (GPUにロード中)...',
        'status-ready': 'モデルがロードされ、WebGPUパイプラインの準備が完了しました！',
        'status-thinking': '思考中...',
        'direct-cache': 'ブラウザキャッシュから直接ロード',
        'status-init': 'モデルダウンロードを初期化中...',
        'status-reset-done': '会話履歴がリセットされました。',
        'error-file-protocol': 'セキュリティエラー：最新のブラウザはセキュリティポリシーにより、file:// プロトコル下でのウェブ要求 (fetch) を制限しています。ローカルウェブサーバー（VS CodeのLive Serverなど）を使用してください。',
        'warning-no-webgpu': '⚠️ 警告：お使いのブラウザまたはハードウェアは WebGPU をサポートしていません。オンデバイス推論を実行するには WebGPU が必要です。',
        'status-ready-to-chat': 'チャット可能です',
        'persona-selection': 'キャラクターの選択',
        'offline-app': 'オフラインアプリ',
        'btn-install': 'デスクトップにインストール',
        'btn-export': 'エクスポート',
        'warning-cache-quota': '⚠️ ブラウザのストレージ容量が不足しているため、モデルをローカルにキャッシュできませんでした。次回は再ダウンロードが必要です。ストレージ空き容量を増やしてください。',
        'error-tts-coep': '音声合成に失敗しました。セキュリティヘッダー (COEP) によりオンライン音声がブロックされています。自動的にローカルのオフライン音声にフォールバックします。',
        'warning-mobile-model': '📱 モバイル端末を検出 — 最小のモデルを自動選択しました。大きいモデルはスマートフォンのメモリを超えるため非表示になっています。',
        'error-device-unsupported': '❌ このブラウザ/端末ではオンデバイス AI を実行できません：WebGPU が利用できません。これはアプリの不具合ではなく、ハードウェア/ブラウザの制限です。デスクトップの Chrome/Edge、新しい Android の Chrome、または iOS 26+ の Safari をお試しください。',
        'warning-no-cache-storage': '⚠️ ブラウザのストレージ不足のため、モデルをこの端末に保存できません。今回は実行できますが、アクセスのたびに再ダウンロードが必要です — これは不具合ではなく端末のストレージ制限です。空き容量を確保するか、アプリ (PWA) をインストールしてください。',
        'warning-storage-blocked': '⚠️ ブラウザのストレージがブロックされています（プライベートブラウズ、または信頼されていない HTTPS 証明書）。モデルを保存できず、大きなダウンロードはタブがクラッシュする可能性があります。通常のタブで信頼された HTTPS アドレス（デプロイ済みの GitHub Pages URL など）から開き直してください。',
        'warning-load-interrupted': '⚠️ 前回のモデル読み込みが完了しませんでした — ページが途中で再読み込みされました。通常はメモリ不足が原因です。もう一度だけ再試行できますが、再発する場合はこの端末ではこのモデルを実行できない可能性が高いです。',
        'error-load-crash-loop': '❌ このモデルの読み込みで 2 回ページがクラッシュしました。この端末/ブラウザではこのサイズのモデルを扱えない可能性が高いです — これは不具合ではなくハードウェアの制限です。デスクトップブラウザをお試しください。',
        'error-device-incompatible': '❌ 非対応：モデルのダウンロードは完了しましたが、保存/コンパイル前にページがクラッシュしました（メモリ不足）。再ダウンロードによる通信量の浪費を防ぐため、この端末での読み込みを無効化しました。デスクトップ版をご利用ください。',
        'chat-history': '会話履歴',
        'btn-new-chat': '新しい会話',
        'memory-intro': 'ここに保存された事実や好みは、すべてのチャットセッションで AI のシステムプロンプトに自動的に反映されます。',
        'lbl-tts-engine': 'TTS エンジン',
        'tts-engine-browser': 'ブラウザ内蔵音声 (ローカル)',
        'tts-engine-fish': 'Fish Audio API (無料 s2.1-pro)',
        'lbl-fish-api-key': 'Fish Audio API キー',
        'lbl-fish-model': 'モデルヘッダー',
        'lbl-fish-ref-id': '参照音声 ID (任意)',
        'free-promo-badge': '🎉 無料 API',
        'error-fish-api-key-missing': '右側の「読み上げ音声」カードに Fish Audio API キーを入力してください。',
        'error-fish-tts-failed': 'Fish Audio TTS のリクエストに失敗しました。ブラウザ音声にフォールバックします。',
        'fish-local-only-notice': '⚠️ Fish Audio クラウド音声は、"npm start"（ローカルサーバー）でこのアプリを実行している場合のみ利用できます。GitHub Pages などの静的ホスティングでは、自動的にブラウザ内蔵音声にフォールバックします。',
        'tts-last-used-idle': '前回の読み上げ：—',
        'persona-customization': 'キャラクターのカスタマイズ'
    },
    ko: {
        'brand-title': '로컬 AI 스타터',
        'hw-accel': '하드웨어 가속 상태',
        'checking-webgpu': 'WebGPU 확인 중...',
        'model-config': '모델 설정',
        'model-version': '모델 버전',
        'sys-settings': '시스템 설정 (역할 설정)',
        'audio-voice': '음성 선택',
        'voice-warning-text': '⚠️ 알림: 온라인 음성은 인터넷 연결이 필요하며 때때로 시간 초과가 발생할 수 있습니다.',
        'model-load-panel': '모델 불러오기',
        'btn-load': '모델 다운로드',
        'btn-load-cached': '모델 로드 (로컬 캐시)',
        'progress-wait': '대기 중...',
        'header-model-name': 'Gemma Web (로컬 실행)',
        'header-model-status': '데이터 전송 없음, 100% 로컬 프라이버시 보호',
        'btn-reset': '대화 리셋',
        'btn-memory': '기억',
        'btn-voice-mode': '음성 모드',
        'btn-speak-on': '🔊 자동 음성: 켬',
        'btn-speak-off': '🔇 자동 음성: 끔',
        'input-placeholder': '메시지를 입력하세요...',
        'stat-speed': '속도:',
        'stat-time': '지연 시간:',
        'footer-powered': 'Google LiteRT-LM & WebGPU 구동',
        'welcome-message': '안녕하세요! 로컬 AI 스타터입니다. 먼저 왼쪽 패널에서 "모델 로드"를 클릭하여 대화를 시작해 주세요.',
        'reset-welcome': '대화 기록이 재설정되었습니다. 다시 대화를 시작할 수 있습니다.',
        'webgpu-available': 'WebGPU 사용 가능',
        'webgpu-unsupported': 'WebGPU 지원되지 않음 (Chrome/Edge 권장)',
        'user-avatar': '나',
        'assistant-avatar': '비서',
        'model-ready': '모델 준비 완료',
        'status-loading-db': '로컬 브라우저 캐시에서 모델을 불러오는 중...',
        'status-downloading': 'Hugging Face에서 모델 다운로드 중...',
        'status-compiling': '모델을 컴파일하는 중 (GPU 로드)...',
        'status-ready': '모델이 로드되었으며 WebGPU 파이프라인이 준비되었습니다!',
        'status-thinking': '생각 중...',
        'direct-cache': '브라우저 캐시에서 즉시 로드됨',
        'status-init': '모델 다운로드 초기화 중...',
        'status-reset-done': '대화 내역이 재설정되었습니다.',
        'error-file-protocol': '보안 오류: 브라우저 보안 정책에 따라 file:// 프로토콜에서는 데이터 요청(fetch)이 제한됩니다. VS Code의 Live Server나 "npx serve ." 등의 로컬 웹 서버를 사용해 실행해 주세요.',
        'warning-no-webgpu': '⚠️ 경고: 브라우저 또는 하드웨어가 WebGPU를 지원하지 않습니다. 로컬 실행을 위해 WebGPU가 필수적입니다.',
        'status-ready-to-chat': '대화할 준비가 되었습니다',
        'persona-selection': '비서 페르소나 선택',
        'offline-app': '오프라인 앱',
        'btn-install': '앱 설치하기',
        'btn-export': '내보내기',
        'warning-cache-quota': '⚠️ 브라우저 저장 공간이 부족하여 모델을 로컬에 저장하지 못했습니다. 다음 실행 시 다시 다운로드해야 합니다. 기기 저장 공간을 확보해 주세요.',
        'error-tts-coep': '음성 합성에 실패했습니다. 보안 헤더(COEP)로 인해 온라인 음성이 차단되었습니다. 자동으로 동일한 성별의 로컬 오프라인 음성으로 대체합니다.',
        'warning-mobile-model': '📱 모바일 기기 감지 — 가장 작은 모델이 자동 선택되었습니다. 큰 모델은 일반적인 휴대폰 메모리를 초과하므로 숨겨졌습니다.',
        'error-device-unsupported': '❌ 이 브라우저/기기에서는 온디바이스 AI를 실행할 수 없습니다: WebGPU를 사용할 수 없습니다. 이는 앱 버그가 아니라 하드웨어/브라우저 제한입니다. 데스크톱 Chrome/Edge, 최신 Android의 Chrome 또는 iOS 26+의 Safari를 사용해 주세요.',
        'warning-no-cache-storage': '⚠️ 브라우저 저장 공간이 부족하여 이 기기에 모델을 저장할 수 없습니다. 지금은 실행되지만 방문할 때마다 다시 다운로드해야 합니다 — 이는 버그가 아니라 기기 저장 공간 제한입니다. 공간을 확보하거나 앱(PWA)을 설치해 주세요.',
        'warning-storage-blocked': '⚠️ 브라우저 저장소가 차단되었습니다(사생활 보호 탭 또는 신뢰되지 않은 HTTPS 인증서). 모델을 저장할 수 없으며 대용량 다운로드 시 탭이 종료될 수 있습니다. 일반 탭에서 신뢰된 HTTPS 주소(배포된 GitHub Pages URL 등)로 열고 다시 시도해 주세요.',
        'warning-load-interrupted': '⚠️ 이전 모델 로드가 완료되지 않았습니다 — 페이지가 도중에 자동으로 새로고침되었으며, 보통 기기 메모리 부족이 원인입니다. 한 번 더 시도할 수 있지만, 반복되면 이 기기에서는 이 모델을 실행할 수 없을 가능성이 큽니다.',
        'error-load-crash-loop': '❌ 이 모델을 로드하는 동안 페이지가 두 번 종료되었습니다. 이 기기/브라우저는 이 크기의 모델을 처리할 수 없을 가능성이 높습니다 — 버그가 아니라 하드웨어 제한입니다. 데스크톱 브라우저를 이용해 주세요.',
        'error-device-incompatible': '❌ 호환되지 않음: 모델 다운로드는 완료되었지만 저장/컴파일 전에 페이지가 종료되었습니다(메모리 부족). 반복 다운로드로 인한 데이터 낭비를 막기 위해 이 기기에서는 로드가 비활성화되었습니다. 데스크톱 버전을 이용해 주세요.',
        'chat-history': '대화 기록',
        'btn-new-chat': '새 대화',
        'memory-intro': '여기에 저장된 사실과 선호도는 모든 채팅 세션에서 AI 시스템 프롬프트에 자동으로 반영됩니다.',
        'lbl-tts-engine': 'TTS 엔진',
        'tts-engine-browser': '브라우저 내장 음성 (로컬)',
        'tts-engine-fish': 'Fish Audio API (무료 s2.1-pro)',
        'lbl-fish-api-key': 'Fish Audio API 키',
        'lbl-fish-model': '모델 헤더',
        'lbl-fish-ref-id': '참조 음성 ID (선택 사항)',
        'free-promo-badge': '🎉 무료 API',
        'error-fish-api-key-missing': '오른쪽 "음성 선택" 카드에 Fish Audio API 키를 입력해 주세요.',
        'error-fish-tts-failed': 'Fish Audio TTS 요청에 실패했습니다. 브라우저 음성으로 대체합니다.',
        'fish-local-only-notice': '⚠️ Fish Audio 클라우드 음성은 "npm start"(로컬 서버)로 이 앱을 실행할 때만 작동합니다. GitHub Pages 등 정적 호스팅에서는 브라우저 내장 음성으로 자동 전환됩니다.',
        'tts-last-used-idle': '마지막 음성: —',
        'persona-customization': '페르소나 커스터마이징'
    },
    ta: {
        'brand-title': 'உள்ளூர் AI உதவியாளர்',
        'hw-accel': 'வன்பொருள் முடுக்கம்',
        'checking-webgpu': 'WebGPU சரிபார்க்கப்படுகிறது...',
        'model-config': 'மாதிரி அமைப்புகள்',
        'model-version': 'மாதிரி பதிப்பு',
        'sys-settings': 'அமைப்பு அமைப்புகள் (நபர்கள்)',
        'audio-voice': 'வாசிப்பு குரல்',
        'voice-warning-text': '⚠️ குறிப்பு: ஆன்லைன் குரல்களுக்கு இணையம் தேவை, சில நேரங்களில் காலாவதியாகலாம்.',
        'model-load-panel': 'மாதிரி ஏற்றப்படுகிறது',
        'btn-load': 'மாதிரியை பதிவிறக்கு',
        'btn-load-cached': 'கேச் மூலம் ஏற்று',
        'progress-wait': 'ஏற்ற காத்திருக்கிறது...',
        'header-model-name': 'Gemma Web (உள்ளூர் இயக்கம்)',
        'header-model-status': 'தரவு பதிவேற்றம் இல்லை, 100% உள்ளூர் தனியுரிமை பாதுகாப்பு',
        'btn-reset': 'உரையாடலை மீட்டமை',
        'btn-memory': 'நினைவகம்',
        'btn-voice-mode': 'குரல் பயன்முறை',
        'btn-speak-on': '🔊 தானியங்கி வாசிப்பு: ஆன்',
        'btn-speak-off': '🔇 தானியங்கி வாசிப்பு: ஆஃப்',
        'input-placeholder': 'உங்கள் செய்தியை உள்ளிடவும்...',
        'stat-speed': 'வேகம்:',
        'stat-time': 'தாமதம்:',
        'footer-powered': 'Google LiteRT-LM & WebGPU மூலம் இயக்கப்படுகிறது',
        'welcome-message': 'வணக்கம்! நான் உங்கள் உள்ளூர் AI உதவியாளர். முதலில் இடது பலகத்தில் "மாதிரியை ஏற்று" என்பதை கிளிக் செய்யவும். ஏற்றப்பட்டதும் உரையாடலைத் தொடங்கலாம்!',
        'reset-welcome': 'வணக்கம்! AI உதவியாளர். இப்போது உரையாடலை மீண்டும் தொடங்கலாம்.',
        'webgpu-available': 'WebGPU கிடைக்கிறது',
        'webgpu-unsupported': 'WebGPU ஆதரிக்கப்படவில்லை (Chrome/Edge பரிந்துரைக்கப்படுகிறது)',
        'user-avatar': 'நான்',
        'assistant-avatar': 'உத',
        'model-ready': 'மாதிரி தயார்',
        'status-loading-db': 'உள்ளூர் உலாவி கேச்சிலிருந்து மாதிரி ஏற்றப்படுகிறது...',
        'status-downloading': 'Hugging Face இலிருந்து மாதிரி பதிவிறக்கப்படுகிறது...',
        'status-compiling': 'மாதிரி கம்பைல் செய்யப்படுகிறது (GPU இல் ஏற்றப்படுகிறது)...',
        'status-ready': 'மாதிரி ஏற்றப்பட்டது மற்றும் WebGPU பைப்லைன் தயாராக உள்ளது!',
        'status-thinking': 'சிந்திக்கிறது...',
        'direct-cache': 'உலாவி கேச்சிலிருந்து நேரடியாக ஏற்றப்பட்டது',
        'status-init': 'மாதிரி பதிவிறக்கம் தொடங்குகிறது...',
        'status-reset-done': 'உரையாடல் வரலாறு மீட்டமைக்கப்பட்டது.',
        'error-file-protocol': 'பாதுகாப்பு பிழை: பாதுகாப்பு கொள்கைகள் காரணமாக file:// கீழ் இணைய கோரிக்கைகள் கட்டுப்படுத்தப்பட்டுள்ளன. Live Server போன்ற உள்ளூர் வெப் சர்வரைப் பயன்படுத்தவும்.',
        'warning-no-webgpu': '⚠️ எச்சரிக்கை: உங்கள் உலாவி WebGPU ஐ ஆதரிக்கவில்லை. LiteRT-LM க்கு WebGPU தேவை.',
        'status-ready-to-chat': 'பேச தயாராக உள்ளது',
        'persona-selection': 'உதவியாளர் பாத்திரம்',
        'offline-app': 'ஆஃப்லைன் பயன்பாடு',
        'btn-install': 'பயன்பாட்டை நிறுவு',
        'btn-export': 'ஏற்றுமதி',
        'warning-cache-quota': '⚠️ சேமிப்பு இடம் போதவில்லை. மாதிரி ஏற்றப்பட்டது ஆனால் சேமிக்கப்படவில்லை. அடுத்த முறை மீண்டும் பதிவிறக்க வேண்டும். சாதன இடத்தை விடுவிக்கவும்.',
        'error-tts-coep': 'குரல் தொகுப்பு தோல்வியடைந்தது. பாதுகாப்பு விதிகள் (COEP) காரணமாக ஆன்லைன் குரல் தடுக்கப்பட்டுள்ளது. ஆஃப்லைன் குரல் பயன்படுத்தப்பட்டது.',
        'warning-mobile-model': '📱 மொபைல் சாதனம் கண்டறியப்பட்டது — மிகச் சிறிய மாதிரி தானாகத் தேர்ந்தெடுக்கப்பட்டது. பெரிய மாதிரிகள் மொபைல் நினைவகத்தை மீறுவதால் மறைக்கப்பட்டுள்ளன.',
        'error-device-unsupported': '❌ இந்த உலாவி/சாதனத்தில் உள்ளூர் AI இயங்காது: WebGPU கிடைக்கவில்லை. இது பயன்பாட்டு பிழை அல்ல, வன்பொருள்/உலாவி வரம்பு. டெஸ்க்டாப் Chrome/Edge, புதிய Android Chrome அல்லது iOS 26+ Safari முயற்சிக்கவும்.',
        'warning-no-cache-storage': '⚠️ உலாவி சேமிப்பு இடம் போதாததால் மாதிரியை இந்த சாதனத்தில் சேமிக்க முடியாது. இப்போது இயங்கும், ஆனால் ஒவ்வொரு முறையும் மீண்டும் பதிவிறக்க வேண்டும் — இது பிழை அல்ல, சாதன சேமிப்பு வரம்பு. இடத்தை விடுவிக்கவும் அல்லது பயன்பாட்டை நிறுவவும்.',
        'warning-storage-blocked': '⚠️ உலாவி சேமிப்பு தடுக்கப்பட்டுள்ளது (தனியார் உலாவல் அல்லது நம்பத்தகாத HTTPS சான்றிதழ்). மாதிரியை சேமிக்க முடியாது, பெரிய பதிவிறக்கங்கள் தாவலை முடக்கலாம். சாதாரண தாவலில் நம்பகமான HTTPS முகவரியில் (GitHub Pages URL போன்று) திறந்து மீண்டும் முயற்சிக்கவும்.',
        'warning-load-interrupted': '⚠️ முந்தைய மாதிரி ஏற்றம் முடியவில்லை — பக்கம் இடையில் மீண்டும் ஏற்றப்பட்டது; பொதுவாக சாதன நினைவகம் போதாததே காரணம். இன்னொரு முறை முயற்சிக்கலாம்; மீண்டும் நடந்தால், இந்த சாதனத்தில் இந்த மாதிரி இயங்காது எனக் கருதலாம்.',
        'error-load-crash-loop': '❌ இந்த மாதிரியை ஏற்றும்போது பக்கம் இரண்டு முறை செயலிழந்தது. இந்த சாதனம்/உலாவி இந்த அளவு மாதிரியை கையாள முடியாது — இது பிழை அல்ல, வன்பொருள் வரம்பு. டெஸ்க்டாப் உலாவியை முயற்சிக்கவும்.',
        'error-device-incompatible': '❌ பொருந்தாது: மாதிரி முழுமையாக பதிவிறக்கப்பட்டது, ஆனால் சேமிப்பு/கம்பைல் முன் பக்கம் செயலிழந்தது (நினைவகம் போதாது). மீண்டும் மீண்டும் பதிவிறக்கி தரவு வீணாகாமல் இருக்க, இந்த சாதனத்தில் ஏற்றம் முடக்கப்பட்டது. டெஸ்க்டாப் பதிப்பை பயன்படுத்தவும்.',
        'chat-history': 'உரையாடல் வரலாறு',
        'btn-new-chat': 'புதிய உரையாடல்',
        'memory-intro': 'இங்கே சேமிக்கப்பட்ட தகவல்கள் மற்றும் விருப்பங்கள் அனைத்து உரையாடல்களிலும் AI அமைப்பு வழிகாட்டலில் தானாக சேர்க்கப்படும்.',
        'lbl-tts-engine': 'TTS இயந்திரம்',
        'tts-engine-browser': 'உலாவி உள்ளமைக்கப்பட்ட குரல் (உள்ளூர்)',
        'tts-engine-fish': 'Fish Audio API (இலவசம் s2.1-pro)',
        'lbl-fish-api-key': 'Fish Audio API விசை',
        'lbl-fish-model': 'மாடல் தலைப்பு',
        'lbl-fish-ref-id': 'குறிப்பு குரல் ID (விருப்பத்தேர்வு)',
        'free-promo-badge': '🎉 இலவச API',
        'error-fish-api-key-missing': 'வலது புற "குரல் அமைப்புகள்" அட்டையில் உங்கள் Fish Audio API விசையை உள்ளிடவும்.',
        'error-fish-tts-failed': 'Fish Audio TTS கோரிக்கை தோல்வியடைந்தது. உலாவி குரலுக்கு மாற்றப்படுகிறது.',
        'fish-local-only-notice': '⚠️ Fish Audio கிளவுட் குரல் "npm start" (உள்ளூர் சேவையகம்) மூலம் இந்த பயன்பாட்டை இயக்கும்போது மட்டுமே செயல்படும். GitHub Pages அல்லது பிற நிலையான வழங்கலில், தானாக உலாவியின் உள்ளமைக்கப்பட்ட குரலுக்கு மாறும்.',
        'tts-last-used-idle': 'கடைசியாக பேசியது: —',
        'persona-customization': 'நபர்பாவனை தனிப்பயனாக்கம்'
    },
    ms: {
        'brand-title': 'Pembantu AI Tempatan',
        'hw-accel': 'Pecutan Perkakasan',
        'checking-webgpu': 'Memeriksa WebGPU...',
        'model-config': 'Tetapan Model',
        'model-version': 'Versi Model',
        'sys-settings': 'Tetapan Sistem (Persona)',
        'audio-voice': 'Suara Bacaan',
        'voice-warning-text': '⚠️ Nota: Suara dalam talian memerlukan sambungan internet dan mungkin tamat masa.',
        'model-load-panel': 'Pemuatan Model',
        'btn-load': 'Muat Turun Model',
        'btn-load-cached': 'Muat dari Cache',
        'progress-wait': 'Menunggu untuk dimuat...',
        'header-model-name': 'Gemma Web (Larian Tempatan)',
        'header-model-status': 'Tiada data dimuat naik, 100% perlindungan privasi tempatan',
        'btn-reset': 'Set Semula Perbualan',
        'btn-memory': 'Memori',
        'btn-voice-mode': 'Mod Suara',
        'btn-speak-on': '🔊 Baca Automatik: Pasang',
        'btn-speak-off': '🔇 Baca Automatik: Tutup',
        'input-placeholder': 'Taip mesej anda...',
        'stat-speed': 'Kelajuan:',
        'stat-time': 'Kelewatan:',
        'footer-powered': 'Dikuasakan oleh Google LiteRT-LM & WebGPU',
        'welcome-message': 'Hello! Saya adalah pembantu AI tempatan anda. Sila klik "Muat Model" di panel kiri dahulu. Perbualan boleh dimulakan setelah model dimuat!',
        'reset-welcome': 'Hello! Saya adalah pembantu AI. Kita boleh mulakan semula perbualan sekarang.',
        'webgpu-available': 'WebGPU Tersedia',
        'webgpu-unsupported': 'WebGPU Tidak Disokong (Gunakan Chrome/Edge)',
        'user-avatar': 'Saya',
        'assistant-avatar': 'Pem',
        'model-ready': 'Model Sedia',
        'status-loading-db': 'Memuatkan model dari cache penyemak imbas tempatan...',
        'status-downloading': 'Memuat turun model dari Hugging Face...',
        'status-compiling': 'Menyusun model (Memuatkan ke dalam GPU)...',
        'status-ready': 'Model dimuat dan saluran WebGPU sedia!',
        'status-thinking': 'Berfikir...',
        'direct-cache': 'Dimuat terus dari cache penyemak imbas',
        'status-init': 'Memulakan muat turun model...',
        'status-reset-done': 'Sejarah perbualan telah diset semula.',
        'error-file-protocol': 'Ralat Keselamatan: Pelayar moden menyekat permintaan web (fetch) di bawah protokol file://. Sila gunakan pelayan web tempatan (seperti Live Server).',
        'warning-no-webgpu': '⚠️ Amaran: Pelayar atau perkakasan anda tidak menyokong WebGPU. LiteRT-LM memerlukan WebGPU untuk dijalankan.',
        'status-ready-to-chat': 'Sedia untuk berbual',
        'persona-selection': 'Pilih Persona Pembantu',
        'offline-app': 'Aplikasi Luar Talian',
        'btn-install': 'Pasang ke Desktop',
        'btn-export': 'Eksport',
        'warning-cache-quota': '⚠️ Ruang penyimpanan pelayar penuh. Model dimuatkan tetapi tidak dapat disimpan. Kali seterusnya ia perlu dimuat turun semula. Sila kosongkan ruang peranti.',
        'error-tts-coep': 'Sintesis suara gagal. Suara dalam talian disekat oleh keselamatan (COEP). Beralih kepada suara luar talian secara automatik.',
        'warning-mobile-model': '📱 Peranti mudah alih dikesan — model terkecil telah dipilih secara automatik. Model lebih besar disembunyikan kerana melebihi memori telefon biasa.',
        'error-device-unsupported': '❌ Pelayar/peranti ini tidak dapat menjalankan AI setempat: WebGPU tidak tersedia. Ini adalah had perkakasan/pelayar, bukan pepijat aplikasi. Cuba Chrome/Edge desktop, Chrome pada Android terkini, atau Safari pada iOS 26+.',
        'warning-no-cache-storage': '⚠️ Ruang storan pelayar tidak mencukupi untuk menyimpan model pada peranti ini. Ia masih boleh dijalankan sekarang, tetapi perlu dimuat turun semula setiap lawatan — ini adalah had storan peranti, bukan pepijat. Kosongkan ruang atau pasang aplikasi (PWA) untuk membolehkan cache.',
        'warning-storage-blocked': '⚠️ Storan pelayar disekat (tab Pelayaran Peribadi, atau sijil HTTPS yang tidak dipercayai). Model tidak dapat disimpan dan muat turun besar mungkin merosakkan tab ini. Buka aplikasi dalam tab biasa melalui alamat HTTPS yang dipercayai (cth. URL GitHub Pages), kemudian cuba semula.',
        'warning-load-interrupted': '⚠️ Pemuatan model sebelum ini tidak selesai — halaman dimuat semula di tengah jalan, biasanya kerana peranti kehabisan memori. Anda boleh cuba sekali lagi; jika berulang, peranti ini berkemungkinan tidak mampu menjalankan model ini.',
        'error-load-crash-loop': '❌ Memuatkan model ini telah merosakkan halaman dua kali pada peranti ini. Peranti/pelayar ini berkemungkinan besar tidak mampu mengendalikan model sebesar ini — had perkakasan, bukan pepijat. Sila cuba pelayar desktop.',
        'error-device-incompatible': '❌ Tidak serasi: model telah dimuat turun sepenuhnya, tetapi halaman ranap sebelum model dapat disimpan/disusun (memori tidak mencukupi). Untuk mengelakkan pembaziran data dengan muat turun berulang, pemuatan dilumpuhkan pada peranti ini. Sila gunakan versi desktop.',
        'chat-history': 'Sejarah Perbualan',
        'btn-new-chat': 'Perbualan Baharu',
        'memory-intro': 'Fakta dan keutamaan yang disimpan di sini akan disuntik secara automatik ke dalam gesaan sistem AI merentasi semua sesi perbualan.',
        'lbl-tts-engine': 'Enjin TTS',
        'tts-engine-browser': 'Suara Terbina Dalam Pelayar (Setempat)',
        'tts-engine-fish': 'Fish Audio API (Percuma s2.1-pro)',
        'lbl-fish-api-key': 'Kunci API Fish Audio',
        'lbl-fish-model': 'Header Model',
        'lbl-fish-ref-id': 'ID Suara Rujukan (Pilihan)',
        'free-promo-badge': '🎉 API Percuma',
        'error-fish-api-key-missing': 'Sila masukkan Kunci API Fish Audio anda dalam kad tetapan Suara di sebelah kanan.',
        'error-fish-tts-failed': 'Permintaan Fish Audio TTS gagal. Beralih kepada suara pelayar.',
        'fish-local-only-notice': '⚠️ TTS awan Fish Audio hanya berfungsi apabila aplikasi ini dijalankan melalui "npm start" (pelayan tempatan). Pada GitHub Pages atau perkhidmatan hosting statik lain, ia akan beralih kepada suara terbina dalam pelayar anda.',
        'tts-last-used-idle': 'Terakhir dituturkan: —',
        'persona-customization': 'Penyesuaian Persona'
    }
};

// DOM Elements
const webgpuStatusDot = document.getElementById('webgpu-status-dot');
const webgpuStatusText = document.getElementById('webgpu-status-text');
const modelSelect = document.getElementById('model-select');
const loadModelBtn = document.getElementById('load-model-btn');
const systemPromptInput = document.getElementById('system-prompt');
const chatMessages = document.getElementById('chat-messages');
const messageForm = document.getElementById('message-form');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-btn');
const langSelect = document.getElementById('lang-select');
const speakToggleBtn = document.getElementById('speak-toggle-btn');
const micBtn = document.getElementById('mic-btn');
const voiceSelect = document.getElementById('voice-select');
const voiceWarning = document.getElementById('voice-warning');
const personaSelect = document.getElementById('persona-select');

// TTS Engine & Fish Audio DOM Elements
const ttsEngineSelect = document.getElementById('tts-engine-select');
const browserVoiceContainer = document.getElementById('browser-voice-container');
const fishAudioContainer = document.getElementById('fish-audio-container');
const fishApiKeyInput = document.getElementById('fish-api-key');
const toggleFishKeyBtn = document.getElementById('toggle-fish-key-btn');
const fishModelInput = document.getElementById('fish-model');
const fishRefIdInput = document.getElementById('fish-ref-id');
const ttsLastUsedDot = document.getElementById('tts-last-used-dot');
const ttsLastUsedText = document.getElementById('tts-last-used-text');

// Progress UI Elements
const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercent = document.getElementById('progress-percent');
const progressStatus = document.getElementById('progress-status');
const progressBytes = document.getElementById('progress-bytes');
const progressSpeed = document.getElementById('progress-speed');

// Stats Elements
const statTps = document.getElementById('stat-tps');
const statTime = document.getElementById('stat-time');

// PWA Install Elements
const pwaInstallCard = document.getElementById('pwa-install-card');
const pwaInstallBtn = document.getElementById('pwa-install-btn');

// Export Elements
const exportDropdownBtn = document.getElementById('export-dropdown-btn');
const exportMdBtn = document.getElementById('export-md');
const exportTxtBtn = document.getElementById('export-txt');
const exportJsonBtn = document.getElementById('export-json');

// Prompt Templates Row
const promptTemplatesRow = document.getElementById('prompt-templates');

// Mobile responsive settings drawer
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const sidebarLeft = document.querySelector('.sidebar-left');
const personaToggleBtn = document.getElementById('persona-toggle-btn');
const sidebarRight = document.querySelector('.sidebar-right');

// System Notification Banner
const sysNotificationBanner = document.getElementById('sys-notification-banner');
const sysNotificationText = document.getElementById('sys-notification-text');
const sysNotificationClose = document.getElementById('sys-notification-close');

// Session & Memory Elements
const sessionListEl = document.getElementById('session-list');
const newChatBtn = document.getElementById('new-chat-btn');
const memoryToggleBtn = document.getElementById('memory-toggle-btn');
const memoryModal = document.getElementById('memory-modal');
const closeMemoryModalBtn = document.getElementById('close-memory-modal');
const memoryListEl = document.getElementById('memory-list');

// Voice Mode Elements
const voiceModeBtn = document.getElementById('voice-mode-btn');
const voiceOverlay = document.getElementById('voice-overlay');
const exitVoiceBtn = document.getElementById('exit-voice-btn');
const voiceStatusText = document.getElementById('voice-status-text');
const voiceSubtext = document.getElementById('voice-subtext');
const voiceTranscript = document.getElementById('voice-transcript');
const voiceTranscriptLog = document.getElementById('voice-transcript-log');

// App Config State
let appConfig = null;
let engine = null;
let conversation = null;
let modelLoaded = false;
let modelCached = false;
let generating = false;
let extractingMemory = false;
let currentAssistantBubble = null;
let currentLang = 'en';
let speakEnabled = localStorage.getItem('speakEnabled') === 'true';
let recognition = null;
let recording = false;
let selectedVoiceName = localStorage.getItem('selectedVoiceName') || '';
let currentFishAudio = null;

// Stop any ongoing TTS audio playback (SpeechSynthesis or HTML5 Audio element)
// Bumped on every stop/interrupt so an in-flight async TTS request (Fish
// Audio fetch still pending, or a delayed browser-voice queue callback) can
// tell it's been superseded and skip playing — otherwise a barge-in can let
// the old response's audio arrive late and overlap the new one.
let ttsToken = 0;

function stopAudioPlayback() {
    ttsToken++;
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    if (currentFishAudio) {
        try {
            currentFishAudio.pause();
            currentFishAudio.currentTime = 0;
        } catch (e) { /* ignore */ }
        currentFishAudio = null;
    }
}

// Chrome/Edge silently stalls window.speechSynthesis after ~15s of inactivity
// (exactly the length of an LLM "Thinking..." pause), causing the next speak()
// call to fire onend instantly with no audio. Pausing/resuming periodically
// keeps the engine alive. See: https://bugs.chromium.org/p/chromium/issues/detail?id=679437
let speechKeepAliveInterval = null;
function startSpeechKeepAlive() {
    if (!window.speechSynthesis || speechKeepAliveInterval) return;
    speechKeepAliveInterval = setInterval(() => {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
    }, 5000);
}
function stopSpeechKeepAlive() {
    if (speechKeepAliveInterval) {
        clearInterval(speechKeepAliveInterval);
        speechKeepAliveInterval = null;
    }
}

// Personas Cache, Sessions, and Memory tracking
const loadedPersonas = {};
const chatHistory = [];
let currentSessionId = null;
let userMemories = [];
let lastUserPrompt = '';
let deferredInstallPrompt = null;
let mobileModelsFiltered = false;

// ---- Crash-loop detection ----
// A marker set while a model load is in progress and cleared on success,
// graceful error, or deliberate navigation (pagehide). It survives ONLY when
// the page was killed mid-load — the silent out-of-memory reload on phones.
const LOAD_INFLIGHT_KEY = 'model-load-inflight';

// Highest download percentage reached, persisted so that after a silent crash
// we can tell "crashed after a full download" apart from "network dropped early"
let activeModelUrl = null;
let lastStoredPercent = -1;

function storedProgressFor(url) {
    return parseInt(localStorage.getItem(`load-progress:${url}`) || '-1', 10);
}

function interruptedCountFor(url) {
    return parseInt(localStorage.getItem(`load-interrupted:${url}`) || '0', 10);
}

function detectInterruptedLoad() {
    const url = localStorage.getItem(LOAD_INFLIGHT_KEY);
    if (!url) return;
    localStorage.removeItem(LOAD_INFLIGHT_KEY);
    localStorage.setItem(`load-interrupted:${url}`, String(interruptedCountFor(url) + 1));
}

// pagehide fires on deliberate navigation/close but NOT on an OOM kill —
// exactly the discriminator needed to avoid false positives
window.addEventListener('pagehide', () => {
    localStorage.removeItem(LOAD_INFLIGHT_KEY);
});

// Warn after one silent crash, block after two — so users learn it's a device
// limitation instead of re-burning bandwidth thinking it's a bug.
// Permanent copy goes in the chat (once per message), banner is a transient toast.
const shownViabilityMessages = new Set();
function showViabilityMessage(key) {
    if (!shownViabilityMessages.has(key)) {
        shownViabilityMessages.add(key);
        showSystemMessage(i18n[currentLang][key], 'error');
    }
    showNotification(i18n[currentLang][key], 'error', 8000);
}

function evaluateLoadViability() {
    if (modelLoaded || !navigator.gpu) return;
    const url = modelSelect.value;
    const count = interruptedCountFor(url);

    // The download completed (≥80%) yet the page crashed and no cached model
    // survived: the device provably cannot keep this model. Retrying would
    // burn the full download again — block immediately after ONE such crash.
    const crashedAfterFullDownload = count >= 1 && storedProgressFor(url) >= 80 && !modelCached;

    if (crashedAfterFullDownload) {
        loadModelBtn.disabled = true;
        showViabilityMessage('error-device-incompatible');
    } else if (count >= 2) {
        loadModelBtn.disabled = true;
        showViabilityMessage('error-load-crash-loop');
    } else if (count === 1) {
        loadModelBtn.disabled = false;
        showViabilityMessage('warning-load-interrupted');
    } else {
        loadModelBtn.disabled = false;
    }
}

// Mobile device detection (iPadOS masquerades as Macintosh but reports touch points)
function isMobileDevice() {
    if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
        return navigator.userAgentData.mobile;
    }
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
}

// Session & Agent Memory Persistence Manager
async function initSessionStorage() {
    try {
        await db.init();
        userMemories = await db.getAllMemories();
        renderMemoryList();

        const sessions = await db.getAllSessions();
        if (sessions.length === 0) {
            await createNewSession();
        } else {
            await switchSession(sessions[0].id);
        }
    } catch (err) {
        console.error('[SessionStorage] Failed to initialize DB sessions:', err);
    }
}

async function createNewSession(personaId = null) {
    const id = `session_${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const title = `Chat ${timeStr}`;
    const newSession = {
        id,
        title,
        personaId: personaId || (personaSelect ? personaSelect.value : 'assistant'),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        systemPrompt: systemPromptInput ? systemPromptInput.value : ''
    };
    await db.saveSession(newSession);
    await switchSession(id);
}

async function switchSession(sessionId) {
    currentSessionId = sessionId;
    const session = await db.getSession(sessionId);
    if (!session) return;

    if (session.personaId && personaSelect) {
        personaSelect.value = session.personaId;
    }
    if (session.systemPrompt !== undefined && systemPromptInput) {
        systemPromptInput.value = session.systemPrompt;
    }

    chatMessages.innerHTML = '';
    currentAssistantBubble = null;
    chatHistory.length = 0;

    const msgs = await db.getMessagesForSession(sessionId);
    if (msgs.length === 0) {
        addMessageBubble(i18n[currentLang]['welcome-message'], 'assistant');
    } else {
        msgs.forEach(m => {
            addMessageBubble(m.content, m.role);
            chatHistory.push({ role: m.role, content: m.content });
        });
    }

    await renderSessionList();

    if (engine) {
        await rehydrateConversationEngine(msgs);
    }
}

async function rehydrateConversationEngine(historyMsgs = []) {
    if (!engine) return;
    try {
        let sysContent = systemPromptInput ? systemPromptInput.value : '';
        if (userMemories && userMemories.length > 0) {
            const memText = userMemories.map(m => `- ${m.text}`).join('\n');
            sysContent += `\n\n[Persistent User Context & Memory]:\n${memText}`;
        }

        const prefaceMsgs = [{ role: 'system', content: sysContent }];
        if (historyMsgs && historyMsgs.length > 0) {
            historyMsgs.forEach(m => {
                prefaceMsgs.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
            });
        }

        conversation = await engine.createConversation({
            preface: { messages: prefaceMsgs }
        });
        console.log('[Engine] Conversation rehydrated with', prefaceMsgs.length, 'preface messages.');
    } catch (e) {
        console.error('Failed to rehydrate conversation engine:', e);
    }
}

async function renderSessionList() {
    if (!sessionListEl) return;
    sessionListEl.innerHTML = '';

    const sessions = await db.getAllSessions();
    sessions.forEach(s => {
        const item = document.createElement('div');
        item.className = `session-item ${s.id === currentSessionId ? 'active' : ''}`;

        const titleSpan = document.createElement('span');
        titleSpan.className = 'session-title-text';
        titleSpan.textContent = s.title;
        titleSpan.onclick = () => switchSession(s.id);

        const actions = document.createElement('div');
        actions.className = 'session-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'session-icon-btn';
        editBtn.textContent = '✏️';
        editBtn.title = 'Rename';
        editBtn.onclick = async (e) => {
            e.stopPropagation();
            const newTitle = prompt('Rename Session:', s.title);
            if (newTitle && newTitle.trim()) {
                s.title = newTitle.trim();
                s.updatedAt = Date.now();
                await db.saveSession(s);
                renderSessionList();
            }
        };

        const delBtn = document.createElement('button');
        delBtn.className = 'session-icon-btn';
        delBtn.textContent = '🗑️';
        delBtn.title = 'Delete';
        delBtn.onclick = async (e) => {
            e.stopPropagation();
            if (confirm(`Delete session "${s.title}"?`)) {
                await deleteSession(s.id);
            }
        };

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        item.appendChild(titleSpan);
        item.appendChild(actions);

        sessionListEl.appendChild(item);
    });
}

async function deleteSession(sessionId) {
    await db.deleteSession(sessionId);
    if (sessionId === currentSessionId) {
        const remaining = await db.getAllSessions();
        if (remaining.length > 0) {
            await switchSession(remaining[0].id);
        } else {
            await createNewSession();
        }
    } else {
        await renderSessionList();
    }
}

function renderMemoryList() {
    if (!memoryListEl) return;
    memoryListEl.innerHTML = '';

    if (userMemories.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.fontSize = '0.85rem';
        emptyMsg.style.color = 'var(--text-secondary)';
        emptyMsg.style.fontStyle = 'italic';
        emptyMsg.textContent = 'No persistent memories saved yet.';
        memoryListEl.appendChild(emptyMsg);
        return;
    }

    userMemories.forEach(mem => {
        const item = document.createElement('div');
        item.className = 'memory-item';

        const textSpan = document.createElement('span');
        textSpan.className = 'memory-item-text';
        textSpan.textContent = mem.text;

        const delBtn = document.createElement('button');
        delBtn.className = 'memory-del-btn';
        delBtn.textContent = '❌';
        delBtn.title = 'Delete Memory';
        delBtn.onclick = async () => {
            await db.deleteMemory(mem.id);
            userMemories = await db.getAllMemories();
            renderMemoryList();
            if (engine && currentSessionId) {
                const msgs = await db.getMessagesForSession(currentSessionId);
                await rehydrateConversationEngine(msgs);
            }
        };

        item.appendChild(textSpan);
        item.appendChild(delBtn);
        memoryListEl.appendChild(item);
    });
}

async function addMemory(text) {
    if (!text || !text.trim()) return;
    const newMem = {
        id: `mem_${Date.now()}`,
        text: text.trim(),
        createdAt: Date.now()
    };
    await db.saveMemory(newMem);
    userMemories = await db.getAllMemories();
    renderMemoryList();

    if (engine && currentSessionId) {
        const msgs = await db.getMessagesForSession(currentSessionId);
        await rehydrateConversationEngine(msgs);
    }
}

// Runs a small, separate background inference (its own Conversation object,
// not the visible chat) after each turn to silently detect and save durable
// facts about the user — the auto version of what addMemory() used to require
// the user to type manually.
async function extractAndSaveMemories(userText, assistantText) {
    if (!engine || !userText || !assistantText || extractingMemory) return;
    extractingMemory = true;

    try {
        const existingFacts = userMemories.length > 0
            ? userMemories.map(m => `- ${m.text}`).join('\n')
            : 'None yet.';

        const extractionPrompt = `Facts already remembered about the user:
${existingFacts}

New exchange:
User: ${userText}
Assistant: ${assistantText}

If this exchange reveals ONE new durable fact about the user (name, birthday, preference, job, location, etc.) that is not already in the list above, reply with only that fact as a short sentence. Otherwise reply with exactly: NONE`;

        const extractionConversation = await engine.createConversation({
            preface: {
                messages: [{
                    role: 'system',
                    content: 'You silently extract durable facts about the user. Reply with only the fact sentence or the word NONE — no other text.'
                }]
            }
        });

        let resultText = '';
        const stream = extractionConversation.sendMessageStreaming(extractionPrompt);
        for await (const chunk of stream) {
            resultText += chunk.content[0].text;
        }

        const fact = resultText.trim().replace(/^["']|["']$/g, '');
        const isDuplicate = userMemories.some(m => m.text.toLowerCase() === fact.toLowerCase());
        if (fact && fact.length < 200 && !/^none\.?$/i.test(fact) && !isDuplicate) {
            await addMemory(fact);
        }
    } catch (e) {
        console.warn('[Memory] Auto-extraction failed:', e);
    } finally {
        extractingMemory = false;
    }
}

// Hands-Free Voice Agent Handlers
async function toggleVoiceMode() {
    if (!voiceOverlay) return;

    if (voiceOverlay.style.display === 'flex') {
        // Stop Voice Mode
        voiceAgent.stopVoiceMode();
        voiceOverlay.style.display = 'none';
        stopAudioPlayback();
        stopSpeechKeepAlive();
    } else {
        // Start Voice Mode
        if (!modelLoaded) {
            alert('Please load an AI model first before starting Voice Mode!');
            return;
        }

        voiceOverlay.style.display = 'flex';
        if (voiceTranscriptLog) voiceTranscriptLog.innerHTML = '';

        // Voice Mode is spoken by definition — force TTS on so responses are
        // actually heard, even if it was left off from regular chat use.
        if (!speakEnabled) {
            speakEnabled = true;
            localStorage.setItem('speakEnabled', 'true');
            if (speakToggleBtn) speakToggleBtn.textContent = i18n[currentLang]['btn-speak-on'];
        }

        startSpeechKeepAlive();

        try {
            await voiceAgent.startVoiceMode(
                onVoiceStateChange,
                onVoiceSpeechSubmitted,
                onVoiceBargeIn,
                onVoiceTranscriptUpdate,
                langToBcp47(currentLang)
            );
        } catch (err) {
            alert('Microphone access is required for Voice Mode: ' + (err.message || err));
            voiceOverlay.style.display = 'none';
        }
    }
}

function onVoiceStateChange(state) {
    if (!voiceOverlay) return;
    voiceOverlay.className = `voice-overlay state-${state.toLowerCase()}`;

    if (state === 'LISTENING') {
        if (voiceStatusText) voiceStatusText.textContent = 'Listening...';
        if (voiceSubtext) voiceSubtext.textContent = 'Speak naturally — VAD will auto-detect when you stop';
    } else if (state === 'THINKING') {
        if (voiceStatusText) voiceStatusText.textContent = 'Thinking...';
        if (voiceSubtext) voiceSubtext.textContent = 'Processing with local WebGPU LLM...';
    } else if (state === 'SPEAKING') {
        if (voiceStatusText) voiceStatusText.textContent = 'Speaking...';
        if (voiceSubtext) voiceSubtext.textContent = 'Reading response aloud (Speak to interrupt)';
    }
}

function onVoiceSpeechSubmitted(text) {
    if (!text || generating || !modelLoaded) return;

    stopAudioPlayback();

    addMessageBubble(text, 'user');
    chatHistory.push({ role: 'user', content: text });
    appendVoiceTranscriptEntry('user', text);

    userInput.disabled = true;
    sendBtn.disabled = true;
    generating = true;

    createAssistantBubble();
    startChat(text);
}

function onVoiceBargeIn() {
    console.log('[VoiceAgent] User interrupted AI speech.');
    stopAudioPlayback();
}

function onVoiceTranscriptUpdate(text) {
    if (voiceTranscript) voiceTranscript.textContent = text;
}

function appendVoiceTranscriptEntry(role, text) {
    if (!voiceTranscriptLog) return;
    const entry = document.createElement('div');
    entry.className = `voice-transcript-entry ${role}`;
    entry.textContent = `${role === 'user' ? 'You' : 'AI'}: ${text}`;
    voiceTranscriptLog.appendChild(entry);
    voiceTranscriptLog.scrollTop = voiceTranscriptLog.scrollHeight;
}

// Initialize Application
async function init() {
    try {
        // 1. Fetch config.json
        const res = await fetch('./config.json');
        if (!res.ok) throw new Error('Could not load config.json');
        appConfig = await res.json();

        // Request persistent storage so browser doesn't evict the model weights cache (critical for mobile)
        if (navigator.storage && navigator.storage.persist) {
            try {
                const isPersisted = await navigator.storage.persisted();
                if (!isPersisted) {
                    await navigator.storage.persist();
                }
            } catch (storageError) {
                console.warn('[Storage] Failed to request persistence:', storageError);
            }
        }
    } catch (e) {
        console.error('Failed to load config.json. Using fallback.', e);
        // Fallback default config
        appConfig = {
            appName: "Local AI Starter",
            defaultModel: "gemma-4-e2b",
            defaultLanguage: "en",
            defaultPersona: "assistant",
            theme: {
                primary: "#3b82f6",
                primaryHover: "#2563eb",
                bgGradientStart: "#0f172a",
                bgGradientEnd: "#1e293b",
                sidebarBg: "rgba(30, 41, 59, 0.7)",
                chatBg: "rgba(15, 23, 42, 0.5)",
                text: "#f8fafc"
            },
            models: [
                {
                    id: "gemma-4-e2b",
                    name: "Gemma 4 E2B IT (Web-Optimized)",
                    url: "https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.litertlm"
                }
            ],
            languages: [
                { "code": "en", "label": "🌐 English" },
                { "code": "zh", "label": "🌐 中文 (Mandarin)" }
            ],
            personas: [
                {
                    id: "assistant",
                    name: { "en": "General AI Assistant", "zh": "通用 AI 助手" }
                }
            ],
            promptTemplates: []
        };
    }

    // Apply configuration features
    applyTheme(appConfig.theme);
    setAppTitles(appConfig.appName);
    populateModelsDropdown(appConfig.models);
    populateLanguagesDropdown(appConfig.languages);
    populatePersonasDropdown(appConfig.personas);

    // Sync from URL search params or fallback config defaults
    const query = parseQueryParams();
    currentLang = query.lang && appConfig.languages.some(l => l.code === query.lang) ? query.lang : appConfig.defaultLanguage;
    langSelect.value = currentLang;

    // Apply model selection
    let initialModelId = query.model && appConfig.models.some(m => m.id === query.model) ? query.model : appConfig.defaultModel;
    const modelToSet = appConfig.models.find(m => m.id === initialModelId) || appConfig.models[0];
    if (modelToSet && Array.from(modelSelect.options).some(opt => opt.value === modelToSet.url)) {
        modelSelect.value = modelToSet.url;
    }
    // else: keep the dropdown's first entry (on mobile that is the smallest model)

    // Apply persona selection
    let initialPersonaId = query.persona && appConfig.personas.some(p => p.id === query.persona) ? query.persona : appConfig.defaultPersona;
    personaSelect.value = initialPersonaId;

    // Run support checks and set event listeners
    checkWebGpuSupport();
    setupEventListeners();

    // Switch language to load correct translations and prompts
    await switchLanguage(currentLang);

    // Tell mobile users why larger models are missing (limitation, not a bug)
    if (mobileModelsFiltered && navigator.gpu) { // WebGPU-unsupported banner takes priority
        showNotification(i18n[currentLang]['warning-mobile-model'], 'info');
    }

    // Detect whether a previous load attempt silently crashed the page,
    // then check local caching status (which also evaluates load viability)
    detectInterruptedLoad();
    checkCacheStatus();

    // Initialize speech dictation
    initSpeechRecognition();

    // Initialize TTS Engine & Fish Audio Settings
    initTtsEngineSettings();

    // Initialize IndexedDB Sessions & Memory Persistence
    await initSessionStorage();

    // Setup PWA service worker registration
    registerServiceWorker();
}

function initTtsEngineSettings() {
    const savedEngine = localStorage.getItem('ttsEngine') || 'webSpeech';
    const savedApiKey = localStorage.getItem('fishApiKey') || '';
    const savedModel = localStorage.getItem('fishModel') || 's2.1-pro-free';
    const savedRefId = localStorage.getItem('fishRefId') || '19e0fb5083d44efb8aec7e08d88d896b';

    if (ttsEngineSelect) ttsEngineSelect.value = savedEngine;
    if (fishApiKeyInput) fishApiKeyInput.value = savedApiKey;
    if (fishModelInput) fishModelInput.value = savedModel;
    if (fishRefIdInput) fishRefIdInput.value = savedRefId;

    updateTtsEngineContainers(savedEngine);
}

function updateTtsEngineContainers(engineType) {
    if (!browserVoiceContainer || !fishAudioContainer) return;
    if (engineType === 'fishAudio') {
        browserVoiceContainer.style.display = 'none';
        fishAudioContainer.style.display = 'block';
    } else {
        browserVoiceContainer.style.display = 'block';
        fishAudioContainer.style.display = 'none';
    }
}

// Dynamic Theme Builder
function applyTheme(theme) {
    if (!theme) return;
    const root = document.documentElement;
    if (theme.primary) root.style.setProperty('--primary-color', theme.primary);
    if (theme.primaryHover) root.style.setProperty('--primary-hover', theme.primaryHover);
    if (theme.bgGradientStart) root.style.setProperty('--bg-gradient-start', theme.bgGradientStart);
    if (theme.bgGradientEnd) root.style.setProperty('--bg-gradient-end', theme.bgGradientEnd);
    if (theme.sidebarBg) root.style.setProperty('--sidebar-bg', theme.sidebarBg);
    if (theme.chatBg) root.style.setProperty('--chat-bg', theme.chatBg);
    if (theme.text) root.style.setProperty('--text-primary', theme.text);
}

// Brand app title setter
function setAppTitles(appName) {
    const brandTitle = document.getElementById('brand-title');
    if (brandTitle) {
        brandTitle.textContent = appName;
    }
}

// Dropdown Populate Helpers
function populateModelsDropdown(models) {
    modelSelect.innerHTML = '';

    // On mobile, drop models flagged as too large for phones; keep at least the smallest
    let visibleModels = models;
    if (isMobileDevice()) {
        const friendly = models.filter(m => m.mobileFriendly !== false);
        if (friendly.length > 0) {
            visibleModels = friendly;
        } else {
            const smallest = [...models].sort((a, b) => (a.sizeMB || Infinity) - (b.sizeMB || Infinity))[0];
            visibleModels = smallest ? [smallest] : models;
        }
        // Auto-select the smallest of what remains
        visibleModels = [...visibleModels].sort((a, b) => (a.sizeMB || Infinity) - (b.sizeMB || Infinity));
        mobileModelsFiltered = visibleModels.length < models.length;
    }

    visibleModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.url;
        option.textContent = model.name;
        modelSelect.appendChild(option);
    });
}

function populateLanguagesDropdown(languages) {
    langSelect.innerHTML = '';
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.label;
        langSelect.appendChild(option);
    });
}

function populatePersonasDropdown(personas) {
    personaSelect.innerHTML = '';
    personas.forEach(persona => {
        const option = document.createElement('option');
        option.value = persona.id;
        option.textContent = persona.name[currentLang] || persona.name['en'] || persona.id;
        personaSelect.appendChild(option);
    });
}

// Parse Search Query string parameters
function parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        lang: params.get('lang'),
        persona: params.get('persona'),
        model: params.get('model')
    };
}

// Populate Prompt Templates Pills bar
function populatePromptTemplates() {
    if (!promptTemplatesRow) return;
    promptTemplatesRow.innerHTML = '';
    if (!appConfig.promptTemplates || appConfig.promptTemplates.length === 0) {
        promptTemplatesRow.style.display = 'none';
        return;
    }

    promptTemplatesRow.style.display = 'flex';
    appConfig.promptTemplates.forEach(template => {
        const pill = document.createElement('button');
        pill.className = 'prompt-pill';

        // Translate pill label based on active language
        const label = template.label[currentLang] || template.label['en'] || template.id;
        pill.textContent = label;

        pill.addEventListener('click', () => {
            // Put prompt template prefix in chat box
            userInput.value = template.template;
            userInput.focus();

            // Stop active reading speech if clicked
            stopAudioPlayback();
        });
        promptTemplatesRow.appendChild(pill);
    });
}

// Check if model exists locally (OPFS file, or the legacy Cache API location)
// Check if model exists locally (OPFS file, or the legacy Cache API location)
async function checkCacheStatus() {
    try {
        modelCached = false;
        if (await findOpfsModel(modelSelect.value)) {
            modelCached = true;
        } else if (typeof caches !== 'undefined' && caches.open) {
            const cache = await caches.open('litert-lm-cache');
            modelCached = !!(await cache.match(modelSelect.value));
        }
    } catch (e) {
        console.warn("Failed to check cache status:", e);
    } finally {
        updateLoadButtonText();
        evaluateLoadViability();
    }
}

// Update Model Loading action button text
function updateLoadButtonText() {
    if (!loadModelBtn) return;
    if (modelLoaded) {
        loadModelBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>${i18n[currentLang]['model-ready']}</span>
        `;
    } else if (modelCached) {
        loadModelBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            <span>${i18n[currentLang]['btn-load-cached']}</span>
        `;
    } else {
        // Not cached: the button triggers a network download — say so, with the size
        const meta = appConfig && appConfig.models ? appConfig.models.find(m => m.url === modelSelect.value) : null;
        const sizeLabel = meta && meta.sizeMB
            ? (meta.sizeMB >= 1024 ? ` (~${(meta.sizeMB / 1024).toFixed(1)} GB)` : ` (~${meta.sizeMB} MB)`)
            : '';
        loadModelBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            <span>${i18n[currentLang]['btn-load']}${sizeLabel}</span>
        `;
    }
}

// WebGPU Verification
function checkWebGpuSupport() {
    if (navigator.gpu) {
        webgpuStatusDot.className = 'status-dot active';
        webgpuStatusText.textContent = i18n[currentLang]['webgpu-available'];
        if (progressStatus && progressStatus.textContent.includes('WebGPU')) {
            progressStatus.textContent = i18n[currentLang]['progress-wait'] || 'Waiting to load...';
        }
    } else {
        webgpuStatusDot.className = 'status-dot error';
        webgpuStatusText.textContent = i18n[currentLang]['webgpu-unsupported'];
        if (progressStatus) {
            progressStatus.textContent = i18n[currentLang]['webgpu-unsupported'] || 'WebGPU Unsupported';
        }
        if (progressPercent) {
            progressPercent.textContent = '-';
        }
        // Hard-block loading: without WebGPU the 1+ GB download would only fail afterwards
        loadModelBtn.disabled = true;
        modelSelect.disabled = true;

        let diagMsg = i18n[currentLang]['error-device-unsupported'];
        if (!window.isSecureContext || (location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')) {
            diagMsg = '⚠️ WebGPU Disabled by Browser: You are accessing via an insecure HTTP network IP address. Chrome/Edge disable WebGPU over plain HTTP network IPs. Please open http://localhost:3000 instead!';
        } else {
            diagMsg += ' (Tip: On new Ryzen AI hardware, open chrome://settings/system -> ensure "Use graphics acceleration when available" is ON, or check chrome://gpu).';
        }

        showSystemMessage(diagMsg, 'error');
        showNotification(diagMsg, 'error', 10000);
    }
}

// Bind DOM event handlers
function setupEventListeners() {
    // Language select changer
    langSelect.addEventListener('change', () => {
        switchLanguage(langSelect.value);
    });

    // Auto voice synthesis click toggle
    speakToggleBtn.addEventListener('click', () => {
        speakEnabled = !speakEnabled;
        localStorage.setItem('speakEnabled', speakEnabled);
        speakToggleBtn.textContent = speakEnabled ? i18n[currentLang]['btn-speak-on'] : i18n[currentLang]['btn-speak-off'];
        if (!speakEnabled) {
            stopAudioPlayback();
        }
    });

    // Microphone STT click toggle
    micBtn.addEventListener('click', () => {
        if (!recognition) return;
        if (recording) {
            recognition.stop();
        } else {
            stopAudioPlayback();
            // Sync STT language codes
            if (currentLang === 'zh') recognition.lang = 'zh-CN';
            else if (currentLang === 'ja') recognition.lang = 'ja-JP';
            else if (currentLang === 'ko') recognition.lang = 'ko-KR';
            else if (currentLang === 'ta') recognition.lang = 'ta-IN';
            else if (currentLang === 'ms') recognition.lang = 'ms-MY';
            else recognition.lang = 'en-US';

            recognition.start();
        }
    });

    // TTS Engine selection changed
    if (ttsEngineSelect) {
        ttsEngineSelect.addEventListener('change', () => {
            const chosenEngine = ttsEngineSelect.value;
            localStorage.setItem('ttsEngine', chosenEngine);
            updateTtsEngineContainers(chosenEngine);
            stopAudioPlayback();
        });
    }

    // Fish Audio settings inputs auto-save
    const saveFishSettings = () => {
        if (fishApiKeyInput) localStorage.setItem('fishApiKey', fishApiKeyInput.value.trim());
        if (fishModelInput) localStorage.setItem('fishModel', fishModelInput.value.trim());
        if (fishRefIdInput) localStorage.setItem('fishRefId', fishRefIdInput.value.trim());
    };

    if (fishApiKeyInput) {
        ['input', 'change', 'blur'].forEach(evt => fishApiKeyInput.addEventListener(evt, saveFishSettings));
    }
    if (fishModelInput) {
        ['input', 'change', 'blur'].forEach(evt => fishModelInput.addEventListener(evt, saveFishSettings));
    }
    if (fishRefIdInput) {
        ['input', 'change', 'blur'].forEach(evt => fishRefIdInput.addEventListener(evt, saveFishSettings));
    }

    if (toggleFishKeyBtn && fishApiKeyInput) {
        toggleFishKeyBtn.addEventListener('click', () => {
            const isPassword = fishApiKeyInput.type === 'password';
            fishApiKeyInput.type = isPassword ? 'text' : 'password';
            toggleFishKeyBtn.textContent = isPassword ? '🙈' : '👁️';
        });
    }

    // System Voice selection changed
    voiceSelect.addEventListener('change', () => {
        selectedVoiceName = voiceSelect.value;
        localStorage.setItem('selectedVoiceName', selectedVoiceName);
        updateVoiceWarning();
    });

    // Switch model URL cache status check on change
    modelSelect.addEventListener('change', () => {
        checkCacheStatus();
    });

    // Persona selection changed
    personaSelect.addEventListener('change', async () => {
        const personaId = personaSelect.value;
        const personaData = await loadPersonaData(personaId);

        // System Prompt value setting with strict language check
        const activeSysPrompt = personaData.systemPrompt[currentLang] || personaData.systemPrompt['en'] || '';
        systemPromptInput.value = activeSysPrompt;
    });

    // Load Model click trigger
    loadModelBtn.addEventListener('click', () => {
        if (window.location.protocol === 'file:') {
            showSystemMessage(i18n[currentLang]['error-file-protocol'], 'error');
            return;
        }

        const modelUrl = modelSelect.value;
        loadModelBtn.disabled = true;
        modelSelect.disabled = true;

        loadModel(modelUrl);
    });

    // Send Form Submission
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        stopAudioPlayback();

        const messageText = userInput.value.trim();
        if (!messageText || !modelLoaded || generating) return;

        // Render User Bubble
        addMessageBubble(messageText, 'user');
        chatHistory.push({ role: 'user', content: messageText });
        userInput.value = '';

        userInput.disabled = true;
        sendBtn.disabled = true;
        generating = true;

        // Render Empty Assistant Bubble and trigger local inference
        createAssistantBubble();
        startChat(messageText);
    });

    // Conversation reset click trigger
    resetBtn.addEventListener('click', async () => {
        if (generating) return;
        chatMessages.innerHTML = '';
        currentAssistantBubble = null;
        statTps.textContent = '0 t/s';
        statTime.textContent = '0 ms';
        chatHistory.length = 0; // Clear history logs

        if (currentSessionId) {
            await db.clearSessionMessages(currentSessionId);
        }

        // Re-display welcome bubble
        addMessageBubble(i18n[currentLang]['reset-welcome'], 'assistant');
        conversation = null;
        updateStatus('ready', i18n[currentLang]['status-ready-to-chat']);
    });

    // New Chat Button
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => createNewSession());
    }

    // Memory Modal Toggle & Controls
    if (memoryToggleBtn && memoryModal) {
        memoryToggleBtn.addEventListener('click', () => {
            renderMemoryList();
            memoryModal.style.display = 'flex';
        });
    }

    if (closeMemoryModalBtn && memoryModal) {
        closeMemoryModalBtn.addEventListener('click', () => {
            memoryModal.style.display = 'none';
        });
    }

    if (memoryModal) {
        memoryModal.addEventListener('click', (e) => {
            if (e.target === memoryModal) {
                memoryModal.style.display = 'none';
            }
        });
    }


    // Voice Mode Triggers
    if (voiceModeBtn) {
        voiceModeBtn.addEventListener('click', toggleVoiceMode);
    }
    if (exitVoiceBtn) {
        exitVoiceBtn.addEventListener('click', toggleVoiceMode);
    }

    // Cancel TTS synthesis if user starts typing manually
    userInput.addEventListener('input', () => {
        stopAudioPlayback();
    });

    // Export Dropdown Click handlers
    exportDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const parent = exportDropdownBtn.parentElement;
        parent.classList.toggle('show');
    });

    // Close dropdown on click outside
    document.addEventListener('click', () => {
        const dropdown = document.querySelector('.dropdown');
        if (dropdown) dropdown.classList.remove('show');
    });

    // Export format triggers
    exportMdBtn.addEventListener('click', () => exportChatHistory('md'));
    exportTxtBtn.addEventListener('click', () => exportChatHistory('txt'));
    exportJsonBtn.addEventListener('click', () => exportChatHistory('json'));

    // PWA Install click
    pwaInstallBtn.addEventListener('click', () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the PWA install prompt');
                pwaInstallCard.style.display = 'none';
            }
            deferredInstallPrompt = null;
        });
    });

    // Mobile Left Sidebar Drawer Toggle
    if (sidebarToggleBtn && sidebarLeft) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebarLeft.classList.toggle('active');
            if (sidebarRight) sidebarRight.classList.remove('active'); // Close other drawer
        });
    }

    // Mobile Right Sidebar Drawer Toggle
    if (personaToggleBtn && sidebarRight) {
        personaToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebarRight.classList.toggle('active');
            if (sidebarLeft) sidebarLeft.classList.remove('active'); // Close other drawer
        });
    }

    // Close drawers if clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (sidebarLeft && sidebarLeft.classList.contains('active') && !sidebarLeft.contains(e.target) && e.target !== sidebarToggleBtn) {
                sidebarLeft.classList.remove('active');
            }
            if (sidebarRight && sidebarRight.classList.contains('active') && !sidebarRight.contains(e.target) && e.target !== personaToggleBtn) {
                sidebarRight.classList.remove('active');
            }
        }
    });

    // Close notification banner
    if (sysNotificationClose && sysNotificationBanner) {
        sysNotificationClose.addEventListener('click', () => {
            sysNotificationBanner.style.display = 'none';
        });
    }
}

// Dynamic Persona Fetch loader
async function loadPersonaData(personaId) {
    if (loadedPersonas[personaId]) {
        return loadedPersonas[personaId];
    }
    try {
        const res = await fetch(`./personas/${personaId}.json`);
        if (!res.ok) throw new Error(`Could not load persona JSON for ${personaId}`);
        const data = await res.json();
        loadedPersonas[personaId] = data;
        return data;
    } catch (e) {
        console.error(`Persona fetch failed for ${personaId}. Constructing fallback.`, e);
        const localMeta = appConfig.personas.find(p => p.id === personaId);
        return {
            id: personaId,
            name: localMeta ? localMeta.name : { en: "Assistant" },
            systemPrompt: {
                en: "You are a helpful, efficient, and friendly local AI assistant.",
                zh: "你是一个高效、实用且友好的本地 AI 助手。"
            }
        };
    }
}

// ---- OPFS (Origin Private File System) model storage ----
// Chunks are written straight to a private on-disk file as they download, so
// RAM stays flat. Buffering ~1 GB in JS memory gets the tab silently killed on
// phones (progress "resets" with no error), and WebKit aborts teed fetches
// when a streamed Cache API write fails — OPFS avoids both.

function opfsNameFor(modelUrl) {
    const meta = appConfig && appConfig.models ? appConfig.models.find(m => m.url === modelUrl) : null;
    const base = meta ? meta.id : modelUrl.replace(/[^a-z0-9]+/gi, '_').slice(-100);
    return `${base}.litertlm`;
}

// Set when OPFS access is DENIED by the environment (Private Browsing tab, or
// an untrusted local HTTPS certificate) rather than merely unsupported
let opfsStorageBlocked = false;

async function getOpfsModelsDir() {
    if (!(navigator.storage && navigator.storage.getDirectory)) return null;
    try {
        const root = await navigator.storage.getDirectory();
        return await root.getDirectoryHandle('models', { create: true });
    } catch (e) {
        opfsStorageBlocked = true;
        console.warn(`[OPFS] Unavailable: ${e.name || 'Error'} — ${e.message || 'no message'}. ` +
            'Usual causes: Private Browsing tab, or an HTTPS certificate the device does not trust.');
        return null;
    }
}

// Returns the stored model File, or null. Deletes partial files left behind
// by an interrupted download (completion marker must match the file size).
async function findOpfsModel(modelUrl) {
    const dir = await getOpfsModelsDir();
    if (!dir) return null;
    const name = opfsNameFor(modelUrl);
    try {
        const handle = await dir.getFileHandle(name);
        const file = await handle.getFile();
        const completeSize = localStorage.getItem(`opfs-complete:${name}`);
        if (!completeSize || file.size !== parseInt(completeSize, 10)) {
            try { await dir.removeEntry(name); } catch (e) { /* stale partial */ }
            localStorage.removeItem(`opfs-complete:${name}`);
            return null;
        }
        return file;
    } catch (e) {
        return null;
    }
}

// Worker source for Safari, which historically lacks createWritable() on the
// main thread — createSyncAccessHandle() is worker-only but widely supported
const OPFS_WORKER_SOURCE = `
self.onmessage = async (e) => {
    const msg = e.data;
    try {
        if (msg.type === 'open') {
            const root = await navigator.storage.getDirectory();
            const dir = await root.getDirectoryHandle('models', { create: true });
            const handle = await dir.getFileHandle(msg.name, { create: true });
            self.accessHandle = await handle.createSyncAccessHandle();
            self.offset = 0;
            self.accessHandle.truncate(0);
            self.postMessage({ type: 'opened' });
        } else if (msg.type === 'write') {
            self.accessHandle.write(msg.chunk, { at: self.offset });
            self.offset += msg.chunk.byteLength;
            self.postMessage({ type: 'written' });
        } else if (msg.type === 'close') {
            self.accessHandle.flush();
            self.accessHandle.close();
            self.postMessage({ type: 'closed', size: self.offset });
        }
    } catch (err) {
        self.postMessage({ type: 'error', message: (err && err.message) ? err.message : String(err) });
    }
};
`;

// Safari path: stream chunks to OPFS through a worker's sync access handle
async function downloadModelViaOpfsWorker(modelUrl, name, dir) {
    let worker = null;
    let workerUrl = null;
    try {
        workerUrl = URL.createObjectURL(new Blob([OPFS_WORKER_SOURCE], { type: 'text/javascript' }));
        worker = new Worker(workerUrl);

        const call = (msg, transfer) => new Promise((resolve, reject) => {
            worker.onmessage = (e) => {
                if (e.data.type === 'error') reject(new Error(e.data.message));
                else resolve(e.data);
            };
            worker.onerror = (e) => reject(new Error(e.message || 'OPFS worker error'));
            worker.postMessage(msg, transfer || []);
        });

        await call({ type: 'open', name });

        const response = await fetch(modelUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const total = parseInt(response.headers.get('content-length') || '0', 10);
        const reader = response.body.getReader();
        let loaded = 0;
        const startTime = Date.now();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            loaded += value.byteLength;
            await call({ type: 'write', chunk: value }, [value.buffer]); // transferred, not copied

            const elapsed = (Date.now() - startTime) / 1000;
            const speed = elapsed > 0 ? (loaded / elapsed / 1024 / 1024).toFixed(2) + ' MB/s' : '0 MB/s';
            const percent = total ? Math.round((loaded / total) * 100) : 0;
            updateProgress({ percent, speed, loaded, total });
        }

        const { size } = await call({ type: 'close' });
        localStorage.setItem(`opfs-complete:${name}`, String(size));
        const handle = await dir.getFileHandle(name);
        return await handle.getFile();
    } catch (e) {
        console.warn(`[OPFS] Worker download failed: ${e.name || 'Error'} — ${e.message || e}`);
        try { await dir.removeEntry(name); } catch (removeError) { /* nothing written */ }
        return null;
    } finally {
        if (worker) worker.terminate();
        if (workerUrl) URL.revokeObjectURL(workerUrl);
    }
}

// Download the model chunk-by-chunk to an OPFS file. Returns the File on
// success, null if OPFS is unusable on this browser (caller falls back).
async function downloadModelToOpfs(modelUrl) {
    const dir = await getOpfsModelsDir();
    if (!dir) return null;
    const name = opfsNameFor(modelUrl);
    localStorage.removeItem(`opfs-complete:${name}`);

    let handle;
    let writable;
    try {
        handle = await dir.getFileHandle(name, { create: true });
        if (!handle.createWritable) {
            // Safari: no main-thread writable stream — use the worker path
            return await downloadModelViaOpfsWorker(modelUrl, name, dir);
        }
        writable = await handle.createWritable();
    } catch (e) {
        console.warn(`[OPFS] Cannot open writable file: ${e.name || 'Error'} — ${e.message || e}`);
        return null;
    }

    try {
        const response = await fetch(modelUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const total = parseInt(response.headers.get('content-length') || '0', 10);
        const reader = response.body.getReader();
        let loaded = 0;
        const startTime = Date.now();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await writable.write(value); // straight to disk
            loaded += value.byteLength;

            const elapsed = (Date.now() - startTime) / 1000;
            const speed = elapsed > 0 ? (loaded / elapsed / 1024 / 1024).toFixed(2) + ' MB/s' : '0 MB/s';
            const percent = total ? Math.round((loaded / total) * 100) : 0;
            updateProgress({ percent, speed, loaded, total });
        }

        await writable.close();
        const file = await handle.getFile();
        localStorage.setItem(`opfs-complete:${name}`, String(file.size));
        return file;
    } catch (e) {
        console.warn('[OPFS] Download-to-disk failed:', e);
        try { await writable.abort(); } catch (abortError) { /* already closed */ }
        try { await dir.removeEntry(name); } catch (removeError) { /* nothing written */ }
        return null;
    }
}

// Read a download stream, updating the progress UI (chunks are discarded, not kept)
async function trackDownloadProgress(stream, total) {
    const reader = stream.getReader();
    let loaded = 0;
    const startTime = Date.now();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        loaded += value.byteLength;

        const elapsed = (Date.now() - startTime) / 1000;
        const speed = elapsed > 0 ? (loaded / elapsed / 1024 / 1024).toFixed(2) + ' MB/s' : '0 MB/s';
        const percent = total ? Math.round((loaded / total) * 100) : 0;

        updateProgress({ percent, speed, loaded, total });
    }
}

// Last-resort path when the Cache API is unavailable: buffer the whole model in memory
async function downloadModelBuffered(modelUrl) {
    const response = await fetch(modelUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;
    const reader = response.body.getReader();
    const chunks = [];
    const startTime = Date.now();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.byteLength;

        const elapsed = (Date.now() - startTime) / 1000;
        const speed = elapsed > 0 ? (loaded / elapsed / 1024 / 1024).toFixed(2) + ' MB/s' : '0 MB/s';
        const percent = total ? Math.round((loaded / total) * 100) : 0;

        updateProgress({ percent, speed, loaded, total });
    }

    return new Blob(chunks);
}

// Download Model from cache or fetch Hugging Face
// Look for an already-cached copy of the model: OPFS first (current format),
// then the Cache API (legacy location used by earlier versions).
async function findExistingModelBlob(modelUrl, cache) {
    const opfsBlob = await findOpfsModel(modelUrl);
    if (opfsBlob) {
        modelCached = true;
        return opfsBlob;
    }

    if (cache) {
        const cachedResponse = await cache.match(modelUrl);
        if (cachedResponse) {
            modelCached = true;
            return await cachedResponse.blob();
        }
    }

    return null;
}

// WebKit aborts the whole teed fetch when the cache write fails, so
// streaming-to-cache is only attempted on non-WebKit browsers.
function isWebKitBrowser() {
    const ua = navigator.userAgent;
    return /iphone|ipad|ipod/i.test(ua) ||
        (/safari/i.test(ua) && !/chrome|chromium|edg|android/i.test(ua)) ||
        (navigator.maxTouchPoints > 1 && /macintosh/i.test(ua));
}

// Guard against streaming into a cache that doesn't have room: a failed
// write here is worse than skipping straight to the buffered fallback.
async function hasCacheQuotaFor(modelUrl) {
    if (!navigator.storage || !navigator.storage.estimate) return true;
    try {
        const modelMeta = appConfig.models.find(m => m.url === modelUrl);
        const expectedBytes = (modelMeta && modelMeta.sizeMB ? modelMeta.sizeMB : 1500) * 1024 * 1024;
        const { usage, quota } = await navigator.storage.estimate();
        return (quota - usage) >= expectedBytes * 1.2;
    } catch (estimateError) {
        console.warn('[Storage] estimate() failed:', estimateError);
        return true;
    }
}

// Fallback 1: stream the download directly into the Cache API while
// reporting progress, verifying the write with a readback afterwards.
async function downloadModelStreamingToCache(modelUrl, cache) {
    try {
        const response = await fetch(modelUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;

        const [progressStream, cacheStream] = response.body.tee();
        const headers = { 'Content-Type': 'application/octet-stream' };
        if (total) headers['Content-Length'] = String(total);
        const cachePut = cache.put(modelUrl, new Response(cacheStream, { headers }));

        await trackDownloadProgress(progressStream, total);
        await cachePut;

        // Trust only a verified readback, never assume the write persisted
        const written = await cache.match(modelUrl);
        if (written) {
            modelCached = true;
            return await written.blob();
        }
        return null;
    } catch (streamError) {
        console.warn('Streaming download-to-cache failed, falling back to buffered download:', streamError);
        try { await cache.delete(modelUrl); } catch (e) { /* partial entry cleanup */ }
        modelCached = false;
        return null;
    }
}

// Fallback 2: buffer the whole model in memory (desktop-safe only), then
// best-effort write it to the Cache API afterwards.
async function downloadModelBufferedWithCache(modelUrl, cache) {
    // Storage denied on a phone means this download may crash the tab
    // (~500 MB memory ceiling) with no error at all — tell the user the
    // cause and fix BEFORE spending their bandwidth
    if (opfsStorageBlocked && isMobileDevice()) {
        showSystemMessage(i18n[currentLang]['warning-storage-blocked'], 'error');
        showNotification(i18n[currentLang]['warning-storage-blocked'], 'error', 8000);
    }

    const blob = await downloadModelBuffered(modelUrl);
    modelCached = false;

    if (cache) {
        try {
            await cache.put(modelUrl, new Response(blob, {
                headers: {
                    'Content-Length': String(blob.size),
                    'Content-Type': 'application/octet-stream'
                }
            }));
            modelCached = !!(await cache.match(modelUrl));
        } catch (cacheError) {
            console.warn('Buffered cache write failed:', cacheError);
            modelCached = false;
        }
    }

    if (!modelCached) {
        // Caching genuinely impossible on this device: say so clearly so
        // the per-visit re-download reads as a limitation, not a bug
        showSystemMessage(i18n[currentLang]['warning-no-cache-storage'], 'error');
        showNotification(i18n[currentLang]['warning-no-cache-storage'], 'error', 8000);
    }

    return blob;
}

// Downloads a fresh copy of the model, trying OPFS, then streamed Cache
// API, then a plain buffered download, in that order of preference.
async function downloadFreshModel(modelUrl, cache) {
    updateStatus('loading_model', 'Downloading model from Hugging Face...');

    // Keep the screen awake: phones suspend the tab (killing the download
    // with no visible error) when the screen sleeps
    let wakeLock = null;
    if (navigator.wakeLock) {
        try { wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* unsupported */ }
    }

    try {
        // Preferred path: stream to an on-disk OPFS file (flat memory, and
        // the file persists as the cache for the next visit)
        let blob = await downloadModelToOpfs(modelUrl);
        if (blob) {
            modelCached = true;
            return blob;
        }

        const canStreamToCache = !isWebKitBrowser() && !!cache && await hasCacheQuotaFor(modelUrl);
        if (canStreamToCache) {
            blob = await downloadModelStreamingToCache(modelUrl, cache);
            if (blob) return blob;
        }

        return await downloadModelBufferedWithCache(modelUrl, cache);
    } finally {
        if (wakeLock) {
            try { await wakeLock.release(); } catch (e) { /* already released */ }
        }
    }
}

async function loadModel(modelUrl) {
    try {
        // Crash marker: survives only if this load kills the page (see detectInterruptedLoad)
        localStorage.setItem(LOAD_INFLIGHT_KEY, modelUrl);
        activeModelUrl = modelUrl;
        lastStoredPercent = -1;
        updateStatus('loading_model', 'Initializing model download...');

        // Cache API can be denied in the same environments that block OPFS
        // (Private Browsing / untrusted certs) — treat it as optional
        let cache = null;
        try {
            cache = await caches.open('litert-lm-cache');
        } catch (e) {
            console.warn(`[Cache] Cache API unavailable: ${e.name || 'Error'} — ${e.message || e}`);
        }

        let blob = await findExistingModelBlob(modelUrl, cache);

        if (blob) {
            updateStatus('loading_model', 'Loading model from local browser cache...');
            updateProgress({
                percent: 100,
                speed: 'Loaded from Cache',
                loaded: 0,
                total: 0
            });
        } else {
            blob = await downloadFreshModel(modelUrl, cache);
        }

        updateStatus('compiling', 'Compiling model (Loading into GPU via WebGPU)...');

        engine = await Engine.create({
            model: blob,
            mainExecutorSettings: {
                maxNumTokens: 8192
            }
        });

        // Full success (download + GPU compile): clear the crash marker and history
        localStorage.removeItem(LOAD_INFLIGHT_KEY);
        localStorage.removeItem(`load-interrupted:${modelUrl}`);
        localStorage.removeItem(`load-progress:${modelUrl}`);
        activeModelUrl = null;

        updateStatus('ready', 'Model loaded and WebGPU pipeline ready!');
        const historyMsgs = currentSessionId ? await db.getMessagesForSession(currentSessionId) : [];
        await rehydrateConversationEngine(historyMsgs);
    } catch (error) {
        // Graceful failure — a real error message is shown, so no crash counting
        localStorage.removeItem(LOAD_INFLIGHT_KEY);
        localStorage.removeItem(`load-progress:${modelUrl}`);
        activeModelUrl = null;
        handleError(error.message || String(error));
    }
}

// Send user prompt to inference engine
async function startChat(prompt) {
    if (!engine) {
        handleError("Engine is not loaded yet.");
        return;
    }

    lastUserPrompt = prompt;

    if (!conversation) {
        const historyMsgs = currentSessionId ? await db.getMessagesForSession(currentSessionId) : [];
        await rehydrateConversationEngine(historyMsgs);
    }

    if (currentSessionId) {
        const userMsgObj = {
            id: `msg_${Date.now()}_u`,
            sessionId: currentSessionId,
            role: 'user',
            content: prompt,
            timestamp: Date.now()
        };
        await db.saveMessage(userMsgObj);

        const session = await db.getSession(currentSessionId);
        const msgs = await db.getMessagesForSession(currentSessionId);
        if (msgs.length === 1 && session && session.title.startsWith('Chat ')) {
            const shortTitle = prompt.length > 22 ? prompt.slice(0, 22) + '...' : prompt;
            session.title = shortTitle;
            session.updatedAt = Date.now();
            await db.saveSession(session);
            await renderSessionList();
        }
    }

    updateStatus('generating', 'Thinking...');

    const startTime = Date.now();
    let tokenCount = 0;

    try {
        const stream = conversation.sendMessageStreaming(prompt);
        for await (const chunk of stream) {
            tokenCount++;
            const text = chunk.content[0].text;
            appendAssistantChunk(text);
        }

        const elapsedMs = Date.now() - startTime;
        const tokensPerSecond = tokenCount > 0 && elapsedMs > 0 ? (tokenCount / (elapsedMs / 1000)).toFixed(1) : '0';

        generationDone({
            tokensPerSecond,
            generationTimeMs: elapsedMs
        });
    } catch (error) {
        handleError(error.message || String(error));
    }
}

// Update central UI text statuses
function updateStatus(status, message) {
    let translatedMsg = message;
    if (status === 'loading_model') {
        if (message.includes('local browser cache')) {
            translatedMsg = i18n[currentLang]['status-loading-db'];
        } else if (message.includes('Hugging Face')) {
            translatedMsg = i18n[currentLang]['status-downloading'];
        } else if (message.includes('Initializing')) {
            translatedMsg = i18n[currentLang]['status-init'];
        }
    } else if (status === 'compiling') {
        translatedMsg = i18n[currentLang]['status-compiling'];
    } else if (status === 'ready') {
        translatedMsg = i18n[currentLang]['status-ready'];
    } else if (status === 'generating' && message === 'Thinking...') {
        translatedMsg = i18n[currentLang]['status-thinking'];
    }

    progressStatus.textContent = translatedMsg;

    if (status === 'ready') {
        modelLoaded = true;
        updateLoadButtonText();
        loadModelBtn.disabled = true;
        userInput.disabled = false;
        sendBtn.disabled = false;
        micBtn.disabled = false;
        resetBtn.disabled = false;

        setTimeout(() => {
            progressStatus.textContent = i18n[currentLang]['status-ready-to-chat'];
        }, 3000);
    }
}

// Update Download progress feedback values
function updateProgress(data) {
    const { percent, speed, loaded, total } = data;

    progressSpeed.textContent = speed === 'Loaded from Cache' ? i18n[currentLang]['direct-cache'] : speed;

    let reachedPercent = null;

    if (total > 0) {
        progressBarFill.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
        const loadedMB = (loaded / 1024 / 1024).toFixed(1);
        const totalMB = (total / 1024 / 1024).toFixed(1);
        progressBytes.textContent = `${loadedMB} MB / ${totalMB} MB`;
        reachedPercent = percent;
    } else if (speed === 'Loaded from Cache') {
        progressBytes.textContent = i18n[currentLang]['direct-cache'];
        progressBarFill.style.width = '100%';
        progressPercent.textContent = '100%';
    } else {
        const loadedMB = (loaded / 1024 / 1024).toFixed(1);
        progressBytes.textContent = `${loadedMB} MB / ~1500 MB`;

        const estimatedTotal = 1500 * 1024 * 1024;
        const estimatedPercent = Math.min(Math.round((loaded / estimatedTotal) * 100), 99);
        progressBarFill.style.width = `${estimatedPercent}%`;
        progressPercent.textContent = `~${estimatedPercent}%`;
        reachedPercent = estimatedPercent;
    }

    // Persist the highest percentage reached — after a silent page kill, this
    // is the evidence that a full download still produced no cached model
    if (activeModelUrl !== null && reachedPercent !== null && reachedPercent > lastStoredPercent) {
        lastStoredPercent = reachedPercent;
        try {
            localStorage.setItem(`load-progress:${activeModelUrl}`, String(reachedPercent));
        } catch (e) { /* storage full — progress tracking is best-effort */ }
    }
}

// Render message bubbles in panel
function addMessageBubble(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = sender === 'user' ? i18n[currentLang]['user-avatar'] : i18n[currentLang]['assistant-avatar'];

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    if (sender === 'assistant') {
        addSpeakButtonToBubble(content, text);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createAssistantBubble() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = i18n[currentLang]['assistant-avatar'];

    const content = document.createElement('div');
    content.className = 'message-content';

    const loader = document.createElement('div');
    loader.className = 'loader-dots';
    loader.innerHTML = '<span></span><span></span><span></span>';
    content.appendChild(loader);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);

    currentAssistantBubble = content;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendAssistantChunk(text) {
    if (!currentAssistantBubble) return;

    const loader = currentAssistantBubble.querySelector('.loader-dots');
    if (loader) {
        currentAssistantBubble.innerHTML = '';
    }

    currentAssistantBubble.textContent += text;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Callback when local inference finishes generating response
function generationDone(stats) {
    generating = false;
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();

    statTps.textContent = `${stats.tokensPerSecond} t/s`;
    statTime.textContent = `${stats.generationTimeMs} ms`;

    // Save reply to logs history
    const responseText = currentAssistantBubble.textContent;
    chatHistory.push({ role: 'assistant', content: responseText });

    if (currentSessionId) {
        const assistantMsgObj = {
            id: `msg_${Date.now()}_a`,
            sessionId: currentSessionId,
            role: 'assistant',
            content: responseText,
            timestamp: Date.now(),
            stats: stats
        };
        db.saveMessage(assistantMsgObj).then(async () => {
            const session = await db.getSession(currentSessionId);
            if (session) {
                session.updatedAt = Date.now();
                await db.saveSession(session);
                renderSessionList();
            }
        });
    }

    // Add speak button for manual playback
    addSpeakButtonToBubble(currentAssistantBubble, responseText);

    const voiceModeActive = voiceOverlay && voiceOverlay.style.display === 'flex';
    if (voiceModeActive) appendVoiceTranscriptEntry('assistant', responseText);

    if (speakEnabled) {
        speakText(responseText);
    } else if (voiceModeActive) {
        // Voice Mode is active but TTS is off — nothing else will transition
        // the voice agent out of THINKING, so do it here.
        voiceAgent.notifyAISpeakingEnd();
    }

    // Fire-and-forget: don't block the visible reply on this.
    extractAndSaveMemories(lastUserPrompt, responseText);
}

// Error handling panel
function handleError(errorMsg) {
    console.error("Local AI inference error:", errorMsg);
    generating = false;
    loadModelBtn.disabled = false;
    updateLoadButtonText();
    modelSelect.disabled = false;
    userInput.disabled = true;
    sendBtn.disabled = true;
    micBtn.disabled = true;

    if (currentAssistantBubble) {
        currentAssistantBubble.textContent = `❌ Error: ${errorMsg}`;
    } else {
        showSystemMessage(`Error: ${errorMsg}`, 'error');
    }

    if (voiceOverlay && voiceOverlay.style.display === 'flex') {
        voiceAgent.notifyAISpeakingEnd();
    }
}

function showSystemMessage(text, type) {
    const msg = document.createElement('div');
    msg.style.padding = '12px';
    msg.style.margin = '10px 0';
    msg.style.borderRadius = '8px';
    msg.style.fontSize = '0.875rem';

    if (type === 'error') {
        msg.style.background = 'rgba(239, 68, 68, 0.15)';
        msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        msg.style.color = '#ef4444';
    } else {
        msg.style.background = 'rgba(255, 255, 255, 0.05)';
        msg.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        msg.style.color = '#f8fafc';
    }

    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// System Notification Banner trigger helper.
// Pass autoHideMs > 0 for toast behavior — used when a permanent copy of the
// message also lives in the chat, so the banner doesn't need manual dismissal.
let notificationHideTimer = null;
function showNotification(message, type = 'error', autoHideMs = 0) {
    if (!sysNotificationBanner || !sysNotificationText) return;
    sysNotificationText.textContent = message;

    if (type === 'info') {
        sysNotificationBanner.className = 'notification-banner info';
        sysNotificationBanner.querySelector('.notification-icon').textContent = 'ℹ️';
    } else {
        sysNotificationBanner.className = 'notification-banner';
        sysNotificationBanner.querySelector('.notification-icon').textContent = '⚠️';
    }
    sysNotificationBanner.style.display = 'flex';

    if (notificationHideTimer) {
        clearTimeout(notificationHideTimer);
        notificationHideTimer = null;
    }
    if (autoHideMs > 0) {
        notificationHideTimer = setTimeout(() => {
            sysNotificationBanner.style.display = 'none';
        }, autoHideMs);
    }
}

// Local UI translation switch helper
async function switchLanguage(lang) {
    currentLang = lang;

    if (langSelect.value !== lang) {
        langSelect.value = lang;
    }

    // Apply translations to all data-i18n attributes. Fall back to English
    // rather than silently leaving stale text when a key is missing for
    // this language — a missing-but-wrong string is easier to spot/fix
    // than one that quietly never updates on language switch.
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = (i18n[lang] && i18n[lang][key]) || (i18n.en && i18n.en[key]);
        if (translated) {
            el.textContent = translated;
        } else {
            console.warn(`[i18n] Missing translation key "${key}" for all languages.`);
        }
    });

    // Populate current labels for Personas dynamically
    if (personaSelect && appConfig) {
        const currentVal = personaSelect.value;
        personaSelect.innerHTML = '';
        appConfig.personas.forEach(persona => {
            const option = document.createElement('option');
            option.value = persona.id;
            option.textContent = persona.name[lang] || persona.name['en'] || persona.id;
            if (persona.id === currentVal) {
                option.selected = true;
            }
            personaSelect.appendChild(option);
        });
    }

    // Set persona system prompt
    if (personaSelect) {
        const personaId = personaSelect.value;
        const personaData = await loadPersonaData(personaId);
        systemPromptInput.value = personaData.systemPrompt[lang] || personaData.systemPrompt['en'] || '';
    }

    userInput.placeholder = i18n[lang]['input-placeholder'];

    if (navigator.gpu) {
        webgpuStatusText.textContent = i18n[lang]['webgpu-available'];
    } else {
        webgpuStatusText.textContent = i18n[lang]['webgpu-unsupported'];
    }

    // Welcome bubble translation
    const welcomeAvatar = document.getElementById('welcome-avatar');
    const welcomeContent = document.getElementById('welcome-content');
    if (welcomeAvatar && welcomeContent && chatMessages.children.length === 1) {
        welcomeAvatar.textContent = i18n[lang]['assistant-avatar'];
        welcomeContent.textContent = i18n[lang]['welcome-message'];
        addSpeakButtonToBubble(welcomeContent, i18n[lang]['welcome-message']);
    }

    // Re-fill quick prompt templates matching the current language
    populatePromptTemplates();

    updateLoadButtonText();
    if (modelLoaded) {
        progressStatus.textContent = i18n[lang]['status-ready-to-chat'];
    }

    // Auto read voice button text update
    speakToggleBtn.textContent = speakEnabled ? i18n[lang]['btn-speak-on'] : i18n[lang]['btn-speak-off'];

    // Reload voices for language selection
    populateVoiceList();
}

// Speech recognition (STT) setup
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Speech recognition is not supported in this browser.");
        micBtn.style.display = 'none';
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        recording = true;
        micBtn.classList.add('recording');
        userInput.placeholder = (currentLang === 'zh' || currentLang === 'ta') ? '正在倾听...' : 'Listening...';
    };

    recognition.onend = () => {
        recording = false;
        micBtn.classList.remove('recording');
        userInput.placeholder = i18n[currentLang]['input-placeholder'];
    };

    recognition.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        userInput.value = resultText;
        userInput.focus();
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        recording = false;
        micBtn.classList.remove('recording');
        userInput.placeholder = i18n[currentLang]['input-placeholder'];
    };
}

// Scan browser speech synthesizers
function populateVoiceList() {
    if (!window.speechSynthesis) return;

    const voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';

    const targetLang = currentLang;
    const filteredVoices = voices.filter(voice => {
        const lang = voice.lang.toLowerCase();
        if (targetLang === 'ms') {
            return lang.startsWith('ms') || lang.startsWith('id');
        }
        return lang.startsWith(targetLang);
    });

    if (filteredVoices.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        let noVoiceText = 'No voices available';
        if (currentLang === 'zh') noVoiceText = '无可用系统声音';
        else if (currentLang === 'ja') noVoiceText = 'システム音声なし';
        else if (currentLang === 'ko') noVoiceText = '시스템 음성 없음';
        else if (currentLang === 'ta') noVoiceText = 'முறைமை குரல் கிடைக்கவில்லை';
        else if (currentLang === 'ms') noVoiceText = 'Tiada suara sistem tersedia';
        option.textContent = noVoiceText;
        voiceSelect.appendChild(option);
        return;
    }

    filteredVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.name === selectedVoiceName) {
            option.selected = true;
        }
        voiceSelect.appendChild(option);
    });

    // Choose natural voice by default
    if (!selectedVoiceName && filteredVoices.length > 0) {
        const premiumVoice = filteredVoices.find(v =>
            v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('online') ||
            v.name.toLowerCase().includes('siri') ||
            v.name.toLowerCase().includes('google')
        ) || filteredVoices[0];

        selectedVoiceName = premiumVoice.name;
        localStorage.setItem('selectedVoiceName', selectedVoiceName);
        const matchingOption = Array.from(voiceSelect.options).find(opt => opt.value === selectedVoiceName);
        if (matchingOption) {
            matchingOption.selected = true;
        }
    }

    updateVoiceWarning();
}

// Register voice changed listener for Chrome/Safari asynchronously loading online voices
if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Append manual click-to-speak button to assistant chat bubbles
function addSpeakButtonToBubble(bubbleElement, textToSpeak) {
    if (!window.speechSynthesis) return;

    // Clear any existing voice button to prevent duplicates
    const existingBtn = bubbleElement.querySelector('.bubble-speak-btn');
    if (existingBtn) existingBtn.remove();

    // Do not append if bubble is still in compiling/loading dots mode
    if (bubbleElement.querySelector('.loader-dots')) return;

    const speakBtn = document.createElement('button');
    speakBtn.className = 'bubble-speak-btn';
    speakBtn.title = 'Speak message';
    speakBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
    `;

    speakBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speakText(textToSpeak);
    });

    bubbleElement.appendChild(speakBtn);
}

// Text-to-Speech vocalizer with sentence splitting queue and Fish Audio API support

// Updates the persistent "Last spoken" badge in Settings so it's always
// clear which engine actually produced the last audio — since Fish Audio
// can silently fall back to the browser voice, the selected dropdown value
// alone isn't a reliable indicator of what just played.
function updateTtsLastUsedBadge(engine) {
    if (!ttsLastUsedDot || !ttsLastUsedText) return;

    if (engine === 'fishAudio') {
        ttsLastUsedDot.className = 'status-dot active';
        ttsLastUsedText.textContent = 'Last spoken: Fish Audio (cloud)';
    } else if (engine === 'browserFallback') {
        ttsLastUsedDot.className = 'status-dot error';
        ttsLastUsedText.textContent = 'Last spoken: Browser voice (Fish Audio fallback)';
    } else {
        // 'browserOnly' — the user's own selection, not a fallback
        ttsLastUsedDot.className = 'status-dot active';
        ttsLastUsedText.textContent = 'Last spoken: Browser voice (local)';
    }
}

// Builds the Fish Audio request target: our own local server proxy (npm
// start) first, falling back to a direct cloud call if that isn't available.
// There is no third-party CORS proxy option — routing API keys and message
// text through a public relay would break the app's zero-leakage privacy
// guarantee, so Fish Audio cloud TTS is simply local-server-only.
function buildFishAudioEndpoint(modelName) {
    const localProxyEndpoint = `/api/fish-tts${modelName ? `?model=${encodeURIComponent(modelName)}` : ''}`;
    const targetUrl = `https://api.fish.audio/v1/tts${modelName ? `?model=${encodeURIComponent(modelName)}` : ''}`;
    return { apiEndpoint: localProxyEndpoint, localProxyEndpoint, targetUrl };
}

// Fires the Fish Audio TTS request, retrying against the direct cloud API
// if the local proxy route 404s (not running) or the fetch itself fails.
async function fetchFishAudioResponse(apiEndpoint, localProxyEndpoint, targetUrl, authHeader, bodyObj) {
    const requestInit = {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObj)
    };

    try {
        const res = await fetch(apiEndpoint, requestInit);
        // On static hosts (e.g. GitHub Pages) there's no server.js to handle
        // this route, so the host itself rejects the request before it ever
        // reaches Fish Audio. Different hosts signal "no such route" differently:
        // a plain static server 404s, but GitHub Pages 405s a POST to any path
        // with no matching static file. Treat both as "local proxy isn't real here."
        if (!res.ok && apiEndpoint === localProxyEndpoint && (res.status === 404 || res.status === 405)) {
            console.warn(`[Fish Audio TTS] /api/fish-tts returned ${res.status} on current server (no local proxy here), trying direct cloud API...`);
            return await fetch(targetUrl, requestInit);
        }
        return res;
    } catch (errFallback) {
        if (apiEndpoint !== targetUrl) {
            console.warn('[Fish Audio TTS] Local proxy fetch failed, trying direct cloud API...', errFallback);
            return await fetch(targetUrl, requestInit);
        }
        throw errFallback;
    }
}

async function readFishAudioErrorDetail(res) {
    const errText = await res.text();
    let detail = `HTTP ${res.status}`;
    try {
        const parsed = JSON.parse(errText);
        if (parsed.message) detail += `: ${parsed.message}`;
        else if (parsed.detail) detail += `: ${typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail)}`;
        else detail += `: ${errText.slice(0, 120)}`;
    } catch (e) {
        if (errText) detail += `: ${errText.slice(0, 120)}`;
    }
    return detail;
}

// Cloud neural TTS path via Fish Audio. Always resolves — on any failure
// (missing key, CORS, network, playback error) it falls back to the
// browser's built-in voice rather than leaving the user with silence.
async function speakTextViaFishAudio(text, cleanedText, myToken) {
    const apiKey = (fishApiKeyInput ? fishApiKeyInput.value : (localStorage.getItem('fishApiKey') || '')).trim();
    const modelName = (fishModelInput ? fishModelInput.value : (localStorage.getItem('fishModel') || 's2.1-pro-free')).trim();
    const refId = (fishRefIdInput ? fishRefIdInput.value : (localStorage.getItem('fishRefId') || '19e0fb5083d44efb8aec7e08d88d896b')).trim();

    if (!apiKey) {
        console.warn('[Fish Audio TTS] Missing API Key.');
        const warnMsg = i18n[currentLang]['error-fish-api-key-missing'] || 'Please enter your Fish Audio API Key.';
        showNotification(warnMsg, 'error');
        updateTtsLastUsedBadge('browserFallback');
        speakText(text, true); // fallback to browser SpeechSynthesis
        return;
    }

    const authHeader = apiKey.toLowerCase().startsWith('bearer ') ? apiKey : `Bearer ${apiKey}`;

    try {
        voiceAgent.notifyAISpeakingStart();

        const bodyObj = { text: cleanedText, format: 'mp3', model: modelName || 's2.1-pro-free' };
        if (refId) bodyObj.reference_id = refId;

        const { apiEndpoint, localProxyEndpoint, targetUrl } = buildFishAudioEndpoint(modelName);

        console.log(`[Fish Audio TTS] Requesting TTS via "${apiEndpoint}" (Model: "${modelName || 's2.1-pro-free'}")`);

        const res = await fetchFishAudioResponse(apiEndpoint, localProxyEndpoint, targetUrl, authHeader, bodyObj);

        if (!res.ok) {
            throw new Error(await readFishAudioErrorDetail(res));
        }

        const audioBlob = await res.blob();

        // A newer speak/stop request superseded this one while we were
        // fetching (e.g. barge-in) — don't play a stale response.
        if (myToken !== ttsToken) return;

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentFishAudio = audio;

        audio.onended = () => {
            currentFishAudio = null;
            URL.revokeObjectURL(audioUrl);
            voiceAgent.notifyAISpeakingEnd();
        };

        audio.onerror = (e) => {
            console.error('[Fish Audio TTS] Audio playback error:', e);
            currentFishAudio = null;
            URL.revokeObjectURL(audioUrl);
            voiceAgent.notifyAISpeakingEnd();
            showNotification('Fish Audio audio playback failed. Falling back to browser voice.', 'error', 8000);
            updateTtsLastUsedBadge('browserFallback');
            speakText(text, true);
        };

        await audio.play();
        updateTtsLastUsedBadge('fishAudio');
    } catch (err) {
        console.error('[Fish Audio TTS] Request failed:', err);
        voiceAgent.notifyAISpeakingEnd();
        const detailMsg = err.message || String(err);
        let warnMsg = `Fish Audio API Error: ${detailMsg}. Falling back to browser voice.`;
        if (detailMsg.includes('Failed to fetch') || detailMsg.includes('NetworkError')) {
            warnMsg = `Fish Audio request blocked by browser CORS policy. Falling back to browser voice.`;
        }
        showNotification(warnMsg, 'error', 8000);
        updateTtsLastUsedBadge('browserFallback');
        speakText(text, true);
    }
}

// Splits cleaned text into sentences so long responses don't hit the
// browser SpeechSynthesis timeout bug on very long single utterances.
function splitIntoSentences(cleanedText) {
    return cleanedText
        .split(/([。！？.!?\n;；])/g)
        .reduce((acc, current, index) => {
            if (index % 2 === 0) {
                acc.push(current);
            } else if (acc.length > 0) {
                acc[acc.length - 1] += current;
            }
            return acc;
        }, [])
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

function detectSpeechLanguage(cleanedText) {
    const hasTamil = /[஀-௿]/.test(cleanedText);
    const hasKorean = /[가-힣]/.test(cleanedText);
    const hasJapanese = /[぀-ゟ゠-ヿ]/.test(cleanedText);
    const hasChinese = !hasJapanese && !hasKorean && !hasTamil && /[一-龥]/.test(cleanedText);

    if (hasTamil) return 'ta';
    if (hasKorean) return 'ko';
    if (hasJapanese) return 'ja';
    if (hasChinese) return 'zh';
    if (currentLang === 'ms') return 'ms';
    return 'en';
}

// Offline fallback: match an equivalent local voice by language and, where
// possible, the same apparent gender as the user's originally selected voice.
function selectOfflineVoice(voices, textLang) {
    const originalVoiceName = (voiceSelect.value || selectedVoiceName || '').toLowerCase();
    const femaleMarkers = ['female', 'serena', 'evelyn', 'zira', 'natasha', 'hazel', 'heera', 'elizabeth', 'clara', 'tina', 'carly', 'lisa'];
    const isFemale = femaleMarkers.some(marker => originalVoiceName.includes(marker));

    if (isFemale) {
        const femaleNameMarkers = ['zira', 'hazel', 'female', 'haruka', 'hanhan', 'heera', 'elizabeth', 'clara', 'lisa'];
        const femaleVoice = voices.find(voice =>
            voice.lang.toLowerCase().startsWith(textLang) &&
            !voice.name.toLowerCase().includes('online') &&
            femaleNameMarkers.some(marker => voice.name.toLowerCase().includes(marker))
        );
        if (femaleVoice) return femaleVoice;
    }

    return voices.find(voice =>
        voice.lang.toLowerCase().startsWith(textLang) &&
        !voice.name.toLowerCase().includes('online')
    ) || null;
}

// Online path: honor the user's exact voice selection, falling back to the
// first available voice for the detected text language if it doesn't match.
function selectOnlineVoice(voices, textLang) {
    const voiceNameToMatch = voiceSelect.value || selectedVoiceName;
    let matchingVoice = voices.find(voice => voice.name === voiceNameToMatch);

    console.log(`[TTS] Requesting voice: "${voiceNameToMatch}" (Text Lang: "${textLang}")`);

    const selectedVoiceLangMatches = matchingVoice && matchingVoice.lang.toLowerCase().startsWith(textLang);
    if (!selectedVoiceLangMatches) {
        console.warn(`[TTS] Voice lang mismatch or not found. Falling back to first available voice for "${textLang}".`);
        matchingVoice = voices.find(voice => voice.lang.toLowerCase().startsWith(textLang));
    }

    if (matchingVoice) {
        console.log(`[TTS] Final voice selected: "${matchingVoice.name}" (${matchingVoice.lang})`);
    }
    return matchingVoice || null;
}

function langToBcp47(textLang) {
    switch (textLang) {
        case 'zh': return 'zh-CN';
        case 'ja': return 'ja-JP';
        case 'ko': return 'ko-KR';
        case 'ta': return 'ta-IN';
        case 'ms': return 'ms-MY';
        default: return 'en-US';
    }
}

// Browser SpeechSynthesis path: queues one utterance per sentence, wiring
// up barge-in notifications and a COEP-failure fallback to an offline voice.
function speakSentencesViaBrowserVoice(sentences, matchingVoice, textLang, useOfflineVoice, myToken) {
    setTimeout(() => {
        // A newer speak/stop request superseded this one while we were
        // waiting on this delay (e.g. barge-in) — don't queue stale speech.
        if (myToken !== ttsToken) return;

        try {
            window.speechSynthesis.resume();
            voiceAgent.notifyAISpeakingStart();

            sentences.forEach((sentence, index) => {
                const utterance = new SpeechSynthesisUtterance(sentence);
                if (matchingVoice) {
                    utterance.voice = matchingVoice;
                    utterance.lang = matchingVoice.lang;
                } else {
                    utterance.lang = langToBcp47(textLang);
                }

                if (index === sentences.length - 1) {
                    utterance.onend = () => voiceAgent.notifyAISpeakingEnd();
                }

                utterance.onerror = (e) => {
                    console.error("Speech utterance failed:", e.error);
                    if (index === sentences.length - 1) {
                        voiceAgent.notifyAISpeakingEnd();
                    }
                    if (e.error === 'synthesis-failed') {
                        console.warn("[TTS] Cloud voice synthesis failed. This is caused by Cross-Origin Embedder Policy (COEP) headers blocking external Microsoft/Google neural audio streams. Falling back to local offline voice.");
                        const warnMsg = i18n[currentLang]['error-tts-coep'] || 'Speech synthesis failed. Cloud neural voices are blocked by security headers (COEP). Automatically falling back to an equivalent local offline voice.';
                        showNotification(warnMsg, 'error');
                    }
                    if (!useOfflineVoice && (matchingVoice && matchingVoice.name.toLowerCase().includes('online'))) {
                        const remainingText = sentences.slice(index).join(' ');
                        speakText(remainingText, true);
                    }
                };

                if (!window.activeUtterances) window.activeUtterances = [];
                window.activeUtterances.push(utterance);

                window.speechSynthesis.speak(utterance);
            });
        } catch (speakError) {
            console.error("Speech Synthesis run error:", speakError);
        }
    }, 100);
}

function speakTextViaBrowserVoice(cleanedText, useOfflineVoice, myToken) {
    if (!window.speechSynthesis) return;

    window.activeUtterances = []; // Reset reference triggers

    const sentences = splitIntoSentences(cleanedText);
    if (sentences.length === 0) return;

    const textLang = detectSpeechLanguage(cleanedText);
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = useOfflineVoice
        ? selectOfflineVoice(voices, textLang)
        : selectOnlineVoice(voices, textLang);

    speakSentencesViaBrowserVoice(sentences, matchingVoice, textLang, useOfflineVoice, myToken);
}

async function speakText(text, useOfflineVoice = false) {
    stopAudioPlayback();
    const myToken = ttsToken;

    const activeEngine = ttsEngineSelect ? ttsEngineSelect.value : (localStorage.getItem('ttsEngine') || 'webSpeech');

    // Strip markdown markers and emojis
    const cleanedText = text
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/[*_`#-]/g, ' ')
        .trim();

    if (!cleanedText) return;

    if (activeEngine === 'fishAudio' && !useOfflineVoice) {
        await speakTextViaFishAudio(text, cleanedText, myToken);
        return;
    }

    // Only mark this as the user's own choice if we didn't just get here via
    // a Fish Audio fallback — those already set 'browserFallback' themselves.
    if (activeEngine !== 'fishAudio') {
        updateTtsLastUsedBadge('browserOnly');
    }

    speakTextViaBrowserVoice(cleanedText, useOfflineVoice, myToken);
}

function updateVoiceWarning() {
    if (!voiceSelect || !voiceWarning) return;
    const isOnline = voiceSelect.value.toLowerCase().includes('online') || voiceSelect.value.toLowerCase().includes('google');
    voiceWarning.style.display = isOnline ? 'block' : 'none';
}

// Chat exporter handler
function exportChatHistory(format) {
    if (chatHistory.length === 0) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `${appConfig.appName.toLowerCase().replace(/\s+/g, '-')}-chat-${dateStr}`;

    if (format === 'md') {
        let mdContent = `# Chat History - ${appConfig.appName}\n\n`;
        mdContent += `*Export Date: ${new Date().toLocaleString()}*\n\n`;
        chatHistory.forEach(msg => {
            const senderName = msg.role === 'user' ? i18n[currentLang]['user-avatar'] : i18n[currentLang]['assistant-avatar'];
            mdContent += `### **${senderName}**:\n${msg.content}\n\n`;
        });
        downloadBlob(mdContent, `${fileName}.md`, 'text/markdown');
    } else if (format === 'txt') {
        let txtContent = `=== Chat History - ${appConfig.appName} ===\n`;
        txtContent += `Export Date: ${new Date().toLocaleString()}\n\n`;
        chatHistory.forEach(msg => {
            const senderName = msg.role === 'user' ? i18n[currentLang]['user-avatar'] : i18n[currentLang]['assistant-avatar'];
            txtContent += `[${senderName}]:\n${msg.content}\n\n====================\n\n`;
        });
        downloadBlob(txtContent, `${fileName}.txt`, 'text/plain');
    } else if (format === 'json') {
        const jsonContent = JSON.stringify(chatHistory, null, 2);
        downloadBlob(jsonContent, `${fileName}.json`, 'application/json');
    }
}

// Utility download trigger
function downloadBlob(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

// PWA Service worker registrar
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Clean up any old coi-serviceworker registrations to lift the COEP header locks
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                if (registration.active && registration.active.scriptURL.includes('coi-serviceworker.js')) {
                    registration.unregister().then(success => {
                        if (success) {
                            console.log('[ServiceWorker] Unregistered coi-serviceworker.js. Reloading page...');
                            window.location.reload();
                        }
                    });
                }
            }
        });

        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('PWA Service Worker registered successfully:', reg.scope))
                .catch(err => console.warn('PWA Service Worker registration failed:', err));
        });
    }

    // Capture install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        if (pwaInstallCard) {
            pwaInstallCard.style.display = 'block';
        }
    });

    window.addEventListener('appinstalled', () => {
        console.log('App was installed successfully');
        if (pwaInstallCard) {
            pwaInstallCard.style.display = 'none';
        }
        deferredInstallPrompt = null;
    });
}

if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = populateVoiceList;
}

document.addEventListener('DOMContentLoaded', init);
