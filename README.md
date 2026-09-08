# 🤖 On-Device AI Assistant

A **fully offline AI assistant** that runs entirely on your phone — no internet required, no data leaves your device. Built with React Native and [llama.cpp](https://github.com/ggml-org/llama.cpp) for private, on-device LLM inference.

## ✨ Features

- **100% Offline** — No network calls. No cloud. No data collection. Works in airplane mode.
- **On-Device LLM** — Runs a quantized Qwen 2.5 1.5B model directly on the phone's CPU via `llama.cpp`.
- **Chat Interface** — Natural conversation with token streaming (responses appear word-by-word).
- **Intent Detection** — Recognizes commands like "Call Mom", "Set alarm for 8 AM", "Search for weather" and triggers native device actions.
- **Voice Input** — Hold the 🎙️ button to speak your message (speech-to-text).
- **Text-to-Speech** — The assistant reads its responses aloud.
- **Debug Overlay** — Shows Time to First Token (TTFT) and Tokens/sec for benchmarking.
- **Prompt Sanitization** — Strips dangerous characters and enforces length limits.
- **Model Integrity Check** — SHA-256 verification of the model file before loading.

## 📁 Project Structure

```
On-Device-AI-Assistant/
├── README.md                       # This file
├── architecture_design.md          # Technical architecture document
├── feasibility_analysis.md         # Feasibility study for on-device LLMs
├── models/                         # Place your .gguf model here (not in repo)
└── OnDeviceAssistant/              # React Native application
    ├── App.tsx                     # Root component (Chat ↔ Settings navigation)
    ├── package.json                # Dependencies and scripts
    ├── index.js                    # App entry point
    ├── metro.config.js             # Metro bundler config
    ├── babel.config.js             # Babel config
    ├── tsconfig.json               # TypeScript config
    ├── patches/                    # patch-package patches (auto-applied on npm install)
    │   ├── @react-native-community+voice+1.1.9.patch
    │   └── react-native-tts+4.1.1.patch
    ├── src/
    │   ├── components/
    │   │   ├── ChatScreen.js       # Main chat UI with voice input
    │   │   ├── SettingsScreen.js   # Model path configuration & loading
    │   │   └── DebugOverlay.js     # TTFT / Tok/s performance overlay
    │   ├── services/
    │   │   ├── LLMService.js       # llama.cpp inference (intent + chat modes)
    │   │   └── ActionHandler.js    # Executes parsed intents (Call, SMS, Alarm, etc.)
    │   └── security/
    │       ├── Sanitizer.js        # Prompt sanitization (length + character filtering)
    │       └── ModelVerifier.js    # SHA-256 model integrity verification
    ├── android/                    # Android native project (Gradle)
    └── ios/                        # iOS native project (Xcode)
```

---

## 💻 Hardware Requirements & Low-End Systems

Running an AI model locally along with an Android Emulator requires significant system resources. 

**Recommended System:**
- 16GB+ RAM
- Modern multi-core CPU (Intel i5/i7 10th Gen+, AMD Ryzen 5+, or Apple M1/M2)

### ⚠️ Running on Low-End Laptops (e.g., 8GB RAM, Pentium/Celeron)
If you have an older laptop with only 8GB of RAM or a slower processor, **do not use the Android Emulator**. The combination of Windows (4GB), Android Studio (2GB), the Emulator (3GB), and the AI model (1GB) will exceed 8GB of RAM, causing the system to freeze or crash heavily.

**Survival Guide for Low-End Systems:**
Instead of an emulator, **use a physical Android phone**:
1. Connect a real Android phone to the laptop via a USB cable.
2. Enable **Developer Options** and **USB Debugging** on the phone.
3. Close Android Studio completely (it uses too much RAM). Use a lightweight editor like VS Code or Notepad.
4. Push the model to the physical device using `adb` (see Step 5 below).
5. Run `npm run android`.
   
This builds the app on the laptop but runs the heavy AI inference entirely on the physical phone, freeing up your laptop's RAM and CPU!

---

## 🚀 Setup Guide — Android Emulator

Follow these steps **exactly** to get the app running on an Android Emulator or a physical device. Instructions are provided for both **Windows** and **macOS**.

---

### Step 1: Install Prerequisites

#### 1.1 — Install Node.js (v18 or newer)

| Platform | Instructions |
|----------|-------------|
| **Windows** | Download the LTS installer from [nodejs.org](https://nodejs.org/). Run it and accept all defaults. |
| **macOS** | `brew install node` (if you have Homebrew), or download from [nodejs.org](https://nodejs.org/). |

**Verify:**
```sh
node --version    # Should print v18.x.x or higher
npm --version     # Should print 9.x.x or higher
```

#### 1.2 — Install Java Development Kit (JDK 17)

> ⚠️ **JDK 17 is recommended.** JDK 21+ may work but can cause Gradle compatibility warnings.

| Platform | Instructions |
|----------|-------------|
| **Windows** | Download JDK 17 from [Adoptium (Eclipse Temurin)](https://adoptium.net/). During installation, check the box **"Set JAVA_HOME variable"**. |
| **macOS** | `brew install --cask temurin@17` |

**Verify:**
```sh
java -version     # Should print openjdk version "17.x.x"
```

**Set `JAVA_HOME` (if not set automatically):**

**Windows** (PowerShell as Administrator):
```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot", "User")
```
*(Replace the path with your actual JDK installation path.)*

**macOS** (add to `~/.zshrc`):
```sh
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

#### 1.3 — Install Android Studio

1. Download and install [Android Studio](https://developer.android.com/studio).
2. On first launch, the **Setup Wizard** will guide you. Accept all defaults — it will download:
   - Android SDK
   - Android SDK Build-Tools
   - Android Emulator
3. **Accept SDK licenses** (this is critical or Gradle will refuse to build):

   **Windows:**
   ```powershell
   cd "$env:LOCALAPPDATA\Android\Sdk"
   .\cmdline-tools\latest\bin\sdkmanager.bat --licenses
   ```

   **macOS:**
   ```sh
   cd ~/Library/Android/sdk
   ./cmdline-tools/latest/bin/sdkmanager --licenses
   ```
   Type `y` and press Enter for each license prompt.

4. **Set `ANDROID_HOME` environment variable:**

   **Windows** (PowerShell as Administrator):
   ```powershell
   [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
   ```

   **macOS** (add to `~/.zshrc`):
   ```sh
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
   Then run `source ~/.zshrc`.

#### 1.4 — Install NDK (Required for llama.cpp native compilation)

The project uses `llama.rn` which compiles C++ code via NDK.

**Windows:**
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" "ndk;27.1.12297006"
```

**macOS:**
```sh
~/Library/Android/sdk/cmdline-tools/latest/bin/sdkmanager "ndk;27.1.12297006"
```

---

### Step 2: Create an Android Emulator (AVD)

1. Open **Android Studio**.
2. Click **More Actions** (or **Tools**) → **Device Manager**.
3. Click **Create Virtual Device**.
4. Select a device, e.g., **Pixel 7** → click **Next**.
5. Select a system image:
   - Recommended: **API 34 (Android 14)** or **API 35 (Android 15)**, **x86_64** architecture.
   - Click **Download** next to the image if it's not yet downloaded.
6. Click **Next** → **Finish**.
7. In Device Manager, click the ▶️ **Play** button to start the emulator. Wait until it fully boots to the home screen.

> 💡 **Tip**: Keep the emulator running in the background for the remaining steps.

---

### Step 3: Download the AI Model

The app uses a **GGUF quantized model** (~1.1 GB). This file is too large for GitHub, so you must download it separately.

1. Download the model:
   - **Model**: `qwen2.5-1.5b-instruct-q4_k_m.gguf`
   - **Download link**: [Hugging Face — Qwen2.5-1.5B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF)
     - Click the **Files and versions** tab.
     - Download the file named `qwen2.5-1.5b-instruct-q4_k_m.gguf`.

2. Place the downloaded file in the `models/` folder at the root of this project:
   ```
   On-Device-AI-Assistant/
   └── models/
       └── qwen2.5-1.5b-instruct-q4_k_m.gguf   ← place here
   ```

---

### Step 4: Clone the Repository & Install Dependencies

```sh
git clone https://github.com/Ankit-0107/On-Device-AI-Assistant.git
cd On-Device-AI-Assistant/OnDeviceAssistant
npm install
```

> `npm install` will automatically run `patch-package` (via the `postinstall` script) to apply the required patches in the `patches/` folder. These fix compatibility issues with `react-native-tts` and `@react-native-community/voice`.

---

### Step 5: Push the Model to the Emulator

The app expects the model file to be in its **Document Directory** on the device. Use `adb` to push it:

**Windows:**
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" push ".\models\qwen2.5-1.5b-instruct-q4_k_m.gguf" "/data/local/tmp/qwen2.5-1.5b-instruct-q4_k_m.gguf"
```

**macOS:**
```sh
adb push ./models/qwen2.5-1.5b-instruct-q4_k_m.gguf /data/local/tmp/qwen2.5-1.5b-instruct-q4_k_m.gguf
```

> ⏳ This will take a few minutes as it copies ~1.1 GB to the emulator.

After the app is installed (Step 6), copy the model from `/data/local/tmp/` to the app's document directory:
```sh
adb shell "run-as com.ondeviceassistant.app cp /data/local/tmp/qwen2.5-1.5b-instruct-q4_k_m.gguf /data/data/com.ondeviceassistant.app/files/qwen2.5-1.5b-instruct-q4_k_m.gguf"
```

---

### Step 6: Build and Run the App

Make sure the emulator is running (you should see it in `adb devices`):
```sh
adb devices
# Should show something like: emulator-5554   device
```

*(Use the full path to `adb` as shown in Step 5 if it's not in your PATH.)*

Now, start the Metro bundler and build the app:

**Terminal 1 — Start Metro:**
```sh
cd OnDeviceAssistant
npm start
```

**Terminal 2 — Build and install on emulator:**
```sh
cd OnDeviceAssistant
npm run android
```

> ⏳ **First build takes 5–15 minutes** as Gradle downloads dependencies and compiles the native C++ code (`llama.cpp`). Subsequent builds are much faster.

The app should launch automatically on the emulator once the build completes.

---

### Step 7: Load the Model in the App

1. In the app, tap **Settings** (top-right corner).
2. The model path should already be set to:
   ```
   /data/data/com.ondeviceassistant.app/files/qwen2.5-1.5b-instruct-q4_k_m.gguf
   ```
3. Tap **Verify & Load Model**.
4. Wait for the "Model verified and loaded successfully" confirmation.
5. Tap **Back** → start chatting!

---

## 🔧 Troubleshooting

### Build Errors

| Problem | Solution |
|---------|----------|
| `SDK location not found` | Set `ANDROID_HOME` environment variable (see Step 1.3). |
| `Failed to install the following Android SDK packages` | Open Android Studio → SDK Manager → install the missing packages. |
| `Could not determine the dependencies of task ':app:compileDebugJavaWithJavac'` | Run `cd android && ./gradlew clean` (or `.\gradlew.bat clean` on Windows), then retry. |
| `NDK not configured` | Install NDK v27.1.12297006 via SDK Manager (see Step 1.4). |
| `Execution failed for task ':app:mergeDebugNativeLibs'` | Run `cd android && ./gradlew clean` and retry. |
| License errors | Run `sdkmanager --licenses` and accept all (see Step 1.3). |

### Runtime Errors

| Problem | Solution |
|---------|----------|
| `Model file not found` | Ensure you pushed the model via `adb` AND copied it with `run-as` (see Step 5). |
| `llama.cpp init failed` | The emulator may not have enough RAM. In AVD settings, increase RAM to 4 GB+. |
| App crashes on model load | Try a smaller model (e.g., `q3_k_s` quantization). Emulators are slower than real devices. |
| `INSTALL_FAILED_INSUFFICIENT_STORAGE` | The emulator disk is full. Create a new AVD with more internal storage (8 GB+). |

### Metro / Hot Reload

| Problem | Solution |
|---------|----------|
| `Unable to load script` | Make sure Metro is running (`npm start` in Terminal 1). |
| Changes not reflecting | Press `R` twice in the emulator, or shake device → Reload. |

---

## 📊 Architecture Overview

```
┌──────────────────────────────────────┐
│         React Native (JS/TS)         │
│  ChatScreen → LLMService → Bridge   │
├──────────────────────────────────────┤
│       Native Bridge (JNI/ObjC++)     │
├──────────────────────────────────────┤
│         llama.cpp (C++ / ARM64)      │
│    ┌─────────────┐                   │
│    │  GGUF Model  │  (on-device)     │
│    └─────────────┘                   │
└──────────────────────────────────────┘
        ↕ No network calls ↕
```

**Data Flow:**
1. User types/speaks a message.
2. LLMService first tries **intent classification** (CALL, SMS, ALARM, WEB_SEARCH).
3. If an intent is detected → `ActionHandler` triggers the native action.
4. If it's a general chat → tokens are streamed back from `llama.cpp` and displayed in real-time.
5. The assistant speaks the response aloud via TTS.

---

## 📄 Key Dependencies

| Package | Purpose |
|---------|---------|
| `llama.rn` | React Native bindings for `llama.cpp` — on-device LLM inference |
| `react-native-tts` | Text-to-Speech — assistant reads responses aloud |
| `@react-native-community/voice` | Speech-to-Text — voice input via microphone |
| `react-native-fs` | File system access — reading model files from device storage |
| `react-native-keychain` | Secure storage (for future use) |
| `react-native-safe-area-context` | Safe area insets for notched devices |
| `patch-package` | Applies compatibility patches automatically on `npm install` |

---

## 📜 License

This project is a college minor project submission. See the repository for license details.
