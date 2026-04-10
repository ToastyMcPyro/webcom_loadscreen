-- ═══════════════════════════════════════════════════════════
--  sv_collaboration.lua – Real-Time Collaborative Editing
--  Element locking, cursor presence, operation broadcast
-- ═══════════════════════════════════════════════════════════

-- Active editor sessions: { [designId] = { [src] = { name, color, cursor, joinedAt } } }
local activeSessions = {}

-- Element locks: { [designId] = { [elementId] = { src, name, lockedAt } } }
local elementLocks = {}

-- Color palette for editor cursors
local cursorColors = {
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
}

local function getEditorColor(designId, src)
    local idx = 0
    if activeSessions[designId] then
        for s, _ in pairs(activeSessions[designId]) do
            idx = idx + 1
            if s == src then break end
        end
    end
    return cursorColors[((idx - 1) % #cursorColors) + 1]
end

-- ─── Join / Leave Session ───────────────────────────────

RegisterNetEvent('webcom_loadscreen:server:joinSession', function(designId)
    local src = source
    HasLoadscreenPermission(src, 'edit', function(allowed)
        if not allowed then return end

        if not activeSessions[designId] then activeSessions[designId] = {} end

        -- Check max collaborators
        local count = 0
        for _ in pairs(activeSessions[designId]) do count = count + 1 end
        if count >= Config.MaxCollaborators then
            TriggerClientEvent('ox_lib:notify', src, {
                title = 'Loadscreen',
                description = 'Max editors reached (' .. Config.MaxCollaborators .. ')',
                type = 'error',
            })
            return
        end

        local playerName = GetPlayerName(src) or ('Player ' .. src)
        local color = getEditorColor(designId, src)

        activeSessions[designId][src] = {
            name     = playerName,
            color    = color,
            cursor   = { x = 0, y = 0 },
            joinedAt = os.time(),
        }

        -- Notify the joiner of current editors
        local editors = {}
        for s, data in pairs(activeSessions[designId]) do
            editors[tostring(s)] = data
        end
        TriggerClientEvent('webcom_loadscreen:client:sessionState', src, designId, editors, elementLocks[designId] or {})

        -- Notify others of new editor
        for s, _ in pairs(activeSessions[designId]) do
            if s ~= src then
                TriggerClientEvent('webcom_loadscreen:client:editorJoined', s, designId, src, activeSessions[designId][src])
            end
        end
    end)
end)

RegisterNetEvent('webcom_loadscreen:server:leaveSession', function(designId)
    local src = source
    if not activeSessions[designId] then return end

    activeSessions[designId][src] = nil

    -- Release all locks held by this editor
    if elementLocks[designId] then
        for elId, lock in pairs(elementLocks[designId]) do
            if lock.src == src then
                elementLocks[designId][elId] = nil
            end
        end
    end

    -- Notify others
    for s, _ in pairs(activeSessions[designId]) do
        TriggerClientEvent('webcom_loadscreen:client:editorLeft', s, designId, src)
    end

    -- Clean up empty sessions
    if not next(activeSessions[designId]) then
        activeSessions[designId] = nil
        elementLocks[designId]   = nil
    end
end)

-- Clean up on disconnect
AddEventHandler('playerDropped', function()
    local src = source
    for designId, editors in pairs(activeSessions) do
        if editors[src] then
            editors[src] = nil
            if elementLocks[designId] then
                for elId, lock in pairs(elementLocks[designId]) do
                    if lock.src == src then
                        elementLocks[designId][elId] = nil
                    end
                end
            end
            for s, _ in pairs(editors) do
                TriggerClientEvent('webcom_loadscreen:client:editorLeft', s, designId, src)
            end
            if not next(editors) then
                activeSessions[designId] = nil
                elementLocks[designId]   = nil
            end
        end
    end
end)

-- ─── Cursor Position Broadcast ──────────────────────────

RegisterNetEvent('webcom_loadscreen:server:cursorMove', function(designId, x, y)
    local src = source
    if not activeSessions[designId] or not activeSessions[designId][src] then return end

    activeSessions[designId][src].cursor = { x = x, y = y }

    for s, _ in pairs(activeSessions[designId]) do
        if s ~= src then
            TriggerClientEvent('webcom_loadscreen:client:cursorMoved', s, designId, src, x, y)
        end
    end
end)

-- ─── Element Locking ────────────────────────────────────

RegisterNetEvent('webcom_loadscreen:server:lockElement', function(designId, elementId)
    local src = source
    if not activeSessions[designId] or not activeSessions[designId][src] then return end

    if not elementLocks[designId] then elementLocks[designId] = {} end

    local existing = elementLocks[designId][elementId]
    if existing then
        -- Check if lock expired
        if os.time() - existing.lockedAt < Config.ElementLockTimeout and existing.src ~= src then
            TriggerClientEvent('webcom_loadscreen:client:lockDenied', src, designId, elementId, existing.name)
            return
        end
    end

    elementLocks[designId][elementId] = {
        src      = src,
        name     = activeSessions[designId][src].name,
        lockedAt = os.time(),
    }

    -- Broadcast lock to all editors
    for s, _ in pairs(activeSessions[designId]) do
        TriggerClientEvent('webcom_loadscreen:client:elementLocked', s, designId, elementId, src, activeSessions[designId][src].name)
    end
end)

RegisterNetEvent('webcom_loadscreen:server:unlockElement', function(designId, elementId)
    local src = source
    if not elementLocks[designId] then return end

    local lock = elementLocks[designId][elementId]
    if not lock or lock.src ~= src then return end

    elementLocks[designId][elementId] = nil

    for s, _ in pairs(activeSessions[designId]) do
        TriggerClientEvent('webcom_loadscreen:client:elementUnlocked', s, designId, elementId)
    end
end)

-- ─── Operation Broadcast ────────────────────────────────

--- Broadcast an element operation to all other editors
RegisterNetEvent('webcom_loadscreen:server:elementOperation', function(designId, operation)
    local src = source
    if not activeSessions[designId] or not activeSessions[designId][src] then return end

    -- Forward to all other editors in the session
    for s, _ in pairs(activeSessions[designId]) do
        if s ~= src then
            TriggerClientEvent('webcom_loadscreen:client:elementOperation', s, designId, operation, src)
        end
    end
end)
