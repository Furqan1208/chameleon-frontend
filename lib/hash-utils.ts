// lib/hash-utils.ts
import { sha256 } from 'js-sha256';

export async function calculateFileHash(file: File): Promise<{
  md5?: string;
  sha1?: string;
  sha256: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const data = new Uint8Array(buffer);
        
        // Calculate SHA256 (you can add MD5/SHA1 if needed)
        const hash = sha256(data);
        
        resolve({
          sha256: hash,
          // Note: For MD5/SHA1 you'd need additional libraries
          // or rely on backend response if available
        });
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Simple fallback if you don't want to install library
export async function simpleHashExtraction(file: File): Promise<string> {
  // Extract from filename as fallback
  const name = file.name.toLowerCase();
  
  // Check if filename contains hash patterns
  const hashPatterns = [
    /[a-fA-F0-9]{32}/, // MD5
    /[a-fA-F0-9]{40}/, // SHA1
    /[a-fA-F0-9]{64}/, // SHA256
  ];
  
  for (const pattern of hashPatterns) {
    const match = name.match(pattern);
    if (match) return match[0];
  }
  
  // Return placeholder
  return "hash_not_available";
}