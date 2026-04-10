/* ═══════════════════════════════════════════════════════════
   layers.js – Layer Panel Management
   Rendered list of elements, selection, visibility, lock,
   reorder, delete
   ═══════════════════════════════════════════════════════════ */

const Layers = (() => {
    let container;

    function init() {
        container = document.getElementById('layers-list');
        State.on('elementsChanged', _render);
        State.on('elementAdded',    _render);
        State.on('elementRemoved',  _render);
        State.on('elementUpdated',  _render);
        State.on('selectionChanged', _updateSelection);
    }

    function _render() {
        if (!container) return;
        container.innerHTML = '';

        const elements = State.getElements();
        const selectedIds = State.getSelectedIds();

        // Reverse order so top zIndex is first in the panel
        const sorted = [...elements].sort((a, b) => (b.props.zIndex || 0) - (a.props.zIndex || 0));

        sorted.forEach(el => {
            const typeInfo = Elements.getTypeInfo(el.type);
            const isSelected = selectedIds.includes(el.id);

            const item = document.createElement('div');
            item.className = 'layer-item' + (isSelected ? ' selected' : '');
            item.dataset.id = el.id;

            // Icon
            const icon = document.createElement('i');
            icon.className = 'fa-solid ' + (typeInfo ? typeInfo.icon : 'fa-cube');
            icon.classList.add('layer-icon');

            // Name
            const name = document.createElement('span');
            name.className = 'layer-name';
            name.textContent = el.props.text
                ? (typeInfo ? typeInfo.label : el.type) + ': ' + (el.props.text || '').substring(0, 16)
                : (typeInfo ? typeInfo.label : el.type);
            name.title = el.id;

            // Actions
            const actions = document.createElement('div');
            actions.className = 'layer-actions';

            // Visibility toggle
            const vis = document.createElement('button');
            vis.className = 'layer-action-btn';
            vis.innerHTML = el.props.visible === false
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';
            vis.title = 'Sichtbarkeit';
            vis.addEventListener('click', (e) => {
                e.stopPropagation();
                State.updateElement(el.id, { visible: el.props.visible === false ? true : false });
                History.push();
            });

            // Lock toggle
            const lock = document.createElement('button');
            lock.className = 'layer-action-btn';
            lock.innerHTML = el.props.locked
                ? '<i class="fa-solid fa-lock"></i>'
                : '<i class="fa-solid fa-lock-open"></i>';
            lock.title = 'Sperren';
            lock.addEventListener('click', (e) => {
                e.stopPropagation();
                State.updateElement(el.id, { locked: !el.props.locked });
                History.push();
            });

            // Move up
            const moveUp = document.createElement('button');
            moveUp.className = 'layer-action-btn';
            moveUp.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
            moveUp.title = 'Nach oben';
            moveUp.addEventListener('click', (e) => {
                e.stopPropagation();
                State.reorderElement(el.id, 1);
                History.push();
            });

            // Move down
            const moveDown = document.createElement('button');
            moveDown.className = 'layer-action-btn';
            moveDown.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
            moveDown.title = 'Nach unten';
            moveDown.addEventListener('click', (e) => {
                e.stopPropagation();
                State.reorderElement(el.id, -1);
                History.push();
            });

            // Delete
            const del = document.createElement('button');
            del.className = 'layer-action-btn';
            del.innerHTML = '<i class="fa-solid fa-trash"></i>';
            del.title = 'Löschen';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                State.removeElement(el.id);
                History.push();
            });

            actions.appendChild(moveUp);
            actions.appendChild(moveDown);
            actions.appendChild(vis);
            actions.appendChild(lock);
            actions.appendChild(del);

            item.appendChild(icon);
            item.appendChild(name);
            item.appendChild(actions);

            // Click to select
            item.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    if (isSelected) {
                        const newSel = selectedIds.filter(id => id !== el.id);
                        State.setSelection(newSel);
                    } else {
                        State.addToSelection(el.id);
                    }
                } else {
                    State.setSelection([el.id]);
                }
            });

            container.appendChild(item);
        });
    }

    function _updateSelection() {
        if (!container) return;
        const selectedIds = State.getSelectedIds();
        container.querySelectorAll('.layer-item').forEach(item => {
            item.classList.toggle('selected', selectedIds.includes(item.dataset.id));
        });
    }

    return { init };
})();
