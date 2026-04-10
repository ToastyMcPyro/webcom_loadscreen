-- ═══════════════════════════════════════════════════════════
--  sv_discord.lua – Discord Role/Rank Reader
--  Reads player Discord roles via bot token + guild API
--  Staff can query ranks; loadscreen shows player rank
-- ═══════════════════════════════════════════════════════════

local discordCache = {}      -- [discordId] = { roles = {}, nickname, fetchedAt }
local CACHE_TTL    = 300     -- 5 minutes cache

local function hasHttpManager()
    return GetResourceState('httpmanager') == 'started'
end

-- ─── Config (set in config.lua or auto-pull from httpmanager) ──

local function _getDiscordConfig()
    -- Try httpmanager shared config first
    if hasHttpManager() then
        local ok, sharedCfg = pcall(exports.httpmanager.getSharedConfig)
        if ok and sharedCfg and sharedCfg.DiscordBotToken and sharedCfg.DiscordGuildId then
            return {
                botToken = sharedCfg.DiscordBotToken,
                guildId  = sharedCfg.DiscordGuildId,
            }
        end
    end
    -- Fallback to Config
    if Config.DiscordBotToken and Config.DiscordGuildId then
        return {
            botToken = Config.DiscordBotToken,
            guildId  = Config.DiscordGuildId,
        }
    end
    return nil
end

-- ─── Get Discord ID from FiveM Player ──────────────────

local function _getDiscordId(src)
    local numIds = GetNumPlayerIdentifiers(tostring(src))
    for i = 0, numIds - 1 do
        local id = GetPlayerIdentifier(tostring(src), i)
        if id and id:find('^discord:') then
            return id:gsub('^discord:', '')
        end
    end
    return nil
end

-- ─── Fetch Guild Member from Discord API ────────────────

local function _fetchMember(discordId, cb)
    local cfg = _getDiscordConfig()
    if not cfg then return cb(nil) end

    -- Check cache
    local cached = discordCache[discordId]
    if cached and (os.time() - cached.fetchedAt) < CACHE_TTL then
        return cb(cached)
    end

    local url = ('https://discord.com/api/v10/guilds/%s/members/%s'):format(cfg.guildId, discordId)

    PerformHttpRequest(url, function(statusCode, body)
        if statusCode ~= 200 then
            return cb(nil)
        end

        local data = SafeJsonDecode(body)
        if not data then return cb(nil) end

        local memberData = {
            roles     = data.roles or {},
            nickname  = data.nick or (data.user and data.user.global_name) or (data.user and data.user.username) or '',
            username  = data.user and data.user.username or '',
            avatar    = data.user and data.user.avatar and
                ('https://cdn.discordapp.com/avatars/' .. discordId .. '/' .. data.user.avatar .. '.png?size=128') or '',
            fetchedAt = os.time(),
        }

        discordCache[discordId] = memberData
        cb(memberData)
    end, 'GET', '', {
        ['Authorization'] = 'Bot ' .. cfg.botToken,
        ['Content-Type']  = 'application/json',
    })
end

-- ─── Fetch Guild Roles (for name mapping) ───────────────

local guildRoles = nil
local rolesLastFetch = 0

local function _fetchGuildRoles(cb)
    if guildRoles and (os.time() - rolesLastFetch) < 600 then
        return cb(guildRoles)
    end

    local cfg = _getDiscordConfig()
    if not cfg then return cb({}) end

    PerformHttpRequest(
        ('https://discord.com/api/v10/guilds/%s/roles'):format(cfg.guildId),
        function(statusCode, body)
            if statusCode ~= 200 then return cb(guildRoles or {}) end
            local data = SafeJsonDecode(body)
            if not data then return cb(guildRoles or {}) end

            guildRoles = {}
            for _, role in ipairs(data) do
                guildRoles[role.id] = {
                    id       = role.id,
                    name     = role.name,
                    color    = role.color,
                    position = role.position,
                }
            end
            rolesLastFetch = os.time()
            cb(guildRoles)
        end, 'GET', '', {
            ['Authorization'] = 'Bot ' .. cfg.botToken,
            ['Content-Type']  = 'application/json',
        }
    )
