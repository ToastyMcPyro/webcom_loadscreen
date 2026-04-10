-- ═══════════════════════════════════════════════════════════
--  sv_loadscreen.lua – Loadscreen Data Handover
--  Injects active design data into FiveM's loadscreen NUI
-- ═══════════════════════════════════════════════════════════

local activeDesignCache = nil

--- Refresh the cached active design from DB
function RefreshActiveDesign()
    activeDesignCache = Storage_GetActiveDesign()
    if activeDesignCache then
        print('^2[webcom_loadscreen]^0 Active design loaded: "' .. activeDesignCache.name .. '" (ID ' .. activeDesignCache.id .. ')')
    else
        print('^3[webcom_loadscreen]^0 No active design set — default loadscreen will be shown')
    end
end

--- Get cached active design
function GetActiveDesignCache()
    return activeDesignCache
end

-- ─── Player Connecting – Handover ───────────────────────

AddEventHandler('playerConnecting', function(playerName, setKickReason, deferrals)
    local src = source

    -- Wait for module initialization if it hasn't completed yet
    if not isReady then
        local waited = 0
        while not isReady and waited < 15000 do
            Wait(100)
            waited = waited + 100
        end
    end

    if not activeDesignCache then return end

    -- Look up player playtime from DB
    local playtimeFormatted = ''
    local lastLogin = ''
    local _license = GetPlayerIdentifierByType(tostring(src), 'license')
    if _license then
        local cleanLicense = _license:gsub('^license:', '')
        local pt = Storage_GetPlaytime(cleanLicense)
        if pt then
            local secs = pt.total_seconds or 0
            local hours = math.floor(secs / 3600)
            local mins = math.floor((secs % 3600) / 60)
            playtimeFormatted = hours .. 'h ' .. mins .. 'm'
            lastLogin = tostring(pt.last_join or '')
        end
    end

    -- Fetch Discord rank (async → promise)
    local playerRank = ''
    local playerAvatar = ''
    if GetPlayerDiscordRank then
        local p = promise.new()
        GetPlayerDiscordRank(src, function(rank)
            p:resolve(rank or '')
        end)
        playerRank = Citizen.Await(p)
    end
    if GetPlayerDiscordInfo then
        local p2 = promise.new()
        GetPlayerDiscordInfo(src, function(info)
            p2:resolve(info)
        end)
        local info = Citizen.Await(p2)
        if info and info.avatar and info.avatar ~= '' then
            playerAvatar = info.avatar
        end
    end

    -- Collect online staff (players with edit permission + their Discord info)
    local onlineStaff = {}
    if GetPlayerDiscordRank then
        local players = GetPlayers()
        for _, pSrc in ipairs(players) do
            local pId = tonumber(pSrc)
            if pId then
                local allowed = HasLoadscreenPermissionSync and HasLoadscreenPermissionSync(pId, 'edit')
                if allowed then
                    local staffName = GetPlayerName(tostring(pId)) or 'Unknown'
                    local staffRank = ''
                    local staffAvatar = ''
                    local pRank = promise.new()
                    GetPlayerDiscordRank(pId, function(r) pRank:resolve(r or '') end)
                    staffRank = Citizen.Await(pRank)
                    if GetPlayerDiscordInfo then
                        local pInfo = promise.new()
                        GetPlayerDiscordInfo(pId, function(i) pInfo:resolve(i) end)
                        local sInfo = Citizen.Await(pInfo)
                        if sInfo and sInfo.avatar then staffAvatar = sInfo.avatar end
                    end
                    onlineStaff[#onlineStaff+1] = { name = staffName, rank = staffRank, avatar = staffAvatar }
                end
            end
        end
    end

    -- Gather dynamic variable data
    local handoverData = {
        design = {
            elements         = activeDesignCache.elements or {},
            canvas_width     = activeDesignCache.canvas_width or 1920,
            canvas_height    = activeDesignCache.canvas_height or 1080,
            background_color = activeDesignCache.background_color or '#0a0a0a',
        },
        variables = {
            serverName      = GetConvar('sv_hostname', 'FiveM Server'),
            playerCount     = #GetPlayers(),
            maxPlayers      = GetConvarInt('sv_maxclients', 48),
            serverIp        = GetConvar('sv_listingIpOverride', ''),
            mapName         = GetConvar('mapname', 'FiveM'),
            gameType        = GetConvar('gametype', 'unknown'),
            playerName      = playerName,
            playerPlaytime  = playtimeFormatted,
            playerLastLogin = lastLogin,
            playerRank      = playerRank,
            playerAvatar    = playerAvatar,
            onlineStaff     = onlineStaff,
        },
    }

    deferrals.handover(handoverData)
end)

-- ─── Server Event: Deploy design as active ──────────────

RegisterNetEvent('webcom_loadscreen:server:deployDesign', function(designId)
    local src = source
    HasLoadscreenPermission(src, 'deploy', function(allowed)
        if not allowed then
            TriggerClientEvent('ox_lib:notify', src, {
                title = 'Loadscreen',
                description = 'No permission to deploy.',
                type = 'error',
            })
            return
        end

        Storage_SetActiveDesign(designId)
        RefreshActiveDesign()

        TriggerClientEvent('ox_lib:notify', src, {
            title = 'Loadscreen',
            description = 'Design deployed! New players will see it.',
            type = 'success',
        })

        -- Notify all editors
        TriggerClientEvent('webcom_loadscreen:client:designDeployed', -1, designId)
    end)
end)

RegisterNetEvent('webcom_loadscreen:server:deactivateDesign', function()
    local src = source
    HasLoadscreenPermission(src, 'deploy', function(allowed)
        if not allowed then return end
        Storage_DeactivateAll()
        activeDesignCache = nil
        TriggerClientEvent('ox_lib:notify', src, {
            title = 'Loadscreen',
            description = 'Loadscreen deactivated.',
            type = 'info',
        })
    end)
end)