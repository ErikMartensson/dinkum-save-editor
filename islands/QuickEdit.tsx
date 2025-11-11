import { useComputed, useSignal } from "@preact/signals";
import type { DinkumSaveData, QuickEditFields } from "../utils/types.ts";
import { filename, saveData } from "../routes/index.tsx";

export default function QuickEdit() {
  const isDirty = useSignal(false);

  // Extract quick edit fields from save data
  const fields = useComputed<QuickEditFields | null>(() => {
    if (!saveData.value) return null;

    // Check if this is a Player save file (has playerInfo)
    if (!saveData.value.playerInfo?.value) return null;

    return {
      playerName: saveData.value.playerInfo.value.playerName,
      islandName: saveData.value.playerInfo.value.islandName,
      money: saveData.value.playerInfo.value.money,
      bankBalance: saveData.value.playerInfo.value.bankBalance,
      health: saveData.value.playerInfo.value.health,
      healthMax: saveData.value.playerInfo.value.healthMax,
      stamina: saveData.value.playerInfo.value.stamina,
      staminaMax: saveData.value.playerInfo.value.staminaMax,
      permitPoints: saveData.value.licences.value.permitPoints,
      isCreative: saveData.value.playerInfo.value.isCreative,
      hasBeenCreative: saveData.value.playerInfo.value.hasBeenCreative,
    };
  });

  const handleSave = () => {
    if (!saveData.value || !fields.value) return;

    // Create updated save data
    const updated: DinkumSaveData = {
      ...saveData.value,
      playerInfo: {
        ...saveData.value.playerInfo,
        value: {
          ...saveData.value.playerInfo.value,
          playerName:
            (document.getElementById("playerName") as HTMLInputElement)
              .value,
          islandName:
            (document.getElementById("islandName") as HTMLInputElement)
              .value,
          money: parseInt(
            (document.getElementById("money") as HTMLInputElement).value,
          ),
          bankBalance: parseInt(
            (document.getElementById("bankBalance") as HTMLInputElement).value,
          ),
          health: parseInt(
            (document.getElementById("health") as HTMLInputElement).value,
          ),
          healthMax: parseInt(
            (document.getElementById("healthMax") as HTMLInputElement).value,
          ),
          stamina: parseInt(
            (document.getElementById("stamina") as HTMLInputElement).value,
          ),
          staminaMax: parseInt(
            (document.getElementById("staminaMax") as HTMLInputElement).value,
          ),
          isCreative:
            (document.getElementById("isCreative") as HTMLInputElement)
              .checked,
          hasBeenCreative: (
            document.getElementById("hasBeenCreative") as HTMLInputElement
          ).checked,
        },
      },
      licences: {
        ...saveData.value.licences,
        value: {
          ...saveData.value.licences.value,
          permitPoints: parseInt(
            (document.getElementById("permitPoints") as HTMLInputElement).value,
          ),
        },
      },
    };

    saveData.value = updated;
    isDirty.value = false;
  };

  const handleChange = () => {
    isDirty.value = true;
  };

  if (!fields.value) {
    return;
  }

  return (
    <div class="bg-dinkum-gray rounded-lg shadow-lg border-2 border-dinkum-primary p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-dinkum-tertiary font-mclaren">
          Player Quick Edit
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
            {filename.value}
          </span>
        </div>
      </div>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="playerName"
              class="block text-sm font-medium text-dinkum-accent mb-1 font-mclaren"
            >
              Player Name
            </label>
            <input
              type="text"
              id="playerName"
              defaultValue={fields.value.playerName}
              onInput={handleChange}
              class="w-full px-3 py-2 border-2 border-dinkum-primary rounded-md bg-dinkum-beige text-dinkum-tertiary font-mclaren focus:outline-none focus:ring-2 focus:ring-dinkum-secondary focus:border-dinkum-secondary"
            />
          </div>

          <div>
            <label
              for="islandName"
              class="block text-sm font-medium text-dinkum-accent mb-1 font-mclaren"
            >
              Island Name
            </label>
            <input
              type="text"
              id="islandName"
              defaultValue={fields.value.islandName}
              onInput={handleChange}
              class="w-full px-3 py-2 border-2 border-dinkum-primary rounded-md bg-dinkum-beige text-dinkum-tertiary font-mclaren focus:outline-none focus:ring-2 focus:ring-dinkum-secondary focus:border-dinkum-secondary"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="money"
              class="block text-sm font-medium text-dinkum-accent mb-1 font-mclaren"
            >
              Money (In Hand)
            </label>
            <input
              type="number"
              id="money"
              defaultValue={fields.value.money}
              onInput={handleChange}
              class="w-full px-3 py-2 border-2 border-dinkum-primary rounded-md bg-dinkum-beige text-dinkum-tertiary font-mclaren focus:outline-none focus:ring-2 focus:ring-dinkum-secondary focus:border-dinkum-secondary"
            />
          </div>

          <div>
            <label
              for="bankBalance"
              class="block text-sm font-medium text-dinkum-accent mb-1 font-mclaren"
            >
              Bank Balance
            </label>
            <input
              type="number"
              id="bankBalance"
              defaultValue={fields.value.bankBalance}
              onInput={handleChange}
              class="w-full px-3 py-2 border-2 border-dinkum-primary rounded-md bg-dinkum-beige text-dinkum-tertiary font-mclaren focus:outline-none focus:ring-2 focus:ring-dinkum-secondary focus:border-dinkum-secondary"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label
              for="health"
              class="block text-sm font-medium text-dinkum-accent mb-1 font-mclaren"
            >
              Health
            </label>
            <input
              type="number"
              id="health"
              defaultValue={fields.value.health}
              onInput={handleChange}
              class="w-full px-3 py-2 border-2 border-dinkum-primary rounded-md bg-dinkum-beige text-dinkum-tertiary font-mclaren focus:outline-none focus:ring-2 focus:ring-dinkum-secondary focus:border-dinkum-secondary"
            />
          </div>

          <div>
            <label
              for="healthMax"
              class="block text-sm font-medium text-dinkum-accent mb-1 font-mclaren"
            >
              Max Health
            </label>
            <input
              type="number"
              id="healthMax"
              defaultValue={fields.value.healthMax}
              onInput={handleChange}
              class="w-full px-3 py-2 border-2 border-dinkum-primary rounded-md bg-dinkum-beige text-dinkum-tertiary font-mclaren focus:outline-none focus:ring-2 focus:ring-dinkum-secondary focus:border-dinkum-secondary"
            />
          </div>

          <div>
            <label
              for="stamina"
              class="block text-sm font-medium text-dinkum-accent mb-1 font-mclaren"
            >
              Stamina
            </label>
            <input
              type="number"
              id="stamina"
              defaultValue={fields.value.stamina}
              onInput={handleChange}
              class="w-full px-3 py-2 border-2 border-dinkum-primary rounded-md bg-dinkum-beige text-dinkum-tertiary font-mclaren focus:outline-none focus:ring-2 focus:ring-dinkum-secondary focus:border-dinkum-secondary"
            />
          </div>

          <div>
            <label
              for="staminaMax"
              class="block text-sm font-medium text-dinkum-accent mb-1 font-mclaren"
            >
              Max Stamina
            </label>
            <input
              type="number"
              id="staminaMax"
              defaultValue={fields.value.staminaMax}
              onInput={handleChange}
              class="w-full px-3 py-2 border-2 border-dinkum-primary rounded-md bg-dinkum-beige text-dinkum-tertiary font-mclaren focus:outline-none focus:ring-2 focus:ring-dinkum-secondary focus:border-dinkum-secondary"
            />
          </div>
        </div>

        <div>
          <label
            for="permitPoints"
            class="block text-sm font-medium text-dinkum-accent mb-1 font-mclaren"
          >
            Permit Points
          </label>
          <input
            type="number"
            id="permitPoints"
            defaultValue={fields.value.permitPoints}
            onInput={handleChange}
            class="w-full px-3 py-2 border-2 border-dinkum-primary rounded-md bg-dinkum-beige text-dinkum-tertiary font-mclaren focus:outline-none focus:ring-2 focus:ring-dinkum-secondary focus:border-dinkum-secondary"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div class="flex items-center">
            <input
              type="checkbox"
              id="isCreative"
              defaultChecked={fields.value.isCreative}
              onChange={handleChange}
              class="h-4 w-4 text-dinkum-secondary focus:ring-dinkum-secondary border-dinkum-primary rounded"
            />
            <label
              for="isCreative"
              class="ml-2 block text-sm text-dinkum-tertiary font-mclaren"
            >
              Creative Mode
            </label>
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              id="hasBeenCreative"
              defaultChecked={fields.value.hasBeenCreative}
              onChange={handleChange}
              class="h-4 w-4 text-dinkum-secondary focus:ring-dinkum-secondary border-dinkum-primary rounded"
            />
            <label
              for="hasBeenCreative"
              class="ml-2 block text-sm text-dinkum-tertiary font-mclaren"
              title="When enabled, Steam achievements are disabled for this save"
            >
              Has Been Creative
              <span
                class="ml-1 text-dinkum-accent cursor-help"
                title="When enabled, Steam achievements are disabled for this save"
              >
                ⓘ
              </span>
            </label>
          </div>
        </div>

        <div class="pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty.value}
            class={`w-full px-4 py-2 rounded-lg font-medium font-mclaren transition-all border-2 ${
              isDirty.value
                ? "bg-dinkum-tertiary text-dinkum-secondary border-dinkum-primary hover:bg-dinkum-accent hover:scale-101 shadow-md hover:shadow-lg"
                : "bg-dinkum-gray text-dinkum-accent border-dinkum-primary cursor-not-allowed opacity-50"
            }`}
          >
            {isDirty.value ? "Save Changes" : "No Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
