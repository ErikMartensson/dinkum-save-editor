import { useSignal } from "@preact/signals";
import { containerData, containerFilename } from "../routes/index.tsx";
import { useJsonSearch } from "../hooks/useJsonSearch.ts";
import { useDebouncedValue } from "../hooks/useDebouncedValue.ts";

interface JsonNodeProps {
  data: unknown;
  path: string;
  depth: number;
  onEdit: (path: string, value: unknown) => void;
  searchQuery: string;
  isMatchingPath: boolean;
  shouldAutoExpand: boolean;
}

// Helper function to check if a subtree contains any matches
function hasMatchInSubtree(obj: unknown, query: string): boolean {
  if (!query || !obj) return false;

  const lowerQuery = query.toLowerCase();

  if (typeof obj !== "object" || obj === null) {
    return String(obj).toLowerCase().includes(lowerQuery);
  }

  const entries = Array.isArray(obj)
    ? (obj as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(obj as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (key.toLowerCase().includes(lowerQuery)) return true;
    if (hasMatchInSubtree(value, query)) return true;
  }

  return false;
}

function JsonNode(
  { data, path, depth, onEdit, searchQuery, isMatchingPath, shouldAutoExpand }:
    JsonNodeProps,
) {
  const isExpanded = useSignal(shouldAutoExpand || depth < 2); // Auto-expand if search match or first 2 levels

  // Update expansion when shouldAutoExpand changes
  if (shouldAutoExpand && !isExpanded.value) {
    isExpanded.value = true;
  }
  const isEditing = useSignal(false);
  const editValue = useSignal("");

  const dataType = typeof data;
  const isObject = data !== null && dataType === "object";
  const isArray = Array.isArray(data);
  const isPrimitive = !isObject;

  const handleEdit = () => {
    if (isPrimitive) {
      isEditing.value = true;
      editValue.value = String(data);
    }
  };

  const handleSave = () => {
    let newValue: unknown = editValue.value;

    // Try to parse the value to the correct type
    if (dataType === "number") {
      newValue = Number(editValue.value);
      if (isNaN(newValue as number)) {
        alert("Invalid number");
        return;
      }
    } else if (dataType === "boolean") {
      newValue = editValue.value.toLowerCase() === "true";
    }

    onEdit(path, newValue);
    isEditing.value = false;
  };

  const handleCancel = () => {
    isEditing.value = false;
  };

  const highlightText = (text: string) => {
    if (!searchQuery || !text) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return text;

    return (
      <>
        {text.substring(0, index)}
        <mark class="bg-yellow-300 font-bold">
          {text.substring(index, index + searchQuery.length)}
        </mark>
        {text.substring(index + searchQuery.length)}
      </>
    );
  };

  const renderPrimitive = () => {
    if (isEditing.value) {
      return (
        <div class="inline-flex items-center gap-2 ml-2">
          <input
            type="text"
            value={editValue.value}
            onInput={(e) =>
              editValue.value = (e.target as HTMLInputElement).value}
            class="px-2 py-1 border border-dinkum-primary rounded text-sm font-mono"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSave}
            class="px-2 py-1 bg-dinkum-tertiary text-dinkum-secondary rounded text-xs hover:bg-dinkum-accent transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            class="px-2 py-1 bg-dinkum-gray text-dinkum-tertiary rounded text-xs hover:bg-dinkum-accent hover:text-dinkum-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      );
    }

    let displayValue = String(data);
    let valueClass = "text-dinkum-tertiary";

    if (dataType === "string") {
      displayValue = `"${data}"`;
      valueClass = "text-green-600";
    } else if (dataType === "number") {
      valueClass = "text-blue-600";
    } else if (dataType === "boolean") {
      valueClass = "text-purple-600";
    } else if (data === null) {
      displayValue = "null";
      valueClass = "text-gray-500";
    }

    return (
      <span
        class={`${valueClass} font-mono cursor-pointer hover:underline`}
        onClick={handleEdit}
        title="Click to edit"
      >
        {isMatchingPath ? highlightText(displayValue) : displayValue}
      </span>
    );
  };

  if (isPrimitive) {
    const keyName = path.split(".").pop() || "";
    return (
      <div class="ml-4">
        <span class="text-dinkum-accent font-mono">
          {isMatchingPath ? highlightText(keyName) : keyName}:
        </span>
        {renderPrimitive()}
      </div>
    );
  }

  const keys = Object.keys(data as Record<string, unknown>);
  const displayType = isArray
    ? `Array[${keys.length}]`
    : `Object{${keys.length}}`;

  const keyName = path.split(".").pop() || "";

  return (
    <div class="ml-4">
      <div class="flex items-center gap-2">
        <button
          type="button"
          onClick={() => isExpanded.value = !isExpanded.value}
          class="text-dinkum-secondary hover:text-dinkum-orange transition-colors"
        >
          {isExpanded.value ? "▼" : "▶"}
        </button>
        <span class="text-dinkum-accent font-mono font-bold">
          {isMatchingPath ? highlightText(keyName) : keyName}
        </span>
        <span class="text-dinkum-tertiary text-sm font-mono">
          {displayType}
        </span>
      </div>
      {isExpanded.value && (
        <div class="border-l-2 border-dinkum-gray ml-2 pl-2">
          {keys.map((key) => {
            const childPath = `${path}.${key}`;
            const childValue = (data as Record<string, unknown>)[key];
            const isMatching = searchQuery.length > 0 && (
              key.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (typeof childValue !== "object" &&
                childValue !== null &&
                String(childValue).toLowerCase().includes(
                  searchQuery.toLowerCase(),
                ))
            );

            // Check if this node or any of its descendants have matches
            const hasDescendantMatch = searchQuery.length > 0 && (
              isMatching || hasMatchInSubtree(childValue, searchQuery)
            );

            return (
              <JsonNode
                key={childPath}
                data={childValue}
                path={childPath}
                depth={depth + 1}
                onEdit={onEdit}
                searchQuery={searchQuery}
                isMatchingPath={isMatching}
                shouldAutoExpand={hasDescendantMatch}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ContainerAdvancedEditor() {
  const isExpanded = useSignal(false);
  const searchQuery = useSignal("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const hasChanges = useSignal(false);
  const currentMatchIndex = useSignal(0);

  const searchResult = useJsonSearch(containerData, debouncedSearchQuery);

  const handleEdit = (path: string, value: unknown) => {
    if (!containerData.value) return;

    // Create a deep copy of the container data
    const newData = JSON.parse(JSON.stringify(containerData.value));

    // Navigate to the path and update the value
    const parts = path.split(".").slice(1); // Remove "root"
    // deno-lint-ignore no-explicit-any
    let current: any = newData;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;

    // Update the signal
    containerData.value = newData;
    hasChanges.value = true;
  };

  const handleExpandAll = () => {
    isExpanded.value = true;
  };

  const handleCollapseAll = () => {
    isExpanded.value = false;
  };

  const handleClearSearch = () => {
    searchQuery.value = "";
    currentMatchIndex.value = 0;
  };

  const handleNextMatch = () => {
    if (searchResult.value.matches.length > 0) {
      currentMatchIndex.value = (currentMatchIndex.value + 1) %
        searchResult.value.matches.length;
      scrollToMatch(currentMatchIndex.value);
    }
  };

  const handlePreviousMatch = () => {
    if (searchResult.value.matches.length > 0) {
      currentMatchIndex.value = currentMatchIndex.value === 0
        ? searchResult.value.matches.length - 1
        : currentMatchIndex.value - 1;
      scrollToMatch(currentMatchIndex.value);
    }
  };

  const scrollToMatch = (index: number) => {
    const match = searchResult.value.matches[index];
    if (match) {
      // Find all highlighted elements
      const highlights = document.querySelectorAll("mark.bg-yellow-300");
      if (highlights[index]) {
        // Remove previous active highlight
        highlights.forEach((h) =>
          h.classList.remove("ring-2", "ring-blue-500")
        );
        // Add active highlight to current match
        highlights[index].classList.add("ring-2", "ring-blue-500");
        // Scroll into view
        highlights[index].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.value) {
      e.preventDefault();
      if (e.shiftKey) {
        handlePreviousMatch();
      } else {
        handleNextMatch();
      }
    }
  };

  // Reset match index when search query changes
  if (
    searchResult.value.matches.length > 0 &&
    currentMatchIndex.value >= searchResult.value.matches.length
  ) {
    currentMatchIndex.value = 0;
  }

  if (!containerData.value) {
    return null;
  }

  return (
    <div class="bg-white rounded-lg shadow-md border-2 border-dinkum-primary p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-bold text-dinkum-tertiary font-mclaren">
            Container Advanced Editor
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
        <div class="flex gap-2">
          <button
            type="button"
            onClick={handleExpandAll}
            class="px-3 py-1 bg-dinkum-tertiary text-dinkum-secondary rounded hover:bg-dinkum-accent transition-colors text-sm font-mclaren"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            class="px-3 py-1 bg-dinkum-tertiary text-dinkum-secondary rounded hover:bg-dinkum-accent transition-colors text-sm font-mclaren"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div class="mb-4">
        <p class="text-sm text-dinkum-accent mb-2 font-mclaren">
          ⚠️ Advanced users only! Click any value to edit it directly.
        </p>
        <div class="relative">
          <input
            type="text"
            placeholder="Search fields and values... (Enter: next, Shift+Enter: previous)"
            value={searchQuery.value}
            onInput={(e) =>
              searchQuery.value = (e.target as HTMLInputElement).value}
            onKeyDown={handleKeyDown}
            class="w-full px-4 py-2 border-2 border-dinkum-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-dinkum-secondary font-mclaren pr-20"
          />
          {searchQuery.value && (
            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchResult.value.matches.length > 0 && (
                <>
                  <span class="text-xs text-dinkum-tertiary font-mclaren">
                    {currentMatchIndex.value + 1} /{" "}
                    {searchResult.value.matches.length}
                  </span>
                  <button
                    type="button"
                    onClick={handlePreviousMatch}
                    class="px-2 py-1 bg-dinkum-tertiary text-dinkum-secondary rounded text-xs hover:bg-dinkum-accent transition-colors"
                    title="Previous match (Shift+Enter)"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMatch}
                    class="px-2 py-1 bg-dinkum-tertiary text-dinkum-secondary rounded text-xs hover:bg-dinkum-accent transition-colors"
                    title="Next match (Enter)"
                  >
                    ↓
                  </button>
                </>
              )}
              {searchResult.value.matches.length === 0 &&
                debouncedSearchQuery.value && (
                <span class="text-xs text-red-600 font-mclaren">
                  No matches
                </span>
              )}
              <button
                type="button"
                onClick={handleClearSearch}
                class="px-2 py-1 bg-dinkum-gray text-dinkum-tertiary rounded text-xs hover:bg-dinkum-accent hover:text-dinkum-secondary transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {hasChanges.value && (
        <div class="mb-4 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <p class="text-sm text-yellow-800 font-mclaren">
            ⚠️ You have unsaved changes. Use the Download Manager below to save
            your edits.
          </p>
        </div>
      )}

      <div class="bg-dinkum-beige rounded-lg p-4 max-h-[600px] overflow-y-auto font-mono text-sm">
        <JsonNode
          data={containerData.value}
          path="root"
          depth={0}
          onEdit={handleEdit}
          searchQuery={searchQuery.value}
          isMatchingPath={searchResult.value.matchingPaths.has("root")}
          shouldAutoExpand={searchResult.value.shouldExpand("root")}
        />
      </div>

      <div class="mt-4 text-xs text-dinkum-tertiary font-mclaren">
        <p>
          💡 Tip: Click on any primitive value (strings, numbers, booleans) to
          edit it. Changes are applied immediately to the in-memory container
          data.
        </p>
      </div>
    </div>
  );
}
