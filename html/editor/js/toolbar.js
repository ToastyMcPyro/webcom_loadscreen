/* ═══════════════════════════════════════════════════════════
   toolbar.js – Toolbar Button Handlers
   ═══════════════════════════════════════════════════════════ */

const Toolbar = (() => {
    function init() {
        _bind('btn-undo',       () => History.undo());
        _bind('btn-redo',       () => History.redo());
        _bind('btn-zoom-in',    () => State.setZoom(Math.min(3, State.getZoom() + 0.1)));
        _bind('btn-zoom-out',   () => State.setZoom(Math.max(0.1, State.getZoom() - 0.1)));
        _bind('btn-zoom-fit',   () => Canvas.fitToScreen());
        _bind('btn-grid',       () => State.toggleGrid());
        _bind('btn-preview',    _togglePreview);
        _bind('btn-save',       _save);
        _bind('btn-deploy',     _deploy);
        _bind('btn-close',      _close);
        _bind('btn-close-preview', _togglePreview);
        _bind('btn-back',       _showDesignList);
        _bind('btn-deactivate', _deactivate);

        // Zoom label
        State.on('zoomChanged', _updateZoomLabel);
        _updateZoomLabel();

        // Save status
        State.on('dirtyChanged', _updateSaveStatus);

        // Design name
        State.on('designLoaded', _updateDesignName);
    }

    function _bind(id, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', handler);
    }

    function _updateZoomLabel() {
        const el = document.getElementById('zoom-level');
        if (el) el.textContent = Math.round(State.getZoom() * 100) + '%';
    }

    function _updateSaveStatus() {
        const el = document.getElementById('save-status');
        if (el) el.textContent = State.isDirty() ? 'Nicht gespeichert' : 'Gespeichert';
    }

    function _updateDesignName() {
        const el = document.getElementById('design-name');
        const design = State.getDesign();
        if (el && design) el.textContent = design.name || 'Unbenannt';
    }

    async function _save() {
        const design = State.getDesign();
        if (!design) return;
        const btn = document.getElementById('btn-save');
        if (btn) btn.disabled = true;

        await NUI.post('saveDesign', {
            designId: design.id,
            data: {
                elements: State.getElements(),
            },
        });
        State.markClean();

        if (btn) btn.disabled = false;
    }

    async function _deploy() {
        const design = State.getDesign();
        if (!design) return;
        // Save first
        await _save();
        await NUI.post('deployDesign', { designId: design.id });
    }

    async function _deactivate() {
        await NUI.post('deactivateDesign', {});
    }

    function _close() {
        NUI.post('closeEditor', {});
    }

    function _showDesignList() {
        App.showDesignList();
    }

    function _togglePreview() {
        const overlay = document.getElementById('preview-overlay');
        if (!overlay) return;
        if (overlay.classList.contains('hidden')) {
            overlay.classList.remove('hidden');
            _renderPreview();
        } else {
            overlay.classList.add('hidden');
        }
    }

    function _renderPreview() {
        const frame = document.getElementById('preview-canvas');
        if (!frame) return;
        const design = State.getDesign();
        const elements = State.getElements();
        if (!design) return;

        frame.innerHTML = '';
        frame.style.width  = '1920px';
        frame.style.height = '1080px';
        frame.style.transform = `scale(${Math.min(window.innerWidth * 0.85 / 1920, window.innerHeight * 0.85 / 1080)})`;
        frame.style.transformOrigin = '0 0';
        frame.style.position = 'relative';
        frame.style.background = design.background_color || '#0a0a0a';

        const sorted = [...elements].sort((a, b) => (a.props.zIndex || 0) - (b.props.zIndex || 0));
        sorted.forEach(el => {
            if (el.props.visible === false) return;
            const p = el.props || {};
            const type = el.type;

            const dom = document.createElement('div');
            dom.style.cssText = `
                position:absolute;
                left:${p.x||0}px;top:${p.y||0}px;
                width:${p.width||200}px;height:${p.height||100}px;
                z-index:${p.zIndex||1};
                opacity:${p.opacity??1};
                transform:rotate(${p.rotation||0}deg);
                overflow:${p.overflow||'hidden'};
            `;

            const inner = document.createElement('div');
            inner.style.cssText = 'width:100%;height:100%;';
            if (p.backgroundColor && p.backgroundColor !== 'transparent') inner.style.backgroundColor = p.backgroundColor;
            if (p.borderRadius) inner.style.borderRadius = p.borderRadius + 'px';
            if (p.borderWidth) inner.style.border = `${p.borderWidth}px ${p.borderStyle||'solid'} ${p.borderColor||'transparent'}`;

            _buildPreviewContent(inner, el);

            dom.appendChild(inner);
            frame.appendChild(dom);
        });
    }

    /* Dynamic variable preview values */
    const _previewVals = {
        server_name: 'My FiveM Server', player_count: '42', max_players: '64',
        server_ip: '127.0.0.1:30120', map_name: 'FiveM', game_type: 'Roleplay',
        queue_position: '5', loading_message: 'Loading resources...',
        server_uptime: '12h 30m', resource_count: '150',
        current_time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
        current_date: new Date().toLocaleDateString('de-DE'),
        player_name: 'Max', player_id: '1', player_playtime: '120h',
        player_last_login: 'Gestern', player_rank: 'Admin',
        player_character: 'Max Mustermann', percentage_text: '65%',
        current_resource: 'qbx_core', welcome_message: 'Willkommen zurück, Max!',
        description_text: 'Server description...', announcement: 'Announcement!',
    };

    function _buildPreviewContent(c, el) {
        const p = el.props || {};
        const type = el.type;

        // ── Dynamic variables ──
        if (_previewVals[type] !== undefined) {
            c.innerHTML = `<span style="display:flex;align-items:center;width:100%;height:100%;padding:4px;font-size:${p.fontSize||16}px;font-weight:${p.fontWeight||'normal'};font-family:${p.fontFamily||'Inter'},sans-serif;color:${p.color||'#fff'};text-align:${p.textAlign||'left'};${p.textAlign==='center'?'justify-content:center;':''}">${_esc(p.prefix||'')}${_esc(_previewVals[type])}${_esc(p.suffix||'')}</span>`;
            return;
        }

        // ── Text elements ──
        if (p.text || p.htmlContent) {
            const text = p.text || 'Text';
            c.innerHTML = `<span style="display:flex;align-items:center;width:100%;height:100%;padding:4px;font-size:${p.fontSize||16}px;font-weight:${p.fontWeight||'normal'};font-family:${p.fontFamily||'Inter'},sans-serif;color:${p.color||'#fff'};text-align:${p.textAlign||'left'};line-height:${p.lineHeight||1.4};${p.fontStyle?'font-style:'+p.fontStyle+';':''}${p.textAlign==='center'?'justify-content:center;':''}">${_esc(p.prefix||'')}${_esc(text)}${_esc(p.suffix||'')}</span>`;
            if (type === 'blockquote' && p.borderLeftWidth) {
                c.style.borderLeft = `${p.borderLeftWidth}px solid ${p.borderLeftColor||'#6366f1'}`;
            }
            return;
        }

        // ── Images ──
        if ((type === 'image' || type === 'logo' || type === 'gif' || type === 'background_image') && p.src) {
            c.innerHTML = `<img src="${encodeURI(p.src)}" style="width:100%;height:100%;object-fit:${p.objectFit||'cover'}">`;
            return;
        }

        // ── Video ──
        if ((type === 'video' || type === 'background_video') && p.src) {
            c.innerHTML = `<video src="${encodeURI(p.src)}" style="width:100%;height:100%;object-fit:${p.objectFit||'cover'}" autoplay muted loop playsinline></video>`;
            return;
        }

        // ── Player avatar ──
        if (type === 'player_avatar') {
            c.style.borderRadius = (p.borderRadius || 40) + 'px';
            c.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.1);border-radius:inherit"><i class="fa-solid fa-circle-user" style="font-size:${Math.min(p.width||80,p.height||80)*0.6}px;color:rgba(255,255,255,0.3)"></i></div>`;
            return;
        }

        // ── Icon ──
        if (type === 'icon') {
            c.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%"><i class="${p.iconClass||'fa-solid fa-star'}" style="color:${p.color||'#fff'};font-size:${p.fontSize||32}px"></i></div>`;
            return;
        }

        // ── Progress bar / bar loader ──
        if (type === 'progress_bar' || type === 'bar_loader') {
            c.innerHTML = `<div style="width:100%;height:100%;background:${p.trackColor||'rgba(255,255,255,0.1)'};border-radius:inherit;overflow:hidden"><div style="width:65%;height:100%;background:${p.barColor||'#6366f1'};border-radius:inherit;transition:width 0.3s"></div></div>`;
            return;
        }

        // ── Spinner ──
        if (type === 'spinner') {
            c.innerHTML = `<div style="width:100%;height:100%;border:${p.spinnerSize||4}px solid rgba(255,255,255,0.1);border-top-color:${p.spinnerColor||'#6366f1'};border-radius:50%;animation:spin 1s linear infinite"></div>`;
            return;
        }

        // ── Circular progress ──
        if (type === 'circular_progress') {
            const sz = Math.min(p.width||100, p.height||100);
            const r = (sz/2) - (p.strokeWidth||6);
            const circ = 2 * Math.PI * r;
            const offset = circ - (circ * 0.65);
            c.innerHTML = `<svg width="${sz}" height="${sz}" style="display:block;margin:auto">
                <circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="${p.trackColor||'rgba(255,255,255,0.1)'}" stroke-width="${p.strokeWidth||6}"/>
                <circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="${p.strokeColor||'#6366f1'}" stroke-width="${p.strokeWidth||6}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 ${sz/2} ${sz/2})"/>
            </svg>${p.showPercent?`<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:${p.color||'#fff'};font-size:${p.fontSize||18}px">65%</span>`:''}`;
            c.style.position = 'relative';
            return;
        }

        // ── Loading dots ──
        if (type === 'loading_dots') {
            let dots = '';
            for (let i = 0; i < (p.dotCount||3); i++) {
                dots += `<div style="width:${p.dotSize||12}px;height:${p.dotSize||12}px;background:${p.dotColor||'#6366f1'};border-radius:50%;animation:pulse 1.4s ${i*0.2}s infinite"></div>`;
            }
            c.style.display = 'flex';
            c.style.alignItems = 'center';
            c.style.justifyContent = 'center';
            c.style.gap = (p.dotGap||8) + 'px';
            c.innerHTML = dots;
            return;
        }

        // ── Step indicator ──
        if (type === 'step_indicator') {
            const steps = p.steps || ['Step 1','Step 2','Step 3'];
            c.style.display = 'flex';
            c.style.alignItems = 'center';
            c.style.justifyContent = 'space-between';
            let html = '';
            for (let i = 0; i < steps.length; i++) {
                const active = i <= (p.activeStep||0);
                html += `<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:24px;height:24px;border-radius:50%;background:${active?(p.color||'#6366f1'):(p.inactiveColor||'rgba(255,255,255,0.3)')};display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff">${i+1}</div><span style="font-size:11px;color:${active?'#fff':'rgba(255,255,255,0.5)'}">${_esc(steps[i])}</span></div>`;
                if (i < steps.length-1) html += `<div style="flex:1;height:2px;background:${active?(p.color||'#6366f1'):(p.inactiveColor||'rgba(255,255,255,0.3)')};margin:0 8px"></div>`;
            }
            c.innerHTML = html;
            return;
        }

        // ── Resource list ──
        if (type === 'resource_list') {
            const mockRes = ['qbx_core','ox_lib','ox_inventory','oxmysql','qbx_vehicles','webcom_loadscreen','es_extended','qbx_medical'];
            c.style.fontFamily = (p.fontFamily||'JetBrains Mono') + ',monospace';
            c.style.fontSize = (p.fontSize||12) + 'px';
            c.style.color = p.color || 'rgba(255,255,255,0.6)';
            c.style.padding = (p.padding||8) + 'px';
            c.style.overflowY = 'auto';
            c.style.lineHeight = '1.6';
            c.innerHTML = mockRes.map((r,i) => {
                const isLast = i === mockRes.length-1;
                return `<div style="opacity:${isLast?1:0.3+i/mockRes.length*0.5};white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><i class="fa-solid ${isLast?'fa-circle':'fa-check'}" style="font-size:${isLast?6:8}px;color:${isLast?'#22c55e':'rgba(255,255,255,0.2)'};margin-right:6px;vertical-align:middle"></i>${_esc(r)}</div>`;
            }).join('');
            return;
        }

        // ── Gradient overlay ──
        if (type === 'gradient_overlay') {
            c.style.background = `linear-gradient(${p.gradientAngle||180}deg, ${(p.colors||['rgba(0,0,0,0.8)','transparent']).join(', ')})`;
            return;
        }

        // ── Color overlay ──
        if (type === 'color_overlay') { c.style.background = p.overlayColor||'rgba(0,0,0,0.5)'; return; }

        // ── Blur overlay ──
        if (type === 'blur_overlay') { c.style.backdropFilter = `blur(${p.blurAmount||5}px)`; return; }

        // ── Glow ──
        if (type === 'glow') { c.style.borderRadius = '50%'; c.style.background = `radial-gradient(circle,${p.glowColor||'#6366f1'} 0%,transparent 70%)`; return; }

        // ── Shadow box ──
        if (type === 'shadow_box') { c.style.boxShadow = `${p.shadowOffsetX||0}px ${p.shadowOffsetY||10}px ${p.shadowBlur||20}px ${p.shadowColor||'rgba(0,0,0,0.5)'}`; return; }

        // ── Neon border ──
        if (type === 'neon_border') { c.style.border = `${p.neonSize||3}px solid ${p.neonColor||'#6366f1'}`; c.style.boxShadow = `0 0 ${(p.neonSize||3)*3}px ${p.neonColor||'#6366f1'}`; return; }

        // ── Divider ──
        if (type === 'divider') { c.style.backgroundColor = p.backgroundColor||'rgba(255,255,255,0.2)'; return; }

        // ── Social links ──
        if (type === 'social_links') {
            c.style.display = 'flex';
            c.style.alignItems = 'center';
            c.style.gap = (p.gap||16) + 'px';
            c.style.justifyContent = 'center';
            const icons = (p.links && p.links.length) ? p.links.map(l => l.icon||'fa-brands fa-discord') : ['fa-brands fa-discord','fa-brands fa-youtube','fa-brands fa-twitter'];
            c.innerHTML = icons.map(ic => `<i class="${ic}" style="color:${p.iconColor||'#fff'};font-size:${p.iconSize||24}px"></i>`).join('');
            return;
        }

        // ── Lists (rules, features, faq) ──
        if (['rules_list','feature_list','faq_list'].includes(type)) {
            const items = p.items || ['Item 1','Item 2','Item 3'];
            c.style.color = p.color||'#ccc';
            c.style.fontSize = (p.fontSize||14) + 'px';
            c.style.fontFamily = (p.fontFamily||'Inter') + ',sans-serif';
            c.style.padding = '8px';
            c.style.overflowY = 'auto';
            c.innerHTML = items.map((it,i) => `<div style="margin-bottom:6px">${p.numbered?i+1+'. ':'• '}${_esc(it)}</div>`).join('');
            return;
        }

        // ── Tip carousel ──
        if (type === 'tip_carousel') {
            const tips = p.tips || ['Tipp'];
            c.style.display = 'flex';
            c.style.alignItems = 'center';
            c.style.justifyContent = 'center';
            c.style.fontSize = (p.fontSize||16) + 'px';
            c.style.fontFamily = (p.fontFamily||'Inter') + ',sans-serif';
            c.style.color = p.color||'#fff';
            c.textContent = tips[0];
            return;
        }

        // ── Stat card ──
        if (type === 'stat_card') {
            c.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:8px">
                <i class="${p.iconClass||'fa-solid fa-users'}" style="font-size:28px;color:${p.accentColor||'#6366f1'}"></i>
                <span style="font-size:24px;font-weight:bold;color:${p.color||'#fff'}">${_esc(p.value||'0')}</span>
                <span style="font-size:12px;color:rgba(255,255,255,0.5)">${_esc(p.label||'Label')}</span>
            </div>`;
            return;
        }

        // ── Feature card ──
        if (type === 'feature_card') {
            c.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;padding:16px;gap:8px;text-align:center">
                <i class="${p.iconClass||'fa-solid fa-star'}" style="font-size:28px;color:${p.accentColor||'#6366f1'}"></i>
                <span style="font-size:18px;font-weight:600;color:${p.color||'#fff'}">${_esc(p.title||'Feature')}</span>
                <span style="font-size:13px;color:rgba(255,255,255,0.5)">${_esc(p.description||'Description')}</span>
            </div>`;
            return;
        }

        // ── Team card ──
        if (type === 'team_card') {
            c.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:8px">
                <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-user" style="font-size:24px;color:rgba(255,255,255,0.3)"></i></div>
                <span style="font-size:16px;font-weight:600;color:${p.color||'#fff'}">${_esc(p.name||'Name')}</span>
                <span style="font-size:12px;color:rgba(255,255,255,0.5)">${_esc(p.role||'Role')}</span>
            </div>`;
            return;
        }

        // ── Hero section ──
        if (type === 'hero_section') {
            if (p.backgroundSrc) c.style.backgroundImage = `url(${encodeURI(p.backgroundSrc)})`;
            c.style.backgroundSize = 'cover';
            c.style.backgroundPosition = 'center';
            c.innerHTML = `<div style="position:absolute;inset:0;background:${p.overlayColor||'rgba(0,0,0,0.5)'}"></div>
                <div style="position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:8px">
                    <span style="font-size:48px;font-weight:bold;color:#fff">${_esc(p.title||'Server Name')}</span>
                    <span style="font-size:20px;color:rgba(255,255,255,0.7)">${_esc(p.subtitle||'Welcome')}</span>
                </div>`;
            c.style.position = 'relative';
            return;
        }

        // ── CTA section ──
        if (type === 'cta_section') {
            c.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:12px">
                <span style="font-size:28px;font-weight:bold;color:${p.color||'#fff'}">${_esc(p.title||'Join Us!')}</span>
                <span style="font-size:14px;color:rgba(255,255,255,0.6)">${_esc(p.subtitle||'')}</span>
                <div style="padding:8px 24px;background:${p.buttonColor||'#6366f1'};border-radius:8px;color:#fff;font-size:14px">${_esc(p.buttonText||'Copy IP')}</div>
            </div>`;
            return;
        }

        // ── Navbar ──
        if (type === 'navbar') {
            const items = p.items || ['Home','Server','Rules','Discord'];
            c.style.display = 'flex';
            c.style.alignItems = 'center';
            c.style.justifyContent = 'center';
            c.style.gap = '32px';
            c.innerHTML = items.map(it => `<span style="font-size:${p.fontSize||14}px;color:${p.color||'#fff'};font-family:${p.fontFamily||'Inter'},sans-serif">${_esc(it)}</span>`).join('');
            return;
        }

        // ── Staff list ──
        if (type === 'staff_list') {
            const members = p.members && p.members.length ? p.members : [{name:'Admin',role:'Owner'},{name:'Mod',role:'Moderator'}];
            c.style.padding = '8px';
            c.style.overflowY = 'auto';
            c.innerHTML = members.map(m => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:${p.fontSize||14}px;color:${p.color||'#ccc'};font-family:${p.fontFamily||'Inter'},sans-serif"><i class="fa-solid fa-circle" style="font-size:6px;color:#22c55e"></i><span>${_esc(m.name||'Staff')}</span><span style="opacity:0.5;font-size:12px">${_esc(m.role||'')}</span></div>`).join('');
            return;
        }

        // ── Music player ──
        if (type === 'music_player') {
            c.innerHTML = `<div style="display:flex;align-items:center;width:100%;height:100%;padding:12px;gap:12px">
                <i class="fa-solid fa-play" style="font-size:20px;color:${p.accentColor||'#6366f1'}"></i>
                <div style="flex:1"><div style="font-size:13px;color:${p.color||'#fff'}">${_esc(p.trackName||'Background Music')}</div><div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;margin-top:6px"><div style="width:35%;height:100%;background:${p.accentColor||'#6366f1'};border-radius:2px"></div></div></div>
            </div>`;
            return;
        }

        // ── Language selector ──
        if (type === 'language_selector') {
            c.style.display = 'flex';
            c.style.alignItems = 'center';
            c.style.justifyContent = 'center';
            c.style.gap = '8px';
            c.innerHTML = `<span style="font-size:14px;font-weight:bold;color:${p.color||'#fff'}">DE</span><span style="color:rgba(255,255,255,0.3)">|</span><span style="font-size:14px;color:rgba(255,255,255,0.5)">EN</span>`;
            return;
        }

        // ── Mute / fullscreen / skip buttons ──
        if (type === 'mute_button') { c.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%"><i class="fa-solid fa-volume-high" style="color:${p.color||'#fff'};font-size:${p.fontSize||20}px"></i></div>`; return; }
        if (type === 'fullscreen_button') { c.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%"><i class="fa-solid fa-expand" style="color:${p.color||'#fff'};font-size:${p.fontSize||20}px"></i></div>`; return; }

        // ── Effects placeholder ──
        if (['particles','snowfall','rainfall','fog','scanlines'].includes(type)) {
            c.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:rgba(255,255,255,0.1);font-size:48px"><i class="fa-solid fa-wand-magic-sparkles"></i></div>`;
            return;
        }

        // ── Skeleton loader ──
        if (type === 'skeleton_loader') {
            c.style.background = `linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 37%, rgba(255,255,255,0.08) 63%)`;
            c.style.backgroundSize = '200% 100%';
            return;
        }

        // ── Pulse loader ──
        if (type === 'pulse_loader') {
            c.innerHTML = `<div style="width:${p.pulseSize||60}px;height:${p.pulseSize||60}px;background:${p.color||'#6366f1'};border-radius:50%;margin:auto;animation:pulse 1.4s infinite"></div>`;
            c.style.display = 'flex';
            c.style.alignItems = 'center';
            return;
        }

        // ── Image placeholder (no src) ──
        if (['image','logo','gif','background_image'].includes(type)) {
            c.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:rgba(255,255,255,0.2);font-size:24px"><i class="fa-solid fa-image"></i></div>`;
            return;
        }
    }

    function _esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    return { init };
})();
