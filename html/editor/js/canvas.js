/* ═══════════════════════════════════════════════════════════
   canvas.js – Canvas Viewport, Zoom, Pan & Grid
   ═══════════════════════════════════════════════════════════ */

const Canvas = (() => {
    let viewport, canvas, gridOverlay;
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let panOrigin = { x: 0, y: 0 };
    let spaceHeld = false;

    function init() {
        viewport = document.getElementById('canvas-viewport');
        canvas   = document.getElementById('canvas');
        gridOverlay = document.getElementById('canvas-grid');

        if (!viewport || !canvas) return;

        // Set canvas size from design
        const design = State.getDesign();
        if (design) {
            canvas.style.width  = (design.canvas_width  || 1920) + 'px';
            canvas.style.height = (design.canvas_height || 1080) + 'px';
            if (design.background_color) canvas.style.background = design.background_color;
        }

        _applyTransform();
        _bindEvents();
        fitToScreen();

        State.on('zoomChanged',  _applyTransform);
        State.on('panChanged',   _applyTransform);
        State.on('gridToggled',  _updateGrid);
        State.on('designLoaded', _onDesignLoaded);
    }

    function _onDesignLoaded() {
        const design = State.getDesign();
        if (design && canvas) {
            canvas.style.width  = (design.canvas_width  || 1920) + 'px';
            canvas.style.height = (design.canvas_height || 1080) + 'px';
            if (design.background_color) canvas.style.background = design.background_color;
        }
        fitToScreen();
    }

    function _bindEvents() {
        // Mouse wheel zoom – zoom toward cursor
        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const oldZoom = State.getZoom();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            const newZoom = Math.min(3, Math.max(0.1, oldZoom + delta));
            // Mouse position relative to viewport
            const rect = viewport.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            // Canvas point under cursor before zoom
            const pan = State.getPan();
            const cx = (mx - pan.x) / oldZoom;
            const cy = (my - pan.y) / oldZoom;
            // Adjust pan so same canvas point stays under cursor
            const newPanX = mx - cx * newZoom;
            const newPanY = my - cy * newZoom;
            State.setPan(newPanX, newPanY);
            State.setZoom(newZoom);
        }, { passive: false });

        // Pan via middle mouse, right mouse, or space+left mouse
        viewport.addEventListener('mousedown', (e) => {
            if (e.button === 1 || e.button === 2 || (e.button === 0 && spaceHeld)) {
                e.preventDefault();
                isPanning = true;
                panStart = { x: e.clientX, y: e.clientY };
                const p = State.getPan();
                panOrigin = { x: p.x, y: p.y };
                viewport.style.cursor = 'grabbing';
            }
        });

        // Prevent context menu on viewport so right-click drag works
        viewport.addEventListener('contextmenu', (e) => e.preventDefault());

        window.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            State.setPan(panOrigin.x + dx, panOrigin.y + dy);
        });

        window.addEventListener('mouseup', (e) => {
            if (isPanning) {
                isPanning = false;
                viewport.style.cursor = spaceHeld ? 'grab' : '';
            }
        });

        // Space key for pan mode
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                spaceHeld = true;
                viewport.style.cursor = 'grab';
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                spaceHeld = false;
                if (!isPanning) viewport.style.cursor = '';
            }
        });
    }

    function _applyTransform() {
        if (!canvas) return;
        const z = State.getZoom();
        const p = State.getPan();
        canvas.style.transform = `translate(${p.x}px, ${p.y}px) scale(${z})`;
        canvas.style.transformOrigin = '0 0';
    }

    function _updateGrid() {
        if (!gridOverlay) return;
        if (State.isGridVisible()) {
            gridOverlay.classList.add('visible');
        } else {
            gridOverlay.classList.remove('visible');
        }
    }

    /** Fit the canvas in the viewport with some padding */
    function fitToScreen() {
        if (!viewport || !canvas) return;
        const vw = viewport.clientWidth;
        const vh = viewport.clientHeight;
        const cw = parseInt(canvas.style.width) || 1920;
        const ch = parseInt(canvas.style.height) || 1080;
        const padding = 80;
        const scaleX = (vw - padding * 2) / cw;
        const scaleY = (vh - padding * 2) / ch;
        const z = Math.min(scaleX, scaleY, 1);
        const px = (vw - cw * z) / 2;
        const py = (vh - ch * z) / 2;
        State.setZoom(z);
        State.setPan(px, py);
    }

    /** Convert page coordinates to canvas coordinates */
    function pageToCanvas(px, py) {
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const z = State.getZoom();
        return {
            x: (px - rect.left) / z,
            y: (py - rect.top)  / z,
        };
    }

    function getCanvas()   { return canvas; }
    function getViewport() { return viewport; }

    return { init, fitToScreen, pageToCanvas, getCanvas, getViewport };
})();
