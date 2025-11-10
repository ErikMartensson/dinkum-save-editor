import { useComputed, useSignal } from "@preact/signals";
import { saveData } from "../routes/index.tsx";

interface JsonNodeProps {
  data: unknown;
  path: string;
  depth: number;
  onEdit: (path: string, value: unknown) => void;
}

function JsonNode({ data, path, depth, onEdit }: JsonNodeProps) {
  const isExpanded = useSignal(depth < 2); // Auto-expand first 2 levels
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
        {displayValue}
      </span>
    );
  };

  if (isPrimitive) {
    return (
      <div class="ml-4">
        <span class="text-dinkum-accent font-mono">
          {path.split(".").pop()}:
        </span>
        {renderPrimitive()}
      </div>
    );
  }

  const keys = Object.keys(data as Record<string, unknown>);
  const displayType = isArray
    ? `Array[${keys.length}]`
    : `Object{${keys.length}}`;

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
          {path.split(".").pop()}
        </span>
        <span class="text-dinkum-tertiary text-sm font-mono">
          {displayType}
        </span>
      </div>
      {isExpanded.value && (
        <div class="border-l-2 border-dinkum-gray ml-2 pl-2">
          {keys.map((key) => (
            <JsonNode
              key={`${path}.${key}`}
              data={(data as Record<string, unknown>)[key]}
              path={`${path}.${key}`}
              depth={depth + 1}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdvancedEditor() {
  const isExpanded = useSignal(false);
  const searchQuery = useSignal("");
  const hasChanges = useSignal(false);

  const isVisible = useComputed(() => saveData.value !== null);

  const handleEdit = (path: string, value: unknown) => {
    if (!saveData.value) return;

    // Create a deep copy of the save data
    const newData = JSON.parse(JSON.stringify(saveData.value));

    // Navigate to the path and update the value
    const parts = path.split(".").slice(1); // Remove "root"
    // deno-lint-ignore no-explicit-any
    let current: any = newData;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;

    // Update the signal
    saveData.value = newData;
    hasChanges.value = true;
  };

  const handleExpandAll = () => {
    // This would require a more complex state management
    // For now, just toggle the main expansion
    isExpanded.value = true;
  };

  const handleCollapseAll = () => {
    isExpanded.value = false;
  };

  if (!isVisible.value) {
    return null;
  }

  return (
    <div class="bg-white rounded-lg shadow-md border-2 border-dinkum-primary p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-dinkum-tertiary font-mclaren">
          Advanced Editor
        </h2>
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
        <input
          type="text"
          placeholder="Search fields... (coming soon)"
          value={searchQuery.value}
          onInput={(e) =>
            searchQuery.value = (e.target as HTMLInputElement).value}
          class="w-full px-4 py-2 border-2 border-dinkum-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-dinkum-secondary font-mclaren"
          disabled
        />
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
          data={saveData.value}
          path="root"
          depth={0}
          onEdit={handleEdit}
        />
      </div>

      <div class="mt-4 text-xs text-dinkum-tertiary font-mclaren">
        <p>
          💡 Tip: Click on any primitive value (strings, numbers, booleans) to
          edit it. Changes are applied immediately to the in-memory save data.
        </p>
      </div>
    </div>
  );
}
