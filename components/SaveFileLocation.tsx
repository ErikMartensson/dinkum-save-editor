export function SaveFileLocation() {
  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Visual feedback could be added here
      console.log(`${platform} path copied to clipboard`);
    });
  };

  return (
    <div class="bg-dinkum-gray rounded-lg shadow-lg border-2 border-dinkum-primary p-6">
      <h2 class="text-2xl font-bold text-dinkum-tertiary font-mclaren mb-4">
        📁 Finding Your Save Files
      </h2>

      {/* Windows Section */}
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-3">
          <svg
            class="w-6 h-6 text-dinkum-accent"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
          </svg>
          <h3 class="text-xl font-bold text-dinkum-tertiary font-mclaren">
            Windows
          </h3>
        </div>

        <div class="bg-dinkum-beige/50 rounded-lg p-4 mb-3">
          <p class="text-sm text-dinkum-tertiary font-mclaren mb-3">
            Your Dinkum save files are located in a hidden folder. Here's how to
            find them:
          </p>

          <ol class="list-decimal list-inside space-y-2 text-sm text-dinkum-tertiary font-mclaren mb-4">
            <li>
              Press{" "}
              <kbd class="px-2 py-1 bg-dinkum-gray rounded border border-dinkum-primary text-xs font-mono">
                Windows + R
              </kbd>{" "}
              on your keyboard
            </li>
            <li>
              Copy the path below and paste it into the "Run" dialog
            </li>
            <li>Press Enter or click OK</li>
            <li>
              Look for folders named{" "}
              <code class="px-1 bg-dinkum-gray rounded text-xs font-mono">
                Slot0
              </code>,{" "}
              <code class="px-1 bg-dinkum-gray rounded text-xs font-mono">
                Slot1
              </code>, etc.
            </li>
          </ol>

          <div class="bg-dinkum-gray border-2 border-dinkum-primary rounded-lg p-3 mb-2">
            <div class="flex items-center justify-between gap-2">
              <code class="text-sm font-mono text-dinkum-tertiary break-all select-all">
                %USERPROFILE%\AppData\LocalLow\James Bendon\Dinkum\
              </code>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    "%USERPROFILE%\\AppData\\LocalLow\\James Bendon\\Dinkum\\",
                    "Windows",
                  )}
                class="shrink-0 px-3 py-1 bg-dinkum-tertiary text-dinkum-secondary rounded hover:bg-dinkum-accent transition-colors text-xs font-mclaren"
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
            </div>
          </div>

          <p class="text-xs text-dinkum-accent font-mclaren italic">
            💡 Tip: You can also navigate manually by showing hidden folders in
            File Explorer (View → Show → Hidden items)
          </p>
        </div>
      </div>

      {/* Linux / Steam Deck Section */}
      <div>
        <div class="flex items-center gap-2 mb-3">
          <svg
            class="w-6 h-6 text-dinkum-accent"
            fill="currentColor"
            viewBox="0 0 37 50"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M28.1744 24.6928C28.1744 15.9508 21.0877 8.86409 12.3457 8.86409V0C25.9832 0 37.0385 11.0553 37.0385 24.6928C37.0385 38.3303 25.9832 49.3856 12.3457 49.3856V40.5215C21.0877 40.5215 28.1744 33.4348 28.1744 24.6928Z"
            />
            <circle cx="12.3464" cy="24.7191" r="12.3464" />
          </svg>
          <h3 class="text-xl font-bold text-dinkum-tertiary font-mclaren">
            Linux / Steam Deck
          </h3>
        </div>

        <div class="bg-dinkum-beige/50 rounded-lg p-4">
          <p class="text-sm text-dinkum-tertiary font-mclaren mb-3">
            Save files are in the Proton compatibility folder:
          </p>

          <div class="bg-dinkum-gray border-2 border-dinkum-primary rounded-lg p-3 mb-2">
            <div class="flex items-center justify-between gap-2">
              <code class="text-xs font-mono text-dinkum-tertiary break-all select-all">
                ~/.local/share/Steam/steamapps/compatdata/1062520/pfx/drive_c/users/steamuser/AppData/LocalLow/James
                Bendon/Dinkum
              </code>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    "~/.local/share/Steam/steamapps/compatdata/1062520/pfx/drive_c/users/steamuser/AppData/LocalLow/James Bendon/Dinkum",
                    "Linux / Steam Deck",
                  )}
                class="shrink-0 px-3 py-1 bg-dinkum-tertiary text-dinkum-secondary rounded hover:bg-dinkum-accent transition-colors text-xs font-mclaren"
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
            </div>
          </div>

          <p class="text-xs text-dinkum-accent font-mclaren italic">
            💡 On Steam Deck, access via Desktop Mode file manager. The ~
            represents your home directory.
          </p>
        </div>
      </div>

      {/* Save Slot Info */}
      <div class="mt-6 bg-dinkum-primary/20 border-2 border-dinkum-accent rounded-lg p-4">
        <h4 class="text-sm font-bold text-dinkum-accent font-mclaren mb-2">
          📂 About Save Slots
        </h4>
        <p class="text-sm text-dinkum-tertiary font-mclaren">
          Inside the Dinkum folder, you'll find folders named{" "}
          <code class="px-1 bg-dinkum-gray rounded text-xs font-mono">
            Slot0
          </code>,{" "}
          <code class="px-1 bg-dinkum-gray rounded text-xs font-mono">
            Slot1
          </code>,{" "}
          <code class="px-1 bg-dinkum-gray rounded text-xs font-mono">
            Slot2
          </code>, etc. Each folder contains the save files for one game save
          slot. The main save file is named{" "}
          <code class="px-1 bg-dinkum-gray rounded text-xs font-mono">
            PlayerData
          </code>.
        </p>
      </div>
    </div>
  );
}
