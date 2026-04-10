-- ═══════════════════════════════════════════════════════════
--  cl_editor.lua – Editor-specific NUI bridge (deep linking)
-- ═══════════════════════════════════════════════════════════

currentDesignId = nil

-- ─── Join collaboration session ─────────────────────────

RegisterNUICallback('joinSession', function(data, cb)
    currentDesignId = data.designId
    TriggerServerEvent('webcom_loadscreen:server:joinSession', data.designId)
    cb('ok')
end)

RegisterNUICallback('leaveSession', function(data, cb)
    if currentDesignId then
        TriggerServerEvent('webcom_loadscreen:server:leaveSession', currentDesignId)
        currentDesignId = nil
    end
    cb('ok')
end)

-- ─── Element operations ─────────────────────────────────

RegisterNUICallback('lockElement', function(data, cb)
    if currentDesignId then
        TriggerServerEvent('webcom_loadscreen:server:lockElement', currentDesignId, data.elementId)
    end
    cb('ok')
end)

RegisterNUICallback('unlockElement', function(data, cb)
    if currentDesignId then
        TriggerServerEvent('webcom_loadscreen:server:unlockElement', currentDesignId, data.elementId)
    end
    cb('ok')
end)

RegisterNUICallback('elementOperation', function(data, cb)
    if currentDesignId then
        TriggerServerEvent('webcom_loadscreen:server:elementOperation', currentDesignId, data.operation)
    end
    cb('ok')
end)

RegisterNUICallback('cursorMove', function(data, cb)
    if currentDesignId then
        TriggerServerEvent('webcom_loadscreen:server:cursorMove', currentDesignId, data.x, data.y)
    end
    cb('ok')
end)


-- ─── Media file operations ──────────────────────────────

RegisterNUICallback('uploadMedia', function(data, cb)
    -- Use latent event for large payloads (auto-chunked by FiveM)
    TriggerLatentServerEvent('webcom_loadscreen:server:uploadMedia', 5000000,
        data.folder, data.fileName, data.data, data.size)
    cb('ok')
end)

RegisterNUICallback('getMediaFiles', function(_, cb)
    TriggerServerEvent('webcom_loadscreen:server:getMediaFiles')
    cb('ok')
end)

RegisterNUICallback('deleteMedia', function(data, cb)
    TriggerServerEvent('webcom_loadscreen:server:deleteMedia', data.folder, data.fileName)
    cb('ok')
end)

RegisterNetEvent('webcom_loadscreen:client:mediaList', function(files)
    SendNUIMessage({ action = 'mediaList', files = files })
end)

RegisterNetEvent('webcom_loadscreen:client:mediaUploaded', function(ok, err, folder)
    SendNUIMessage({ action = 'mediaUploaded', success = ok, error = err, folder = folder })
end)