-- ═══════════════════════════════════════════════════════════
--  sv_dashboard.lua – Dashboard Integration (httpmanager)
-- ═══════════════════════════════════════════════════════════

local function hasHttpManager()
    return GetResourceState('httpmanager') == 'started'
end

local function printStandaloneBanner()
    print('^3+------------------------------------------------------------------------+^0')
    print('^3| [webcom_loadscreen] Standalone mode: dashboard endpoints are disabled. |^0')
    print('^3| Full ArgusAdmin experience: https://weko-web.de/argusadmin            |^0')
    print('^3+------------------------------------------------------------------------+^0')
end

CreateThread(function()
    while not isReady do Wait(500) end
    Wait(2000)

    if not hasHttpManager() then
        printStandaloneBanner()
        return
    end

    -- Module is auto-discovered via fxmanifest metadata (webcom_module_name etc.)
    -- We only need to register the HTTP endpoints here.

    local epOk, epErr = pcall(function()

    -- ─── REST Endpoints ─────────────────────────────────

    -- GET /loadscreen/designs
    exports.httpmanager:registerEndpoint('loadscreen/designs', function(_data)
        if _data.method == 'GET' and not _data.params.id then
            local designs = Storage_GetAllDesigns() or {}
            return { success = true, data = designs }
        end

        -- GET /loadscreen/designs/:id
        if _data.method == 'GET' and _data.params.id then
            local design = Storage_GetDesign(tonumber(_data.params.id))
            if not design then
                return { success = false, error = 'Design not found' }
            end
            return { success = true, data = design }
        end

        -- POST /loadscreen/designs
        if _data.method == 'POST' and not _data.params.id then
            local body = _data.body or {}
            local newId = Storage_CreateDesign({
                name             = body.name or 'Untitled',
                description      = body.description,
                canvas_width     = body.canvas_width,
                canvas_height    = body.canvas_height,
                background_color = body.background_color,
                elements         = body.elements or {},
                is_template      = body.is_template,
                created_by       = 'dashboard',
            })
            local design = Storage_GetDesign(newId)
            return { success = true, data = design }
        end

        -- PUT /loadscreen/designs/:id
        if _data.method == 'PUT' and _data.params.id then
            local body = _data.body or {}
            body.updated_by = 'dashboard'
            local ok = Storage_UpdateDesign(tonumber(_data.params.id), body)

            -- Refresh active design cache if needed
            local active = GetActiveDesignCache()
            if active and active.id == tonumber(_data.params.id) then
                RefreshActiveDesign()
            end

            return { success = ok }
        end

        -- DELETE /loadscreen/designs/:id
        if _data.method == 'DELETE' and _data.params.id then
            Storage_DeleteDesign(tonumber(_data.params.id))
            return { success = true }
        end

        return { success = false, error = 'Unknown request' }
    end)

    -- POST /loadscreen/designs/:id/deploy
    exports.httpmanager:registerEndpoint('loadscreen/deploy', function(_data)
        if _data.method == 'POST' and _data.body and _data.body.designId then
            Storage_SetActiveDesign(tonumber(_data.body.designId))
            RefreshActiveDesign()
            return { success = true }
        end
        return { success = false, error = 'Missing designId' }
    end)

    -- POST /loadscreen/designs/:id/duplicate
    exports.httpmanager:registerEndpoint('loadscreen/duplicate', function(_data)
        if _data.method == 'POST' and _data.body and _data.body.designId then
            local newId = Storage_DuplicateDesign(
                tonumber(_data.body.designId),
                _data.body.name,
                'dashboard'
            )
            if newId then
                local design = Storage_GetDesign(newId)
                return { success = true, data = design }
            end
            return { success = false, error = 'Design not found' }
        end
        return { success = false, error = 'Missing designId' }
    end)

    -- POST /loadscreen/deactivate
    exports.httpmanager:registerEndpoint('loadscreen/deactivate', function(_data)
        Storage_DeactivateAll()
        RefreshActiveDesign()
        return { success = true }
    end)

    -- GET /loadscreen/active
    exports.httpmanager:registerEndpoint('loadscreen/active', function(_data)
        local active = GetActiveDesignCache()
        return { success = true, data = active }
    end)

    -- GET /loadscreen/elements
    exports.httpmanager:registerEndpoint('loadscreen/elements', function(_data)
        local categories = {}
        for _, et in ipairs(ElementTypes) do
            if not categories[et.category] then categories[et.category] = {} end
            categories[et.category][#categories[et.category]+1] = {
                id       = et.id,
                label    = et.label,
                icon     = et.icon,
                defaults = DefaultTypeProps[et.id] or {},
            }
        end
        return { success = true, data = categories }
    end)

    end)

    if not epOk then
        print('^1[webcom_loadscreen]^0 Endpoint registration failed: ' .. tostring(epErr))
        return
    end

    print('^2[webcom_loadscreen]^0 Dashboard endpoints registered')
end)
