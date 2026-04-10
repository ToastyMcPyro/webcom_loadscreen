/* ═══════════════════════════════════════════════════════════
    resize.js – Resize Handles & Rotation
    8-directional resize, proportional corner resize,
   rotation handle
   ═══════════════════════════════════════════════════════════ */

const Resize = (() => {
    const HANDLES = ['nw','n','ne','e','se','s','sw','w'];
    let handleElements = {};
    let rotateHandle   = null;
    let activeHandle   = null;
    let isResizing     = false;
    let isRotating     = false;
    let startRect      = null;
    let startMouse     = null;
    let targetId       = null;

    function init() {
        const canvas = Canvas.getCanvas();
        if (!canvas) return;

        // Create resize handles container (appended to canvas)
        const container = document.createElement('div');
        container.id = 'resize-handles';
        container.style.cssText = 'position:absolute;pointer-events:none;display:none;z-index:999999;';
        canvas.appendChild(container);

        HANDLES.forEach(pos => {
            const h = document.createElement('div');
            h.className = 'resize-handle resize-' + pos;
            h.dataset.handle = pos;
            h.style.pointerEvents = 'auto';
            h.addEventListener('mousedown', (e) => _startResize(e, pos));
            container.appendChild(h);
            handleElements[pos] = h;
        });

        // Rotation handle
        rotateHandle = document.createElement('div');
        rotateHandle.className = 'rotation-handle';
        rotateHandle.style.pointerEvents = 'auto';
        rotateHandle.innerHTML = '<i class="fa-solid fa-rotate" style="font-size:10px"></i>';
        rotateHandle.addEventListener('mousedown', _startRotation);
        container.appendChild(rotateHandle);

        window.addEventListener('mousemove', _onMouseMove);
        window.addEventListener('mouseup', _onMouseUp);

        State.on('selectionChanged', _updateHandles);
        State.on('elementUpdated',   _updateHandles);
    }

    function _updateHandles() {
        const container = document.getElementById('resize-handles');
        if (!container) return;

        const selected = State.getSelectedElements();
        if (selected.length !== 1) {
            container.style.display = 'none';
            return;
        }

        const el = selected[0];
        if (el.props.locked) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.style.left   = (el.props.x || 0) + 'px';
        container.style.top    = (el.props.y || 0) + 'px';
        container.style.width  = (el.props.width || 200) + 'px';
        container.style.height = (el.props.height || 100) + 'px';
        container.style.transform = el.props.rotation ? `rotate(${el.props.rotation}deg)` : '';
    }

    function _startResize(e, handle) {
        e.stopPropagation();
        e.preventDefault();
        const selected = State.getSelectedElements();
        if (selected.length !== 1) return;

        const el = selected[0];
        activeHandle = handle;
        isResizing   = true;
        targetId     = el.id;
        startRect    = { x: el.props.x||0, y: el.props.y||0, w: el.props.width||200, h: el.props.height||100 };
        startMouse   = { x: e.clientX, y: e.clientY };
    }

    function _startRotation(e) {
        e.stopPropagation();
        e.preventDefault();
        const selected = State.getSelectedElements();
        if (selected.length !== 1) return;

        const el = selected[0];
        isRotating = true;
        targetId   = el.id;
        startRect  = { x: el.props.x||0, y: el.props.y||0, w: el.props.width||200, h: el.props.height||100, r: el.props.rotation||0 };
        startMouse = { x: e.clientX, y: e.clientY };
    }

    function _onMouseMove(e) {
        if (isResizing) _doResize(e);
        if (isRotating) _doRotate(e);
    }

    function _doResize(e) {
        const zoom = State.getZoom();
        const dx = (e.clientX - startMouse.x) / zoom;
        const dy = (e.clientY - startMouse.y) / zoom;
        const h  = activeHandle;
        const r  = { ...startRect };
        const isCornerHandle = h.length === 2;

        // Resize based on handle direction
        if (h.includes('e'))  r.w += dx;
        if (h.includes('w'))  { r.x += dx; r.w -= dx; }
        if (h.includes('s'))  r.h += dy;
        if (h.includes('n'))  { r.y += dy; r.h -= dy; }

        // Corner handles resize proportionally by default.
        // Edge handles keep the previous Shift-to-lock behavior.
        if ((isCornerHandle || e.shiftKey) && startRect.w > 0 && startRect.h > 0) {
            const aspect = startRect.w / startRect.h;

            if (isCornerHandle) {
                const widthDelta = h.includes('w') ? -dx : dx;
                const heightDelta = h.includes('n') ? -dy : dy;
                const widthRatio = startRect.w !== 0 ? Math.abs(widthDelta / startRect.w) : 0;
                const heightRatio = startRect.h !== 0 ? Math.abs(heightDelta / startRect.h) : 0;

                if (widthRatio >= heightRatio) {
                    r.w = startRect.w + widthDelta;
                    r.h = r.w / aspect;
                } else {
                    r.h = startRect.h + heightDelta;
                    r.w = r.h * aspect;
                }

                if (h.includes('w')) {
                    r.x = startRect.x + (startRect.w - r.w);
                }
                if (h.includes('n')) {
                    r.y = startRect.y + (startRect.h - r.h);
                }
            } else if (['n','s'].includes(h)) {
                r.w = r.h * aspect;
            } else if (['e','w'].includes(h)) {
                r.h = r.w / aspect;
            }
        }

        // Minimum size
        if (r.w < 10) {
            r.w = 10;
            if (h.includes('w')) {
                r.x = startRect.x + (startRect.w - r.w);
            }
        }
        if (r.h < 10) {
            r.h = 10;
            if (h.includes('n')) {
                r.y = startRect.y + (startRect.h - r.h);
            }
        }

        State.updateElement(targetId, {
            x: Math.round(r.x),
            y: Math.round(r.y),
            width: Math.round(r.w),
            height: Math.round(r.h),
        });
    }

    function _doRotate(e) {
        const el = State.getElementById(targetId);
        if (!el) return;

        // Calculate center of element in screen space
        const canvas = Canvas.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const zoom = State.getZoom();
        const pan  = State.getPan();
        const cx = rect.left + (el.props.x + el.props.width / 2)  * zoom;
        const cy = rect.top  + (el.props.y + el.props.height / 2) * zoom;

        // Angle from center to mouse
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90;
        let rounded = Math.round(angle);

        // Snap to 15-degree increments with Shift
        if (e.shiftKey) {
            rounded = Math.round(rounded / 15) * 15;
        }

        State.updateElement(targetId, { rotation: rounded });
    }

    function _onMouseUp() {
        if (isResizing || isRotating) {
            History.push();
            isResizing = false;
            isRotating = false;
            activeHandle = null;
            targetId = null;
        }
    }

    return { init };
})();
