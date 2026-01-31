#!/usr/bin/env python3
"""
Dinkum Item Data Extractor

Extracts item names, tool flags, and durability data from Dinkum game files.
Outputs a JSON file with all item data for use by the save editor.

Requires: UnityPy (pip install unitypy)

Usage:
    python extract_items.py "/path/to/Dinkum"
    python extract_items.py "/path/to/Dinkum" --output ../data/items.json
"""

import argparse
import json
import re
import struct
import sys
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_VERSION = "1.1.0"

# Items whose durability isn't stored in maxStack (e.g. watering cans track
# water level, tele items track uses). Values confirmed from a creative-mode
# save where items spawn at max durability.
DURABILITY_OVERRIDES = {
    10: 20,    # Watering Can
    699: 60,   # Copper Watering Can
    701: 120,  # Iron Watering Can
    711: 15,   # Tele Caller
    1761: 30,  # Tele-Jumper
}

# Known item durabilities for auto-calibrating binary offsets.
# If a game update shifts field positions, these anchor values let the script
# rediscover the correct offsets automatically.
STACK_CALIBRATION = {
    0: 150,  # Basic Axe
    3: 2500,  # Chainsaw
    119: 3,  # First Aid Kit
    1728: 3500,  # Har-Vac
    1972: 4,  # Blistering Bottle
}

# Known tool/non-tool items for calibrating the isATool boolean offset.
TOOL_CALIBRATION = {
    0: True,  # Basic Axe
    3: True,  # Chainsaw
    119: True,  # First Aid Kit
    1728: True,  # Har-Vac
    1: False,  # Megaphone
    12: False,  # Bag of Cement
    13: False,  # BBQ
    17: False,  # Bush Lime
}


def find_game_file(game_dir: Path, *subpath: str) -> Path:
    """Locate a game file, trying standard Unity paths."""
    # Standard path: Dinkum/Dinkum_Data/...
    path = game_dir / "Dinkum_Data" / Path(*subpath)
    if path.exists():
        return path

    # Fallback: search recursively
    filename = subpath[-1]
    for match in game_dir.rglob(filename):
        return match

    print(f"ERROR: Could not find {'/'.join(subpath)} in {game_dir}")
    sys.exit(1)


def read_unity_string(raw: bytes, offset: int) -> tuple[str, int]:
    """Read a Unity length-prefixed string. Returns (string, next_aligned_offset)."""
    str_len = struct.unpack("<I", raw[offset : offset + 4])[0]
    s = raw[offset + 4 : offset + 4 + str_len].decode("utf-8", errors="replace")
    total = 4 + str_len
    aligned = (total + 3) & ~3
    return s, offset + aligned


def skip_unity_string(raw: bytes, offset: int) -> int:
    """Skip a Unity length-prefixed string. Returns next aligned offset."""
    str_len = struct.unpack("<I", raw[offset : offset + 4])[0]
    total = 4 + str_len
    return offset + ((total + 3) & ~3)


def get_fixed_data_offset(raw: bytes) -> int:
    """
    Parse the variable-length header of an InventoryItem MonoBehaviour
    and return the offset where fixed-size fields begin.

    Layout:
      [0-27]  MonoBehaviour header (GameObject PPtr, Enabled, Script PPtr)
      [28]    m_Name (MonoBehaviour name string, usually empty)
      [...]   Internal name / category string (e.g. "Ranged", "shovel_empty")
      [...]   Item name string (variable length)
      [...]   Description string (variable length)
      [...]   Fixed-size fields start here
    """
    pos = 28
    pos = skip_unity_string(raw, pos)  # m_Name (MonoBehaviour name)
    pos = skip_unity_string(raw, pos)  # Internal name / category
    pos = skip_unity_string(raw, pos)  # Item name
    pos = skip_unity_string(raw, pos)  # Description
    return pos


# --- Phase 1: Item names from I2 Localization ---


