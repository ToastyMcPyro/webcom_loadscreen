/* ═══════════════════════════════════════════════════════════
   nui-bridge.js – Communication layer between NUI and Lua
   ═══════════════════════════════════════════════════════════ */

const NUI = (() => {
    function post(action, data = {}) {
        return fetch(`https://${GetParentResourceName()}/` + action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).catch(() => {});
    }

    function GetParentResourceName() {
        return window.__resourceName || 'webcom_loadscreen';
    }

    // Expose globally for convenience
    window.GetParentResourceName = GetParentResourceName;

    // Listen for resource name from FiveM
    window.addEventListener('message', (e) => {
        if (e.data && e.data.__resourceName) {
            window.__resourceName = e.data.__resourceName;
        }
    });

    return { post };
})();
