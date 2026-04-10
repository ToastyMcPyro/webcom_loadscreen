/* ═══════════════════════════════════════════════════════════
   state.js – Central State Management
   ═══════════════════════════════════════════════════════════ */

const State = (() => {
    let _design = null;       // Current loaded design
    let _elements = [];       // Elements array of the current design
    let _selectedIds = [];    // Currently selected element IDs
    let _clipboard = null;    // Copied elements
    let _dirty = false;       // Unsaved changes
    let _designs = [];        // All designs list
    let _zoom = 1;
    let _panX = 0;
    let _panY = 0;
    let _gridVisible = false;
    let _listeners = {};

    // ─── Event System ────────────────────────────────────

    function on(event, fn) {
        if (!_listeners[event]) _listeners[event] = [];
        _listeners[event].push(fn);
    }

    function emit(event, data) {
        (_listeners[event] || []).forEach(fn => fn(data));
    }

    // ─── Design ──────────────────────────────────────────

    function setDesign(design) {
        _design = design;
        _elements = design ? (design.elements || []) : [];
        _selectedIds = [];
        _dirty = false;
        emit('designLoaded', design);
    }

    function getDesign() { return _design; }

    function setDesigns(list) {
        _designs = list || [];
        emit('designsLoaded', _designs);
    }

    function getDesigns() { return _designs; }

    // ─── Elements ────────────────────────────────────────

    function getElements() { return _elements; }

    function getElementById(id) {
        return _elements.find(el => el.id === id);
    }

    function addElement(el) {
        _elements.push(el);
        _dirty = true;
        emit('elementAdded', el);
        emit('elementsChanged', _elements);
    }

    function updateElement(id, props) {
        const el = getElementById(id);
        if (!el) return;
        Object.assign(el.props, props);
        _dirty = true;
        emit('elementUpdated', { id, props });
        emit('elementsChanged', _elements);
    }

    function removeElement(id) {
        const idx = _elements.findIndex(el => el.id === id);
        if (idx === -1) return;
        const removed = _elements.splice(idx, 1)[0];
        _selectedIds = _selectedIds.filter(sid => sid !== id);
        _dirty = true;
        emit('elementRemoved', removed);
        emit('elementsChanged', _elements);
    }

    function setElements(els) {
        _elements = els;
        _dirty = true;
        emit('elementsChanged', _elements);
    }

    function reorderElement(id, delta) {
        const idx = _elements.findIndex(el => el.id === id);
        if (idx === -1) return;
        const newIdx = Math.max(0, Math.min(_elements.length - 1, idx + delta));
        if (newIdx === idx) return;
        const [el] = _elements.splice(idx, 1);
        _elements.splice(newIdx, 0, el);
        // Update zIndex for all
        _elements.forEach((e, i) => { e.props.zIndex = i + 1; });
        _dirty = true;
        emit('elementsChanged', _elements);
    }

    // ─── Selection ───────────────────────────────────────

    function getSelectedIds() { return [..._selectedIds]; }

    function getSelectedElements() {
        return _selectedIds.map(id => getElementById(id)).filter(Boolean);
    }

    function setSelection(ids) {
        _selectedIds = Array.isArray(ids) ? ids : [ids];
        emit('selectionChanged', _selectedIds);
    }

    function addToSelection(id) {
        if (!_selectedIds.includes(id)) {
            _selectedIds.push(id);
            emit('selectionChanged', _selectedIds);
        }
    }

    function clearSelection() {
        _selectedIds = [];
        emit('selectionChanged', _selectedIds);
    }

    function isSelected(id) {
        return _selectedIds.includes(id);
    }

    // ─── Clipboard ───────────────────────────────────────

    function copy() {
        const els = getSelectedElements();
        if (els.length === 0) return;
        _clipboard = els.map(el => JSON.parse(JSON.stringify(el)));
    }

    function getClipboard() { return _clipboard; }

    // ─── Zoom / Pan ──────────────────────────────────────

    function setZoom(z) { _zoom = z; emit('zoomChanged', _zoom); }
    function getZoom() { return _zoom; }
    function setPan(x, y) { _panX = x; _panY = y; emit('panChanged', { x: _panX, y: _panY }); }
    function getPan() { return { x: _panX, y: _panY }; }

    // ─── Grid ────────────────────────────────────────────

    function toggleGrid() { _gridVisible = !_gridVisible; emit('gridToggled', _gridVisible); }
    function isGridVisible() { return _gridVisible; }

    // ─── Dirty State ─────────────────────────────────────

    function isDirty() { return _dirty; }
    function markClean() { _dirty = false; emit('dirtyChanged', false); }
    function markDirty() { _dirty = true; emit('dirtyChanged', true); }

    return {
        on, emit,
        setDesign, getDesign, setDesigns, getDesigns,
        getElements, getElementById, addElement, updateElement,
        removeElement, setElements, reorderElement,
        getSelectedIds, getSelectedElements, setSelection,
        addToSelection, clearSelection, isSelected,
        copy, getClipboard,
        setZoom, getZoom, setPan, getPan,
        toggleGrid, isGridVisible,
        isDirty, markClean, markDirty,
    };
})();
