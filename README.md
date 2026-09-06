# On-Device AI Assistant

An offline AI assistant running entirely on-device for Android and iOS using a small, quantized open-weight model. This app is built with React Native and `llama.cpp` to guarantee structural privacy (no internet permissions required).

## Features
- **100% Offline**: No network calls, completely private.
- **Cross-Platform**: Runs on both Android and iOS.
- **Low Resource**: Optimized for mobile devices (6GB+ RAM recommended) using quantized GGUF models.

## Project Structure
- `OnDeviceAssistant/` - The React Native application.
- `models/` - Directory for storing downloaded `.gguf` model files.
- `architecture_design.md` - Technical architecture and constraints.
- `feasibility_analysis.md` - Analysis of running LLMs on mobile devices.

## Prerequisites

### Windows / Mac (Android)
- [Node.js](https://nodejs.org/) (v18 or newer)
- [Android Studio](https://developer.android.com/studio) (for Android Emulator and SDK)
- Java Development Kit (JDK) 17

### Mac Only (iOS)
- [Xcode](https://developer.apple.com/xcode/)
- [CocoaPods](https://cocoapods.org/)

## Setup Instructions

### 1. Clone the repository
```sh
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Download the Model
Since model files are large, they are not included in the repository.
1. Download a compatible GGUF model, for example: `qwen2.5-1.5b-instruct-q4_k_m.gguf`. (You can find quantized models on [Hugging Face](https://huggingface.co/)).
2. Place the downloaded `.gguf` file inside the `models/` folder in the root of the project.
*Note: Make sure the model filename matches what is expected in the React Native codebase (or update the app code to point to your specific model name).*

### 3. Install Dependencies
Navigate to the app directory and install NPM packages:
```sh
cd OnDeviceAssistant
npm install
```

*(Mac only) Install iOS Pods:*
```sh
cd ios
bundle install
bundle exec pod install
cd ..
```

### 4. Run the Application

Start the Metro bundler:
```sh
npm start
```

In a new terminal, build and run the app:
**For Android:**
```sh
npm run android
```

**For iOS (Mac only):**
```sh
npm run ios
```

## Troubleshooting
- **Build Failures:** Ensure you have accepted Android SDK licenses in Android Studio. On iOS, try `cd ios && pod deintegrate && pod install`.
- **Model not loading:** Ensure the model is correctly placed in the `models/` directory (and/or copied to the app's sandboxed document directory as expected by the native bridge).
- **Out of Memory (OOM):** If the app crashes on generation, try a smaller model (e.g., `< 1B parameters` or lower quantization like `q3`).
