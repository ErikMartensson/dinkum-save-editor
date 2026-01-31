import { useComputed, useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import { getAllItems, getItemName, getMaxDurability } from "../utils/items.ts";

const GRID_COLS: Record<number, string> = {
  6: "grid-cols-6",
  8: "grid-cols-8",
};

export interface SlotEditState {
  gridIndex: number;
  slotIndex: number;
}

export function ItemGrid(
  {
    itemIds,
    stacks,
    gridIndex,
    onSlotClick,
    editingSlot,
    onSave,
    onClear,
    onCancel,
    columns = 6,
    slotOffset = 0,
  }: {
    itemIds: number[];
    stacks: number[];
    gridIndex: number;
    onSlotClick: (gridIndex: number, slotIndex: number) => void;
    editingSlot: SlotEditState | null;
    onSave: (itemId: number, stack: number) => void;
    onClear: () => void;
    onCancel: () => void;
    columns?: number;
    slotOffset?: number;
  },
) {
  const cols = columns;
  const rows: number[][] = [];
  for (let i = 0; i < itemIds.length; i += cols) {
    rows.push(Array.from({ length: cols }, (_, j) => i + j));
  }

  return (
    <div class="space-y-1">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          class={`grid ${GRID_COLS[cols] ?? "grid-cols-6"} gap-1`}
        >
          {row.map((localIndex) => {
            if (localIndex >= itemIds.length) {
              return <div key={localIndex} />;
            }
            const realIndex = localIndex + slotOffset;
            const itemId = itemIds[localIndex];
            const stack = stacks[localIndex];
            const isEmpty = itemId === -1;
            const isEditing = editingSlot?.gridIndex === gridIndex &&
              editingSlot?.slotIndex === realIndex;

            return (
              <div key={localIndex} class="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlotClick(gridIndex, realIndex);
                  }}
                  title={isEmpty
                    ? `Slot ${realIndex + 1}: Empty`
                    : `Slot ${realIndex + 1}: ${getItemName(itemId)} x${stack}`}
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

export function SlotEditor(
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
