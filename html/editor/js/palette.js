/* ═══════════════════════════════════════════════════════════
   palette.js – Element Palette Panel
   Categories with items, search, drag-start
   ═══════════════════════════════════════════════════════════ */

const Palette = (() => {
    let paletteEl, searchInput;
    let expandedCategory = null;

    function init() {
        paletteEl   = document.getElementById('palette-categories');
        searchInput = document.getElementById('palette-search');
        if (!paletteEl) return;

        _render();

        if (searchInput) {
            searchInput.addEventListener('input', _onSearch);
        }
    }

    function _render(filter) {
        paletteEl.innerHTML = '';
        const categories = Elements.getCategories();

        categories.forEach(cat => {
            const types = Elements.getTypesByCategory(cat.id);
            const filtered = filter
                ? types.filter(t => t.label.toLowerCase().includes(filter) || t.id.toLowerCase().includes(filter))
                : types;
            if (filter && filtered.length === 0) return;

            const catDiv = document.createElement('div');
            catDiv.className = 'palette-category';

            // Header
            const header = document.createElement('div');
            header.className = 'palette-category-header';
            const isOpen = filter ? true : expandedCategory === cat.id;
            header.innerHTML = `
                <span><i class="fa-solid ${cat.icon}" style="margin-right:6px;opacity:0.6"></i> ${I18n.t('cat.' + cat.id) || cat.label}
                <span style="opacity:0.4;font-size:11px;margin-left:4px">(${filtered.length})</span></span>
                <i class="fa-solid ${isOpen ? 'fa-chevron-down' : 'fa-chevron-right'}" style="font-size:10px;opacity:0.4"></i>
            `;
            header.addEventListener('click', () => {
                expandedCategory = expandedCategory === cat.id ? null : cat.id;
                _render(filter);
            });
            catDiv.appendChild(header);

            // Items
            if (isOpen) {
                const items = document.createElement('div');
                items.className = 'palette-items';
                filtered.forEach(t => {
                    const item = document.createElement('div');
                    item.className = 'palette-item';
                    item.dataset.type = t.id;
                    item.draggable = true;
                    const elLabel = I18n.S['el.' + t.id] ? I18n.t('el.' + t.id) : t.label;
                    item.innerHTML = `<i class="fa-solid ${t.icon}"></i><span>${elLabel}</span>`;

                    // Drag start
                    item.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', t.id);
                        e.dataTransfer.effectAllowed = 'copy';
                    });

                    // Double-click to add at center
                    item.addEventListener('dblclick', () => {
                        _addElementAtCenter(t.id);
                    });

                    items.appendChild(item);
                });
                catDiv.appendChild(items);
            }

            paletteEl.appendChild(catDiv);
        });
    }

    function _onSearch() {
        const val = searchInput.value.trim().toLowerCase();
        _render(val || undefined);
    }

    function _addElementAtCenter(typeId) {
        const canvas = Canvas.getCanvas();
        if (!canvas) return;
        const el = Elements.create(typeId, {
            x: (parseInt(canvas.style.width)  || 1920) / 2 - 100,
            y: (parseInt(canvas.style.height) || 1080) / 2 - 50,
        });
        State.addElement(el);
        History.push();
        State.setSelection([el.id]);
    }

    return { init };
})();
