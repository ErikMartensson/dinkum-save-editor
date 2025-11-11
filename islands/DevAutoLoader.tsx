import { useEffect } from "preact/hooks";
import {
  containerData,
  containerFilename,
  containerFileSize,
  filename,
  fileSize,
  saveData,
} from "../routes/index.tsx";

/**
 * Development-only component that automatically loads save files
 * from the selected-saves directory on mount.
 *
 * This simulates dropping files in the UI, saving time during development
 * when hot-reloading resets the state.
 *
 * Dynamically discovers and loads any .es3 or .json files in the directory.
 */
export default function DevAutoLoader() {
  useEffect(() => {
    // Only run in development mode
    const isDev = import.meta.env.DEV;
    if (!isDev) return;

    // Only auto-load if no files are already loaded
    if (saveData.value || containerData.value) return;

    const autoLoadFiles = async () => {
      try {
        console.log("[DevAutoLoader] Checking for development save files...");

        // Try to get the list of files from the API endpoint
        const listResponse = await fetch("/api/dev-saves");
        if (!listResponse.ok) {
          console.log(
            "[DevAutoLoader] No selected-saves directory or files found",
          );
          return;
        }

        const files = await listResponse.json();
        if (!files || files.length === 0) {
          console.log("[DevAutoLoader] No save files found in selected-saves/");
          return;
        }

        console.log(`[DevAutoLoader] Found ${files.length} file(s):`, files);

        // Import crypto utilities
        const { decryptES3 } = await import("../utils/crypto.ts");

        // Process each file
        for (const fileName of files) {
          try {
            const response = await fetch(`/selected-saves/${fileName}`);
            if (!response.ok) continue;

            let decrypted: string;

            if (fileName.endsWith(".es3")) {
              // Decrypt .es3 files
              const buffer = await response.arrayBuffer();
              const uint8 = new Uint8Array(buffer);
              decrypted = await decryptES3(uint8);
            } else {
              // Read .json files directly
              decrypted = await response.text();
            }

            const parsed = JSON.parse(decrypted);

            // Determine file type and store appropriately
            if (fileName.toLowerCase().includes("player")) {
              saveData.value = parsed;
              filename.value = fileName;
              fileSize.value = decrypted.length;
              console.log(
                `[DevAutoLoader] ✓ Loaded ${fileName} as Player save`,
              );
            } else if (fileName.toLowerCase().includes("container")) {
              containerData.value = parsed;
              containerFilename.value = fileName;
              containerFileSize.value = decrypted.length;
              console.log(
                `[DevAutoLoader] ✓ Loaded ${fileName} as Container save`,
              );
            } else {
              // Default to player save if name doesn't match
              saveData.value = parsed;
              filename.value = fileName;
              fileSize.value = decrypted.length;
              console.log(
                `[DevAutoLoader] ✓ Loaded ${fileName} (defaulted to Player save)`,
              );
            }
          } catch (err) {
            console.warn(`[DevAutoLoader] Failed to load ${fileName}:`, err);
          }
        }

        console.log("[DevAutoLoader] Auto-load complete!");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.log("[DevAutoLoader] Auto-load not available:", message);
        // Don't set error signal - this is a dev convenience feature
        // and shouldn't interfere with normal operation
      }
    };

    // Small delay to ensure the app is fully mounted
    const timeoutId = setTimeout(autoLoadFiles, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  // This component doesn't render anything
  return null;
}
