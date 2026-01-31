import { useSignal } from "@preact/signals";
import {
  containerData,
  containerFilename,
  filename,
  saveData,
} from "../routes/index.tsx";

export default function DownloadManager() {
  const isEncrypting = useSignal(false);

  const downloadJSON = (data: unknown, fname: string) => {
    if (!data || !fname) return;

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fname.replace(".es3", ".json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadEncrypted = async (data: unknown, fname: string) => {
    if (!data || !fname) return;

    isEncrypting.value = true;

    try {
      // Import crypto utilities dynamically for client-side use
      const { encryptES3, serializeES3Json } = await import(
        "../utils/crypto.ts"
      );
      const jsonString = serializeES3Json(data);
      const encrypted = await encryptES3(jsonString, false);

      // Create a new Uint8Array with proper ArrayBuffer for Blob compatibility
      const encryptedArray = new Uint8Array(encrypted);
      const blob = new Blob([encryptedArray], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      // Ensure the file has .es3 extension for encrypted files
      a.download = fname.replace(/\.(json|es3)$/, ".es3");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      alert(`Failed to encrypt file: ${message}`);
    } finally {
      isEncrypting.value = false;
    }
  };

  const downloadAllEncrypted = async () => {
    if (saveData.value && filename.value) {
      await downloadEncrypted(saveData.value, filename.value);
    }
    if (containerData.value && containerFilename.value) {
      // Small delay to avoid browser blocking multiple downloads
      setTimeout(() => {
        if (containerData.value && containerFilename.value) {
          downloadEncrypted(containerData.value, containerFilename.value);
        }
      }, 500);
    }
  };

  const hasPlayerSave = saveData.value && filename.value;
  const hasContainerSave = containerData.value && containerFilename.value;

  if (!hasPlayerSave && !hasContainerSave) {
    return;
  }

  return (
    <div class="bg-dinkum-gray rounded-lg shadow-lg border-2 border-dinkum-primary p-6">
      <h2 class="text-xl font-bold mb-4 text-dinkum-tertiary font-mclaren">
        Download
      </h2>

      <div class="space-y-4">
        {/* Player Save Downloads */}
        {hasPlayerSave && (
          <div class="space-y-2">
            <div class="text-sm font-bold text-dinkum-tertiary font-mclaren">
              Player Save ({filename.value})
            </div>
            <div class="space-y-2">
              <button
                type="button"
                onClick={() => downloadJSON(saveData.value, filename.value!)}
                class="w-full px-4 py-2 bg-dinkum-tertiary text-dinkum-secondary rounded-lg font-medium font-mclaren hover:bg-dinkum-accent hover:scale-101 transition-all flex items-center justify-center gap-2 border-2 border-dinkum-primary shadow-md hover:shadow-lg text-sm"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download JSON
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadEncrypted(saveData.value, filename.value!)}
                disabled={isEncrypting.value}
                class={`w-full px-4 py-2 rounded-lg font-medium font-mclaren transition-all flex items-center justify-center gap-2 border-2 text-sm ${
                  isEncrypting.value
                    ? "bg-dinkum-gray text-dinkum-accent border-dinkum-primary cursor-not-allowed opacity-50"
                    : "bg-dinkum-tertiary text-dinkum-secondary border-dinkum-primary hover:bg-dinkum-accent hover:scale-101 shadow-md hover:shadow-lg"
                }`}
              >
                {isEncrypting.value
                  ? (
                    <>
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-dinkum-tertiary">
                      </div>
                      Encrypting...
                    </>
                  )
                  : (
                    <>
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Download Encrypted .es3
                    </>
                  )}
              </button>
            </div>
          </div>
        )}

        {/* Container Save Downloads */}
        {hasContainerSave && (
          <div class="space-y-2">
            <div class="text-sm font-bold text-dinkum-tertiary font-mclaren">
              Container Save ({containerFilename.value})
            </div>
            <div class="space-y-2">
              <button
                type="button"
                onClick={() =>
                  downloadJSON(containerData.value, containerFilename.value!)}
                class="w-full px-4 py-2 bg-dinkum-tertiary text-dinkum-secondary rounded-lg font-medium font-mclaren hover:bg-dinkum-accent hover:scale-101 transition-all flex items-center justify-center gap-2 border-2 border-dinkum-primary shadow-md hover:shadow-lg text-sm"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download JSON
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadEncrypted(
                    containerData.value,
                    containerFilename.value!,
                  )}
                disabled={isEncrypting.value}
                class={`w-full px-4 py-2 rounded-lg font-medium font-mclaren transition-all flex items-center justify-center gap-2 border-2 text-sm ${
                  isEncrypting.value
                    ? "bg-dinkum-gray text-dinkum-accent border-dinkum-primary cursor-not-allowed opacity-50"
                    : "bg-dinkum-tertiary text-dinkum-secondary border-dinkum-primary hover:bg-dinkum-accent hover:scale-101 shadow-md hover:shadow-lg"
                }`}
              >
                {isEncrypting.value
                  ? (
                    <>
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-dinkum-tertiary">
                      </div>
                      Encrypting...
                    </>
                  )
                  : (
                    <>
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Download Encrypted .es3
                    </>
                  )}
              </button>
            </div>
          </div>
        )}

        {/* Download All Button */}
        {hasPlayerSave && hasContainerSave && (
          <button
            type="button"
            onClick={downloadAllEncrypted}
            disabled={isEncrypting.value}
            class={`w-full px-4 py-3 rounded-lg font-bold font-mclaren transition-all flex items-center justify-center gap-2 border-2 ${
              isEncrypting.value
                ? "bg-dinkum-gray text-dinkum-accent border-dinkum-primary cursor-not-allowed opacity-50"
                : "bg-dinkum-tertiary text-dinkum-secondary border-dinkum-primary hover:bg-dinkum-accent hover:scale-101 shadow-md hover:shadow-lg"
            }`}
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download All Encrypted Files
          </button>
        )}

        <div class="mt-4 p-4 bg-dinkum-orange/30 border-2 border-dinkum-accent rounded-lg">
          <p class="text-sm text-dinkum-tertiary font-mclaren">
            <strong>⚠️ Important:</strong>{" "}
            Always backup your original save files before using edited versions
            in the game!
          </p>
        </div>
      </div>
    </div>
  );
}
