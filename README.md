# ndr Transform Quick Apply

A small, free Adobe Premiere Pro panel that applies **Scale**, **Position** and/or **Rotation** to the selected timeline clips in one click, with named presets you can reuse.

![Premiere Pro](https://img.shields.io/badge/Premiere%20Pro-25.5.2%20tested-9999FF) ![Platform](https://img.shields.io/badge/platform-Windows-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Compatibility

| | |
|---|---|
| Tested on | Adobe Premiere Pro **25.5.2**, Windows 11 |
| Should load on | Premiere Pro 25.0 and later (set in `CSXS/manifest.xml`) |
| Type | CEP panel (HTML/JS + ExtendScript) |
| macOS | Not tested; see manual install below |

## Features

- Set any combination of Scale (%), Position (X/Y in pixels) and Rotation (degrees). Unticked properties are left alone.
- Applies to every selected video clip at once; audio clips in the selection are ignored.
- Save named presets (e.g. "Zoom 120 left"), load them from a dropdown, delete them.
- Remembers your last values and presets between sessions.
- Keyframed properties are skipped and listed in the status line, so existing animation isn't overwritten.
- Changes go on Premiere's normal Edit > Undo stack.

## Install (Windows)

1. Download this repository (green **Code** button > **Download ZIP**) and unzip it.
2. In the unzipped folder, run:
   ```
   powershell -ExecutionPolicy Bypass -File install.ps1
   ```
3. Restart Premiere Pro, then open **Window > Extensions > ndr Transform Quick Apply**.

The installer copies the panel to `%APPDATA%\Adobe\CEP\extensions\ndr-transform-quick-apply` and sets `PlayerDebugMode=1` under `HKCU\Software\Adobe\CSXS.11` and `CSXS.12`. That setting is required because the panel isn't signed with an Adobe certificate; without it Premiere hides the panel.

### Manual install (Windows or macOS, untested on macOS)

1. Copy this folder (with `CSXS`, `index.html`, `main.js`, `host.jsx`) to:
   - Windows: `%APPDATA%\Adobe\CEP\extensions\ndr-transform-quick-apply`
   - macOS: `~/Library/Application Support/Adobe/CEP/extensions/ndr-transform-quick-apply`
2. Allow unsigned panels:
   - Windows: add a string value `PlayerDebugMode` = `1` under `HKEY_CURRENT_USER\Software\Adobe\CSXS.12`
   - macOS: `defaults write com.adobe.CSXS.12 PlayerDebugMode 1`
3. Restart Premiere Pro.

## Use

1. Select one or more clips in the timeline.
2. Tick the properties you want to change and type the values:
   - **Scale** in %.
   - **Position** in sequence pixels, 0,0 is the top-left corner (the centre of a 1920x1080 sequence is 960, 540).
   - **Rotation** in degrees.
3. Click **Apply to selected clips**.

**Presets:** type a name and click **Save** to store the current ticks and values. Pick a preset from the list to load it, then click Apply. **Delete** removes the selected preset.

## Limitations

- Expects Premiere's English UI (it finds "Motion", "Scale", "Position", "Rotation" by name).
- Scale sets the uniform Scale value; if a clip has **Uniform Scale** turned off, only the height changes.
- Each property change may be its own Undo step.

## Uninstall

Delete `%APPDATA%\Adobe\CEP\extensions\ndr-transform-quick-apply` (macOS: the folder under `~/Library/Application Support/Adobe/CEP/extensions`) and restart Premiere.

## Files

| File | Purpose |
|---|---|
| `CSXS/manifest.xml` | Extension id, supported Premiere versions, panel size |
| `index.html` | Panel UI |
| `main.js` | UI logic and presets (stored in the panel's localStorage) |
| `host.jsx` | ExtendScript that changes the clips' Motion properties |
| `install.ps1` | Windows installer for the current user |

## License

MIT, see [LICENSE](LICENSE).
