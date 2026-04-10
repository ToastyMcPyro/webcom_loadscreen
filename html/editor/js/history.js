/* ═══════════════════════════════════════════════════════════
   history.js – Undo/Redo Stack
   ═══════════════════════════════════════════════════════════ */

const History = (() => {
    let _undoStack = [];
    let _redoStack = [];
    const MAX_HISTORY = 50;

    function push() {
        const snapshot = JSON.stringify(State.getElements());
        _undoStack.push(snapshot);
        if (_undoStack.length > MAX_HISTORY) _undoStack.shift();
        _redoStack = [];
        _updateButtons();
    }

    function undo() {
        if (_undoStack.length === 0) return;
        const current = JSON.stringify(State.getElements());
        _redoStack.push(current);
        const prev = _undoStack.pop();
        State.setElements(JSON.parse(prev));
        _updateButtons();
    }

    function redo() {
        if (_redoStack.length === 0) return;
        const current = JSON.stringify(State.getElements());
        _undoStack.push(current);
        const next = _redoStack.pop();
        State.setElements(JSON.parse(next));
        _updateButtons();
    }

    function clear() {
        _undoStack = [];
        _redoStack = [];
        _updateButtons();
    }

    function _updateButtons() {
        const undoBtn = document.getElementById('btn-undo');
        const redoBtn = document.getElementById('btn-redo');
        if (undoBtn) undoBtn.disabled = _undoStack.length === 0;
        if (redoBtn) redoBtn.disabled = _redoStack.length === 0;
    }

    function canUndo() { return _undoStack.length > 0; }
    function canRedo() { return _redoStack.length > 0; }

    return { push, undo, redo, clear, canUndo, canRedo };
})();
