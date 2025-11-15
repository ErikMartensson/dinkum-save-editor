import { signal } from "@preact/signals";
import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import FileSelectWrapper from "../islands/FileSelectWrapper.tsx";
import QuickEdit from "../islands/QuickEdit.tsx";
import AdvancedEditor from "../islands/AdvancedEditor.tsx";
import ContainerEditor from "../islands/ContainerEditor.tsx";
import ContainerAdvancedEditor from "../islands/ContainerAdvancedEditor.tsx";
import DownloadManager from "../islands/DownloadManager.tsx";
import PageDropZone from "../islands/PageDropZone.tsx";
import ErrorDismiss from "../islands/ErrorDismiss.tsx";
import DevAutoLoader from "../islands/DevAutoLoader.tsx";
import SaveFileCard from "../components/SaveFileCard.tsx";
import SaveFileLocation from "../islands/SaveFileLocation.tsx";
import { Footer } from "../components/Footer.tsx";
import type { ContainerSaveData, DinkumSaveData } from "../utils/types.ts";

// Global signals that can be shared across islands
export const saveData = signal<DinkumSaveData | null>(null);
export const containerData = signal<ContainerSaveData | null>(null);
export const filename = signal<string | null>(null);
export const containerFilename = signal<string | null>(null);
export const fileSize = signal<number>(0);
export const containerFileSize = signal<number>(0);
export const error = signal<string | null>(null);

/**
 * Check if there are dev save files to load (SSR only, dev mode only)
 */
async function checkDevSaveFiles(): Promise<string[]> {
  // Only check in development mode
  if (Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined) {
    return [];
  }

  try {
    const files: string[] = [];
    for await (const entry of Deno.readDir("./selected-saves")) {
      if (
        entry.isFile &&
        (entry.name.endsWith(".es3") || entry.name.endsWith(".json"))
      ) {
        files.push(entry.name);
      }
    }
    return files;
  } catch {
    // Directory doesn't exist or can't be read
    return [];
  }
}

export default define.page(async function Home() {
  // Check for dev save files during SSR
  const devSaveFiles = await checkDevSaveFiles();
  const hasDevSaveFiles = devSaveFiles.length > 0;
  return (
    <>
      <Head>
        <title>Dinkum Save Editor</title>
      </Head>
      <PageDropZone>
        {/* Only include DevAutoLoader if there are files to load */}
        {hasDevSaveFiles && <DevAutoLoader />}
        <div class="min-h-screen bg-dinkum-beige">
          <div class="container mx-auto px-4 py-8">
            {/* Header */}
            <div class="text-center mb-8">
              <h1 class="text-5xl font-bold text-dinkum-tertiary mb-2 font-mclaren">
                Dinkum Save Editor
              </h1>
              <p class="text-dinkum-accent text-lg font-mclaren">
                Save editor for Dinkum v1.0 and later
              </p>
              <p class="text-dinkum-accent text-md font-mclaren">
                Encrypted (.es3) or decrypted (.json) save files
              </p>
            </div>

            {/* Error Display */}
            <ErrorDismiss />

            {/* Main Content */}
            <div class="max-w-4xl mx-auto space-y-6">
              {/* Show FileSelect and FeaturesList only if no files are selected */}
              <FileSelectWrapper />

              {/* Loaded File Info */}
              {saveData.value && filename.value && (
                <SaveFileCard
                  filename={filename.value}
                  saveData={saveData.value}
                  fileSize={fileSize.value}
                />
              )}

              {/* Container File Info */}
              {containerData.value && containerFilename.value && (
                <div class="bg-dinkum-gray rounded-lg shadow-lg border-2 border-dinkum-primary p-6">
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <h3 class="text-lg font-bold text-dinkum-tertiary font-mclaren">
                        {containerFilename.value}
                      </h3>
                      <p class="text-sm text-dinkum-accent font-mclaren">
                        {containerFileSize.value < 1024
                          ? `${containerFileSize.value} B`
                          : `${(containerFileSize.value / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                    <div class="flex items-center gap-2">
                      <svg
                        class="w-5 h-5 text-dinkum-secondary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <span class="text-sm font-medium text-dinkum-secondary font-mclaren">
                        Loaded
                      </span>
                    </div>
                  </div>
                  <p class="text-sm text-dinkum-tertiary font-mclaren">
                    Container file with{" "}
                    {containerData.value?.chests?.value?.allChests?.length || 0}
                    {" "}
                    chests
                  </p>
                </div>
              )}

              {/* Player Quick Edit */}
              <QuickEdit />

              {/* Player Advanced Editor */}
              <AdvancedEditor />

              {/* Container Editor */}
              <ContainerEditor />

              {/* Container Advanced Editor */}
              <ContainerAdvancedEditor />

              {/* Download Manager */}
              <DownloadManager />

              {/* Save File Location Info */}
              <SaveFileLocation />
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </PageDropZone>
    </>
  );
});
