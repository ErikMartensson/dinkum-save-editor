# Dinkum Item Data Extractor

Extracts item names, tool flags, and durability data from Dinkum game files.
Outputs `data/items.json` for use by the save editor.

## Requirements

- Python 3.10+
- [UnityPy](https://github.com/K0lb3/UnityPy) (`pip install unitypy`)

## Usage

```bash
pip install -r requirements.txt
python extract_items.py "/path/to/Dinkum"
```

The game version is auto-detected from the `WorldManager` singleton in `level0`.
Use `--game-version` to override if auto-detection fails.

The output defaults to `../data/items.json` (relative to this script). Override
with `--output`:

```bash
python extract_items.py "/path/to/Dinkum" --output /tmp/items.json
```

**Common installation paths:**

- **Windows**: `C:\Program Files (x86)\Steam\steamapps\common\Dinkum`
- **Linux**: `~/.local/share/Steam/steamapps/common/Dinkum`
- **WSL**: `/mnt/c/Program Files (x86)/Steam/steamapps/common/Dinkum`

## How It Works

The script runs three phases:

### Phase 1: Item Names

Parses I2 Localization data from `resources.assets`. Items follow the pattern
`InventoryItemNames/InvItem_NNN` mapped to their English names. Pluralization
markers like `{s}` are stripped.

### Phase 2: Tool & Durability Data

Parses `InventoryItem` MonoBehaviour objects from `sharedassets0.assets` and
maps them to item indices via the `Inventory` singleton in `level0`.

Binary field offsets are **auto-calibrated** using known item values (e.g.
Chainsaw = 2500 durability, Basic Axe = 150). This makes the script resilient to
game updates that shift field positions.

Items with durability not stored in `maxStack` (watering cans, tele items) use
manually confirmed overrides from creative-mode save data.

### Phase 2.5: Game Version

Reads `versionNumber` and `masterVersionNumber` from the `WorldManager`
singleton in `level0`. The game constructs its display version as
`1.<master>.<version>` (the `1.` prefix is hardcoded in the `showVersionNumber`
script).

### Phase 3: Validation

Cross-checks item counts, durability ranges, and calibration values against
expected results.

## Output Format

```json
{
  "meta": {
    "extractedAt": "2026-01-30T23:42:55.084691+00:00",
    "totalItems": 2025,
    "totalItemsWithDurability": 89,
    "scriptVersion": "1.3.0",
    "gameVersion": "1.0.7"
  },
  "items": {
    "0": { "name": "Basic Axe", "maxDurability": 150 },
    "1": { "name": "Megaphone" },
    "10": { "name": "Watering Can", "maxDurability": 20 },
    "236": { "name": "Slingshot", "maxDurability": 200 }
  }
}
```

- **`maxDurability`**: Present only for items with durability (tools, watering
  cans, tele items). For most tools this is extracted from the game's internal
  `maxStack` field. Watering cans and tele items use manual overrides since
  their durability is stored differently.

## After a Game Update

1. Run the script against the updated game files
2. Review any warnings in the output
3. If calibration fails, the game may have changed its data layout. Check if the
   calibration values in the script still match the game.
4. Run `deno task check && deno task build` to verify the save editor still
   works
