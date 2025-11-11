# Dinkum Save File Password Finder

This directory contains a Python script that automatically finds the encryption
password used by the Dinkum game for its save files.

## Overview

Dinkum uses the EasySave3 (ES3) library to encrypt save files with the `.es3`
extension. The encryption password is stored in the game's `resources.assets`
file within an `ES3Defaults` configuration object. This script extracts that
password automatically.

## Requirements

- Python 3.6 or higher (no external dependencies required)
- Access to the Dinkum game installation directory

## Usage

Run the script with the path to your Dinkum game installation directory as an
argument:

```bash
python find_password.py "/path/to/Dinkum"
```

Or make it executable and run directly:

```bash
chmod +x find_password.py
./find_password.py "/path/to/Dinkum"
```

**Examples:**

Windows (from WSL):

```bash
python find_password.py "/mnt/d/SteamLibrary/steamapps/common/Dinkum"
```

Linux:

```bash
python find_password.py "$HOME/.local/share/Steam/steamapps/common/Dinkum"
```

Windows (native):

```bash
python find_password.py "D:\SteamLibrary\steamapps\common\Dinkum"
```

**Common installation locations:**

- **Windows**: `C:\Program Files (x86)\Steam\steamapps\common\Dinkum`
- **Linux**: `~/.local/share/Steam/steamapps/common/Dinkum`
- **WSL**: `/mnt/c/Program Files (x86)/Steam/steamapps/common/Dinkum`

## How It Works

1. **Validates the game directory** - Checks that the provided path exists and
   is a directory
2. **Finds resources.assets** - Located in `Dinkum_Data/resources.assets`
3. **Searches for ES3Defaults** - The configuration object that stores ES3
   settings
4. **Extracts the password** - Parses the binary data to find the encryption
   password

The password is typically the developer's name and appears near the
`SaveFile.es3` string in the ES3Defaults configuration.

## Output

When successful, the script outputs:

```
✅ SUCCESS! Found encryption password: 'jamesbendon'

This password is used to encrypt/decrypt Dinkum save files (.es3)

Technical Details:
  - Algorithm: AES-128-CBC
  - Key Derivation: PBKDF2 with SHA-1
  - Salt: IV (first 16 bytes of encrypted file)
  - Iterations: 100
  - Key Length: 16 bytes (128 bits)
  - Password: 'jamesbendon'
```

## Technical Details

### ES3 Encryption Specifications

- **Algorithm**: AES-128-CBC (Advanced Encryption Standard, 128-bit)
- **Key Derivation**: PBKDF2 (Password-Based Key Derivation Function 2) with
  SHA-1
- **Salt**: IV (first 16 bytes of the encrypted file)
- **Iterations**: 100
- **Key Length**: 16 bytes (128 bits)
- **IV**: First 16 bytes of the encrypted file
- **Padding**: PKCS7

### File Structure

The `resources.assets` file contains Unity asset data in a binary format. The
ES3Defaults object is serialized within this file and contains:

```
ES3Defaults
  ├─ SaveFile.es3 (default filename)
  └─ jamesbendon (encryption password)
```

The script searches for the `ES3Defaults` marker and then extracts readable
ASCII strings in the surrounding data to find the password.

## Troubleshooting

### "Error: Game directory path is required"

**Solution**: You must provide the game directory path as an argument:

```bash
python find_password.py "/path/to/your/Dinkum/installation"
```

### "Error: Provided path does not exist" or "Error: Provided path is not a directory"

**Solution**: Verify that the path you provided is correct and points to the
Dinkum game directory.

### "Could not find resources.assets"

**Possible causes**:

- Incorrect game directory path
- Game files are corrupted or incomplete
- Non-standard installation

**Solution**: Verify the game directory contains `Dinkum_Data/resources.assets`

### "ES3Defaults configuration not found"

**Possible causes**:

- Game version has changed
- Modified or corrupted resources.assets file

**Solution**: Try verifying game files through Steam:

1. Right-click Dinkum in Steam
2. Properties → Installed Files → Verify integrity of game files

### "Could not extract password"

**Possible causes**:

- Game update changed the file structure
- Different encryption method in newer versions

**Solution**: The script will show the offset where ES3Defaults was found. You
can manually inspect the file around that location using a hex editor.

## Background

This script was created based on reverse engineering the Dinkum save file
encryption. The discovery process involved:

1. Identifying that Dinkum uses EasySave3 for save file management
2. Decompiling `Assembly-CSharp-firstpass.dll` to understand ES3 implementation
3. Finding that ES3Settings uses default values from ES3Defaults
   ScriptableObject
4. Locating ES3Defaults in `resources.assets` at offset 0x02bcc718
5. Extracting the password "jamesbendon" from the binary data

## Related Files

- **Save files**: Located in your user profile's save directory
  - Windows: `%USERPROFILE%\AppData\LocalLow\James Bendon\Dinkum\`
  - Linux / Steam Deck:
    `~/.local/share/Steam/steamapps/compatdata/1062520/pfx/drive_c/users/steamuser/AppData/LocalLow/James Bendon/Dinkum`
- **File types**:
  - `Player.es3` - Player data (encrypted)
  - `Container.es3` - Chest/container data (encrypted)
  - `MapSave.dat` - World map data (different format)

## License

This script is provided as-is for educational and personal use. Dinkum and
EasySave3 are properties of their respective owners.

## Credits

- **Dinkum** - Developed by James Bendon
- **EasySave3** - Save system by Moodkie Interactive
