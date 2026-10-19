# Control Panel Telemetry & Feature Suggestions

This document lists viable, high-value data points and device metrics that can be extracted client-side via native browser Web APIs and logged to Cloud Firestore to enrich device profiles in the astrong.xyz control panel.

---

### 1. PWA & Standalone Display Mode
- **API**: `window.matchMedia('(display-mode: standalone)').matches`
- **What it tracks**: Whether the user is viewing astrong.xyz in a standard browser tab, as an installed Progressive Web App (PWA) on their desktop/mobile home screen, or in fullscreen mode.
- **Why it's useful**: Immediately shows whether a device has pinned or installed your site to their OS.

### 2. Multi-Monitor Setup & Screen Extended State
- **API**: `window.screen.isExtended` / `window.getScreenDetails?.()`
- **What it tracks**: Boolean flag indicating if the device is connected to multiple physical external monitors.
- **Why it's useful**: Quickly identifies desktop workstation rigs vs. single-screen laptops and phones.

### 3. Display HDR & Wide Color Gamut (P3)
- **API**: `window.matchMedia('(dynamic-range: high)').matches` & `window.matchMedia('(color-gamut: p3)').matches`
- **What it tracks**: Detects if the device has a high-dynamic-range (HDR) display or Apple Display P3 wide-gamut panel (e.g. MacBook Liquid Retina XDR, iPhone OLED, high-end PC gaming monitors).
- **Why it's useful**: Enhances hardware profiling and performance categorization.

### 4. Storage Quota & Available Disk Space Bucket
- **API**: `navigator.storage.estimate()`
- **What it tracks**: Estimated disk storage quota assigned to the origin (e.g. 150 GB total quota, 45 MB used).
- **Why it's useful**: Gives an approximate magnitude of the client device's total disk capacity without needing native system permissions.

### 5. Input Device Modality & Pointer Precision
- **API**: `window.matchMedia('(pointer: fine)').matches`, `(hover: hover)`, and PointerEvent `pointerType`
- **What it tracks**: Detects whether the user is navigating via precise mouse/trackpad (`fine`), touch (`coarse`), or digital stylus/pen (`pen` with pressure support).
- **Why it's useful**: Accurately distinguishes tablets with keyboards/mice, touch-screen laptops, and dedicated mobile devices.

### 6. Tab Visibility, Focus Dwell Time & Active Engagement
- **API**: `document.visibilityState` & Page Visibility API timers
- **What it tracks**: Total foreground active dwell time vs background tab duration (e.g. "Active: 4m 12s | Background: 22m 05s").
- **Why it's useful**: Differentiates between someone actively reading your schedule/tools and someone who left the tab open in the background for hours.

### 7. Max Scroll Depth & Interaction Milestones
- **API**: `window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)`
- **What it tracks**: The maximum scroll percentage reached on each page visit (e.g. 25%, 50%, 75%, 100%) and whether specific interactive triggers (modals, search bars, shape cyclers) were activated.
- **Why it's useful**: Shows how deeply a visitor engaged with page content before navigating away.

### 8. WebGL Max Texture Size & Render Capabilities
- **API**: `gl.getParameter(gl.MAX_TEXTURE_SIZE)`, `gl.MAX_RENDERBUFFER_SIZE`, `gl.getSupportedExtensions()`
- **What it tracks**: Maximum 2D texture dimensions (e.g. 16384px vs 8192px vs 4096px) and supported graphics extensions.
- **Why it's useful**: Accurately classifies GPU tier (discrete high-end gaming GPU, Apple Metal silicon, budget mobile SoC, or software renderer).

### 9. AudioContext Hardware Sample Rate & Latency
- **API**: `new (window.AudioContext || window.webkitAudioContext)().sampleRate` & `baseLatency`
- **What it tracks**: Native audio hardware sampling rate (e.g. 48,000 Hz, 44,100 Hz, 96,000 Hz) and output latency.
- **Why it's useful**: Provides a lightweight hardware audio signature that helps identify studio monitors, external DACs, and distinct OS audio subsystems without requiring microphone permissions.

### 10. Data Saver Mode & Cellular Metered Connection
- **API**: `navigator.connection.saveData` (boolean)
- **What it tracks**: Whether the user has toggled "Data Saver" or "Low Data Mode" on their operating system or browser.
- **Why it's useful**: Identifies mobile users on capped data plans or slow roaming connections.

### 11. Media Hardware Codec Support (AV1, HEVC, VP9, Opus)
- **API**: `navigator.mediaCapabilities.decodingInfo()`
- **What it tracks**: Queries hardware-accelerated playback support for modern video codecs (AV1, H.265/HEVC, VP9) and audio formats (Opus, AAC).
- **Why it's useful**: Distinguishes modern silicon (which has dedicated AV1/HEVC decoders) from older legacy hardware.

### 12. Gamepad & Controller Connectivity
- **API**: `window.addEventListener('gamepadconnected', ...)` / `navigator.getGamepads()`
- **What it tracks**: Brand and model of connected USB/Bluetooth game controllers (e.g. Xbox Wireless Controller, Sony DualSense, Nintendo Switch Pro Controller).
- **Why it's useful**: Fun telemetry data point for devices being used on gaming consoles, Steam Decks, or gaming PCs.