def extract_item_names(game_dir: Path) -> dict[int, str]:
    """
    Extract item ID -> name mapping from I2 Localization data in resources.assets.
    Items follow the pattern: InventoryItemNames/InvItem_NNN -> English name
    """
    import UnityPy

    resources_path = find_game_file(game_dir, "resources.assets")
    print(f"  Loading {resources_path}...")
    env = UnityPy.load(str(resources_path))

    # Find the MonoBehaviour containing I2 Localization data
    i2_raw = None
    for obj in env.objects:
        if obj.type.name == "MonoBehaviour":
            raw = obj.get_raw_data()
            if b"InventoryItemNames" in raw:
                i2_raw = raw
                break

    if i2_raw is None:
        print("ERROR: Could not find I2 Localization data in resources.assets")
        sys.exit(1)

    # Parse all InvItem entries
    pattern = rb"InventoryItemNames/InvItem_(\d+)"
    items: dict[int, str] = {}

    for match in re.finditer(pattern, i2_raw):
        item_id = int(match.group(1))
        start = match.start()

        # Skip past the term string (aligned to 4 bytes)
        term_len = struct.unpack("<I", i2_raw[start - 4 : start])[0]
        term_end = start + term_len
        term_end = (term_end + 3) & ~3

        # Scan forward for the first valid name string
        search_end = min(term_end + 200, len(i2_raw))
        chunk = i2_raw[term_end:search_end]

        pos = 0
        while pos < len(chunk) - 4:
            str_len = struct.unpack("<I", chunk[pos : pos + 4])[0]
            if 1 < str_len < 100:
                candidate = chunk[pos + 4 : pos + 4 + str_len]
                try:
                    name = candidate.decode("utf-8")
                    if name.isprintable() and not name.startswith("InventoryItem"):
                        # Strip I2 pluralization markers like {s}
                        name = re.sub(r"\{[^}]*\}", "", name)
                        items[item_id] = name
                        break
                except (UnicodeDecodeError, ValueError):
                    pass
            pos += 1

    return items


# --- Phase 2: Tool durability from InventoryItem MonoBehaviours ---


