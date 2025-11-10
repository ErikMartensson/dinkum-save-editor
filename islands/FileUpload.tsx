import { useSignal } from "@preact/signals";
import { JSX } from "preact";
import {
  containerData,
  containerFilename,
  containerFileSize,
  error,
  filename,
  fileSize,
  saveData,
} from "../routes/index.tsx";

export default function FileUpload() {
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
    for (let i = 0; i < files.length; i++) {
      await handleFile(files[i]);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    isDragging.value = false;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleMultipleFiles(files);
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
    // Only set to false if we're leaving the drop zone itself
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (
      x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom
    ) {
      isDragging.value = false;
    }
  };

  const handleFileInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      handleMultipleFiles(files);
    }
  };

  return (
    <div class="w-full">
      <div
        class={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging.value
            ? "border-dinkum-secondary bg-dinkum-secondary/30 scale-105 shadow-lg"
            : "border-dinkum-primary bg-dinkum-gray hover:border-dinkum-orange"
        } ${isProcessing.value ? "opacity-50 pointer-events-none" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isProcessing.value
          ? (
            <div class="flex flex-col items-center gap-4">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-dinkum-secondary">
              </div>
              <p class="text-dinkum-tertiary font-mclaren">
                Decrypting save file...
              </p>
            </div>
          )
          : (
            <>
              <svg
                class="mx-auto h-12 w-12 text-dinkum-orange"
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
              <div class="mt-4">
                <label
                  for="file-upload"
                  class="cursor-pointer rounded-md font-bold text-dinkum-secondary hover:text-dinkum-orange hover:underline focus-within:outline-none font-mclaren text-lg transition-colors"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".es3"
                    multiple
                    class="sr-only"
                    onInput={handleFileInput}
                  />
                </label>{" "}
                <p class="text-dinkum-tertiary inline font-mclaren text-lg">
                  or drag and drop
                </p>
              </div>
              <p class="text-xs text-dinkum-accent mt-2 font-mclaren">
                .es3 save files (Player.es3, Container.es3)
              </p>
            </>
          )}
      </div>
    </div>
  );
}
