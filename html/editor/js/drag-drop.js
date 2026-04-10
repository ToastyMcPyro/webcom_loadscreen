/* ═══════════════════════════════════════════════════════════
   drag-drop.js – Drag & Drop Interactions
   - Drag from palette to canvas (create element)
   - Drag to move elements on canvas
   - Multi-select drag
   - Snap to grid
   ═══════════════════════════════════════════════════════════ */

const DragDrop = (() => {
    let isDragging = false;
    let dragTarget  = null;
    let dragOffsets = [];
    let startPositions = [];

    const GRID_SNAP = 10;

    function init() {
        const canvas   = Canvas.getCanvas();
        const viewport = Canvas.getViewport();
        if (!canvas || !viewport) return;

        // Drop from palette onto canvas
        viewport.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        viewport.addEventListener('drop', (e) => {
            e.preventDefault();
            const typeId = e.dataTransfer.getData('text/plain');
            if (!typeId) return;
            const pos = Canvas.pageToCanvas(e.clientX, e.clientY);
            const defaults = Elements.TYPE_DEFAULTS[typeId] || {};
            const w = defaults.width  || 200;
            const h = defaults.height || 100;
            const el = Elements.create(typeId, {
                x: Math.round(pos.x - w / 2),
                y: Math.round(pos.y - h / 2),
            });
            State.addElement(el);
            History.push();
            State.setSelection([el.id]);
        });

        // Mouse-based drag to move elements on canvas
        canvas.addEventListener('mousedown', _onMouseDown);
        window.addEventListener('mousemove', _onMouseMove);
        window.addEventListener('mouseup',   _onMouseUp);
    }

    function _onMouseDown(e) {
        if (e.button !== 0) return;
        const elDom = e.target.closest('.canvas-element');
        if (!elDom) {
            // Clicked on empty canvas — deselect
            if (!e.shiftKey && !e.ctrlKey) State.clearSelection();
            return;
        }

        const elId = elDom.dataset.id;
        const el = State.getElementById(elId);
        if (!el || el.props.locked) return;

        // Prevent native browser drag (prohibition sign)
        e.preventDefault();

        // Select if not already
        const selectedIds = State.getSelectedIds();
        if (!selectedIds.includes(elId)) {
            if (e.ctrlKey || e.metaKey) {
                State.addToSelection(elId);
            } else {
                State.setSelection([elId]);
            }
        }

        // Start drag
        isDragging  = true;
        dragTarget  = elId;
        const zoom  = State.getZoom();
        const selected = State.getSelectedElements();
        dragOffsets = selected.map(sel => ({
            id: sel.id,
            ox: e.clientX / zoom - (sel.props.x || 0),
            oy: e.clientY / zoom - (sel.props.y || 0),
        }));
        startPositions = selected.map(sel => ({
            id: sel.id,
            x: sel.props.x || 0,
            y: sel.props.y || 0,
        }));

        e.stopPropagation();
    }

    function _onMouseMove(e) {
        if (!isDragging) return;
        const zoom = State.getZoom();

        dragOffsets.forEach(off => {
            let newX = e.clientX / zoom - off.ox;
            let newY = e.clientY / zoom - off.oy;

            // Snap to grid
            if (State.isGridVisible()) {
                newX = Math.round(newX / GRID_SNAP) * GRID_SNAP;
                newY = Math.round(newY / GRID_SNAP) * GRID_SNAP;
            }

            State.updateElement(off.id, { x: newX, y: newY });
        });
    }

    function _onMouseUp(e) {
        if (!isDragging) return;

        // Check if position actually changed
        const selected = State.getSelectedElements();
        const moved = selected.some((sel, i) => {
            const start = startPositions[i];
            return start && (sel.props.x !== start.x || sel.props.y !== start.y);
        });
        if (moved) {
            History.push();
            // Notify collaboration
            selected.forEach(sel => {
                NUI.post('elementOperation', {
                    elementId: sel.id,
                    operation: 'move',
                    data: { x: sel.props.x, y: sel.props.y },
                });
            });
        }

        isDragging   = false;
        dragTarget   = null;
        dragOffsets  = [];
        startPositions = [];
    }

    return { init };
})();
