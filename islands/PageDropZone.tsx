import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { ComponentChildren } from "preact";
import {
  containerData,
  containerFilename,
  containerFileSize,
  error,
  filename,
  fileSize,
  saveData,
} from "../routes/index.tsx";

interface PageDropZoneProps {
  children: ComponentChildren;
}

export default function PageDropZone({ children }: PageDropZoneProps) {
  const isDragging = useSignal(false);
  const isProcessing = useSignal(false);
  const dragTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDragging.value) {
        isDragging.value = false;
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, []);

  const clearDragTimeout = () => {
    if (dragTimeoutRef.current !== null) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
  };

  const handleFile = async (file: File) => {
    const isES3 = file.name.endsWith(".es3");
    const isJSON = file.name.endsWith(".json");

    if (!isES3 && !isJSON) {
      error.value = "Please select a .es3 or .json file";
      return;
    }

    isProcessing.value = true;

    try {
      let decryptedJson: string;

      if (isES3) {
        // Decrypt .es3 files
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Import crypto utilities dynamically for client-side use
        const { decryptES3 } = await import("../utils/crypto.ts");
        decryptedJson = await decryptES3(uint8Array);
      } else {
        // Read .json files directly
        decryptedJson = await file.text();
      }

      // Parse and store the data
      const parsed = JSON.parse(decryptedJson);

      // Determine file type and store appropriately
      if (file.name.toLowerCase().includes("player")) {
        saveData.value = parsed;
        filename.value = file.name;
        fileSize.value = decryptedJson.length;
      } else if (file.name.toLowerCase().includes("container")) {
        containerData.value = parsed;
        containerFilename.value = file.name;
        containerFileSize.value = decryptedJson.length;
      } else {
        // Default to player save if name doesn't match
        saveData.value = parsed;
        filename.value = file.name;
        fileSize.value = decryptedJson.length;
      }

      error.value = null;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      error.value = `Failed to decrypt file: ${message}`;
    } finally {
      isProcessing.value = false;
    }
  };

  const handleMultipleFiles = async (files: FileList) => {
    // Track which file types we've seen
    let hasPlayer = false;
    let hasContainer = false;
    const warnings: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPlayer = file.name.toLowerCase().includes("player");
      const isContainer = file.name.toLowerCase().includes("container");

      // Check for duplicates
      if (isPlayer && hasPlayer) {
        warnings.push(`Skipped duplicate Player save: ${file.name}`);
        continue;
      }
      if (isContainer && hasContainer) {
        warnings.push(`Skipped duplicate Container save: ${file.name}`);
        continue;
      }

      // Process the file
      await handleFile(file);

      // Mark as seen
      if (isPlayer) hasPlayer = true;
      if (isContainer) hasContainer = true;
    }

    // Show warnings if any files were skipped
    if (warnings.length > 0) {
      error.value = warnings.join("\n") +
        "\n\nOnly one Player save and one Container save can be loaded at a time.";
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = false;
    clearDragTimeout();

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleMultipleFiles(files);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = true;

    // Safety net: dragover fires continuously while dragging over the page.
    // If it stops (drag left the window), clear the state after a short delay.
    clearDragTimeout();
    dragTimeoutRef.current = globalThis.setTimeout(() => {
      isDragging.value = false;
      dragTimeoutRef.current = null;
    }, 300);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;

    if (
      !relatedTarget || target === document.documentElement ||
      target === document.body
    ) {
      isDragging.value = false;
      clearDragTimeout();
    }
  };

  return (
    <div
      class="relative min-h-screen"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {children}

      {/* Full-page drop overlay */}
      {isDragging.value && !isProcessing.value && (
        <div class="fixed inset-0 z-50 bg-dinkum-secondary/40 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div class="bg-dinkum-beige border-4 border-dashed border-dinkum-accent rounded-2xl p-12 shadow-2xl">
            <svg
              class="mx-auto h-24 w-24 text-dinkum-accent mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p class="text-3xl font-bold text-dinkum-tertiary font-mclaren text-center">
              Drop your save file here
            </p>
            <p class="text-lg text-dinkum-accent font-mclaren text-center mt-2">
              .es3 or .json files
            </p>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessing.value && (
        <div class="fixed inset-0 z-50 bg-dinkum-tertiary/60 backdrop-blur-sm flex items-center justify-center">
          <div class="bg-dinkum-beige border-4 border-dinkum-primary rounded-2xl p-12 shadow-2xl">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-dinkum-secondary mx-auto mb-4">
            </div>
            <p class="text-2xl font-bold text-dinkum-tertiary font-mclaren text-center">
              Processing save file...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
