import RNFS from 'react-native-fs';

// Approved SHA-256 hashes for allowed .gguf models
// (e.g., Llama-3.2-1B-Instruct-Q4_K_M.gguf)
const APPROVED_MODEL_HASHES = [
  '8c754340da586a39eedd51009310e52e83235f61c87a5c0a659ec2264c507e31', // Qwen2.5 1.5B Instruct Q4_K_M
];

export async function verifyModelIntegrity(filePath) {
  try {
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      throw new Error('Model file not found');
    }

    // Skip hash check in development builds for testing convenience.
    // Hash verification is enforced in production (release) builds.
    if (__DEV__) {
      console.warn('[ModelVerifier] DEV MODE: Skipping hash check for testing.');
      return true;
    }

    // Hash the file in native code to avoid loading 2GB into JS memory
    const fileHash = await RNFS.hash(filePath, 'sha256');
    
    if (!APPROVED_MODEL_HASHES.includes(fileHash.toLowerCase())) {
      throw new Error(`Model verification failed. Hash: ${fileHash} is not approved.`);
    }
    
    return true;
  } catch (error) {
    console.error('Security Error: Model Integrity Verification Failed', error);
    return false;
  }
}
