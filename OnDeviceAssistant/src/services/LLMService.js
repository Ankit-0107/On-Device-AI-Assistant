import { initLlama } from 'llama.rn';
import { sanitizePrompt } from '../security/Sanitizer';
import { verifyModelIntegrity } from '../security/ModelVerifier';

let currentContext = null;
const MAX_CONTEXT_TOKENS = 2048; // Common budget limit

export async function loadModel(modelPath) {
  if (currentContext) {
    await currentContext.release();
    currentContext = null;
  }

  // 1. Verify model integrity (SHA-256)
  const isVerified = await verifyModelIntegrity(modelPath);
  if (!isVerified) {
    throw new Error('Model failed security verification.');
  }

  // 2. Initialize llama.rn context
  try {
    currentContext = await initLlama({
      model: modelPath,
      use_mlock: false,  // mlock is not supported on emulators
      use_mmap: true,    // memory-map the file instead
      n_ctx: 1024,       // smaller context for emulator stability
      n_threads: 2,      // fewer threads for emulator
      n_gpu_layers: 0,   // CPU only on emulator
    });
  } catch (initError) {
    throw new Error(`llama.cpp init failed: ${initError.message || initError}`);
  }
  
  return currentContext;
}

export function generateStream(prompt, history, onToken, onStats, onComplete, onError) {
  if (!currentContext) {
    onError(new Error('Model not initialized. Please load a model in settings.'));
    return;
  }

  const safePrompt = sanitizePrompt(prompt);
  
  // Qwen2.5 expects strict ChatML format
  let fullPrompt = `<|im_start|>system\nYou are a helpful, offline AI assistant.<|im_end|>\n`;
  history.forEach(msg => {
    const role = msg.role === 'user' ? 'user' : 'assistant';
    fullPrompt += `<|im_start|>${role}\n${msg.content}<|im_end|>\n`;
  });
  fullPrompt += `<|im_start|>user\n${safePrompt}<|im_end|>\n<|im_start|>assistant\n`;
  
  // Basic context truncation (keep last ~2000 chars if it gets too long)
  // This is a naive UI-side truncation to prevent OOM
  const MAX_CHARS = 2048 * 3;
  if (fullPrompt.length > MAX_CHARS) {
    // Trim from the beginning but keep the system prompt
    const systemPromptLength = fullPrompt.indexOf('<|im_end|>\n') + 11;
    const trimmed = fullPrompt.substring(fullPrompt.length - (MAX_CHARS - systemPromptLength));
    fullPrompt = fullPrompt.substring(0, systemPromptLength) + trimmed;
  }

  let startTime = Date.now();
  let firstTokenTime = null;
  let tokenCount = 0;

  currentContext.completion(
    {
      prompt: fullPrompt,
      n_predict: 200, // Capped generation length to prevent thermal throttling
      temperature: 0.7,
      stop: ['<|im_end|>', '<|im_start|>', '\nuser:']
    },
    (data) => {
      if (!firstTokenTime) {
        firstTokenTime = Date.now();
        onStats({ ttft: firstTokenTime - startTime, toks: 0 });
      }
      // Partial callback
      if (data && data.token) {
        tokenCount++;
        onToken(data.token);
      }
    }
  )
  .then((result) => {
    const endTime = Date.now();
    const durationSec = (endTime - (firstTokenTime || startTime)) / 1000;
    const toks = durationSec > 0 ? (tokenCount / durationSec).toFixed(2) : 0;
    
    onStats({ ttft: firstTokenTime ? firstTokenTime - startTime : 0, toks });
    onComplete(result.text);
  })
  .catch((err) => {
    onError(err);
  });
}
