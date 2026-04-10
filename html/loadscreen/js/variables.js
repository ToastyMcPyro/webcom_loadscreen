/* ═══════════════════════════════════════════════════════════
   variables.js – Dynamic Variable Resolution
   Replaces {placeholders} in text with actual server data
   ═══════════════════════════════════════════════════════════ */

const Variables = (() => {
    let _vars = {};
    let _progress = 0;
    let _currentResource = '';
    let _resourceCount = 0;

    function init(handoverVars) {
        _vars = handoverVars || {};
    }

    function setProgress(pct) {
        _progress = Math.min(100, Math.max(0, pct));
    }

    function getProgress() {
        return _progress;
    }

    function setCurrentResource(name) {
        _currentResource = name || '';
    }

    function getCurrentResource() {
        return _currentResource;
    }

    function setResourceCount(count) {
        _resourceCount = count;
    }

    function getResourceCount() {
        return _resourceCount;
    }

    function get(key) {
        return _vars[key] ?? '';
    }

    function getAll() {
        return { ..._vars, progress: _progress, currentResource: _currentResource, resourceCount: _resourceCount };
    }

    /** Replace all {variable} placeholders in text */
    function resolve(text) {
        if (!text || typeof text !== 'string') return text;

        return text.replace(/\{(\w+)\}/g, (match, key) => {
            if (key === 'progress') return Math.round(_progress);
            if (key === 'currentResource') return _currentResource;
            if (key === 'resourceCount') return _resourceCount;
            if (key === 'currentTime') {
                return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            if (key === 'currentDate') {
                return new Date().toLocaleDateString('de-DE');
            }
            return _vars[key] !== undefined ? _vars[key] : match;
        });
    }

    /** Get the value for a dynamic element type */
    function getDynamicValue(elementType) {
        const map = {
            server_name:       () => _vars.serverName || 'FiveM Server',
            player_count:      () => _vars.playerCount ?? '0',
            max_players:       () => _vars.maxPlayers ?? '48',
            server_ip:         () => _vars.serverIp || '',
            map_name:          () => _vars.mapName || 'FiveM',
            game_type:         () => _vars.gameType || '',
            queue_position:    () => _vars.queuePosition ?? '',
            loading_message:   () => _vars.loadingMessage || 'Loading resources...',
            server_uptime:     () => _vars.serverUptime || '',
            resource_count:    () => _resourceCount || _vars.resourceCount || '',
            current_resource:  () => _currentResource || '',
            current_time:      () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            current_date:      () => new Date().toLocaleDateString('de-DE'),
            player_name:       () => _vars.playerName || 'Player',
            player_avatar:     () => _vars.playerAvatar || '',
            player_id:         () => _vars.playerId || '',
            player_playtime:   () => _vars.playerPlaytime || '',
            player_last_login: () => _vars.playerLastLogin || '',
            player_rank:       () => _vars.playerRank || '',
            player_character:  () => _vars.playerCharacter || '',
            percentage_text:   () => Math.round(_progress) + '%',
        };

        const getter = map[elementType];
        return getter ? getter() : '';
    }

    return { init, setProgress, getProgress, setCurrentResource, getCurrentResource, setResourceCount, getResourceCount, get, getAll, resolve, getDynamicValue };
})();