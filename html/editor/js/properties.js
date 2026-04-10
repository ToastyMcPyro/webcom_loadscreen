/* ═══════════════════════════════════════════════════════════
   properties.js – Property Inspector Panel
   Generates dynamic form fields based on selected element
   ═══════════════════════════════════════════════════════════ */

const Properties = (() => {
    let panel;

    const FONTS = ['Inter','Roboto','Montserrat','Poppins','Open Sans','Lato','Oswald','Raleway','Playfair Display','Bebas Neue','Orbitron','Press Start 2P','Bangers','JetBrains Mono','Fira Code'];
    const ANIMATIONS = ['none','fadeIn','fadeInUp','fadeInDown','fadeInLeft','fadeInRight','slideInUp','slideInDown','slideInLeft','slideInRight','zoomIn','zoomOut','bounceIn','rotateIn','flipInX','flipInY','pulse','float','shake','blink'];
    const OBJECT_FITS = ['cover','contain','fill','none','scale-down'];
    const TEXT_ALIGNS = ['left','center','right','justify'];
    const BORDER_STYLES = ['solid','dashed','dotted','double','none'];
    const OVERFLOW_OPTS = ['hidden','visible','auto','scroll'];

    function init() {
        panel = document.getElementById('properties-content');
        State.on('selectionChanged', _rebuild);
    }

    function _rebuild() {
        if (!panel) return;
        panel.innerHTML = '';

        const sel = State.getSelectedElements();
        if (sel.length === 0) {
            panel.innerHTML = '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.3);font-size:13px">' + I18n.t('noSelection') + '</div>';
            return;
        }
        if (sel.length > 1) {
            panel.innerHTML = '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.3);font-size:13px">' + I18n.t('multiSelect', { n: sel.length }) + '</div>';
            return;
        }

        const el = sel[0];
        const p  = el.props || {};
        const typeInfo = Elements.getTypeInfo(el.type);

        // Element info header
        _addHeader(typeInfo ? typeInfo.label : el.type, el.id, el.type);

        // Position & Size
        _addGroup(I18n.t('posSize'), [
            _numberRow('X', 'x', p.x, -5000, 5000),
            _numberRow('Y', 'y', p.y, -5000, 5000),
            _numberRow(I18n.t('width'), 'width', p.width, 1, 5000),
            _numberRow(I18n.t('height'), 'height', p.height, 1, 5000),
            _numberRow(I18n.t('rotation'), 'rotation', p.rotation, -360, 360),
            _numberRow('Z-Index', 'zIndex', p.zIndex, 0, 9999),
        ]);

        // Appearance
        _addGroup(I18n.t('appearance'), [
            _rangeRow('Opacity', 'opacity', p.opacity, 0, 1, 0.01),
            _colorRow(I18n.t('background'), 'backgroundColor', p.backgroundColor),
            _numberRow('Border Radius', 'borderRadius', p.borderRadius, 0, 500),
            _numberRow(I18n.t('borderWidth'), 'borderWidth', p.borderWidth, 0, 20),
            _colorRow(I18n.t('borderColor'), 'borderColor', p.borderColor),
            _selectRow(I18n.t('borderStyle'), 'borderStyle', p.borderStyle, BORDER_STYLES),
            _textRow('Box Shadow', 'boxShadow', p.boxShadow),
            _selectRow('Overflow', 'overflow', p.overflow, OVERFLOW_OPTS),
        ]);

        // Animation
        _addGroup(I18n.t('animation'), [
            _selectRow(I18n.t('animType'), 'animationType', p.animationType, ANIMATIONS),
            _numberRow(I18n.t('animDuration'), 'animationDuration', p.animationDuration, 0, 30, 0.1),
            _numberRow(I18n.t('animDelay'), 'animationDelay', p.animationDelay, 0, 30, 0.1),
            _numberRow(I18n.t('animRepeat'), 'animationRepeat', p.animationRepeat, 0, 100),
        ]);

        // Visibility & Lock
        _addGroup(I18n.t('visibility'), [
            _checkboxRow(I18n.t('visible'), 'visible', p.visible !== false),
            _checkboxRow(I18n.t('locked'), 'locked', !!p.locked),
        ]);

        // Type-specific properties
        const typeDefaults = Elements.TYPE_DEFAULTS[el.type];
        if (typeDefaults) {
            const typeRows = [];
            for (const key of Object.keys(typeDefaults)) {
                if (['x','y','width','height','zIndex'].includes(key)) continue; // skip position
                const val = p[key] ?? typeDefaults[key];
                typeRows.push(_autoRow(key, val, el.type));
            }
            if (typeRows.length > 0) {
                _addGroup(I18n.t('typeProps'), typeRows.filter(Boolean));
            }
        }

        // Translation field (text_en) for text-capable elements
        if (p.text !== undefined || typeDefaults?.text !== undefined) {
            const textEn = p.text_en ?? '';
            _addGroup(I18n.t('translation'), [
                _textareaRow('Text (EN)', 'text_en', textEn),
            ]);
        }
    }

    function _addHeader(label, id, type) {
        const div = document.createElement('div');
        div.className = 'prop-header';
        div.innerHTML = `<div style="font-weight:600;font-size:14px">${label}</div><div style="font-size:10px;opacity:0.3">${type} | ${id}</div>`;
        panel.appendChild(div);
    }

    function _addGroup(title, rows) {
        const group = document.createElement('div');
        group.className = 'prop-group';
        const hdr = document.createElement('div');
        hdr.className = 'prop-group-title';
        hdr.textContent = title;
        group.appendChild(hdr);
        rows.forEach(r => { if (r) group.appendChild(r); });
        panel.appendChild(group);
    }

    /* ── Row builders ── */

    function _numberRow(label, key, value, min, max, step) {
        return _row(label, () => {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'prop-input';
            input.value = value ?? 0;
            if (min !== undefined) input.min = min;
            if (max !== undefined) input.max = max;
            if (step !== undefined) input.step = step;
            input.addEventListener('change', () => _update(key, parseFloat(input.value) || 0));
            return input;
        });
    }

    function _textRow(label, key, value) {
        return _row(label, () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'prop-input';
            input.value = value ?? '';
            input.addEventListener('change', () => _update(key, input.value));
            return input;
        });
    }

    function _colorRow(label, key, value) {
        return _row(label, () => {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'display:flex;gap:6px;align-items:center;flex:1';
            const color = document.createElement('input');
            color.type = 'color';
            color.className = 'prop-color';
            // Convert named/rgba to hex for color picker if possible
            color.value = _toHex(value) || '#000000';
            const text = document.createElement('input');
            text.type = 'text';
            text.className = 'prop-input';
            text.style.flex = '1';
            text.value = value || '';
            color.addEventListener('input', () => { text.value = color.value; _update(key, color.value); });
            text.addEventListener('change', () => _update(key, text.value));
            wrap.appendChild(color);
            wrap.appendChild(text);
            return wrap;
        });
    }

    function _selectRow(label, key, value, options) {
        return _row(label, () => {
            const sel = document.createElement('select');
            sel.className = 'prop-select';
            options.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o;
                opt.textContent = o;
                if (o === value) opt.selected = true;
                sel.appendChild(opt);
            });
            sel.addEventListener('change', () => _update(key, sel.value));
            return sel;
        });
    }

    function _checkboxRow(label, key, value) {
        return _row(label, () => {
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'prop-checkbox';
            cb.checked = !!value;
            cb.addEventListener('change', () => _update(key, cb.checked));
            return cb;
        });
    }

    function _rangeRow(label, key, value, min, max, step) {
        return _row(label, () => {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'display:flex;gap:6px;align-items:center;flex:1';
            const range = document.createElement('input');
            range.type = 'range';
            range.min = min;
            range.max = max;
            range.step = step || 1;
            range.value = value ?? 1;
            range.style.flex = '1';
            const num = document.createElement('span');
            num.style.cssText = 'min-width:35px;text-align:right;font-size:12px;opacity:0.7';
            num.textContent = parseFloat(value ?? 1).toFixed(2);
            range.addEventListener('input', () => {
                num.textContent = parseFloat(range.value).toFixed(2);
                _update(key, parseFloat(range.value));
            });
            wrap.appendChild(range);
            wrap.appendChild(num);
            return wrap;
        });
    }

    function _textareaRow(label, key, value) {
        return _row(label, () => {
            const ta = document.createElement('textarea');
            ta.className = 'prop-textarea';
            ta.value = value ?? '';
            ta.rows = 3;
            ta.addEventListener('change', () => _update(key, ta.value));
            return ta;
        });
    }

    function _autoRow(key, value, elType) {
        const label = _humanize(key);
        if (typeof value === 'boolean') return _checkboxRow(label, key, value);
        if (typeof value === 'number') {
            if (key.includes('opacity') || key.includes('intensity')) return _rangeRow(label, key, value, 0, 1, 0.01);
            if (key.includes('speed') || key.includes('interval')) return _numberRow(label, key, value, 0, 60000);
            return _numberRow(label, key, value);
        }
        if (typeof value === 'string') {
            if (key.includes('color') || key.includes('Color')) return _colorRow(label, key, value);
            if (key === 'fontFamily') return _selectRow(label, key, value, FONTS);
            if (key === 'objectFit') return _selectRow(label, key, value, OBJECT_FITS);
            if (key === 'textAlign') return _selectRow(label, key, value, TEXT_ALIGNS);
            // Media file picker for src / trackUrl
            if (key === 'src' || key === 'trackUrl') return _mediaRow(label, key, value, elType);
            if (key.includes('text') || key.includes('content') || key.includes('description') || key.includes('subtitle') || key.includes('htmlContent')) return _textareaRow(label, key, value);
            return _textRow(label, key, value);
        }
        // Array/Object: JSON textarea
        if (Array.isArray(value) || typeof value === 'object') {
            return _row(label, () => {
                const ta = document.createElement('textarea');
                ta.className = 'prop-textarea';
                ta.value = JSON.stringify(value, null, 2);
                ta.rows = 4;
                ta.addEventListener('change', () => {
                    try { _update(key, JSON.parse(ta.value)); }
                    catch(e) { ta.style.borderColor = '#ef4444'; }
                });
                return ta;
            });
        }
        return null;
    }

    /* ── Helpers ── */

    function _mediaRow(label, key, value, elType) {
        return _row(label, () => {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'display:flex;gap:6px;align-items:center;flex:1';
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'prop-input';
            input.style.flex = '1';
            input.value = value ?? '';
            input.addEventListener('change', () => _update(key, input.value));
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'padding:4px 8px;border-radius:6px;border:1px solid rgba(99,102,241,.4);background:rgba(99,102,241,.15);color:#818cf8;font-size:11px;cursor:pointer;white-space:nowrap;';
            btn.innerHTML = '<i class="fa-solid fa-folder-open"></i>';
            btn.title = I18n.t('media.browse');
            const mediaType = (key === 'trackUrl' || (elType && elType === 'music_player')) ? 'music'
                : (['video','background_video'].includes(elType)) ? 'video' : 'music';
            btn.addEventListener('click', () => {
                MediaManager.openPicker(mediaType, (path) => {
                    input.value = path;
                    _update(key, path);
                });
            });
            wrap.appendChild(input);
            wrap.appendChild(btn);
            return wrap;
        });
    }

    function _row(label, buildInput) {
        const row = document.createElement('div');
        row.className = 'prop-row';
        const lbl = document.createElement('label');
        lbl.className = 'prop-label';
        lbl.textContent = label;
        row.appendChild(lbl);
        const input = buildInput();
        row.appendChild(input);
        return row;
    }

    function _update(key, value) {
        const sel = State.getSelectedIds();
        if (sel.length !== 1) return;
        State.updateElement(sel[0], { [key]: value });
        History.push();
    }

    function _humanize(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, c => c.toUpperCase()).trim();
    }

    function _toHex(color) {
        if (!color || color === 'transparent' || color === 'none') return '#000000';
        if (/^#[0-9a-f]{6}$/i.test(color)) return color;
        if (/^#[0-9a-f]{3}$/i.test(color)) return '#' + color[1]+color[1]+color[2]+color[2]+color[3]+color[3];
        // Can't easily convert rgba to hex for color picker, return default
        return '#000000';
    }

    return { init };
})();
