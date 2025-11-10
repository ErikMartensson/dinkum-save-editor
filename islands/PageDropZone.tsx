import { useSignal } from "@preact/signals";
import { ComponentChildren } from "preact";
import { error, filename, fileSize, saveData } from "../routes/index.tsx";

interface PageDropZoneProps {
  children: ComponentChildren;
}

export default function PageDropZone({ children }: PageDropZoneProps) {
  const isDragging = useSignal(false);
  const isProcessing = useSignal(false);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".es3")) {
      error.value = "Please upload a .es3 file";
      return;
    }

    isProcessing.value = true;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Import crypto utilities dynamically for client-side use
      const { decryptES3 } = await import("../utils/crypto.ts");
      const decryptedJson = await decryptES3(uint8Array);

      // Parse and store the data
      const parsed = JSON.parse(decryptedJson);
      saveData.value = parsed;
      filename.value = file.name;
      fileSize.value = decryptedJson.length;
      error.value = null;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      error.value = `Failed to decrypt file: ${message}`;
    } finally {
      isProcessing.value = false;
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = false;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = true;
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide overlay if leaving the window
    if (e.clientX === 0 && e.clientY === 0) {
      isDragging.value = false;
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
          <div class="bg-dinkum-beige border-4 border-dashed border-dinkum-secondary rounded-2xl p-12 shadow-2xl">
            <svg
              class="mx-auto h-24 w-24 text-dinkum-secondary mb-4"
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
              Drop your .es3 file here
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
              Decrypting save file...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
