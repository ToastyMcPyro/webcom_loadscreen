-- ═══════════════════════════════════════════════════════════
--  cl_collaboration.lua – Collaboration event handlers
-- ═══════════════════════════════════════════════════════════

-- ─── Session State ──────────────────────────────────────

RegisterNetEvent('webcom_loadscreen:client:sessionState', function(designId, editors, locks)
    SendNUIMessage({
        action  = 'sessionState',
        yourId  = tostring(GetPlayerServerId(PlayerId())),
        designId = designId,
        editors = editors,
        locks   = locks,
    })
end)

RegisterNetEvent('webcom_loadscreen:client:editorJoined', function(designId, src, editorData)
    SendNUIMessage({
        action   = 'editorJoined',
        designId = designId,
        src      = src,
        editor   = editorData,
    })
end)

RegisterNetEvent('webcom_loadscreen:client:editorLeft', function(designId, src)
    SendNUIMessage({
        action   = 'editorLeft',
        designId = designId,
        src      = src,
    })
end)

-- ─── Cursor Presence ────────────────────────────────────

RegisterNetEvent('webcom_loadscreen:client:cursorMoved', function(designId, src, x, y)
    SendNUIMessage({
        action   = 'cursorMoved',
        designId = designId,
        src      = src,
        x        = x,
        y        = y,
    })
end)

-- ─── Element Locking ────────────────────────────────────

RegisterNetEvent('webcom_loadscreen:client:elementLocked', function(designId, elementId, src, name)
    SendNUIMessage({
        action    = 'elementLocked',
        designId  = designId,
        elementId = elementId,
        src       = src,
        name      = name,
    })
end)

RegisterNetEvent('webcom_loadscreen:client:elementUnlocked', function(designId, elementId)
    SendNUIMessage({
        action    = 'elementUnlocked',
        designId  = designId,
        elementId = elementId,
    })
end)

RegisterNetEvent('webcom_loadscreen:client:lockDenied', function(designId, elementId, lockedByName)
    SendNUIMessage({
        action    = 'lockDenied',
        designId  = designId,
        elementId = elementId,
        lockedBy  = lockedByName,
    })
end)

-- ─── Operation Relay ────────────────────────────────────

RegisterNetEvent('webcom_loadscreen:client:elementOperation', function(designId, operation, fromSrc)
    SendNUIMessage({
        action    = 'elementOperation',
        designId  = designId,
        operation = operation,
        fromSrc   = fromSrc,
    })
end)
