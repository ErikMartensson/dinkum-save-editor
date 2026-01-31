import { useSignal } from "@preact/signals";
import { saveData } from "../routes/index.tsx";
import type { ChestSave, DinkumSaveData } from "../utils/types.ts";
import { ItemGrid, type SlotEditState } from "../components/ItemGrid.tsx";

function getStashKeys(data: DinkumSaveData): string[] {
  return Object.keys(data)
    .filter((key) => key.startsWith("stash_"))
    .sort((a, b) => {
      const numA = parseInt(a.split("_")[1]);
      const numB = parseInt(b.split("_")[1]);
      return numA - numB;
    });
}

function getItemCount(itemIds: number[]): number {
  return itemIds.filter((id) => id !== -1).length;
}

// Toolbar = first total/4 slots, backpack = rest.
// Base: 8 toolbar + 24 backpack = 32. Each Cargo Licence adds 1+3 = 4.
function getToolbarSize(totalSlots: number): number {
  return Math.floor(totalSlots / 4);
}

export default function PlayerInventoryEditor() {
  const inventoryExpanded = useSignal(false);
  const stashesExpanded = useSignal(false);
  const editingSlot = useSignal<SlotEditState | null>(null);

  if (!saveData.value?.playerInfo?.value?.itemsInInvSlots) {
    return null;
  }

  const playerInfo = saveData.value.playerInfo.value;
  const stashKeys = getStashKeys(saveData.value);

  const totalSlots = playerInfo.itemsInInvSlots.length;
  const toolbarSize = getToolbarSize(totalSlots);
  const toolbarItemIds = playerInfo.itemsInInvSlots.slice(0, toolbarSize);
  const toolbarStacks = playerInfo.stacksInSlots.slice(0, toolbarSize);
  const backpackItemIds = playerInfo.itemsInInvSlots.slice(toolbarSize);
  const backpackStacks = playerInfo.stacksInSlots.slice(toolbarSize);

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

  // gridIndex 0 = player inventory, 1+ = stashes
  const handleSlotSave = (itemId: number, stack: number) => {
    if (!editingSlot.value || !saveData.value) return;
    const { gridIndex, slotIndex } = editingSlot.value;

    const updated = JSON.parse(JSON.stringify(saveData.value));

    if (gridIndex === 0) {
      updated.playerInfo.value.itemsInInvSlots[slotIndex] = itemId;
      updated.playerInfo.value.stacksInSlots[slotIndex] = stack;
    } else {
      const stashKey = stashKeys[gridIndex - 1];
      updated[stashKey].value.itemId[slotIndex] = itemId;
      updated[stashKey].value.itemStack[slotIndex] = stack;
    }

    saveData.value = updated;
    editingSlot.value = null;
  };

  const handleSlotClear = () => {
    if (!editingSlot.value || !saveData.value) return;
    const { gridIndex, slotIndex } = editingSlot.value;

    const updated = JSON.parse(JSON.stringify(saveData.value));

    if (gridIndex === 0) {
      updated.playerInfo.value.itemsInInvSlots[slotIndex] = -1;
      updated.playerInfo.value.stacksInSlots[slotIndex] = 0;
    } else {
      const stashKey = stashKeys[gridIndex - 1];
      updated[stashKey].value.itemId[slotIndex] = -1;
      updated[stashKey].value.itemStack[slotIndex] = 0;
    }

    saveData.value = updated;
    editingSlot.value = null;
  };

  const handleCancel = () => {
    editingSlot.value = null;
  };

  const handleClearAll = (gridIndex: number) => {
    if (!saveData.value) return;

    const updated = JSON.parse(JSON.stringify(saveData.value));

    if (gridIndex === 0) {
      updated.playerInfo.value.itemsInInvSlots = updated.playerInfo.value
        .itemsInInvSlots.map(() => -1);
      updated.playerInfo.value.stacksInSlots = updated.playerInfo.value
        .stacksInSlots.map(() => 0);
    } else {
      const stashKey = stashKeys[gridIndex - 1];
      updated[stashKey].value.itemId = updated[stashKey].value.itemId.map(() =>
        -1
      );
      updated[stashKey].value.itemStack = updated[stashKey].value.itemStack.map(
        () => 0,
      );
    }

    saveData.value = updated;
    editingSlot.value = null;
  };

  return (
    <div class="bg-dinkum-gray rounded-lg shadow-lg border-2 border-dinkum-primary p-6">
      <h2 class="text-xl font-bold text-dinkum-tertiary font-mclaren mb-4">
        Player Inventory & Stashes
      </h2>

      {/* Player Inventory */}
      <div class="border-2 border-dinkum-primary rounded-lg bg-dinkum-beige">
        <div
          class="flex items-center justify-between p-3 cursor-pointer hover:bg-dinkum-beige/80 transition-colors"
          onClick={() => {
            inventoryExpanded.value = !inventoryExpanded.value;
            if (!inventoryExpanded.value) editingSlot.value = null;
          }}
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <div>
              <p class="font-medium text-dinkum-tertiary font-mclaren">
                Player Inventory
              </p>
              <p class="text-xs text-dinkum-accent font-mclaren">
                {getItemCount(playerInfo.itemsInInvSlots)} items &bull;{" "}
                {playerInfo.itemsInInvSlots.length} slots
              </p>
            </div>
          </div>
          <span class="text-dinkum-secondary text-sm">
            {inventoryExpanded.value ? "\u25BC" : "\u25B6"}
          </span>
        </div>

        {inventoryExpanded.value && (
          <div class="p-3 pt-0">
            <div class="border-t border-dinkum-primary pt-3">
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs text-dinkum-accent font-mclaren">
                  Click a slot to edit
                </p>
                {getItemCount(playerInfo.itemsInInvSlots) > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAll(0);
                    }}
                    class="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-mclaren"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div class="bg-dinkum-secondary/10 border border-dinkum-secondary/30 rounded-lg p-2">
                <p class="text-[10px] text-dinkum-secondary font-mclaren font-medium mb-1">
                  Toolbar ({toolbarSize} slots)
                </p>
                <ItemGrid
                  itemIds={toolbarItemIds}
                  stacks={toolbarStacks}
                  gridIndex={0}
                  onSlotClick={handleSlotClick}
                  editingSlot={editingSlot.value}
                  onSave={handleSlotSave}
                  onClear={handleSlotClear}
                  onCancel={handleCancel}
                  columns={8}
                />
              </div>

              <p class="text-[10px] text-dinkum-accent font-mclaren mb-1 mt-3">
                Backpack ({backpackItemIds.length} slots)
              </p>
              <ItemGrid
                itemIds={backpackItemIds}
                stacks={backpackStacks}
                gridIndex={0}
                onSlotClick={handleSlotClick}
                editingSlot={editingSlot.value}
                onSave={handleSlotSave}
                onClear={handleSlotClear}
                onCancel={handleCancel}
                columns={8}
                slotOffset={toolbarSize}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stashes */}
      {stashKeys.length > 0 && (
        <div class="mt-3">
          <div
            class="flex items-center justify-between cursor-pointer mb-3"
            onClick={() => {
              stashesExpanded.value = !stashesExpanded.value;
              if (!stashesExpanded.value) editingSlot.value = null;
            }}
          >
            <p class="text-sm font-medium text-dinkum-tertiary font-mclaren">
              Stashes ({stashKeys.length})
            </p>
            <span class="text-dinkum-secondary text-sm">
              {stashesExpanded.value ? "\u25BC" : "\u25B6"}
            </span>
          </div>

          {stashesExpanded.value && (
            <div class="space-y-3">
              {stashKeys.map((key, index) => {
                const stash = (
                  saveData.value as DinkumSaveData
                )[key as `stash_${number}`].value as ChestSave;
                const gridIndex = index + 1;

                return (
                  <StashSection
                    key={key}
                    stash={stash}
                    stashIndex={index}
                    gridIndex={gridIndex}
                    editingSlot={editingSlot.value}
                    onSlotClick={handleSlotClick}
                    onSave={handleSlotSave}
                    onClear={handleSlotClear}
                    onCancel={handleCancel}
                    onClearAll={() => handleClearAll(gridIndex)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StashSection(
  {
    stash,
    stashIndex,
    gridIndex,
    editingSlot,
    onSlotClick,
    onSave,
    onClear,
    onCancel,
    onClearAll,
  }: {
    stash: ChestSave;
    stashIndex: number;
    gridIndex: number;
    editingSlot: SlotEditState | null;
    onSlotClick: (gridIndex: number, slotIndex: number) => void;
    onSave: (itemId: number, stack: number) => void;
    onClear: () => void;
    onCancel: () => void;
    onClearAll: () => void;
  },
) {
  const isExpanded = useSignal(false);

  return (
    <div class="border-2 border-dinkum-primary rounded-lg bg-dinkum-beige">
      <div
        class="flex items-center justify-between p-3 cursor-pointer hover:bg-dinkum-beige/80 transition-colors"
        onClick={() => {
          isExpanded.value = !isExpanded.value;
        }}
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
              Stash #{stashIndex + 1}
            </p>
            <p class="text-xs text-dinkum-accent font-mclaren">
              {getItemCount(stash.itemId)} items &bull; {stash.itemId.length}
              {" "}
              slots
            </p>
          </div>
        </div>
        <span class="text-dinkum-secondary text-sm">
          {isExpanded.value ? "\u25BC" : "\u25B6"}
        </span>
      </div>

      {isExpanded.value && (
        <div class="p-3 pt-0">
          <div class="border-t border-dinkum-primary pt-3">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs text-dinkum-accent font-mclaren">
                Click a slot to edit
              </p>
              {getItemCount(stash.itemId) > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearAll();
                  }}
                  class="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-mclaren"
                >
                  Clear All
                </button>
              )}
            </div>
            <ItemGrid
              itemIds={stash.itemId}
              stacks={stash.itemStack}
              gridIndex={gridIndex}
              onSlotClick={onSlotClick}
              editingSlot={editingSlot}
              onSave={onSave}
              onClear={onClear}
              onCancel={onCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
