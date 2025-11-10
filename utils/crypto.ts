const ES3_PASSWORD = "jamesbendon";
const PBKDF2_ITERATIONS = 100;

/**
 * Derives an AES-128 key from the password using PBKDF2 with IV as salt
 */
async function deriveKey(password: string, iv: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(iv),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-1",
    },
    keyMaterial,
    { name: "AES-CBC", length: 128 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Checks if data is gzipped
 */
function isGzip(data: Uint8Array): boolean {
  return data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b;
}

/**
 * Decrypts an ES3 file using AES-128-CBC
 */
export async function decryptES3(encryptedData: Uint8Array): Promise<string> {
  try {
    console.info(`Decrypting ES3 file (${encryptedData.length} bytes)`);

    // First 16 bytes are the IV for CBC mode
    const iv = encryptedData.slice(0, 16);
    const ciphertext = encryptedData.slice(16);

    console.debug(
      `IV length: ${iv.length}, Ciphertext length: ${ciphertext.length}`,
    );

    const key = await deriveKey(ES3_PASSWORD, iv);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      key,
      ciphertext,
    );

    let data = new Uint8Array(decrypted);

    // Check if data is gzipped and decompress if needed
    if (isGzip(data)) {
      console.debug("Data is gzipped, decompressing...");
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(data);
          controller.close();
        },
      });
      const decompressed = stream.pipeThrough(new DecompressionStream("gzip"));
      const reader = decompressed.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      data = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        data.set(chunk, offset);
        offset += chunk.length;
      }
      console.debug(`Decompressed size: ${data.length} bytes`);
    }

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(data);

    console.info("Successfully decrypted ES3 file");
    return jsonString;
  } catch (error) {
    console.error("Failed to decrypt ES3 file", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Decryption failed: ${message}`);
  }
}

/**
 * Encrypts JSON data to ES3 format using AES-128-CBC
 */
export async function encryptES3(
  jsonString: string,
  shouldGzip = false,
): Promise<Uint8Array> {
  try {
    console.info(`Encrypting data (${jsonString.length} characters)`);

    const encoder = new TextEncoder();
    let plaintext = encoder.encode(jsonString);

    // Optionally gzip the data
    if (shouldGzip) {
      console.debug("Compressing data with gzip...");
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(plaintext);
          controller.close();
        },
      });
      const compressed = stream.pipeThrough(new CompressionStream("gzip"));
      const reader = compressed.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      plaintext = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        plaintext.set(chunk, offset);
        offset += chunk.length;
      }
      console.debug(`Compressed size: ${plaintext.length} bytes`);
    }

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(16));

    const key = await deriveKey(ES3_PASSWORD, iv);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      key,
      plaintext,
    );

    // Prepend IV to ciphertext
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);

    console.info(`Successfully encrypted data (${result.length} bytes)`);
    return result;
  } catch (error) {
    console.error("Failed to encrypt data", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Encryption failed: ${message}`);
  }
}
