-- ═══════════════════════════════════════════════════════════
--  sv_playtime.lua – Internal Playtime Tracking
--  Tracks per-player session time using license identifier
-- ═══════════════════════════════════════════════════════════

local activeSessions = {} -- [src] = { license, joinTime }

local function hasHttpManager()
    return GetResourceState('httpmanager') == 'started'
end

-- ─── Player Join ────────────────────────────────────────

AddEventHandler('playerConnecting', function(playerName)
    local src = source
    local license = GetPlayerIdentifierByType(tostring(src), 'license')
    if not license then return end
    license = license:gsub('^license:', '')

    activeSessions[src] = {
        license  = license,
        joinTime = os.time(),
        name     = playerName,
    }

    -- Record join in DB (async, fire-and-forget)
    CreateThread(function()
        while not StorageReady do Wait(100) end
        Storage_PlayerJoin(license, playerName)
    end)
end)

-- ─── Player Drop ────────────────────────────────────────

AddEventHandler('playerDropped', function()
    local src = source
    local session = activeSessions[src]
    if not session then return end

    local duration = os.time() - session.joinTime
    activeSessions[src] = nil

    -- Record leave + duration in DB
    CreateThread(function()
        Storage_PlayerLeave(session.license, duration)
    end)
end)

-- ─── Handover Helper (called from sv_loadscreen) ────────

function GetPlayerPlaytimeData(src)
    local license = GetPlayerIdentifierByType(tostring(src), 'license')
    if not license then return nil end
    license = license:gsub('^license:', '')

    local data = Storage_GetPlaytime(license)
    if not data then
        return { totalSeconds = 0, totalFormatted = '0h 0m', sessionCount = 0, firstSeen = '', lastJoin = '' }
    end

    local secs = (data.total_seconds or 0)
    -- Add current live session time if they have one
    local session = nil
    for _, s in pairs(activeSessions) do
        if s.license == license then
            secs = secs + (os.time() - s.joinTime)
            break
        end
    end

    local hours = math.floor(secs / 3600)
    local mins  = math.floor((secs % 3600) / 60)

    return {
        totalSeconds   = secs,
        totalFormatted = hours .. 'h ' .. mins .. 'm',
        sessionCount   = data.session_count or 0,
        firstSeen      = tostring(data.first_seen or ''),
        lastJoin       = tostring(data.last_join or ''),
    }
end

-- ─── Resource Stop: Flush active sessions ───────────────

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    for src, session in pairs(activeSessions) do
        local duration = os.time() - session.joinTime
        pcall(Storage_PlayerLeave, session.license, duration)
    end
    activeSessions = {}
end)

-- ─── Dashboard Endpoint ─────────────────────────────────

CreateThread(function()
    while not isReady do Wait(500) end
    Wait(2000)

    if not hasHttpManager() then
        return
    end

    pcall(function()
        exports.httpmanager:registerEndpoint('loadscreen/playtime', function(_data)
            if _data.method == 'GET' and _data.params.license then
                local license = _data.params.license:gsub('^license:', '')
                local data = Storage_GetPlaytime(license)
                return { success = true, data = data }
            end

            -- GET top playtime
            if _data.method == 'GET' then
                local top = Storage_GetTopPlaytime(tonumber(_data.params.limit) or 20)
                return { success = true, data = top }
            end

            return { success = false, error = 'Unknown request' }
        end)
    end)
end)