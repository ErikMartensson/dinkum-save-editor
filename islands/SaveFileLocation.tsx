import { useState } from "preact/hooks";

interface ClickEffect {
  id: string;
  x: number;
  y: number;
}

export default function SaveFileLocation() {
  const [copiedButtons, setCopiedButtons] = useState<Set<string>>(new Set());
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);

  const copyToClipboard = (
    text: string,
    platform: string,
    event: MouseEvent,
  ) => {
    // Get click position relative to viewport
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    navigator.clipboard.writeText(text).then(() => {
      // Add this button to the copied set
      setCopiedButtons((prev) => new Set(prev).add(platform));

      // Add new click effect with unique ID
      const effectId = `${platform}-${Date.now()}`;
      setClickEffects((prev) => [...prev, { id: effectId, x, y }]);

      // Remove this specific effect after animation completes
      setTimeout(() => {
        setClickEffects((prev) => prev.filter((e) => e.id !== effectId));
      }, 1000);

      // Reset this specific button's copied state
      setTimeout(() => {
        setCopiedButtons((prev) => {
          const newSet = new Set(prev);
          newSet.delete(platform);
          return newSet;
        });
      }, 1500);
    }).catch((err) => {
      console.error("Failed to copy:", err);
    });
  };

  const CopyButton = (
    { text, platform }: { text: string; platform: string },
  ) => {
    const isCopied = copiedButtons.has(platform);

    return (
      <button
        type="button"
        onClick={(e) =>
          copyToClipboard(text, platform, e as unknown as MouseEvent)}
        class={`shrink-0 px-3 py-1 rounded text-xs font-mclaren transition-all duration-300 ${
          isCopied
            ? "bg-green-500 text-white scale-105"
            : "bg-dinkum-tertiary text-dinkum-secondary hover:bg-dinkum-accent"
        }`}
        title="Copy to clipboard"
      >
        {isCopied ? "✓ Copied!" : "📋 Copy"}
      </button>
    );
  };

  return (
    <>
      {/* Radial animation effects - can have multiple at once */}
      {clickEffects.map((effect) => (
        <div
          key={effect.id}
          class="fixed pointer-events-none z-50"
          style={{
            left: `${effect.x}px`,
            top: `${effect.y}px`,
          }}
        >
          {/* Create 8 lines shooting out in a circle */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <div
              key={`line-${i}`}
              class="absolute left-0 top-0 origin-left"
              style={{
                width: "3px",
                height: "3px",
                background: "linear-gradient(to right, #E8A87C, transparent)",
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                animation: `radialBurst 0.6s ease-out forwards`,
                animationDelay: `${i * 0.02}s`,
              }}
            />
          ))}
          {/* Add some sparkle dots */}
          {[30, 60, 120, 150, 210, 240, 300, 330].map((angle, i) => (
            <div
              key={`dot-${i}`}
              class="absolute w-2 h-2 rounded-full left-0 top-0"
              style={{
                backgroundColor: "#C38D9E",
                transform:
                  `translate(-50%, -50%) rotate(${angle}deg) translateX(0px)`,
                animation: `sparkle 0.8s ease-out forwards`,
                animationDelay: `${i * 0.03}s`,
                "--angle": `${angle}deg`,
              }}
            />
          ))}
        </div>
      ))}

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
              Your Dinkum save files are located in a hidden folder. Here's how
              to find them:
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
                <CopyButton
                  text="%USERPROFILE%\AppData\LocalLow\James Bendon\Dinkum\"
                  platform="Windows"
                />
              </div>
            </div>

            <p class="text-xs text-dinkum-accent font-mclaren italic">
              💡 Tip: You can also navigate manually by showing hidden folders
              in File Explorer (View → Show → Hidden items)
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
                <CopyButton
                  text="~/.local/share/Steam/steamapps/compatdata/1062520/pfx/drive_c/users/steamuser/AppData/LocalLow/James Bendon/Dinkum"
                  platform="Linux"
                />
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

      {/* Add CSS animations */}
      <style>
        {`
        @keyframes radialBurst {
          0% {
            width: 3px;
            opacity: 1;
          }
          100% {
            width: 50px;
            opacity: 0;
          }
        }

        @keyframes sparkle {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0px) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(35px) scale(1);
            opacity: 0;
          }
        }
      `}
      </style>
    </>
  );
}
