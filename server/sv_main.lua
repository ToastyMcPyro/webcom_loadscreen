-- ═══════════════════════════════════════════════════════════
--  sv_main.lua – Core Server Logic & NUI Callbacks
-- ═══════════════════════════════════════════════════════════

isReady = false  -- Global: referenced by sv_dashboard.lua

local function hasHttpManager()
    return GetResourceState('httpmanager') == 'started'
end

-- ─── Initialization ─────────────────────────────────────

CreateThread(function()
    while not MySQL do Wait(100) end

    -- Bootstrap database schema
    InitializeStorage()

    -- Seed default templates if none exist
    Storage_SeedTemplatesIfEmpty()

    -- Load DB-managed permissions
    LoadDBPermissions()

    -- Cache the active design for handover
    RefreshActiveDesign()

    -- Try to load auto-config from httpmanager
    if hasHttpManager() then
        local ok, sharedCfg = pcall(exports.httpmanager.getSharedConfig)
        if ok and sharedCfg then
            Config.WebcomBaseUrl = sharedCfg.DashboardURL
            Config.ServerId      = sharedCfg.ServerId
        end
    end

    isReady = true
    print('^2[webcom_loadscreen]^0 Module initialized')
end)

-- ─── NUI Callbacks (editor → server) ────────────────────

--- Get list of all designs
RegisterNetEvent('webcom_loadscreen:server:getDesigns', function()
    local src = source
    if not isReady then
        -- Not ready yet; send nil so client knows to retry
        return TriggerClientEvent('webcom_loadscreen:client:receiveDesigns', src, nil)
    end
    HasLoadscreenPermission(src, 'view', function(allowed)
        if not allowed then
            -- Send false to signal permission denied (distinct from empty array)
            return TriggerClientEvent('webcom_loadscreen:client:receiveDesigns', src, false)
        end
        local designs = Storage_GetAllDesigns() or {}
        TriggerClientEvent('webcom_loadscreen:client:receiveDesigns', src, designs)
    end)
end)

--- Get a single design (full data with elements)
RegisterNetEvent('webcom_loadscreen:server:getDesign', function(designId)
    local src = source
    HasLoadscreenPermission(src, 'view', function(allowed)
        if not allowed then
            return TriggerClientEvent('webcom_loadscreen:client:receiveDesign', src, nil)
        end
        local design = Storage_GetDesign(designId)
        TriggerClientEvent('webcom_loadscreen:client:receiveDesign', src, design)
    end)
end)

--- Create a new design
RegisterNetEvent('webcom_loadscreen:server:createDesign', function(data)
    local src = source
    HasLoadscreenPermission(src, 'edit', function(allowed)
        if not allowed then
            return TriggerClientEvent('webcom_loadscreen:client:designCreated', src, nil)
        end

        local license = GetPlayerIdentifierByType(tostring(src), 'license')
        data.created_by = license and license:gsub('^license:', '') or ('src:' .. src)

        local newId = Storage_CreateDesign(data)
        local design = Storage_GetDesign(newId)
        TriggerClientEvent('webcom_loadscreen:client:designCreated', src, design)
    end)
end)

--- Save/update a design
RegisterNetEvent('webcom_loadscreen:server:saveDesign', function(designId, data)
    local src = source
    HasLoadscreenPermission(src, 'edit', function(allowed)
        if not allowed then
            return TriggerClientEvent('webcom_loadscreen:client:designSaved', src, false)
        end

        local license = GetPlayerIdentifierByType(tostring(src), 'license')
        data.updated_by = license and license:gsub('^license:', '') or ('src:' .. src)

        Storage_UpdateDesign(designId, data)

        -- If this is the active design, refresh cache
        local active = GetActiveDesignCache()
        if active and active.id == designId then
            RefreshActiveDesign()
        end

        TriggerClientEvent('webcom_loadscreen:client:designSaved', src, true)

        -- Broadcast to collaborators
        TriggerClientEvent('webcom_loadscreen:client:designUpdated', -1, designId, data, src)
    end)
end)

--- Delete a design
RegisterNetEvent('webcom_loadscreen:server:deleteDesign', function(designId)
    local src = source
    HasLoadscreenPermission(src, 'edit', function(allowed)
        if not allowed then return end
        Storage_DeleteDesign(designId)
        TriggerClientEvent('webcom_loadscreen:client:designDeleted', -1, designId)
    end)
end)

--- Duplicate a design
RegisterNetEvent('webcom_loadscreen:server:duplicateDesign', function(designId, newName)
    local src = source
    HasLoadscreenPermission(src, 'edit', function(allowed)
        if not allowed then return end

        local license = GetPlayerIdentifierByType(tostring(src), 'license')
        local createdBy = license and license:gsub('^license:', '') or ('src:' .. src)

        local newId = Storage_DuplicateDesign(designId, newName, createdBy)
        if newId then
            local design = Storage_GetDesign(newId)
            TriggerClientEvent('webcom_loadscreen:client:designCreated', src, design)
        end
    end)
end)