def extract_tool_data(
    game_dir: Path, item_names: dict[int, str]
) -> tuple[dict[int, bool], dict[int, int]]:
    """
    Extract tool flags and maxStack data from InventoryItem MonoBehaviours.

    Returns (is_tool_map, max_stack_map) where:
      - is_tool_map: item_id -> True if the game flags this item as a tool
      - max_stack_map: item_id -> maxStack value (durability for tools, stack size otherwise)
    """
    import UnityPy

    # Step 1: Find the InventoryItem MonoScript path_id
    gg_path = find_game_file(game_dir, "globalgamemanagers.assets")
    print(f"  Loading {gg_path}...")
    genv = UnityPy.load(str(gg_path))

    inv_script_pid = None
    for obj in genv.objects:
        if obj.type.name == "MonoScript":
            raw = obj.get_raw_data()
            if b"InventoryItem" in raw:
                name_len = struct.unpack("<I", raw[0:4])[0]
                name = raw[4 : 4 + name_len].decode("utf-8")
                if name == "InventoryItem":
                    inv_script_pid = obj.path_id
                    break

    if inv_script_pid is None:
        print("ERROR: Could not find InventoryItem MonoScript")
        sys.exit(1)

    # Step 2: Collect all InventoryItem MonoBehaviours from sharedassets0
    sa_path = find_game_file(game_dir, "sharedassets0.assets")
    print(f"  Loading {sa_path}...")
    senv = UnityPy.load(str(sa_path))

    inv_items_by_pid: dict[int, bytes] = {}
    for obj in senv.objects:
        if obj.type.name == "MonoBehaviour":
            raw = obj.get_raw_data()
            if len(raw) > 28:
                script_path_id = struct.unpack("<q", raw[20:28])[0]
                if script_path_id == inv_script_pid:
                    inv_items_by_pid[obj.path_id] = raw

    print(f"  Found {len(inv_items_by_pid)} InventoryItem objects")

    # Step 3: Get item ID -> path_id mapping from Inventory singleton in level0
    level_path = find_game_file(game_dir, "level0")
    print(f"  Loading {level_path}...")
    lenv = UnityPy.load(str(level_path))

    item_pid_map: dict[int, int] = {}
    for obj in lenv.objects:
        if obj.type.name == "MonoBehaviour":
            raw = obj.get_raw_data()
            # Search for the allItems array (size should match our item count)
            expected_count = len(item_names)
            for offset in range(0, min(500, len(raw) - 4)):
                arr_size = struct.unpack("<I", raw[offset : offset + 4])[0]
                if arr_size == expected_count:
                    # Verify it looks like a PPtr array
                    pptr_start = offset + 4
                    file_id = struct.unpack(
                        "<i", raw[pptr_start : pptr_start + 4]
                    )[0]
                    path_id = struct.unpack(
                        "<q", raw[pptr_start + 4 : pptr_start + 12]
                    )[0]
                    if file_id in (0, 1, 2, 3, 4) and path_id in inv_items_by_pid:
                        # Found the array
                        for i in range(arr_size):
                            ps = offset + 4 + i * 12
                            pid = struct.unpack("<q", raw[ps + 4 : ps + 12])[0]
                            item_pid_map[i] = pid
                        break
            if item_pid_map:
                break

    mapped = sum(1 for pid in item_pid_map.values() if pid in inv_items_by_pid)
    print(f"  Mapped {mapped}/{len(item_pid_map)} items to MonoBehaviour objects")

    if not item_pid_map:
        print("ERROR: Could not find allItems array in Inventory singleton")
        sys.exit(1)

    # Step 4: Auto-calibrate binary offsets using known values
    maxstack_rel_offset = calibrate_offset(
        "maxStack",
        STACK_CALIBRATION,
        item_pid_map,
        inv_items_by_pid,
        search_range=range(100, 300, 4),
        read_fn=lambda raw, off: struct.unpack("<i", raw[off : off + 4])[0],
    )

    tool_rel_offset = calibrate_offset(
        "isATool",
        {k: (1 if v else 0) for k, v in TOOL_CALIBRATION.items()},
        item_pid_map,
        inv_items_by_pid,
        search_range=range(100, 300),
        read_fn=lambda raw, off: raw[off],
    )

    # Step 5: Extract tool flag and maxStack for all items
    is_tool_map: dict[int, bool] = {}
    max_stack_map: dict[int, int] = {}
    parse_errors = 0
    for item_id in range(len(item_names)):
        pid = item_pid_map.get(item_id)
        if not pid or pid not in inv_items_by_pid:
            continue
        raw = inv_items_by_pid[pid]
        try:
            fixed_start = get_fixed_data_offset(raw)
            if fixed_start + maxstack_rel_offset + 4 > len(raw):
                parse_errors += 1
                continue

            is_tool = raw[fixed_start + tool_rel_offset] == 1
            max_stack = struct.unpack(
                "<i",
                raw[
                    fixed_start + maxstack_rel_offset : fixed_start
                    + maxstack_rel_offset
                    + 4
                ],
            )[0]
            is_tool_map[item_id] = is_tool
            max_stack_map[item_id] = max_stack
        except (struct.error, IndexError):
            parse_errors += 1

    if parse_errors > 0:
        print(f"  Skipped {parse_errors} items with unexpected data layout")

    return is_tool_map, max_stack_map


def calibrate_offset(
    field_name: str,
    calibration: dict[int, int],
    item_pid_map: dict[int, int],
    inv_items_by_pid: dict[int, bytes],
    search_range: range,
    read_fn,
) -> int:
    """
    Auto-discover a binary field offset by testing candidate offsets against
    items with known values. Returns offset relative to fixed data start.
    """
    for candidate in search_range:
        all_match = True
        for item_id, expected in calibration.items():
            pid = item_pid_map.get(item_id)
            if not pid or pid not in inv_items_by_pid:
                all_match = False
                break
            raw = inv_items_by_pid[pid]
            fixed_start = get_fixed_data_offset(raw)
            abs_offset = fixed_start + candidate
            if abs_offset + 4 > len(raw):
                all_match = False
                break
            val = read_fn(raw, abs_offset)
            if val != expected:
                all_match = False
                break
        if all_match:
            print(f"  Calibrated {field_name} offset: +{candidate} from fixed data start")
            return candidate

    print(f"ERROR: Could not calibrate {field_name} offset.")
    print(f"  The game may have been updated with a different data layout.")
    print(f"  Check if the calibration values in the script still match the game.")
    sys.exit(1)


# --- Output ---


