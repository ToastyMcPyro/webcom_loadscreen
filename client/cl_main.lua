-- ═══════════════════════════════════════════════════════════
--  cl_main.lua – Client Bootstrap, Keybind, Shutdown
-- ═══════════════════════════════════════════════════════════

local editorOpen = false

-- ─── Shutdown Loadscreen ────────────────────────────────

CreateThread(function()
    -- Wait for game to be ready
    while not NetworkIsSessionStarted() do Wait(100) end
    ShutdownLoadingScreen()
    ShutdownLoadingScreenNui()
end)

-- ─── Keybind & Command ──────────────────────────────────

RegisterCommand(Config.OpenCommand, function()
    ToggleEditor()
end, false)

-- Register keybind (mapped key)
RegisterKeyMapping(Config.OpenCommand, 'Toggle Loadscreen Editor', 'keyboard', Config.OpenKey)

function ToggleEditor()
    if editorOpen then
        CloseEditor()
    else
        OpenEditor()
    end
end

function OpenEditor()
    editorOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'openEditor' })

    -- Request design list from server (server gates this by permission)
    TriggerServerEvent('webcom_loadscreen:server:getDesigns')
end

function CloseEditor()
    editorOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'closeEditor' })

    -- Leave any active collaboration session
    if currentDesignId then
        TriggerServerEvent('webcom_loadscreen:server:leaveSession', currentDesignId)
        currentDesignId = nil
    end
end

function IsEditorOpen()
    return editorOpen
end

-- ─── NUI Callbacks ──────────────────────────────────────

RegisterNUICallback('closeEditor', function(_, cb)
    CloseEditor()
    cb('ok')
end)

RegisterNUICallback('getDesigns', function(_, cb)
    TriggerServerEvent('webcom_loadscreen:server:getDesigns')
    cb('ok')
end)

RegisterNUICallback('getDesign', function(data, cb)
    TriggerServerEvent('webcom_loadscreen:server:getDesign', data.designId)
    cb('ok')
end)

RegisterNUICallback('createDesign', function(data, cb)
    TriggerServerEvent('webcom_loadscreen:server:createDesign', data)
    cb('ok')
end)

RegisterNUICallback('saveDesign', function(data, cb)
    TriggerServerEvent('webcom_loadscreen:server:saveDesign', data.designId, data.data)
    cb('ok')
end)

RegisterNUICallback('deleteDesign', function(data, cb)
    TriggerServerEvent('webcom_loadscreen:server:deleteDesign', data.designId)
    cb('ok')
end)

RegisterNUICallback('duplicateDesign', function(data, cb)
    TriggerServerEvent('webcom_loadscreen:server:duplicateDesign', data.designId, data.name)
    cb('ok')
end)

RegisterNUICallback('deployDesign', function(data, cb)
    TriggerServerEvent('webcom_loadscreen:server:deployDesign', data.designId)
    cb('ok')
end)

RegisterNUICallback('deactivateDesign', function(_, cb)
    TriggerServerEvent('webcom_loadscreen:server:deactivateDesign')
    cb('ok')
end)

-- ─── Server → Client Event Handlers ─────────────────────

RegisterNetEvent('webcom_loadscreen:client:receiveDesigns', function(designs)
    SendNUIMessage({ action = 'receiveDesigns', designs = designs })
end)

RegisterNetEvent('webcom_loadscreen:client:receiveDesign', function(design)
    SendNUIMessage({ action = 'receiveDesign', design = design })
end)

RegisterNetEvent('webcom_loadscreen:client:designCreated', function(design)
    SendNUIMessage({ action = 'designCreated', design = design })
end)

RegisterNetEvent('webcom_loadscreen:client:designSaved', function(success)
    SendNUIMessage({ action = 'designSaved', success = success })
end)

RegisterNetEvent('webcom_loadscreen:client:designDeleted', function(designId)
    SendNUIMessage({ action = 'designDeleted', designId = designId })
end)

RegisterNetEvent('webcom_loadscreen:client:designDeployed', function(designId)
    SendNUIMessage({ action = 'designDeployed', designId = designId })
end)

RegisterNetEvent('webcom_loadscreen:client:designUpdated', function(designId, data, fromSrc)
    if fromSrc == GetPlayerServerId(PlayerId()) then return end
    SendNUIMessage({ action = 'designUpdated', designId = designId, data = data })
end)
