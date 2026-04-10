-- ═══════════════════════════════════════════════════════════
--  Shared Utilities for webcom_loadscreen
-- ═══════════════════════════════════════════════════════════

--- Generate a short unique ID (8 chars hex)
function GenerateElementId()
    local template = 'xxxxxxxx'
    return template:gsub('x', function()
        return string.format('%x', math.random(0, 15))
    end)
end

--- Deep-clone a table
function DeepCopy(orig)
    if type(orig) ~= 'table' then return orig end
    local copy = {}
    for k, v in pairs(orig) do
        copy[DeepCopy(k)] = DeepCopy(v)
    end
    return setmetatable(copy, getmetatable(orig))
end

--- Merge type-specific defaults with base defaults for an element type
function GetDefaultProps(elementType)
    local base = DeepCopy(DefaultBaseProps)
    local typeDefaults = DefaultTypeProps[elementType]
    if typeDefaults then
        for k, v in pairs(typeDefaults) do
            base[k] = v
        end
    end
    return base
end

--- Safe JSON decode that returns nil on failure
function SafeJsonDecode(str)
    if not str or str == '' then return nil end
    local ok, result = pcall(json.decode, str)
    if ok then return result end
    return nil
end

--- Safe JSON encode
function SafeJsonEncode(tbl)
    if not tbl then return '{}' end
    local ok, result = pcall(json.encode, tbl)
    if ok then return result end
    return '{}'
end