def build_output(
    item_names: dict[int, str],
    is_tool_map: dict[int, bool],
    max_stack_map: dict[int, int],
) -> dict:
    """Build the final JSON structure."""
    items = {}
    durability_count = 0
    for item_id in sorted(item_names.keys()):
        entry: dict = {"name": item_names[item_id]}
        is_tool = is_tool_map.get(item_id, False)
        max_stack = max_stack_map.get(item_id)

        if max_stack is not None:
            entry["maxStack"] = max_stack

        # Determine max durability:
        # 1. Manual overrides for items whose durability isn't in maxStack
        # 2. isATool items with positive maxStack
        if item_id in DURABILITY_OVERRIDES:
            entry["maxDurability"] = DURABILITY_OVERRIDES[item_id]
            durability_count += 1
        elif is_tool and max_stack is not None and max_stack > 0:
            entry["maxDurability"] = max_stack
            durability_count += 1

        items[str(item_id)] = entry

    return {
        "meta": {
            "extractedAt": datetime.now(timezone.utc).isoformat(),
            "totalItems": len(items),
            "totalItemsWithDurability": durability_count,
            "scriptVersion": SCRIPT_VERSION,
        },
        "items": items,
    }


def validate_output(output: dict) -> list[str]:
    """Sanity-check the extracted data."""
    warnings = []
    items = output["items"]
    with_durability = {k: v for k, v in items.items() if "maxDurability" in v}

    if len(items) < 1000:
        warnings.append(f"Suspiciously few items: {len(items)} (expected ~2025)")
    if len(with_durability) < 50 or len(with_durability) > 200:
        warnings.append(
            f"Unexpected durability item count: {len(with_durability)} (expected ~89)"
        )

    for item_id, entry in with_durability.items():
        dur = entry["maxDurability"]
        if dur <= 0:
            warnings.append(f"Item {item_id} ({entry['name']}): non-positive durability {dur}")
        if dur > 100000:
            warnings.append(f"Item {item_id} ({entry['name']}): suspiciously high durability {dur}")

    # Verify calibration values are present and correct
    for item_id, expected in STACK_CALIBRATION.items():
        key = str(item_id)
        if key not in items:
            warnings.append(f"Calibration item {item_id} missing from output")
        elif items[key].get("maxDurability") != expected:
            actual = items[key].get("maxDurability")
            warnings.append(f"Calibration mismatch: item {item_id} expected {expected}, got {actual}")

    # Verify durability overrides are applied
    for item_id, expected in DURABILITY_OVERRIDES.items():
        key = str(item_id)
        if key not in items:
            warnings.append(f"Override item {item_id} missing from output")
        elif items[key].get("maxDurability") != expected:
            actual = items[key].get("maxDurability")
            warnings.append(f"Override mismatch: item {item_id} expected {expected}, got {actual}")

    return warnings


def main():
    parser = argparse.ArgumentParser(
        description="Extract item data from Dinkum game files"
    )
    parser.add_argument("game_dir", type=Path, help="Path to Dinkum installation directory")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output JSON path (default: ../data/items.json relative to this script)",
    )
    args = parser.parse_args()

    if not args.game_dir.exists():
        print(f"ERROR: Game directory not found: {args.game_dir}")
        sys.exit(1)

    output_path = args.output or (Path(__file__).parent.parent / "data" / "items.json")

    print(f"Dinkum Item Data Extractor v{SCRIPT_VERSION}")
    print(f"Game directory: {args.game_dir}")
    print(f"Output: {output_path}")
    print()

    print("Phase 1: Extracting item names...")
    item_names = extract_item_names(args.game_dir)
    print(f"  Extracted {len(item_names)} item names")
    print()

    print("Phase 2: Extracting tool and stack data...")
    is_tool_map, max_stack_map = extract_tool_data(args.game_dir, item_names)
    tool_count = sum(1 for v in is_tool_map.values() if v)
    print(f"  Found {tool_count} tools, extracted maxStack for {len(max_stack_map)} items")
    print()

    print("Phase 3: Building output...")
    output = build_output(item_names, is_tool_map, max_stack_map)

    warnings = validate_output(output)
    if warnings:
        print("  WARNINGS:")
        for w in warnings:
            print(f"    - {w}")
    else:
        print("  All validation checks passed")
    print()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Wrote {output_path} ({output_path.stat().st_size:,} bytes)")
    meta = output["meta"]
    print(f"  {meta['totalItems']} items, {meta['totalItemsWithDurability']} with durability")


if __name__ == "__main__":
    main()
