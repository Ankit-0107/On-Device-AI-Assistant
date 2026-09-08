# Plan: Voice & Actions Implementation

Build Voice STT/TTS and Hybrid Intent execution while maintaining offline-only architecture, focused strictly on emulation.

## Scope

- In:
  - Add native Android STT (Speech Recognizer).
  - Add native Android TTS (Text-to-Speech).
  - Implement a Hybrid Intent schema using the LLM to parse commands.
  - Implement basic Intents (Open Apps, Alarm, SMS placeholder, Web Search placeholder).
- Out:
  - Bundling external offline STT models (`whisper.cpp`).
  - Always-listening wake word logic.
  - Elaborate third-party app access.
  - Persistent chat memory (save that for later).

## Action Items

[x] Step 1: Voice Recognition (STT) - Install `@react-native-community/voice` and build a "Hold to Speak" button in `ChatScreen`.
[x] Step 2: Speech Output (TTS) - Install `react-native-tts` and wire it into the `generateStream` completion block.
[ ] Step 3: Intent Parser - Modify `LLMService` to intercept the prompt, try parsing it as a command, and then fallback to normal chat if it's conversational.
[ ] Step 4: System Actions - Create an `ActionHandler` to execute Android Intents (e.g. `Linking.openURL`).
[ ] Step 5: Emulation Testing - Verify STT, TTS, and Actions work without crashing the emulator.

## Open Questions

- None at the moment.
