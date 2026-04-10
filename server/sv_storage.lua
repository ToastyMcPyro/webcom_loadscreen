-- ═══════════════════════════════════════════════════════════
--  sv_storage.lua – Database Layer for Loadscreen Designs
-- ═══════════════════════════════════════════════════════════

local StorageReady = false

-- ─── Schema Bootstrap ───────────────────────────────────

function InitializeStorage()
    local sqlFile = LoadResourceFile(GetCurrentResourceName(), 'sql/install.sql')
    if not sqlFile then
        print('^1[webcom_loadscreen]^0 Could not load sql/install.sql')
        return false
    end

    -- Strip SQL comment lines before splitting
    local cleaned = sqlFile:gsub('%-%-[^\n]*', '')
    for stmt in cleaned:gmatch('([^;]+)') do
        local trimmed = stmt:match('^%s*(.-)%s*$')
        if trimmed and #trimmed > 10 then
            local ok, err = pcall(function() MySQL.query.await(trimmed) end)
            if not ok then
                print('^1[webcom_loadscreen]^0 SQL error: ' .. tostring(err))
            end
        end
    end

    StorageReady = true
    return true
end

-- ─── Design CRUD ────────────────────────────────────────

--- Get all designs (list view – no element data)
function Storage_GetAllDesigns()
    return MySQL.query.await([[
        SELECT id, name, description, thumbnail, canvas_width, canvas_height,
               background_color, is_active, is_template, created_by, updated_by,
               created_at, updated_at
        FROM webcom_loadscreen_designs
        ORDER BY updated_at DESC
    ]])
end

--- Get a single design with full element data
function Storage_GetDesign(designId)
    local rows = MySQL.query.await(
        'SELECT * FROM webcom_loadscreen_designs WHERE id = ?',
        { designId }
    )
    if not rows or #rows == 0 then return nil end
    local design = rows[1]
    design.elements = SafeJsonDecode(design.elements) or {}
    return design
end

--- Get the currently active design (the one used as loadscreen)
function Storage_GetActiveDesign()
    local rows = MySQL.query.await(
        'SELECT * FROM webcom_loadscreen_designs WHERE is_active = 1 LIMIT 1'
    )
    if not rows or #rows == 0 then return nil end
    local design = rows[1]
    design.elements = SafeJsonDecode(design.elements) or {}
    return design
end

