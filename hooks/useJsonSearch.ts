import { Signal, useComputed } from "@preact/signals";

interface SearchMatch {
  path: string;
  matchType: "key" | "value";
  matchedText: string;
}

interface SearchResult {
  matches: SearchMatch[];
  matchingPaths: Set<string>;
  shouldExpand: (path: string) => boolean;
}

export function useJsonSearch(
  data: Signal<unknown>,
  searchQuery: Signal<string>,
): Signal<SearchResult> {
  return useComputed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    if (!query || !data.value) {
      return {
        matches: [],
        matchingPaths: new Set(),
        shouldExpand: () => false,
      };
    }

    const matches: SearchMatch[] = [];
    const matchingPaths = new Set<string>();
    const pathsToExpand = new Set<string>();

    function searchRecursive(obj: unknown, currentPath: string) {
      if (obj === null || obj === undefined) return;

      const objType = typeof obj;

      if (objType === "object") {
        const isArray = Array.isArray(obj);
        const entries = isArray
          ? (obj as unknown[]).map((v, i) =>
            [String(i), v] as [string, unknown]
          )
          : Object.entries(obj as Record<string, unknown>);

        for (const [key, value] of entries) {
          const newPath = `${currentPath}.${key}`;

          // Check if key matches
          if (key.toLowerCase().includes(query)) {
            matches.push({
              path: newPath,
              matchType: "key",
              matchedText: key,
            });
            matchingPaths.add(newPath);

            // Add all parent paths to expand
            let parentPath = currentPath;
            while (parentPath && parentPath !== "root") {
              pathsToExpand.add(parentPath);
              const lastDot = parentPath.lastIndexOf(".");
              parentPath = lastDot > 0 ? parentPath.substring(0, lastDot) : "";
            }
            pathsToExpand.add("root");
          }

          // Check if value matches (for primitives)
          const valueType = typeof value;
          if (value !== null && valueType !== "object") {
            const valueStr = String(value).toLowerCase();
            if (valueStr.includes(query)) {
              matches.push({
                path: newPath,
                matchType: "value",
                matchedText: String(value),
              });
              matchingPaths.add(newPath);

              // Add all parent paths to expand
              let parentPath = currentPath;
              while (parentPath && parentPath !== "root") {
                pathsToExpand.add(parentPath);
                const lastDot = parentPath.lastIndexOf(".");
                parentPath = lastDot > 0
                  ? parentPath.substring(0, lastDot)
                  : "";
              }
              pathsToExpand.add("root");
            }
          }

          // Recurse into nested objects/arrays
          if (value !== null && typeof value === "object") {
            searchRecursive(value, newPath);
          }
        }
      }
    }

    searchRecursive(data.value, "root");

    return {
      matches,
      matchingPaths,
      shouldExpand: (path: string) => pathsToExpand.has(path),
    };
  });
}
