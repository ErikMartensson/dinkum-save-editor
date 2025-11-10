import type { DinkumSaveData } from "../utils/types.ts";

interface SaveFileCardProps {
  filename: string;
  saveData: DinkumSaveData;
  fileSize: number;
}

export default function SaveFileCard({
  filename,
  saveData,
  fileSize,
}: SaveFileCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const playerInfo = saveData.playerInfo.value;
  const dateInfo = saveData.date.value;

  return (
    <div class="bg-dinkum-gray rounded-lg shadow-lg border-2 border-dinkum-primary p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-dinkum-tertiary font-mclaren">
            {filename}
          </h3>
          <p class="text-sm text-dinkum-accent font-mclaren">
            {formatFileSize(fileSize)}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <svg
            class="w-5 h-5 text-dinkum-secondary"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-sm font-medium text-dinkum-secondary font-mclaren">
            Loaded
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-dinkum-accent font-mclaren">Player</p>
          <p class="font-medium text-dinkum-tertiary font-mclaren">
            {playerInfo.playerName}
          </p>
        </div>
        <div>
          <p class="text-dinkum-accent font-mclaren">Island</p>
          <p class="font-medium text-dinkum-tertiary font-mclaren">
            {playerInfo.islandName}
          </p>
        </div>
        <div>
          <p class="text-dinkum-accent font-mclaren">Money</p>
          <p class="font-medium text-dinkum-tertiary font-mclaren">
            {playerInfo.money.toLocaleString()}
          </p>
        </div>
        <div>
          <p class="text-dinkum-accent font-mclaren">Bank</p>
          <p class="font-medium text-dinkum-tertiary font-mclaren">
            {playerInfo.bankBalance.toLocaleString()}
          </p>
        </div>
        <div>
          <p class="text-dinkum-accent font-mclaren">Game Date</p>
          <p class="font-medium text-dinkum-tertiary font-mclaren">
            Year {dateInfo.year}, Day {dateInfo.day}
          </p>
        </div>
        <div>
          <p class="text-dinkum-accent font-mclaren">Creative Mode</p>
          <p class="font-medium text-dinkum-tertiary font-mclaren">
            {playerInfo.isCreative ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
}
