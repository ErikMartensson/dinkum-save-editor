import { useSignal } from "@preact/signals";
import { containerData, containerFilename } from "../routes/index.tsx";
import type { ChestSave } from "../utils/types.ts";

export default function ContainerEditor() {
  const isExpanded = useSignal(false);
  const selectedChestIndex = useSignal<number | null>(null);

  if (!containerData.value || !containerFilename.value) {
    return null;
  }

  const chests = containerData.value.chests.value.allChests;

  const handleChestClick = (index: number) => {
    if (selectedChestIndex.value === index) {
      selectedChestIndex.value = null;
    } else {
      selectedChestIndex.value = index;
    }
  };

  const getChestLocation = (chest: ChestSave) => {
    if (chest.houseX !== -1 && chest.houseY !== -1) {
      return `House (${chest.houseX}, ${chest.houseY})`;
    }
    return `World (${chest.xPos}, ${chest.yPos})`;
  };

  const getItemCount = (chest: ChestSave) => {
    return chest.itemId.filter((id) => id !== -1).length;
  };

  return (
    <div class="bg-dinkum-gray rounded-lg shadow-lg border-2 border-dinkum-primary p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <h2 class="text-xl font-bold text-dinkum-tertiary font-mclaren">
            Container Editor
          </h2>
          <div class="flex items-center gap-2 bg-dinkum-beige px-3 py-1 rounded-md border border-dinkum-primary">
            <svg
              class="w-4 h-4 text-dinkum-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span class="text-sm font-medium text-dinkum-tertiary font-mclaren">
              {containerFilename.value}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => isExpanded.value = !isExpanded.value}
          class="px-3 py-1 bg-dinkum-tertiary text-dinkum-secondary rounded hover:bg-dinkum-accent transition-colors text-sm font-mclaren"
        >
          {isExpanded.value ? "Collapse" : "Expand"}
        </button>
      </div>

      <div class="mb-4">
        <p class="text-sm text-dinkum-accent font-mclaren">
          Total Chests: {chests.length}
        </p>
      </div>

      {isExpanded.value && (
        <div class="space-y-2 max-h-[500px] overflow-y-auto">
          {chests.map((chest, index) => (
            <div
              key={index}
              class="border-2 border-dinkum-primary rounded-lg p-3 bg-dinkum-beige hover:bg-dinkum-beige/80 transition-colors cursor-pointer"
              onClick={() => handleChestClick(index)}
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <svg
                    class="w-5 h-5 text-dinkum-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <div>
                    <p class="font-medium text-dinkum-tertiary font-mclaren">
                      Chest #{index + 1}
                    </p>
                    <p class="text-xs text-dinkum-accent font-mclaren">
                      {getChestLocation(chest)} • {getItemCount(chest)} items
                    </p>
                  </div>
                </div>
                <span class="text-dinkum-secondary">
                  {selectedChestIndex.value === index ? "▼" : "▶"}
                </span>
              </div>

              {selectedChestIndex.value === index && (
                <div class="mt-3 pt-3 border-t border-dinkum-primary">
                  <div class="grid grid-cols-2 gap-2 text-xs font-mclaren">
                    <div>
                      <span class="text-dinkum-accent">Position:</span>
                      <span class="text-dinkum-tertiary ml-1">
                        ({chest.xPos}, {chest.yPos})
                      </span>
                    </div>
                    <div>
                      <span class="text-dinkum-accent">House:</span>
                      <span class="text-dinkum-tertiary ml-1">
                        {chest.houseX !== -1
                          ? `(${chest.houseX}, ${chest.houseY})`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div class="mt-2">
                    <p class="text-xs text-dinkum-accent font-mclaren mb-1">
                      Items:
                    </p>
                    <div class="bg-white rounded p-2 max-h-32 overflow-y-auto">
                      {chest.itemId.map((itemId, slotIndex) => {
                        if (itemId === -1) return null;
                        return (
                          <div
                            key={slotIndex}
                            class="text-xs text-dinkum-tertiary font-mono"
                          >
                            Slot {slotIndex}: Item ID {itemId} (x
                            {chest.itemStack[slotIndex]})
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div class="mt-4 p-3 bg-dinkum-orange/30 border-2 border-dinkum-accent rounded-lg">
        <p class="text-sm text-dinkum-tertiary font-mclaren">
          ℹ️ Container files store chest/storage data. Use the Advanced Editor
          below to modify chest contents.
        </p>
      </div>
    </div>
  );
}
