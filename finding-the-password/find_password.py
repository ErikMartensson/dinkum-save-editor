#!/usr/bin/env python3
"""
Dinkum Save File Password Finder

This script automatically finds the encryption password used by the Dinkum game
for its save files by analyzing the game's resources.assets file.

The game uses EasySave3 (ES3) for save file encryption, and the password is
stored in the ES3Defaults configuration object within resources.assets.
"""

import re
import sys
from pathlib import Path
from typing import Optional, Tuple




def find_resources_file(game_dir: Path) -> Optional[Path]:
    """
    Locate the resources.assets file within the game directory.

    Args:
        game_dir: Path to the Dinkum game installation directory

    Returns:
        Path to resources.assets file, or None if not found
    """
    # Standard Unity game structure
    resources_path = game_dir / "Dinkum_Data" / "resources.assets"

    if resources_path.exists():
        return resources_path

    # Try to find it recursively as a fallback
    for resources_file in game_dir.rglob("resources.assets"):
        return resources_file

    return None


def extract_password_from_resources(resources_path: Path) -> Tuple[Optional[str], dict]:
    """
    Extract the encryption password from the resources.assets file.

    The password is stored in the ES3Defaults ScriptableObject configuration,
    which contains the default settings for EasySave3.

    Args:
        resources_path: Path to the resources.assets file

    Returns:
        Tuple of (password string or None, info dict with details)
    """
    print(f"Reading resources file: {resources_path}")
    print(f"File size: {resources_path.stat().st_size:,} bytes")

    with open(resources_path, 'rb') as f:
        data = f.read()

    info = {
        'file_size': len(data),
        'es3defaults_offset': None,
        'password': None,
        'context': None
    }

    # Search for ES3Defaults configuration object
    es3_marker = b'ES3Defaults'
    idx = data.find(es3_marker)

    if idx == -1:
        print("ERROR: ES3Defaults configuration not found in resources.assets")
        return None, info

    print(f"Found ES3Defaults at offset: {idx} (0x{idx:08x})")
    info['es3defaults_offset'] = idx

    # Extract a chunk of data around ES3Defaults
    # The password typically appears within 100 bytes after ES3Defaults
    start = max(0, idx - 50)
    end = min(len(data), idx + 200)
    chunk = data[start:end]

    # Look for readable ASCII strings (potential passwords)
    # ES3 stores strings with a length prefix followed by the string data
    strings = re.findall(b'[\x20-\x7e]{4,}', chunk)

    print("\nReadable strings found near ES3Defaults:")
    for s in strings:
        decoded = s.decode('ascii')
        print(f"   - {decoded}")

    # The password typically appears after "SaveFile.es3" in the structure
    # Look for the pattern: SaveFile.es3 followed by some bytes, then the password
    savefile_marker = b'SaveFile.es3'
    savefile_idx = chunk.find(savefile_marker)

    if savefile_idx != -1:
        # Password usually appears 8-20 bytes after SaveFile.es3
        password_search_start = savefile_idx + len(savefile_marker)
        password_chunk = chunk[password_search_start:password_search_start + 50]

        # Look for length-prefixed string (common Unity serialization format)
        # Format: [length as int32] [string bytes]
        for i in range(len(password_chunk) - 4):
            # Try to read a length prefix
            potential_length = password_chunk[i]
            if 4 <= potential_length <= 30:  # Reasonable password length
                potential_password = password_chunk[i+4:i+4+potential_length]
                # Check if it's all printable ASCII
                if all(32 <= b < 127 for b in potential_password):
                    password = potential_password.decode('ascii')
                    print(f"\nFound potential password: '{password}'")
                    info['password'] = password
                    info['context'] = chunk[savefile_idx:savefile_idx+100].hex()
                    return password, info

    # Fallback: return the most likely candidate (longest readable string after ES3Defaults)
    if strings:
        # Filter out known non-password strings
        filtered = [s for s in strings if s not in [b'ES3Defaults', b'SaveFile.es3', b'Easy Save']]
        if filtered:
            # The password is typically one of the shorter strings (developer names are usually short)
            candidates = [s for s in filtered if 4 <= len(s) <= 20]
            if candidates:
                password = candidates[0].decode('ascii')
                print(f"\nBest guess for password: '{password}'")
                info['password'] = password
                return password, info

    return None, info


def print_hex_dump(data: bytes, offset: int = 0, length: int = 256):
    """Print a formatted hex dump of binary data."""
    print("\nHex dump of relevant section:")
    for i in range(0, min(length, len(data)), 16):
        hex_part = ' '.join(f'{b:02x}' for b in data[i:i+16])
        ascii_part = ''.join(chr(b) if 32 <= b < 127 else '.' for b in data[i:i+16])
        print(f"  {offset+i:08x}: {hex_part:<48} {ascii_part}")


def main():
    """Main entry point for the password finder script."""
    print("=" * 70)
    print("Dinkum Save File Password Finder")
    print("=" * 70)
    print()

    # Check if game directory was provided as argument
    if len(sys.argv) < 2:
        print("ERROR: Game directory path is required")
        print("\nUsage:")
        print("  python find_password.py <path_to_dinkum_directory>")
        print("\nExample:")
        print("  python find_password.py /mnt/d/SteamLibrary/steamapps/common/Dinkum")
        print("\nCommon locations:")
        print("  Windows: C:\\Program Files (x86)\\Steam\\steamapps\\common\\Dinkum")
        print("  Linux:   ~/.local/share/Steam/steamapps/common/Dinkum")
        print("  WSL:     /mnt/c/Program Files (x86)/Steam/steamapps/common/Dinkum")
        sys.exit(1)

    game_dir = Path(sys.argv[1])
    if not game_dir.exists():
        print(f"ERROR: Provided path does not exist: {game_dir}")
        sys.exit(1)

    if not game_dir.is_dir():
        print(f"ERROR: Provided path is not a directory: {game_dir}")
        sys.exit(1)

    print(f"Using game directory: {game_dir}")

    # Locate resources.assets file
    print("\nLooking for resources.assets...")
    resources_path = find_resources_file(game_dir)

    if resources_path is None:
        print(f"ERROR: Could not find resources.assets in {game_dir}")
        sys.exit(1)

    print(f"Found resources.assets: {resources_path}")

    # Extract password
    print("\nAnalyzing resources.assets for ES3 configuration...")
    print("-" * 70)
    password, info = extract_password_from_resources(resources_path)

    # Print results
    print("\n" + "=" * 70)
    print("RESULTS")
    print("=" * 70)

    if password:
        print(f"\nSUCCESS! Found encryption password: '{password}'")
        print("\nThis password is used to encrypt/decrypt Dinkum save files (.es3)")
        print("\nTechnical Details:")
        print(f"  - Algorithm: AES-128-CBC")
        print(f"  - Key Derivation: PBKDF2 with SHA-1")
        print(f"  - Salt: IV (first 16 bytes of encrypted file)")
        print(f"  - Iterations: 100")
        print(f"  - Key Length: 16 bytes (128 bits)")
        print(f"  - Password: '{password}'")

        if info['es3defaults_offset']:
            print(f"\nFound at offset: {info['es3defaults_offset']} (0x{info['es3defaults_offset']:08x})")
    else:
        print("\nERROR: Could not extract password from resources.assets")
        print("\nThis might mean:")
        print("  - The game version has changed")
        print("  - The file structure is different than expected")
        print("  - The password is stored in a different location")

        if info['es3defaults_offset']:
            print(f"\nES3Defaults was found at offset {info['es3defaults_offset']}")
            print("You may need to manually inspect the file around that location.")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
