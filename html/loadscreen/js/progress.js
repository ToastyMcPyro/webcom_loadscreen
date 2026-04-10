/* ═══════════════════════════════════════════════════════════
   progress.js – Real Loading Progress Tracking
   Monitors FiveM loading events, tracks individual resources,
   and provides accurate progress percentage
   ═══════════════════════════════════════════════════════════ */

const Progress = (() => {
    let _count = 0;
    let _total = 0;
    let _percentage = 0;
    let _currentResource = '';
    let _resources = [];        // List of loaded resource names
    let _resourceSet = {};      // Fast dedup lookup
    let _listeners = [];
    let _resourceListeners = [];

    function init() {
        const handlers = {
            startInitFunctionOrder(data) {
                if (data.count) _total += data.count;
            },

            initFunctionInvoking(data) {
                _count++;
                // data.type is the category (e.g. INIT_CORE), NOT the resource name
                // data.name may contain resource info like "resource:xyz"
                if (data.name) {
                    const m = data.name.match(/^(?:resource:)?(\S+)/);
                    if (m && m[1] && !m[1].match(/^[\d.]+$/) && m[1].length > 1) {
                        _addResource(m[1]);
                    }
                }
                _update();
            },

            startDataFileEntries(data) {
                if (data.count) _total += data.count;
            },

            performMapLoadFunction(data) {
                _count++;
                _update();
            },

            loadProgress(data) {
                // FiveM sends loadFraction (0.0 – 1.0) during loading
                if (data.loadFraction !== undefined) {
                    const realPct = Math.round(data.loadFraction * 100);
                    // Use the higher value between calculated and native
                    if (realPct > _percentage) {
                        _percentage = Math.min(100, realPct);
                        Variables.setProgress(_percentage);
                        _listeners.forEach(fn => fn(_percentage));
                    }
                }
            },

            onLogLine(data) {
                if (data.message) {
                    // Match various FiveM resource loading log patterns
                    const match = data.message.match(/Loading resource\s+(\S+)/i)
                               || data.message.match(/Started resource\s+(\S+)/i)
                               || data.message.match(/Mounting (\S+)/i)
                               || data.message.match(/Loading script\s+(\S+)/i)
                               || data.message.match(/executing (?:server|client) script\s+@?(\S+)/i);
                    if (match && match[1]) {
                        // Clean up the resource name (remove trailing colons, slashes, etc.)
                        let name = match[1].replace(/[:/\\]+$/, '');
                        // Extract base resource name (e.g. "es_extended/server/main.lua" -> "es_extended")
                        if (name.includes('/')) name = name.split('/')[0];
                        // Skip purely numeric entries
                        if (name && !name.match(/^\d+$/) && name.length > 1) {
                            _addResource(name);
                        }
                    }
                }
                _count++;
                _update();
            },
        };

        window.addEventListener('message', (e) => {
            if (!e.data || !e.data.eventName) return;
            const handler = handlers[e.data.eventName];
            if (handler) handler(e.data);
        });
    }

    function _addResource(name) {
        if (!name || _resourceSet[name]) return;
        _resourceSet[name] = true;
        _resources.push(name);
        _currentResource = name;
        Variables.setCurrentResource(name);
        Variables.setResourceCount(_resources.length);
        _resourceListeners.forEach(fn => fn(name, _resources));
    }

    function _update() {
        if (_total <= 0) {
            _percentage = 0;
        } else {
            const calc = Math.min(100, Math.round((_count / _total) * 100));
            // Only increase, never decrease
            if (calc > _percentage) {
                _percentage = calc;
            }
        }
        Variables.setProgress(_percentage);
        _listeners.forEach(fn => fn(_percentage));
    }

    function onProgress(fn) {
        _listeners.push(fn);
    }

    function onResource(fn) {
        _resourceListeners.push(fn);
    }

    function getPercentage() {
        return _percentage;
    }

    function getCurrentResource() {
        return _currentResource;
    }

    function getResources() {
        return _resources;
    }

    return { init, onProgress, onResource, getPercentage, getCurrentResource, getResources };
})();