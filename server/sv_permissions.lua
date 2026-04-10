-- ═══════════════════════════════════════════════════════════
--  sv_permissions.lua – Dual-Mode Permission System
--  Supports 'config' (ACE/job/citizenid) and 'dashboard' modes
-- ═══════════════════════════════════════════════════════════

local permissionCache = {}
local dbPermissions   = {}

-- ─── Cache Helpers ──────────────────────────────────────

local function _cachePermission(src, permKey, allowed)
    if not permissionCache[src] then permissionCache[src] = {} end
    permissionCache[src][permKey] = allowed
end

-- Clear cache on disconnect
AddEventHandler('playerDropped', function()
    permissionCache[source] = nil
end)

-- ─── Load DB Permissions ────────────────────────────────

function LoadDBPermissions()
    dbPermissions = Storage_GetDBPermissions()
end


-- ─── Framework Bridge ───────────────────────────────────

local function _getPlayer(src)
    local ok, player = pcall(exports.qbx_core.GetPlayer, exports.qbx_core, src)
    if ok and player then return player end
    -- Fallback: try QBCore bridge (GetCoreObject pattern)
    local ok2, QBCore = pcall(exports['qb-core'].GetCoreObject, exports['qb-core'])
    if ok2 and QBCore and QBCore.Functions and QBCore.Functions.GetPlayer then
        return QBCore.Functions.GetPlayer(src)
    end
    return nil
end

-- ─── Config Mode Check ──────────────────────────────────

local function _checkConfigPermission(src, permKey)
    -- Superadmin bypass: group.admin or webcom.admin always has full access
    if IsPlayerAceAllowed(tostring(src), 'group.admin') or
       IsPlayerAceAllowed(tostring(src), 'webcom.admin') then
        return true
    end

    local permDef = Config.Permissions[permKey]
    if not permDef then return false end

    -- Ace check
    if permDef.aces then
        for _, ace in ipairs(permDef.aces) do
            if IsPlayerAceAllowed(tostring(src), ace) then
                return true
            end
        end
    end

    -- Job check (requires QBCore/QBox bridge)
    if permDef.jobs and #permDef.jobs > 0 then
        local player = _getPlayer(src)
        if player then
            local jobName = player.PlayerData and player.PlayerData.job and player.PlayerData.job.name
            if jobName then
                for _, j in ipairs(permDef.jobs) do
                    if j == jobName then return true end
                end
            end
        end
    end

    -- CitizenID check
    if permDef.citizenids and #permDef.citizenids > 0 then
        local player = _getPlayer(src)
        if player then
            local cid = player.PlayerData and player.PlayerData.citizenid
            if cid then
                for _, id in ipairs(permDef.citizenids) do
                    if id == cid then return true end
                end
            end
        end
    end

    -- DB-managed citizenid check
    if dbPermissions[permKey] and next(dbPermissions[permKey]) then
        local player = _getPlayer(src)
        if player then
            local cid = player.PlayerData and player.PlayerData.citizenid
            if cid and dbPermissions[permKey][cid] then
                return true
            end
        end
    end

    return false
end

-- ─── Dashboard Mode Check ───────────────────────────────

local function _checkDashboardPermission(src, permKey)
    local dashPermKey = Config.DashboardPermissions[permKey]
    if not dashPermKey then return false end

    local identifiers = GetPlayerIdentifiers(src)
    local license = nil
    for _, id in ipairs(identifiers) do
        if id:find('^license:') then
            license = id
            break
        end
    end
    if not license then return false end

    local ok, result = pcall(function()
        return exports.httpmanager:checkPermission(license, dashPermKey)
    end)

    return ok and result == true
end

-- ─── Public API ─────────────────────────────────────────

--- Async permission check (callback-based, now synchronous internally)
function HasLoadscreenPermission(src, permKey, cb)
    -- Check cache first
    if permissionCache[src] and permissionCache[src][permKey] ~= nil then
        return cb(permissionCache[src][permKey])
    end

    -- Dashboard mode (now synchronous via httpmanager export)
    if Config.PermissionMode == 'dashboard' then
        local allowed = _checkDashboardPermission(src, permKey)
        _cachePermission(src, permKey, allowed)
        return cb(allowed)
    end

    -- Config mode (synchronous)
    if Config.PermissionMode ~= 'config' then return cb(false) end

    local allowed = _checkConfigPermission(src, permKey)
    _cachePermission(src, permKey, allowed)
    return cb(allowed)
end

--- Synchronous permission check (config mode only, no HTTP)
function HasLoadscreenPermissionSync(src, permKey)
    if permissionCache[src] and permissionCache[src][permKey] ~= nil then
        return permissionCache[src][permKey]
    end

    if Config.PermissionMode ~= 'config' then return false end

    local allowed = _checkConfigPermission(src, permKey)
    _cachePermission(src, permKey, allowed)
    return allowed
end

--- Invalidate permission cache for a player (e.g. after granting)
function InvalidatePermissionCache(src)
    permissionCache[src] = nil
end

-- ─── Client Permission Check ────────────────────────────

RegisterNetEvent('webcom_loadscreen:server:checkEditPermission', function()
    local src = source
    -- If module not ready yet, respond with false so client doesn't hang
    if not isReady then
        return TriggerClientEvent('webcom_loadscreen:client:permissionResult', src, false)
    end
    HasLoadscreenPermission(src, 'edit', function(allowed)
        TriggerClientEvent('webcom_loadscreen:client:permissionResult', src, allowed)
    end)
end)