--- Create a new design
function Storage_CreateDesign(data)
    local result = MySQL.insert.await([[
        INSERT INTO webcom_loadscreen_designs
            (name, description, canvas_width, canvas_height, background_color, elements, is_template, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ]], {
        data.name or 'Untitled',
        data.description or '',
        data.canvas_width or Config.CanvasWidth,
        data.canvas_height or Config.CanvasHeight,
        data.background_color or '#0a0a0a',
        SafeJsonEncode(data.elements or {}),
        data.is_template and 1 or 0,
        data.created_by,
        data.created_by,
    })
    return result -- insert id
end

--- Update a design (partial update)
function Storage_UpdateDesign(designId, data)
    local sets = {}
    local params = {}

    if data.name then
        sets[#sets+1] = 'name = ?'
        params[#params+1] = data.name
    end
    if data.description ~= nil then
        sets[#sets+1] = 'description = ?'
        params[#params+1] = data.description
    end
    if data.thumbnail ~= nil then
        sets[#sets+1] = 'thumbnail = ?'
        params[#params+1] = data.thumbnail
    end
    if data.canvas_width then
        sets[#sets+1] = 'canvas_width = ?'
        params[#params+1] = data.canvas_width
    end
    if data.canvas_height then
        sets[#sets+1] = 'canvas_height = ?'
        params[#params+1] = data.canvas_height
    end
    if data.background_color then
        sets[#sets+1] = 'background_color = ?'
        params[#params+1] = data.background_color
    end
    if data.elements then
        sets[#sets+1] = 'elements = ?'
        params[#params+1] = SafeJsonEncode(data.elements)
    end
    if data.is_template ~= nil then
        sets[#sets+1] = 'is_template = ?'
        params[#params+1] = data.is_template and 1 or 0
    end
    if data.updated_by then
        sets[#sets+1] = 'updated_by = ?'
        params[#params+1] = data.updated_by
    end

    if #sets == 0 then return false end

    params[#params+1] = designId
    MySQL.update.await(
        'UPDATE webcom_loadscreen_designs SET ' .. table.concat(sets, ', ') .. ' WHERE id = ?',
        params
    )
    return true
end

--- Delete a design
function Storage_DeleteDesign(designId)
    MySQL.query.await('DELETE FROM webcom_loadscreen_designs WHERE id = ?', { designId })
    return true
end

--- Set a design as the active loadscreen (deactivates all others)
function Storage_SetActiveDesign(designId)
    MySQL.query.await('UPDATE webcom_loadscreen_designs SET is_active = 0 WHERE is_active = 1')
    MySQL.query.await('UPDATE webcom_loadscreen_designs SET is_active = 1 WHERE id = ?', { designId })
    return true
end

--- Deactivate all designs (no custom loadscreen)
function Storage_DeactivateAll()
    MySQL.query.await('UPDATE webcom_loadscreen_designs SET is_active = 0 WHERE is_active = 1')
    return true
end

--- Duplicate a design
function Storage_DuplicateDesign(designId, newName, createdBy)
    local original = Storage_GetDesign(designId)
    if not original then return nil end

    return Storage_CreateDesign({
        name            = newName or (original.name .. ' (Copy)'),
        description     = original.description,
        canvas_width    = original.canvas_width,
        canvas_height   = original.canvas_height,
        background_color = original.background_color,
        elements        = original.elements,
        is_template     = false,
        created_by      = createdBy,
    })
end

-- ─── Permission DB Helpers ──────────────────────────────

function Storage_GetDBPermissions()
    local rows = MySQL.query.await(
        'SELECT citizenid, permission_key FROM webcom_loadscreen_permissions'
    )
    local perms = {}
    if rows then
        for _, row in ipairs(rows) do
            if not perms[row.permission_key] then perms[row.permission_key] = {} end
            perms[row.permission_key][row.citizenid] = true
        end
    end
    return perms
end

function Storage_AddDBPermission(citizenid, permKey, grantedBy)
    MySQL.insert.await(
        'INSERT IGNORE INTO webcom_loadscreen_permissions (citizenid, permission_key, granted_by) VALUES (?, ?, ?)',
        { citizenid, permKey, grantedBy }
    )
end

function Storage_RemoveDBPermission(citizenid, permKey)
    MySQL.query.await(
        'DELETE FROM webcom_loadscreen_permissions WHERE citizenid = ? AND permission_key = ?',
        { citizenid, permKey }
    )
end

-- ─── Seed Default Templates ─────────────────────────────

function Storage_SeedTemplatesIfEmpty()
    local existing = MySQL.scalar.await(
        'SELECT COUNT(*) FROM webcom_loadscreen_designs WHERE is_template = 1'
    )
    if (existing or 0) > 0 then return end

    print('^3[webcom_loadscreen]^0 No templates found – seeding defaults...')

    local sqlFile = LoadResourceFile(GetCurrentResourceName(), 'sql/seed-templates.sql')
    if not sqlFile then
        print('^1[webcom_loadscreen]^0 Could not load sql/seed-templates.sql')
        return
    end

    local cleaned = sqlFile:gsub('%-%-[^\n]*', '')
    for stmt in cleaned:gmatch('([^;]+)') do
        local trimmed = stmt:match('^%s*(.-)%s*$')
        if trimmed and #trimmed > 10 then
            local ok, err = pcall(function() MySQL.query.await(trimmed) end)
            if not ok then
                print('^1[webcom_loadscreen]^0 Seed error: ' .. tostring(err))
            end
        end
    end

    print('^2[webcom_loadscreen]^0 Templates seeded successfully')
end


-- ─── Playtime Tracking ─────────────────────────────────

--- Record a player join (upsert + increment session count)
function Storage_PlayerJoin(license, playerName)
    MySQL.query.await([[
        INSERT INTO webcom_loadscreen_playtime (license, player_name, last_join, session_count)
        VALUES (?, ?, NOW(), 1)
        ON DUPLICATE KEY UPDATE
            player_name = VALUES(player_name),
            last_join = NOW(),
            session_count = session_count + 1
    ]], { license, playerName })
end

--- Record a player leave (add session duration)
function Storage_PlayerLeave(license, sessionSeconds)
    MySQL.query.await([[
        UPDATE webcom_loadscreen_playtime
        SET total_seconds = total_seconds + ?,
            last_leave = NOW()
        WHERE license = ?
    ]], { math.max(0, math.floor(sessionSeconds)), license })
end

--- Get playtime for a player
function Storage_GetPlaytime(license)
    local rows = MySQL.query.await(
        'SELECT total_seconds, session_count, first_seen, last_join, last_leave FROM webcom_loadscreen_playtime WHERE license = ?',
        { license }
    )
    if not rows or #rows == 0 then return nil end
    return rows[1]
end

--- Get top playtime (leaderboard)
function Storage_GetTopPlaytime(limit)
    return MySQL.query.await(
        'SELECT license, player_name, total_seconds, session_count, first_seen FROM webcom_loadscreen_playtime ORDER BY total_seconds DESC LIMIT ?',
        { limit or 10 }
    )
end