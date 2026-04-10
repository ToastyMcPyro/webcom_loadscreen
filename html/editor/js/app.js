/* ═══════════════════════════════════════════════════════════
   app.js – Main Bootstrap & Message Handler
   Initializes all modules, handles NUI messages from Lua,
   keyboard shortcuts, design list UI
   ═══════════════════════════════════════════════════════════ */

const App = (() => {
    let currentView = 'designs'; // 'designs' | 'editor'
    let initialized = false;

    function init() {
        if (initialized) return;
        initialized = true;

        // Listen for NUI messages from Lua client
        window.addEventListener('message', _onMessage);

        // Initialize modules
        I18n.init();
        MediaManager.init();
        Collaboration.init();
        Canvas.init();
        Palette.init();
        Properties.init();
        Toolbar.init();
        Layers.init();
        DragDrop.init();
        Resize.init();

        // Language toggle button
        const btnLang = document.getElementById('btn-lang');
        if (btnLang) {
            btnLang.textContent = I18n.getLang().toUpperCase();
            btnLang.addEventListener('click', () => {
                I18n.toggle();
                btnLang.textContent = I18n.getLang().toUpperCase();
            });
            I18n.onChange(() => {
                btnLang.textContent = I18n.getLang().toUpperCase();
                // Rebuild palette categories with new language
                Palette.init();
                // Rebuild properties panel
                Properties.init();
            });
        }

        // Keyboard shortcuts
        window.addEventListener('keydown', _onKeyDown);

        // Track mouse for collaboration cursor broadcast
        const viewport = Canvas.getViewport();
        if (viewport) {
            viewport.addEventListener('mousemove', _onCanvasMouseMove);
        }

        // Canvas element rendering
        State.on('elementAdded',   _onElementAdded);
        State.on('elementUpdated', _onElementUpdated);
        State.on('elementRemoved', _onElementRemoved);
        State.on('designLoaded',   _renderAllElements);
        State.on('elementsChanged', _renderAllElements);
        State.on('selectionChanged', _updateSelectionVisuals);

        // Design list overlay buttons
        const btnNew = document.getElementById('btn-new-design');
        if (btnNew) btnNew.addEventListener('click', _createNewDesign);
        const btnCloseOverlay = document.getElementById('btn-close-overlay');
        if (btnCloseOverlay) btnCloseOverlay.addEventListener('click', () => NUI.post('closeEditor', {}));
    }

    /* ══════════════════ NUI Message Handler ══════════════════ */

    function _onMessage(event) {
        const msg = event.data;
        if (!msg || !msg.action) return;

        switch (msg.action) {
            case 'openEditor':
                _show();
                _loadDesigns();
                break;

            case 'closeEditor':
                _hide();
                break;

            case 'receiveDesigns':
                if (msg.designs === null || msg.designs === undefined) {
                    // Server not ready yet — retry after delay
                    setTimeout(() => _loadDesigns(), 3000);
                    break;
                }
                if (msg.designs === false) {
                    // Permission denied
                    State.setDesigns([]);
                    _renderDesignList([], true);
                    break;
                }
                State.setDesigns(msg.designs || []);
                _renderDesignList(msg.designs || []);
                break;

            case 'receiveDesign':
                if (msg.design) _openDesign(msg.design);
                break;

            case 'designCreated':
                if (msg.design) {
                    _loadDesigns();
                    _openDesign(msg.design);
                }
                break;

            case 'designSaved':
                State.markClean();
                break;

            case 'designDeleted':
                _loadDesigns();
                break;

            case 'designDeployed':
                _loadDesigns();
                break;

            case 'designDuplicated':
                _loadDesigns();
                break;

            // Media events
            case 'mediaList':
                MediaManager.onMediaList(msg.files || {});
                break;
            case 'mediaUploaded':
                break;

            // Collaboration events
            case 'sessionState':
                Collaboration.onSessionState(msg);
                break;
            case 'editorJoined':
                Collaboration.onEditorJoined(msg);
                break;
            case 'editorLeft':
                Collaboration.onEditorLeft(msg);
                break;
            case 'cursorMoved':
                Collaboration.onCursorMoved(msg);
                break;
            case 'elementLocked':
                Collaboration.onElementLocked(msg);
                break;
            case 'elementUnlocked':
                Collaboration.onElementUnlocked(msg);
                break;
            case 'lockDenied':
                Collaboration.onLockDenied(msg);
                break;
            case 'elementOperation':
                Collaboration.onElementOperation(msg);
                break;
        }
    }

    /* ══════════════════ View Management ══════════════════ */

    function _show() {
        document.getElementById('editor-root')?.classList.remove('hidden');
    }

    function _hide() {
        document.getElementById('editor-root')?.classList.add('hidden');
        // Leave collaboration session
        const design = State.getDesign();
        if (design) NUI.post('leaveSession', { designId: design.id });
    }

    function showDesignList() {
        currentView = 'designs';
        document.getElementById('design-list-overlay').style.display = 'flex';
        _loadDesigns();
    }

    function hideDesignList() {
        document.getElementById('design-list-overlay').style.display = 'none';
        currentView = 'editor';
    }

    /* ══════════════════ Design List ══════════════════ */

    async function _loadDesigns() {
        await NUI.post('getDesigns', {});
    }

    function _renderDesignList(designs, noPermission) {
        const grid = document.getElementById('design-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (noPermission) {
            grid.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:rgba(255,255,255,0.4)"><i class="fa-solid fa-lock" style="font-size:40px;margin-bottom:12px"></i><br>Keine Berechtigung</div>';
            return;
        }

        // New design card
        const newCard = document.createElement('div');
        newCard.className = 'design-card new-design';
        newCard.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.4)"><i class="fa-solid fa-plus" style="font-size:32px;margin-bottom:8px"></i><span>Neues Design</span></div>`;
        newCard.addEventListener('click', _createNewDesign);
        grid.appendChild(newCard);

        designs.forEach(d => {
            const card = document.createElement('div');
            card.className = 'design-card' + (d.is_active ? ' active' : '');
            card.innerHTML = `
                <div class="design-card-preview" style="background:${d.background_color||'#0a0a0a'};height:120px;position:relative;overflow:hidden">
                    ${d.is_active ? '<span style="position:absolute;top:6px;right:6px;background:#10b981;color:#fff;font-size:10px;padding:2px 8px;border-radius:4px">AKTIV</span>' : ''}
                </div>
                <div class="card-body design-card-body">
                    <div class="card-title">${_escHtml(d.name || 'Unbenannt')}</div>
                    <div class="card-meta">
                        <span>${d.canvas_width||1920}×${d.canvas_height||1080}</span>
                    </div>
                    <div class="design-card-actions card-actions">
                        <button class="btn sm" data-action="open" data-id="${d.id}">Öffnen</button>
                        ${d.is_active
                            ? '<button class="btn sm warning" data-action="deactivate" data-id="' + d.id + '">Deaktivieren</button>'
                            : '<button class="btn sm success" data-action="deploy" data-id="' + d.id + '">Deploy</button>'
                        }
                        <button class="btn sm" data-action="duplicate" data-id="${d.id}">Duplizieren</button>
                        <button class="btn sm danger" data-action="delete" data-id="${d.id}">Löschen</button>
                    </div>
                </div>
            `;
            card.querySelector('[data-action="open"]').addEventListener('click', (e) => {
                e.stopPropagation();
                NUI.post('getDesign', { designId: d.id });
            });
            const deployBtn = card.querySelector('[data-action="deploy"]');
            if (deployBtn) {
                deployBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    NUI.post('deployDesign', { designId: d.id });
                    setTimeout(() => _loadDesigns(), 500);
                });
            }
            const deactivateBtn = card.querySelector('[data-action="deactivate"]');
            if (deactivateBtn) {
                deactivateBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    NUI.post('deactivateDesign', {});
                    setTimeout(() => _loadDesigns(), 500);
                });
            }
            card.querySelector('[data-action="duplicate"]').addEventListener('click', (e) => {
                e.stopPropagation();
                NUI.post('duplicateDesign', { designId: d.id });
            });
            card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Design wirklich löschen?')) {
                    NUI.post('deleteDesign', { designId: d.id });
                }
            });
            grid.appendChild(card);
        });
    }

    async function _createNewDesign() {
        await NUI.post('createDesign', {
            name: 'Neues Design',
            canvas_width: 1920,
            canvas_height: 1080,
            background_color: '#0a0a0a',
        });
    }

    function _openDesign(design) {
        // Parse elements if string
        if (typeof design.elements === 'string') {
            try { design.elements = JSON.parse(design.elements); } catch(e) { design.elements = []; }
        }
        State.setDesign(design);
        hideDesignList();
        History.push();

        // Join collaboration session
        NUI.post('joinSession', { designId: design.id });
    }

    /* ══════════════════ Canvas Element Rendering ══════════════════ */

    function _renderAllElements() {
        const canvas = Canvas.getCanvas();
        if (!canvas) return;
        // Remove old elements
        canvas.querySelectorAll('.canvas-element').forEach(el => el.remove());
        // Render all
        const elements = State.getElements();
        const sorted = [...elements].sort((a, b) => (a.props.zIndex || 0) - (b.props.zIndex || 0));
        sorted.forEach(el => {
            const dom = Elements.renderDom(el);
            canvas.appendChild(dom);
        });
        _updateSelectionVisuals();
    }

    function _onElementAdded(el) {
        const canvas = Canvas.getCanvas();
        if (!canvas) return;
        const dom = Elements.renderDom(el);
        canvas.appendChild(dom);
    }

    function _onElementUpdated(data) {
        const canvas = Canvas.getCanvas();
        if (!canvas) return;
        const dom = canvas.querySelector(`.canvas-element[data-id="${data.id}"]`);
        const el = State.getElementById(data.id);
        if (dom && el) Elements.updateDom(dom, el);
    }

    function _onElementRemoved(id) {
        const canvas = Canvas.getCanvas();
        if (!canvas) return;
        const dom = canvas.querySelector(`.canvas-element[data-id="${id}"]`);
        if (dom) dom.remove();
    }

    function _updateSelectionVisuals() {
        const canvas = Canvas.getCanvas();
        if (!canvas) return;
        const selectedIds = State.getSelectedIds();
        canvas.querySelectorAll('.canvas-element').forEach(dom => {
            dom.classList.toggle('selected', selectedIds.includes(dom.dataset.id));
        });
    }

    /* ══════════════════ Keyboard Shortcuts ══════════════════ */

    function _onKeyDown(e) {
        // Don't intercept when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

        const ctrl = e.ctrlKey || e.metaKey;

        // Ctrl+Z – Undo
        if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); History.undo(); }
        // Ctrl+Shift+Z or Ctrl+Y – Redo
        if ((ctrl && e.key === 'z' && e.shiftKey) || (ctrl && e.key === 'y')) { e.preventDefault(); History.redo(); }
        // Ctrl+S – Save
        if (ctrl && e.key === 's') { e.preventDefault(); document.getElementById('btn-save')?.click(); }
        // Ctrl+C – Copy
        if (ctrl && e.key === 'c') { e.preventDefault(); State.copySelected(); }
        // Ctrl+V – Paste
        if (ctrl && e.key === 'v') { e.preventDefault(); _paste(); }
        // Ctrl+D – Duplicate
        if (ctrl && e.key === 'd') { e.preventDefault(); _duplicateSelected(); }
        // Ctrl+A – Select all
        if (ctrl && e.key === 'a') { e.preventDefault(); State.setSelection(State.getElements().map(e => e.id)); }
        // Delete / Backspace – Remove
        if (e.key === 'Delete' || e.key === 'Backspace') { _deleteSelected(); }
        // Escape – Deselect or close overlay
        if (e.key === 'Escape') {
            if (document.getElementById('preview-overlay').style.display === 'flex') {
                document.getElementById('preview-overlay').style.display = 'none';
            } else if (State.getSelectedIds().length > 0) {
                State.clearSelection();
            }
        }
        // Arrow keys – nudge
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const selected = State.getSelectedElements();
            selected.forEach(el => {
                const dX = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
                const dY = e.key === 'ArrowUp'   ? -step : e.key === 'ArrowDown'  ? step : 0;
                State.updateElement(el.id, { x: (el.props.x||0) + dX, y: (el.props.y||0) + dY });
            });
            History.push();
        }
    }

    function _paste() {
        const clipboard = State.getClipboard();
        if (!clipboard || clipboard.length === 0) return;
        const newIds = [];
        clipboard.forEach(el => {
            const newEl = Elements.create(el.type, { ...el.props, x: (el.props.x||0) + 20, y: (el.props.y||0) + 20 });
            State.addElement(newEl);
            newIds.push(newEl.id);
        });
        State.setSelection(newIds);
        History.push();
    }

    function _duplicateSelected() {
        const selected = State.getSelectedElements();
        if (selected.length === 0) return;
        const newIds = [];
        selected.forEach(el => {
            const newEl = Elements.create(el.type, { ...el.props, x: (el.props.x||0) + 20, y: (el.props.y||0) + 20 });
            State.addElement(newEl);
            newIds.push(newEl.id);
        });
        State.setSelection(newIds);
        History.push();
    }

    function _deleteSelected() {
        const ids = State.getSelectedIds();
        if (ids.length === 0) return;
        ids.forEach(id => State.removeElement(id));
        State.clearSelection();
        History.push();
    }

    /* ══════════════════ Collaboration Mouse ══════════════════ */

    let _lastCursorBroadcast = 0;
    function _onCanvasMouseMove(e) {
        const now = Date.now();
        if (now - _lastCursorBroadcast < 200) return;
        _lastCursorBroadcast = now;
        const pos = Canvas.pageToCanvas(e.clientX, e.clientY);
        NUI.post('cursorMove', { x: Math.round(pos.x), y: Math.round(pos.y) });
    }

    /* ══════════════════ Utilities ══════════════════ */

    function _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { init, showDesignList, hideDesignList };
})();

// Auto-init when DOM loaded
document.addEventListener('DOMContentLoaded', () => App.init());
