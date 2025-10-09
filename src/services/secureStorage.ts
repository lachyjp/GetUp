// Lightweight encrypted local storage for sensitive tokens.
// Uses Web Crypto: AES-GCM with a key derived from a user PIN via PBKDF2.

const STORAGE_PREFIX = 'getup-secure:';

type StoredCipher = {
  v: 1; // schema version
  algo: 'AES-GCM';
  saltB64: string;
  ivB64: string;
  cipherB64: string;
};

function toUint8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function fromUint8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function toB64(bytes: ArrayBuffer): string {
  // Avoid spread on typed arrays to support lower TS targets without downlevelIteration
  const view = new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < view.length; i++) bin += String.fromCharCode(view[i]);
  return btoa(bin);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveAesKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    // Provide ArrayBuffer explicitly for wider TS/DOM lib compatibility
    toUint8(pin).buffer as ArrayBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: (salt.buffer as ArrayBuffer), iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptAndStore(key: string, plaintext: string, pin: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aesKey = await deriveAesKey(pin, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: (iv.buffer as ArrayBuffer) },
    aesKey,
    // Pass ArrayBuffer explicitly to avoid TS BufferSource narrowing issues
    toUint8(plaintext).buffer as ArrayBuffer
  );

  const record: StoredCipher = {
    v: 1,
    algo: 'AES-GCM',
    saltB64: toB64(salt.buffer),
    ivB64: toB64(iv.buffer),
    cipherB64: toB64(cipher),
  };

  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(record));
}

export function hasStored(key: string): boolean {
  return !!localStorage.getItem(STORAGE_PREFIX + key);
}

export function clearStored(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export async function tryDecrypt(key: string, pin: string): Promise<string | null> {
  const raw = localStorage.getItem(STORAGE_PREFIX + key);
  if (!raw) return null;
  let parsed: StoredCipher;
  try {
    parsed = JSON.parse(raw) as StoredCipher;
  } catch {
    return null;
  }

  if (parsed.v !== 1 || parsed.algo !== 'AES-GCM') return null;

  try {
    const salt = fromB64(parsed.saltB64);
    const iv = fromB64(parsed.ivB64);
    const aesKey = await deriveAesKey(pin, salt);
    const plainBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: (iv.buffer as ArrayBuffer) },
      aesKey,
      // Provide ArrayBuffer explicitly for typing compatibility
      fromB64(parsed.cipherB64).buffer as ArrayBuffer
    );
    return fromUint8(new Uint8Array(plainBuf));
  } catch {
    return null; // wrong PIN or tampered data
  }
}


