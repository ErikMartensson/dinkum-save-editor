import { Footer } from "./components/Footer.tsx";
import SaveFileCard from "./components/SaveFileCard.tsx";
import AdvancedEditor from "./islands/AdvancedEditor.tsx";
import ContainerAdvancedEditor from "./islands/ContainerAdvancedEditor.tsx";
import ContainerEditor from "./islands/ContainerEditor.tsx";
import DevAutoLoader from "./islands/DevAutoLoader.tsx";
import DownloadManager from "./islands/DownloadManager.tsx";
import ErrorDismiss from "./islands/ErrorDismiss.tsx";
import FileSelectWrapper from "./islands/FileSelectWrapper.tsx";
import PageDropZone from "./islands/PageDropZone.tsx";
import PlayerInventoryEditor from "./islands/PlayerInventoryEditor.tsx";
import QuickEdit from "./islands/QuickEdit.tsx";
import SaveFileLocation from "./islands/SaveFileLocation.tsx";
import SwRegistration from "./islands/SwRegistration.tsx";
import {
  containerData,
  containerFilename,
  containerFileSize,
  filename,
  fileSize,
  saveData,
} from "./utils/state.ts";

export default function App() {
  return (
    <>
      <DevAutoLoader />
      <SwRegistration />
      <PageDropZone>
        <div class="min-h-screen bg-dinkum-beige">
          <div class="container mx-auto px-4 py-8">
            {/* Header */}
            <div class="text-center mb-8">
              <h1 class="text-5xl font-bold text-dinkum-tertiary mb-2 font-mclaren">
                Dinkum Save Editor
              </h1>
              <p class="text-lg font-mclaren">
                Works with the current version of Dinkum (v1.0 and later)
              </p>
              <p class="text-md font-mclaren">
                Everything happens in your browser. Your saves never leave your
                computer.
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
                <div class="rounded-lg shadow-lg border-2 border-dinkum-primary p-6">
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <h3 class="text-lg font-bold text-dinkum-tertiary font-mclaren">
                        {containerFilename.value}
                      </h3>
                      <p class="text-sm font-mclaren">
                        {containerFileSize.value < 1024
                          ? `${containerFileSize.value} B`
                          : `${(containerFileSize.value / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                    <div class="flex items-center gap-2">
                      <svg
                        class="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <span class="text-sm font-medium font-mclaren">
                        Loaded
                      </span>
                    </div>
                  </div>
                  <p class="text-sm text-dinkum-tertiary font-mclaren">
                    Container file with{" "}
                    {containerData.value?.chests?.value?.allChests?.length || 0}{" "}
                    chests
                  </p>
                </div>
              )}

              {/* Player Quick Edit */}
              <QuickEdit />

              {/* Player Inventory & Stashes */}
              <PlayerInventoryEditor />

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
}
