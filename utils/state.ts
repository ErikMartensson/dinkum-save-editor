import { signal } from "@preact/signals";
import type { ContainerSaveData, DinkumSaveData } from "./types.ts";

// Global signals shared across all components
export const saveData = signal<DinkumSaveData | null>(null);
export const containerData = signal<ContainerSaveData | null>(null);
export const filename = signal<string | null>(null);
export const containerFilename = signal<string | null>(null);
export const fileSize = signal<number>(0);
export const containerFileSize = signal<number>(0);
export const error = signal<string | null>(null);