end

-- ─── Public API ─────────────────────────────────────────

--- Get the highest Discord role name for a player (async, callback)
function GetPlayerDiscordRank(src, cb)
    local discordId = _getDiscordId(src)
    if not discordId then return cb('') end

    _fetchMember(discordId, function(member)
        if not member then return cb('') end

        _fetchGuildRoles(function(roles)
            if not roles or not member.roles then return cb('') end

            -- Find highest role (by position)
            local highest = nil
            local highestPos = -1
            for _, roleId in ipairs(member.roles) do
                local r = roles[roleId]
                if r and r.position > highestPos then
                    highest = r
                    highestPos = r.position
                end
            end

            cb(highest and highest.name or '')
        end)
    end)
end

--- Get all Discord roles for a player (async, callback)
function GetPlayerDiscordRoles(src, cb)
    local discordId = _getDiscordId(src)
    if not discordId then return cb({}) end

    _fetchMember(discordId, function(member)
        if not member then return cb({}) end

        _fetchGuildRoles(function(roles)
            if not roles or not member.roles then return cb({}) end

            local result = {}
            for _, roleId in ipairs(member.roles) do
                local r = roles[roleId]
                if r then
                    result[#result+1] = { id = r.id, name = r.name, color = r.color, position = r.position }
                end
            end

            -- Sort by position descending
            table.sort(result, function(a, b) return a.position > b.position end)
            cb(result)
        end)
    end)
end

--- Get Discord member info (avatar, nickname) for a player
function GetPlayerDiscordInfo(src, cb)
    local discordId = _getDiscordId(src)
    if not discordId then return cb(nil) end
    _fetchMember(discordId, cb)
end

-- ─── Staff Command: Check Discord ranks ─────────────────

RegisterNetEvent('webcom_loadscreen:server:getDiscordRank', function(targetSrc)
    local src = source
    HasLoadscreenPermission(src, 'edit', function(allowed)
        if not allowed then return end

        local target = tonumber(targetSrc) or src
        GetPlayerDiscordRoles(target, function(roles)
            local roleNames = {}
            for _, r in ipairs(roles) do
                roleNames[#roleNames+1] = r.name
            end
            TriggerClientEvent('ox_lib:notify', src, {
                title = 'Discord Rollen',
                description = GetPlayerName(tostring(target)) .. ': ' .. (#roleNames > 0 and table.concat(roleNames, ', ') or 'Keine Rollen'),
                type = 'info',
                duration = 8000,
            })
        end)
    end)
end)

-- ─── Dashboard Endpoint ─────────────────────────────────

CreateThread(function()
    while not isReady do Wait(500) end
    Wait(2000)

    if not hasHttpManager() then
        return
    end

    pcall(function()
        -- GET /loadscreen/discord/roles?src=X
        exports.httpmanager:registerEndpoint('loadscreen/discord', function(_data)
            if _data.method == 'GET' and _data.params.src then
                local target = tonumber(_data.params.src)
                if not target then return { success = false, error = 'Invalid src' } end

                -- Sync wrapper using promise pattern
                local p = promise.new()
                GetPlayerDiscordRoles(target, function(roles)
                    p:resolve(roles)
                end)
                local roles = Citizen.Await(p)
                return { success = true, data = roles }
            end

            -- GET /loadscreen/discord/guild-roles
            if _data.method == 'GET' then
                local p = promise.new()
                _fetchGuildRoles(function(roles)
                    p:resolve(roles)
                end)
                local roles = Citizen.Await(p)
                return { success = true, data = roles }
            end

            return { success = false, error = 'Unknown request' }
        end)
    end)
end)

-- ─── Clear cache on disconnect ──────────────────────────

AddEventHandler('playerDropped', function()
    local discordId = _getDiscordId(source)
    if discordId then
        discordCache[discordId] = nil
    end
end)