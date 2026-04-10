Config = {}

-- ═══════════════════════════════════════════════════════════
--  Auto-Config: Filled from httpmanager at startup
-- ═══════════════════════════════════════════════════════════
Config.WebcomBaseUrl = nil
Config.ServerId      = nil

-- ═══════════════════════════════════════════════════════════
--  Permission Mode
--  'config'    → Uses ace permissions, job/gang names, citizenid lists below
--  'dashboard' → Uses Dashboard roles/groups via httpmanager license-auth
-- ═══════════════════════════════════════════════════════════
Config.PermissionMode = 'config'

Config.Permissions = {
    edit   = { aces = { 'webcom.loadscreen.edit' },   jobs = {"police"},  citizenids = {} },
    deploy = { aces = { 'webcom.loadscreen.deploy' },  jobs = {"police"},  citizenids = {} },
    view   = { aces = { 'webcom.loadscreen.view' },    jobs = {"police"},  citizenids = {} },
}

Config.DashboardPermissions = {
    edit   = 'loadscreen.edit',
    deploy = 'loadscreen.deploy',
    view   = 'loadscreen.view',
}

-- ═══════════════════════════════════════════════════════════
--  Editor Settings
-- ═══════════════════════════════════════════════════════════
Config.OpenCommand = 'loadscreeneditor'    -- Chat command to open editor
Config.OpenKey     = 'F8'                  -- Keybind to toggle editor

-- Canvas defaults (pixels) – loadscreen renders at 1920×1080
Config.CanvasWidth  = 1920
Config.CanvasHeight = 1080

-- ═══════════════════════════════════════════════════════════
--  Collaboration
-- ═══════════════════════════════════════════════════════════
Config.MaxCollaborators     = 8    -- Max concurrent editors per design
Config.ElementLockTimeout   = 30   -- Seconds before an element lock expires
Config.CursorBroadcastRate  = 200  -- ms between cursor position broadcasts


-- ═══════════════════════════════════════════════════════════
--  Discord Integration (optional)
--  Required for reading Discord ranks/roles on the loadscreen
--  Leave empty to disable; can also be set via httpmanager config
-- ═══════════════════════════════════════════════════════════
Config.DiscordBotToken = ''    -- Your Discord bot token
Config.DiscordGuildId  = ''    -- Your Discord server (guild) ID