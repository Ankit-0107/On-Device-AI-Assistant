# Architecture Design: On-Device AI Assistant (Minor Project)

## Understanding Summary
- **What:** An offline AI assistant running entirely on-device (React Native cross-platform app) for Android and iOS using a small, quantized open-weight model.
- **Why:** To guarantee user privacy structurally (by not requesting the INTERNET permission).
- **Who:** Built by a solo developer for an Indian engineering college minor project submission.
- **Key Constraints:** Must never make a network call. Must run within the thermal and RAM constraints of budget mobile hardware (which severely limit sustained generation).
- **Explicit Non-goals:** Not aiming to match cloud-based LLM knowledge or fluid conversational abilities; tasks are tightly scoped to utility and structured commands.

## Assumptions
- The primary target is a 6GB+ RAM device. 4GB devices will be treated as a fallback requiring a smaller (1B) model.
- College evaluators value a working, verifiable privacy demo (airplane mode) and honest engineering benchmarks over theoretical novelty for this minor project phase.
- Training (LoRA/distillation) for the major project will happen on a dev laptop, not on the phone.
- The React Native UI will be kept simple to focus engineering effort on the native C++ AI integration.

## Decision Log
- **Architecture Approach:** Decided on a Cross-Platform (React Native + `llama.cpp`) architecture over Native Apps or LiteRT-LM.
  - *Alternatives considered:* Native Kotlin/Swift apps (too high maintenance for a solo developer), Google LiteRT-LM (iOS support is too early/unstable).
  - *Why this was chosen:* Allows a single UI codebase while leveraging the rock-solid, cross-platform C++ `llama.cpp` backend for GGUF model inference, optimizing for the minor project timeline.
- **Model Storage Strategy:** Models will be downloaded/side-loaded to local app storage rather than bundled into the app binary, keeping the core app size small.
- **Memory & Thermal Mitigation:** Context limits will be strictly enforced (~2048 tokens), and generation will be capped (~150 tokens per reply) to prevent OS out-of-memory kills and severe thermal throttling on budget devices.

## Final Design

### 1. Components
- **UI Layer (React Native):** A chat interface handling user input, token streaming display, and basic settings.
- **Bridge Layer (Native Modules):** JNI (Android) and Objective-C++ (iOS) native modules to pass prompt strings to the C++ engine and stream tokens back.
- **Inference Engine (llama.cpp):** The core C++ library compiled for ARM64, managing memory and generating responses entirely on the CPU.
- **Model Storage:** The `.gguf` file is stored in the app's sandboxed local document directory.

### 2. Data Flow
- User types message -> UI formats prompt with model's specific chat template -> Passed over native bridge to `llama.cpp` -> Engine performs prefill and starts decode -> Tokens are streamed back across the bridge in real-time to the UI.

### 3. Error Handling
- **OOM Prevention:** UI tracks conversation length and truncates/summarizes history to stay strictly under the token limit.
- **Thermal Management:** Max generation token limits are enforced to prevent runaway heat generation.
- **Missing Model:** Graceful catch of `llama.cpp` initialization errors, triggering a "Download Model" prompt in the UI.

### 4. Testing & Benchmarking
- **Development:** Mock the native bridge to allow rapid UI iteration in an emulator without loading a 2GB model.
- **Validation:** Test exclusively on a physical device in Airplane Mode.
- **Benchmarking:** A hidden Debug Overlay in the app will track Time to First Token (TTFT), Tokens Per Second (Tok/s), and RAM usage for academic reporting.
