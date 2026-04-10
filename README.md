# webcom loadscreen

`webcom_loadscreen` provides an in-game loadscreen editor, deployable designs, media management, and optional ArgusAdmin/httpmanager integration.

## Features

- Standalone editor via `/loadscreeneditor`
- Design storage in the database
- Deploy and deactivate loadscreen designs
- Built-in media manager for music and video
- Optional Discord role/rank integration
- Optional dashboard endpoints when `httpmanager` is running

## Start Order

Start dependencies before the resource:

```cfg
ensure oxmysql
ensure ox_lib
ensure webcom_loadscreen
```

If you want dashboard integration, start `httpmanager` before `webcom_loadscreen`.

## Database

The required SQL tables are created automatically on the first resource start.

- No manual SQL import is required for normal setup.
- The files in the `sql` folder are only there for reference/manual recovery.

## Configuration

Main settings are in `config.lua`:

- `Config.PermissionMode = 'config'` for standalone permission checks
- `Config.OpenCommand` to change the editor command
- `Config.CanvasWidth` and `Config.CanvasHeight` for editor defaults
- `Config.MaxCollaborators`, `Config.ElementLockTimeout`, and `Config.CursorBroadcastRate` for collaboration
- `Config.DiscordBotToken` and `Config.DiscordGuildId` for Discord integration without `httpmanager`

### Standalone Permissions

When `Config.PermissionMode` is `config`, access is controlled by `Config.Permissions`.

Example ACE entries in `server.cfg`:

```cfg
add_ace group.admin webcom.loadscreen.view allow
add_ace group.admin webcom.loadscreen.edit allow
add_ace group.admin webcom.loadscreen.deploy allow
```

### Dashboard Mode

If `httpmanager` is present and you want dashboard-driven permissions, switch:

```lua
Config.PermissionMode = 'dashboard'
```

In that mode, shared config such as `Config.WebcomBaseUrl`, `Config.ServerId`, and optional Discord values are pulled automatically.

## Editor Workflow

1. Start the resource.
2. Run `/loadscreeneditor` as an authorized player.
3. Create or open a design.
4. Add elements from the left panel.
5. Edit properties on the right side.
6. Save the design.
7. Use `Deploy` to activate it as the live loadscreen.

## Media Import

The editor has a built-in media picker for audio and video files.

- Open an element property that uses media.
- Click the media picker button in the property panel.
- Upload the file directly from the picker.
- Select the uploaded file from the list.

Current upload rules:

- Music formats: `.mp3`, `.ogg`, `.wav`
- Video formats: `.mp4`, `.webm`
- Maximum file size: `5 MB`
- Files are stored under `html/loadscreen/media/music` and `html/loadscreen/media/video`
- The manifest is stored in `html/loadscreen/media/manifest.json`

Important notes:

- Filenames are sanitized automatically.
- Deleting media through the editor also updates the manifest.
- If you add files manually, keep the manifest in sync or re-upload them through the editor.

## Discord Integration

Discord integration is optional.

- Set `Config.DiscordBotToken` and `Config.DiscordGuildId` in `config.lua`
- Or provide those values through `httpmanager` shared config

If neither is configured, Discord rank features simply stay inactive.

## Standalone Notes

- Without `httpmanager`, REST endpoints are disabled automatically.
- The editor, deployment flow, media manager, and saved designs still work in config mode.
- If you see only the standalone banner in console, that is expected behavior.

## Troubleshooting

- If the editor opens but no designs appear, wait until the storage init is finished.
- If uploads fail, check file format and the `5 MB` size limit.
- If dashboard features are missing, confirm `httpmanager` is started before this resource.
