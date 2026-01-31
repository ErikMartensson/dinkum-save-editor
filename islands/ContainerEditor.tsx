import { useComputed, useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import { containerData, containerFilename } from "../routes/index.tsx";
import type { ChestSave } from "../utils/types.ts";
import { getAllItems, getItemName, getMaxDurability } from "../utils/items.ts";

const SLOTS_PER_ROW = 6;

interface SlotEditState {
  chestIndex: number;
  slotIndex: number;
}

function ChestGrid(
  { chest, chestIndex, onSlotClick, editingSlot, onSave, onClear, onCancel }: {
    chest: ChestSave;
    chestIndex: number;
    onSlotClick: (chestIndex: number, slotIndex: number) => void;
    editingSlot: SlotEditState | null;
    onSave: (itemId: number, stack: number) => void;
    onClear: () => void;
    onCancel: () => void;
  },
) {
  const slots = chest.itemId;
  const rows: number[][] = [];
  for (let i = 0; i < slots.length; i += SLOTS_PER_ROW) {
    rows.push(Array.from({ length: SLOTS_PER_ROW }, (_, j) => i + j));
  }

  return (
    <div class="space-y-1">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} class="grid grid-cols-6 gap-1">
          {row.map((slotIndex) => {
            if (slotIndex >= slots.length) {
              return <div key={slotIndex} />;
            }
            const itemId = chest.itemId[slotIndex];
            const stack = chest.itemStack[slotIndex];
            const isEmpty = itemId === -1;
            const isEditing = editingSlot?.chestIndex === chestIndex &&
              editingSlot?.slotIndex === slotIndex;

            return (
              <div key={slotIndex} class="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlotClick(chestIndex, slotIndex);
                  }}
                  title={isEmpty
                    ? `Slot ${slotIndex + 1}: Empty`
                    : `Slot ${slotIndex + 1}: ${getItemName(itemId)} x${stack}`}
                  class={`w-full aspect-square rounded border-2 text-xs font-mclaren flex flex-col items-center justify-center p-0.5 transition-colors ${
                    isEditing
                      ? "border-dinkum-secondary bg-dinkum-secondary/20 ring-2 ring-dinkum-secondary"
                      : isEmpty
                      ? "border-dinkum-primary/40 bg-dinkum-beige/50 text-dinkum-accent/40 hover:border-dinkum-primary hover:bg-dinkum-beige"
                      : "border-dinkum-primary bg-white text-dinkum-tertiary hover:border-dinkum-secondary hover:bg-dinkum-secondary/10"
                  }`}
                >
                  {isEmpty
                    ? (
                      <span class="text-[10px] leading-tight select-none">
                        +
                      </span>
                    )
                    : (
                      <>
                        <span class="text-[10px] leading-tight text-center truncate w-full">
                          {getItemName(itemId)}
                        </span>
                        <span class="text-[9px] text-dinkum-accent">
                          x{stack}
                        </span>
                      </>
                    )}
                </button>
                {isEditing && (
                  <SlotEditor
                    itemId={itemId}
                    stack={stack}
                    onSave={onSave}
                    onClear={onClear}
                    onCancel={onCancel}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SlotEditor(
  { itemId, stack, onSave, onClear, onCancel }: {
    itemId: number;
    stack: number;
    onSave: (itemId: number, stack: number) => void;
    onClear: () => void;
    onCancel: () => void;
  },
) {
  const searchQuery = useSignal("");
  const selectedItemId = useSignal(itemId === -1 ? 0 : itemId);
  const selectedStack = useSignal(stack || 100);
  const showDropdown = useSignal(false);
  const highlightedIndex = useSignal(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allItems = getAllItems();

  const filteredItems = useComputed(() => {
    const q = searchQuery.value.toLowerCase();
    if (!q) return allItems.slice(0, 50);
    return allItems.filter((item) => item.name.toLowerCase().includes(q));
  });

  const applyHighlight = (index: number) => {
    if (!dropdownRef.current) return;
    const buttons = dropdownRef.current.querySelectorAll("button");
    buttons.forEach((btn, i) => {
      if (i === index) {
        btn.style.backgroundColor = "#ffc400";
        btn.style.color = "#fdf4e4";
        btn.style.fontWeight = "500";
        btn.scrollIntoView({ block: "nearest" });
      } else {
        btn.style.backgroundColor = "";
        btn.style.color = "";
        btn.style.fontWeight = "";
      }
    });
  };

  const handleSelect = (id: number) => {
    selectedItemId.value = id;
    searchQuery.value = getItemName(id);
    showDropdown.value = false;
    highlightedIndex.value = -1;
    const durability = getMaxDurability(id);
    if (durability !== null) {
      selectedStack.value = durability;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showDropdown.value) return;

    const items = filteredItems.value;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = highlightedIndex.value < items.length - 1
        ? highlightedIndex.value + 1
        : 0;
      highlightedIndex.value = next;
      requestAnimationFrame(() => applyHighlight(next));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = highlightedIndex.value > 0
        ? highlightedIndex.value - 1
        : items.length - 1;
      highlightedIndex.value = next;
      requestAnimationFrame(() => applyHighlight(next));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = highlightedIndex.value >= 0 ? highlightedIndex.value : 0;
      if (items[idx]) {
        handleSelect(items[idx].id);
      }
    } else if (e.key === "Escape") {
      showDropdown.value = false;
      highlightedIndex.value = -1;
    }
  };

  return (
    <div
      class="absolute z-50 top-full left-0 mt-1 bg-white border-2 border-dinkum-secondary rounded-lg shadow-xl p-3 w-64"
      onClick={(e) => e.stopPropagation()}
    >
      <div class="space-y-2">
        <div>
          <label class="block text-xs font-medium text-dinkum-accent font-mclaren mb-1">
            Item
          </label>
          <div class="relative">
            <input
              type="text"
              value={showDropdown.value
                ? searchQuery.value
                : getItemName(selectedItemId.value)}
              onFocus={() => {
                showDropdown.value = true;
                searchQuery.value = "";
                highlightedIndex.value = -1;
              }}
              onInput={(e) => {
                searchQuery.value = (e.target as HTMLInputElement).value;
                showDropdown.value = true;
                highlightedIndex.value = -1;
              }}
              onKeyDown={handleKeyDown}
              class="w-full px-2 py-1 text-xs border-2 border-dinkum-primary rounded bg-dinkum-beige text-dinkum-tertiary font-mclaren focus:outline-none focus:border-dinkum-secondary"
              placeholder="Search items..."
            />
            {showDropdown.value && (
              <div
                ref={dropdownRef}
                class="absolute z-10 w-full mt-1 bg-white border-2 border-dinkum-primary rounded-lg shadow-lg max-h-40 overflow-y-auto"
              >
                {filteredItems.value.length === 0
                  ? (
                    <div class="px-2 py-1 text-xs text-dinkum-accent font-mclaren">
                      No items found
                    </div>
                  )
                  : filteredItems.value.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      class={`w-full text-left px-2 py-1 text-xs font-mclaren transition-colors ${
                        item.id === selectedItemId.value
                          ? "bg-dinkum-secondary/10 text-dinkum-tertiary"
                          : "text-dinkum-tertiary hover:bg-dinkum-beige"
                      }`}
                    >
                      <span>{item.name}</span>
                      <span class="text-dinkum-accent ml-1">#{item.id}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-dinkum-accent font-mclaren mb-1">
            {getMaxDurability(selectedItemId.value) !== null
              ? "Durability"
              : "Quantity"}
          </label>
          <input
            type="number"
            min="1"
            value={selectedStack.value}
            onInput={(e) => {
              selectedStack.value = Math.max(
                1,
                parseInt((e.target as HTMLInputElement).value) || 1,
              );
            }}
            class="w-full px-2 py-1 text-xs border-2 border-dinkum-primary rounded bg-dinkum-beige text-dinkum-tertiary font-mclaren focus:outline-none focus:border-dinkum-secondary"
          />
          {getMaxDurability(selectedItemId.value) !== null && (
            <p class="text-[10px] text-dinkum-accent mt-0.5 font-mclaren">
              Max: {getMaxDurability(selectedItemId.value)}
            </p>
          )}
        </div>

        <div class="flex gap-1">
          <button
            type="button"
            onClick={() => onSave(selectedItemId.value, selectedStack.value)}
            class="flex-1 px-2 py-1 text-xs bg-dinkum-tertiary text-dinkum-secondary rounded hover:bg-dinkum-accent transition-colors font-mclaren"
          >
            Set
          </button>
          <button
            type="button"
            onClick={onClear}
            class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-mclaren"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onCancel}
            class="px-2 py-1 text-xs bg-dinkum-beige text-dinkum-accent rounded hover:bg-dinkum-primary/20 transition-colors font-mclaren"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

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

  const handleSlotClick = (chestIndex: number, slotIndex: number) => {
    if (
      editingSlot.value?.chestIndex === chestIndex &&
      editingSlot.value?.slotIndex === slotIndex
    ) {
      editingSlot.value = null;
    } else {
      editingSlot.value = { chestIndex, slotIndex };
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
      editingSlot.value.chestIndex,
      editingSlot.value.slotIndex,
      itemId,
      stack,
    );
  };

  const handleSlotClear = () => {
    if (!editingSlot.value) return;
    updateSlot(
      editingSlot.value.chestIndex,
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
                    <ChestGrid
                      chest={chest}
                      chestIndex={index}
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
