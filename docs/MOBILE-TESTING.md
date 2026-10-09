# Testing a Local Dev Server from a Mobile Device

> **Shortcut:** if you just want to try the app on your phone, deploy to GitHub Pages and open that URL — it has HTTPS and everything works. This guide is only for testing **local, uncommitted changes** on a real phone.

**Which option to use:** Android with a USB cable → Option 1. iPhone (or no cable) → Option 2. Option 3 only if you specifically need the LAN IP and are willing to install a root certificate on the phone.

## Why a plain LAN URL doesn't work

WebGPU, the Cache API, and Service Workers only exist in a **secure context**. Browsers treat `http://localhost` as secure, but `http://192.168.x.x:3000` is not — the app will report "WebGPU unsupported" even on a capable phone. You need one of the options below.

## Option 1: Android over USB (recommended)

1. Enable **USB debugging** on the phone (Settings → Developer options).
2. Connect via USB and run:
   ```bash
   adb reverse tcp:3000 tcp:3000
   npm start
   ```
3. Open `http://localhost:3000` in Chrome **on the phone** — `localhost` on the phone now tunnels to your PC server (including built-in Fish Audio TTS proxy), so it counts as a secure context.
4. Bonus: open `chrome://inspect` in desktop Chrome to get full DevTools against the phone's tab.

## Option 2: HTTPS tunnel (recommended for iPhone)

```bash
npm start
npx cloudflared tunnel --url http://localhost:3000
```

Open the generated `https://….trycloudflare.com` URL on the phone. (ngrok works the same way.) You are still testing your local, uncommitted code — the tunnel simply provides a certificate the phone already trusts.

## Option 3: LAN IP with a local certificate (mkcert)

```powershell
mkcert -install
mkcert 192.168.1.50   # your PC's LAN IP
npx serve . --ssl-cert 192.168.1.50.pem --ssl-key 192.168.1.50-key.pem
```

Open `https://192.168.1.50:3000` on the phone.

> ⚠️ **The cert must be genuinely trusted — do not just tap through the warning.**
> If the phone shows a certificate warning and you "Proceed anyway", the page loads
> but WebKit/iOS **silently blocks all persistent storage** (OPFS and the Cache API).
> The model then cannot be cached, downloads fall back to RAM, and iOS kills the tab
> mid-download with **no error** — it looks like the app randomly resets around 40–50%.
> The same happens in a **Private Browsing** tab. To use this option on iPhone you must
> install the mkcert root CA on the device: run `mkcert -CAROOT` on the PC, copy
> `rootCA.pem` to the phone, install it (Settings → General → VPN & Device Management),
> then enable full trust (Settings → General → About → Certificate Trust Settings).
> If that's too much hassle, use Option 2 instead.

**Windows firewall gotcha:** if the phone can't connect at all, your Wi-Fi is probably profiled as *Public*, which blocks inbound connections. In an admin PowerShell:

```powershell
New-NetFirewallRule -DisplayName "dev server 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

Also check that your router doesn't have client/AP isolation enabled.

## Seeing console errors on the phone

iOS has no remote DevTools from Windows. Append `?debug` to the URL (e.g. `https://…:3000/?debug`) to load an on-device console (eruda) with logs, network, and storage inspection.

## Notes on caching behavior

* The **origin is part of the storage key**: a model cached at `http://localhost:3000` is not reused at `https://192.168.x.x:3000`. Pick one URL and stick with it.
* On iOS, all browsers are WebKit; storage quotas are small and evicted after 7 days of inactivity. Install the PWA to the home screen for persistent model caching.
