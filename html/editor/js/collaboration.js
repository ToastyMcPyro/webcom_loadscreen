/* ═══════════════════════════════════════════════════════════
   collaboration.js – Remote Cursor & Lock Visuals
   ═══════════════════════════════════════════════════════════ */

const Collaboration = (() => {
    let cursorLayer, collabContainer;
    const remoteCursors = {};
    const remoteLocks   = {};
    const CURSOR_COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'];
    let myId = null;

    function init() {
        cursorLayer     = document.getElementById('cursor-layer');
        collabContainer = document.getElementById('collaborators');
    }

    /** Called when server sends session state on join */
    function onSessionState(data) {
        myId = data.yourId;
        // Render existing editors (object keyed by source id)
        if (data.editors) {
            Object.entries(data.editors).forEach(([id, ed]) => {
                if (id !== myId) _addCursor(id, ed.name, ed.color);
            });
        }
        // Render existing locks
        if (data.locks) {
            Object.entries(data.locks).forEach(([elId, lock]) => {
                _showLock(elId, lock.name, lock.color);
            });
        }
        _updateCollaboratorBar();
    }

    function onEditorJoined(data) {
        const id = String(data.src);
        const ed = data.editor || {};
        _addCursor(id, ed.name, ed.color);
        _updateCollaboratorBar();
    }

    function onEditorLeft(data) {
        _removeCursor(String(data.src));
        // Remove locks by this editor
        const leftId = String(data.src);
        Object.keys(remoteLocks).forEach(elId => {
            if (remoteLocks[elId] && remoteLocks[elId].editorId === leftId) {
                _hideLock(elId);
            }
        });
        _updateCollaboratorBar();
    }

    function onCursorMoved(data) {
        if (!remoteCursors[data.src]) return;
        const dom = remoteCursors[data.src].dom;
        dom.style.left = data.x + 'px';
        dom.style.top  = data.y + 'px';
    }

    function onElementLocked(data) {
        _showLock(data.elementId, data.name, data.color);
    }

    function onElementUnlocked(data) {
        _hideLock(data.elementId);
    }

    function onLockDenied(data) {
        // Brief visual feedback
        const el = document.querySelector(`.canvas-element[data-id="${data.elementId}"]`);
        if (el) {
            el.style.outline = '2px solid #ef4444';
            setTimeout(() => { el.style.outline = ''; }, 800);
        }
    }

    function onElementOperation(data) {
        // Remote user changed an element — apply to state
        const el = State.getElementById(data.elementId);
        if (!el) return;
        if (data.operation === 'move' || data.operation === 'resize' || data.operation === 'update') {
            State.updateElement(data.elementId, data.data);
        } else if (data.operation === 'delete') {
            State.removeElement(data.elementId);
        } else if (data.operation === 'add') {
            State.addElement(data.data);
        }
    }

    /* ── Internal ── */

    function _addCursor(id, name, color) {
        if (remoteCursors[id]) return;
        const dom = document.createElement('div');
        dom.className = 'remote-cursor';
        dom.style.cssText = `position:absolute;pointer-events:none;z-index:999998;transition:left 0.15s,top 0.15s;`;
        dom.innerHTML = `
            <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
                <path d="M1 1L15 11L8 12L5 21L1 1Z" fill="${color}" stroke="#fff" stroke-width="1"/>
            </svg>
            <span class="cursor-name-badge" style="background:${color}">${name}</span>
        `;
        if (cursorLayer) cursorLayer.appendChild(dom);
        remoteCursors[id] = { dom, name, color };
    }

    function _removeCursor(id) {
        if (remoteCursors[id]) {
            remoteCursors[id].dom.remove();
            delete remoteCursors[id];
        }
    }

    function _showLock(elId, name, color) {
        const elDom = document.querySelector(`.canvas-element[data-id="${elId}"]`);
        if (elDom) {
            elDom.classList.add('locked-by-other');
            elDom.style.setProperty('--lock-color', color || '#f59e0b');
            // Add lock badge if not already
            if (!elDom.querySelector('.lock-badge')) {
                const badge = document.createElement('div');
                badge.className = 'lock-badge';
                badge.style.cssText = `position:absolute;top:-18px;left:0;font-size:10px;background:${color};color:#fff;padding:1px 6px;border-radius:4px;white-space:nowrap;z-index:9999;pointer-events:none;`;
                badge.textContent = '🔒 ' + name;
                elDom.appendChild(badge);
            }
        }
        remoteLocks[elId] = { name, color, editorId: null };
    }

    function _hideLock(elId) {
        const elDom = document.querySelector(`.canvas-element[data-id="${elId}"]`);
        if (elDom) {
            elDom.classList.remove('locked-by-other');
            const badge = elDom.querySelector('.lock-badge');
            if (badge) badge.remove();
        }
        delete remoteLocks[elId];
    }

    function _updateCollaboratorBar() {
        if (!collabContainer) return;
        collabContainer.innerHTML = '';
        Object.values(remoteCursors).forEach(c => {
            const av = document.createElement('div');
            av.className = 'collaborator-avatar';
            av.style.background = c.color;
            av.textContent = c.name[0].toUpperCase();
            av.title = c.name;
            collabContainer.appendChild(av);
        });
    }

    return {
        init, onSessionState, onEditorJoined, onEditorLeft,
        onCursorMoved, onElementLocked, onElementUnlocked,
        onLockDenied, onElementOperation,
    };
})();
