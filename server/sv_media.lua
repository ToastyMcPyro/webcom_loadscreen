-- ═══════════════════════════════════════════════════════════
--  sv_media.lua – Media File Upload & Management
--  Handles music/video file uploads with format & size validation
-- ═══════════════════════════════════════════════════════════

local mediaManifest = { music = {}, video = {} }
local RESOURCE_NAME = GetCurrentResourceName()
local MEDIA_BASE = 'html/loadscreen/media/'

local ALLOWED = {
    music = { mp3 = true, ogg = true, wav = true },
    video = { mp4 = true, webm = true },
}
local MAX_SIZE = 5 * 1024 * 1024 -- 5 MB

local function hasHttpManager()
    return GetResourceState('httpmanager') == 'started'
end

-- ─── Base64 Decode ──────────────────────────────────────

local b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

local function b64decode(data)
    data = data:gsub('[^' .. b64 .. '=]', '')
    return (data:gsub('.', function(x)
        if x == '=' then return '' end
        local r, f = '', (b64:find(x) - 1)
        for i = 6, 1, -1 do
            r = r .. (f % 2 ^ i - f % 2 ^ (i - 1) > 0 and '1' or '0')
        end
        return r
    end):gsub('%d%d%d?%d?%d?%d?%d?%d', function(x)
        if #x ~= 8 then return '' end
        local c = 0
        for i = 1, 8 do c = c + (x:sub(i, i) == '1' and 2 ^ (8 - i) or 0) end
        return string.char(c)
    end))
end

-- ─── Manifest Persistence ───────────────────────────────

local function loadManifest()
    local raw = LoadResourceFile(RESOURCE_NAME, MEDIA_BASE .. 'manifest.json')
    if raw and raw ~= '' then
        local ok, data = pcall(json.decode, raw)
        if ok and data then
            mediaManifest = data
            if not mediaManifest.music then mediaManifest.music = {} end
            if not mediaManifest.video then mediaManifest.video = {} end
        end
    end
end

local function saveManifest()
    local data = json.encode(mediaManifest)
    SaveResourceFile(RESOURCE_NAME, MEDIA_BASE .. 'manifest.json', data, #data)
end

-- ─── File Helpers ───────────────────────────────────────

local function sanitizeFileName(name)
    local safe = name:gsub('[^%w%.%-_]', '_'):sub(1, 100)
    if safe == '' then safe = 'file' end
    return safe
end

local function getExtension(name)
    return name:match('%.(%w+)$')
end

-- ─── Core Functions ─────────────────────────────────────

function UploadMediaFile(src, folder, fileName, base64Data, fileSize)
    if not src or not folder or not fileName or not base64Data then
        return false, 'Missing parameters'
    end

    if folder ~= 'music' and folder ~= 'video' then
        return false, 'Invalid folder'
    end

    local ext = getExtension(fileName)
    if not ext then return false, 'No file extension' end
    ext = ext:lower()

    if not ALLOWED[folder][ext] then
        return false, 'Invalid format: ' .. ext
    end

    if fileSize and fileSize > MAX_SIZE then
        return false, 'File too large (max 5 MB)'
    end

    local decoded = b64decode(base64Data)
    if not decoded or #decoded == 0 then
        return false, 'Decode failed'
    end

    if #decoded > MAX_SIZE then
        return false, 'Decoded file exceeds 5 MB'
    end

    local safeName = sanitizeFileName(fileName)
    local filePath = MEDIA_BASE .. folder .. '/' .. safeName

    local ok = SaveResourceFile(RESOURCE_NAME, filePath, decoded, #decoded)
    if not ok then
        return false, 'SaveResourceFile failed'
    end

    if not mediaManifest[folder] then mediaManifest[folder] = {} end

    -- Remove existing entry with same name
    for i = #mediaManifest[folder], 1, -1 do
        if mediaManifest[folder][i].name == safeName then
            table.remove(mediaManifest[folder], i)
        end
    end

    mediaManifest[folder][#mediaManifest[folder] + 1] = {
        name     = safeName,
        path     = 'media/' .. folder .. '/' .. safeName,
        size     = #decoded,
        uploaded = os.time(),
        uploadedBy = GetPlayerName(src) or 'unknown',
    }

    saveManifest()
    print('^2[webcom_loadscreen]^0 Media uploaded: ' .. folder .. '/' .. safeName .. ' (' .. #decoded .. ' bytes)')
    return true
end

function DeleteMediaFile(folder, fileName)
    if not mediaManifest[folder] then return false end

    for i = #mediaManifest[folder], 1, -1 do
        if mediaManifest[folder][i].name == fileName then
            table.remove(mediaManifest[folder], i)
            -- Overwrite with empty to "delete"
            SaveResourceFile(RESOURCE_NAME, MEDIA_BASE .. folder .. '/' .. fileName, '', 0)
            saveManifest()
            return true
        end
    end
    return false
end

function GetMediaFiles()
    return mediaManifest
end

-- ─── Server Events ──────────────────────────────────────

RegisterNetEvent('webcom_loadscreen:server:uploadMedia', function(folder, fileName, base64Data, fileSize)
    local src = source
    HasLoadscreenPermission(src, 'edit', function(allowed)
        if not allowed then
            TriggerClientEvent('webcom_loadscreen:client:mediaUploaded', src, false, 'No permission')
            return
        end
        local ok, err = UploadMediaFile(src, folder, fileName, base64Data, fileSize)
        TriggerClientEvent('webcom_loadscreen:client:mediaUploaded', src, ok, err, folder)
        if ok then
            TriggerClientEvent('webcom_loadscreen:client:mediaList', src, GetMediaFiles())
        end
    end)
end)

RegisterNetEvent('webcom_loadscreen:server:getMediaFiles', function()
    local src = source
    TriggerClientEvent('webcom_loadscreen:client:mediaList', src, GetMediaFiles())
end)

RegisterNetEvent('webcom_loadscreen:server:deleteMedia', function(folder, fileName)
    local src = source
    HasLoadscreenPermission(src, 'edit', function(allowed)
        if not allowed then return end
        DeleteMediaFile(folder, fileName)
        TriggerClientEvent('webcom_loadscreen:client:mediaList', src, GetMediaFiles())
    end)
end)

-- ─── Dashboard Endpoints ────────────────────────────────

CreateThread(function()
    while not isReady do Wait(500) end
    Wait(2000)

    if not hasHttpManager() then
        return
    end

    pcall(function()
        exports.httpmanager:registerEndpoint('loadscreen/media', function(_data)
            if _data.method == 'GET' then
                return { success = true, data = GetMediaFiles() }
            end

            if _data.method == 'POST' then
                local body = _data.body or {}
                local ok, err = UploadMediaFile(0, body.folder, body.fileName, body.data, body.size)
                return { success = ok, error = err, data = ok and GetMediaFiles() or nil }
            end

            if _data.method == 'DELETE' then
                local body = _data.body or {}
                DeleteMediaFile(body.folder, body.fileName)
                return { success = true, data = GetMediaFiles() }
            end

            return { success = false, error = 'Unknown method' }
        end)
    end)

    print('^2[webcom_loadscreen]^0 Media endpoints registered')
end)

-- ─── Init ───────────────────────────────────────────────

CreateThread(function()
    Wait(500)
    loadManifest()
    print('^2[webcom_loadscreen]^0 Media manifest loaded (' .. #(mediaManifest.music or {}) .. ' music, ' .. #(mediaManifest.video or {}) .. ' video)')
end)