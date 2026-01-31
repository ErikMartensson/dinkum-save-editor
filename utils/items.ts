import itemData from "../data/items.json" with { type: "json" };

interface ItemEntry {
  name: string;
  maxStack?: number;
  maxDurability?: number;
}

const items = itemData.items as Record<string, ItemEntry>;

export function getItemName(id: number): string {
  if (id === -1) return "Empty";
  return items[String(id)]?.name ?? `Unknown (${id})`;
}

export function getMaxDurability(id: number): number | null {
  return items[String(id)]?.maxDurability ?? null;
}

export function getAllItems(): { id: number; name: string }[] {
  return Object.entries(items).map(([id, entry]) => ({
    id: Number(id),
    name: entry.name,
  }));
}
