import { useSignal } from "@preact/signals";
import { containerData, containerFilename } from "../routes/index.tsx";
import type { ChestSave } from "../utils/types.ts";
import { ItemGrid, type SlotEditState } from "../components/ItemGrid.tsx";

export default function ContainerEditor() {
  const isExpanded = useSignal(true);
  const selectedChestIndex = useSignal<number | null>(null);
  const editingSlot = useSignal<SlotEditState | null>(null);
  const isDirty = useSignal(false);

  if (!containerData.value || !containerFilename.value) {
    return null;
  }

  const chests = containerData.value.chests.value.allChests;

  const handleChestClick = (index: number) => {
    if (selectedChestIndex.value === index) {
      selectedChestIndex.value = null;
      editingSlot.value = null;
    } else {
      selectedChestIndex.value = index;
      editingSlot.value = null;
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

  const handleSlotClick = (gridIndex: number, slotIndex: number) => {
    if (
      editingSlot.value?.gridIndex === gridIndex &&
      editingSlot.value?.slotIndex === slotIndex
    ) {
      editingSlot.value = null;
    } else {
      editingSlot.value = { gridIndex, slotIndex };
    }
  };

  const updateSlot = (
    chestIndex: number,
    slotIndex: number,
    itemId: number,
    stack: number,
  ) => {
    if (!containerData.value) return;

    const updated = JSON.parse(JSON.stringify(containerData.value));
    updated.chests.value.allChests[chestIndex].itemId[slotIndex] = itemId;
    updated.chests.value.allChests[chestIndex].itemStack[slotIndex] = stack;
    containerData.value = updated;
    editingSlot.value = null;
    isDirty.value = true;
  };

  const handleSlotSave = (itemId: number, stack: number) => {
    if (!editingSlot.value) return;
    updateSlot(
      editingSlot.value.gridIndex,
      editingSlot.value.slotIndex,
      itemId,
      stack,
    );
  };

  const handleSlotClear = () => {
    if (!editingSlot.value) return;
    updateSlot(
      editingSlot.value.gridIndex,
      editingSlot.value.slotIndex,
      -1,
      0,
    );
  };

  const handleCancel = () => {
    editingSlot.value = null;
  };

  const handleClearChest = (chestIndex: number) => {
    if (!containerData.value) return;

    const updated = JSON.parse(JSON.stringify(containerData.value));
    const chest = updated.chests.value.allChests[chestIndex];
    chest.itemId = chest.itemId.map(() => -1);
    chest.itemStack = chest.itemStack.map(() => 0);
    containerData.value = updated;
    isDirty.value = true;
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
          {isDirty.value && (
            <span class="text-xs text-dinkum-secondary font-mclaren bg-dinkum-secondary/20 px-2 py-0.5 rounded">
              Modified
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            isExpanded.value = !isExpanded.value;
            if (!isExpanded.value) {
              editingSlot.value = null;
            }
          }}
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
        <div class="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {chests.map((chest, index) => (
            <div
              key={index}
              class="border-2 border-dinkum-primary rounded-lg bg-dinkum-beige"
            >
              <div
                class="flex items-center justify-between p-3 cursor-pointer hover:bg-dinkum-beige/80 transition-colors"
                onClick={() => handleChestClick(index)}
              >
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
                      {getChestLocation(chest)} &bull; {getItemCount(chest)}
                      {" "}
                      items
                    </p>
                  </div>
                </div>
                <span class="text-dinkum-secondary text-sm">
                  {selectedChestIndex.value === index ? "\u25BC" : "\u25B6"}
                </span>
              </div>

              {selectedChestIndex.value === index && (
                <div class="p-3 pt-0">
                  <div class="border-t border-dinkum-primary pt-3">
                    <div class="flex items-center justify-between mb-2">
                      <p class="text-xs text-dinkum-accent font-mclaren">
                        Click a slot to edit
                      </p>
                      {getItemCount(chest) > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearChest(index);
                          }}
                          class="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-mclaren"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <ItemGrid
                      itemIds={chest.itemId}
                      stacks={chest.itemStack}
                      gridIndex={index}
                      onSlotClick={handleSlotClick}
                      editingSlot={editingSlot.value}
                      onSave={handleSlotSave}
                      onClear={handleSlotClear}
                      onCancel={handleCancel}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
