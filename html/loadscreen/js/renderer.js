/* ═══════════════════════════════════════════════════════════
   renderer.js – Main Loadscreen Renderer
   Reads design from handover data and renders all elements
   ═══════════════════════════════════════════════════════════ */

const Renderer = (() => {
    const canvas = document.getElementById('loadscreen-canvas');
    const fallback = document.getElementById('fallback-screen');
    let _design = null;
    let _updateTimers = [];

    function init() {
        Progress.init();

        // Listen for handover data from FiveM
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'handover') {
                _onHandover(e.data);
            }
        });

        // Also check nuiHandoverData (set by FiveM native)
        if (window.nuiHandoverData) {
            _onHandover(window.nuiHandoverData);
        }

        // Progress bar updates
        Progress.onProgress((pct) => {
            _updateProgressElements(pct);
            // Also update fallback bar
            const bar = document.getElementById('fallback-bar');
            if (bar) bar.style.width = pct + '%';
        });
    }

    function _onHandover(data) {
        if (!data || !data.design) return;

        _design = data.design;
        Variables.init(data.variables || {});

        // Hide fallback, show custom design
        if (fallback) fallback.classList.add('hidden');

        // Set canvas background
        canvas.style.backgroundColor = _design.background_color || '#0a0a0a';

        // Scale canvas to viewport
        _setupScaling();

        // Render all elements sorted by zIndex
        const elements = (_design.elements || []).slice().sort((a, b) =>
            (a.props?.zIndex || 0) - (b.props?.zIndex || 0)
        );

        for (const el of elements) {
            if (el.props?.visible === false) continue;
            _renderElement(el);
        }

        // Start dynamic variable update timer
        _startDynamicUpdates();
    }

    function _setupScaling() {
        const dw = _design.canvas_width || 1920;
        const dh = _design.canvas_height || 1080;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const scale = Math.max(vw / dw, vh / dh);

        canvas.style.width = dw + 'px';
        canvas.style.height = dh + 'px';
        canvas.style.transform = `scale(${scale})`;
        canvas.style.transformOrigin = 'top left';
        canvas.style.position = 'fixed';
        canvas.style.top = ((vh - dh * scale) / 2) + 'px';
        canvas.style.left = ((vw - dw * scale) / 2) + 'px';
    }

    function _renderElement(el) {
        const type = el.type;
        const props = el.props || {};
        const dom = document.createElement('div');

        dom.className = 'ls-element';
        dom.id = 'el-' + el.id;
        dom.dataset.type = type;

        // Position & size
        dom.style.left     = (props.x || 0) + 'px';
        dom.style.top      = (props.y || 0) + 'px';
        dom.style.width    = (props.width || 200) + 'px';
        dom.style.height   = (props.height || 100) + 'px';
        dom.style.zIndex   = props.zIndex || 1;
        dom.style.opacity  = props.opacity ?? 1;

        if (props.rotation) {
            dom.style.transform = `rotate(${props.rotation}deg)`;
        }

        // Common styles
        if (props.backgroundColor && props.backgroundColor !== 'transparent') {
            dom.style.backgroundColor = props.backgroundColor;
        }
        if (props.borderRadius)  dom.style.borderRadius  = props.borderRadius + 'px';
        if (props.borderWidth)   dom.style.border        = `${props.borderWidth}px ${props.borderStyle || 'solid'} ${props.borderColor || 'transparent'}`;
        if (props.boxShadow && props.boxShadow !== 'none') dom.style.boxShadow = props.boxShadow;
        if (props.overflow)      dom.style.overflow      = props.overflow;

        // Animation
        if (props.animationType && props.animationType !== 'none') {
            const dur   = props.animationDuration || 1;
            const delay = props.animationDelay || 0;
            const count = props.animationRepeat === -1 ? 'infinite' : (props.animationRepeat || 1);
            const name  = props.animationType === 'glow' ? 'glowPulse' : props.animationType;
            dom.style.animation = `${name} ${dur}s ease ${delay}s ${count} both`;
        }

        // Render type-specific content
        _renderContent(dom, el);

        canvas.appendChild(dom);
    }

    function _renderContent(dom, el) {
        const type = el.type;
        const p = el.props || {};

        // ── Text Elements ──
        if (['heading_h1','heading_h2','heading_h3','paragraph','label','badge','blockquote','code_block','rich_text','loading_text','announcement','description_text','welcome_message'].includes(type)) {
            _applyTextStyles(dom, p);
            const textSrc = (I18n.getLang() === 'en' && p.text_en) ? p.text_en : (p.text || p.htmlContent || '');
            const text = Variables.resolve(textSrc);
            if (p.text_en) {
                dom.dataset.textDe = p.text || '';
                dom.dataset.textEn = p.text_en;
                dom.dataset.translatable = 'true';
            }
            if (type === 'rich_text') {
                dom.innerHTML = _sanitizeHTML(text);
            } else {
                dom.textContent = text;
            }
            if (type === 'blockquote' && p.borderLeftWidth) {
                dom.style.borderLeft = `${p.borderLeftWidth}px solid ${p.borderLeftColor || '#6366f1'}`;
                dom.style.paddingLeft = '16px';
            }
            if (type === 'loading_text' && p.showDots) {
                dom.dataset.dots = 'true';
            }
            return;
        }

        // ── Dynamic Variable Elements ──
        if (['server_name','player_count','max_players','server_ip','map_name','game_type','queue_position','loading_message','server_uptime','resource_count','current_time','current_date','player_name','player_id','player_playtime','player_last_login','player_rank','player_character','percentage_text','current_resource'].includes(type)) {
            _applyTextStyles(dom, p);
            dom.dataset.dynamic = type;
            const value = Variables.getDynamicValue(type);
            dom.textContent = (p.prefix || '') + value + (p.suffix || '');
            return;
        }

        // ── Image / Logo / GIF ──
        if (['image','logo','gif'].includes(type)) {
            if (p.src) {
                const img = document.createElement('img');
                img.src = p.src;
                img.style.objectFit = p.objectFit || 'cover';
                img.style.borderRadius = (p.borderRadius || 0) + 'px';
                img.loading = 'eager';
                dom.appendChild(img);
            }
            return;
        }

        // ── Background Image ──
        if (type === 'background_image') {
            if (p.src) {
                const img = document.createElement('img');
                img.src = p.src;
                img.style.objectFit = p.objectFit || 'cover';
                img.style.width = '100%';
                img.style.height = '100%';
                dom.appendChild(img);
            }
            return;
        }

        // ── Video / Background Video ──
        if (['video','background_video'].includes(type)) {
            if (p.src) {
                const vid = document.createElement('video');
                vid.src = p.src;
                vid.autoplay = p.autoplay !== false;
                vid.loop = p.loop !== false;
                vid.muted = p.muted !== false;
                vid.playsInline = true;
                vid.style.objectFit = p.objectFit || 'cover';
                dom.appendChild(vid);
            }
            return;
        }

        // ── Player Avatar ──
        if (type === 'player_avatar') {
            const src = Variables.getDynamicValue('player_avatar');
            if (src) {
                const img = document.createElement('img');
                img.src = src;
                img.style.objectFit = p.objectFit || 'cover';
                img.style.borderRadius = (p.borderRadius || 0) + 'px';
                dom.appendChild(img);
            }
            return;
        }

        // ── Icon ──
        if (type === 'icon') {
            const i = document.createElement('i');
            i.className = p.iconClass || 'fa-solid fa-star';
            i.style.color = p.color || '#ffffff';
            i.style.fontSize = (p.fontSize || 32) + 'px';
            dom.style.display = 'flex';
            dom.style.alignItems = 'center';
            dom.style.justifyContent = 'center';
            dom.appendChild(i);
            return;
        }

        // ── Progress Bar ──
        if (type === 'progress_bar') {
            dom.innerHTML = `
                <div class="ls-progress-track" style="background:${p.trackColor || 'rgba(255,255,255,0.1)'}">
                    <div class="ls-progress-fill ${p.animated ? 'animated' : ''}"
                         style="width:0%;background:${p.barColor || '#6366f1'}"
                         data-progress-bar="true"></div>
                </div>`;
            return;
        }

        // ── Bar Loader ──
        if (type === 'bar_loader') {
            dom.innerHTML = `
                <div class="ls-progress-track" style="background:${p.trackColor || 'transparent'}">
                    <div class="ls-progress-fill ${p.animated ? 'animated' : ''}"
                         style="width:0%;background:${p.barColor || '#6366f1'}"
                         data-progress-bar="true"></div>
                </div>`;
            return;
        }

        // ── Spinner ──
        if (type === 'spinner') {
            const sz = p.spinnerSize || 4;
            dom.innerHTML = `<div class="ls-spinner" style="
                width:100%;height:100%;
                border:${sz}px solid rgba(255,255,255,0.1);
                border-top-color:${p.spinnerColor || '#6366f1'};
            "></div>`;
            return;
        }

        // ── Circular Progress ──
        if (type === 'circular_progress') {
            const size = Math.min(p.width || 100, p.height || 100);
            const r = (size / 2) - (p.strokeWidth || 6);
            const circ = 2 * Math.PI * r;
            dom.classList.add('ls-circular-progress');
            dom.innerHTML = `
                <svg width="${size}" height="${size}">
                    <circle cx="${size/2}" cy="${size/2}" r="${r}"
                        fill="none" stroke="${p.trackColor || 'rgba(255,255,255,0.1)'}"
                        stroke-width="${p.strokeWidth || 6}"/>
                    <circle cx="${size/2}" cy="${size/2}" r="${r}"
                        fill="none" stroke="${p.strokeColor || '#6366f1'}"
                        stroke-width="${p.strokeWidth || 6}"
                        stroke-dasharray="${circ}"
                        stroke-dashoffset="${circ}"
                        stroke-linecap="round"
                        data-circular-progress="true"
                        data-circumference="${circ}"/>
                </svg>
                ${p.showPercent ? `<span class="percent-text" style="color:${p.color || '#fff'};font-size:${p.fontSize || 18}px">0%</span>` : ''}`;
            return;
        }

        // ── Loading Dots ──
        if (type === 'loading_dots') {
            dom.classList.add('ls-loading-dots');
            dom.style.setProperty('--dot-gap', (p.dotGap || 8) + 'px');
            let dots = '';
            for (let i = 0; i < (p.dotCount || 3); i++) {
                dots += `<div class="dot" style="width:${p.dotSize || 12}px;height:${p.dotSize || 12}px;background:${p.dotColor || '#6366f1'}"></div>`;
            }
            dom.innerHTML = dots;
            return;
        }

        // ── Percentage Text ──
        if (type === 'percentage_text') {
            _applyTextStyles(dom, p);
            dom.dataset.dynamic = 'percentage_text';
            dom.textContent = '0%';
            return;
        }

        // ── Skeleton Loader ──
        if (type === 'skeleton_loader') {
            dom.classList.add('ls-skeleton');
            dom.style.background = `linear-gradient(90deg, ${p.baseColor || 'rgba(255,255,255,0.08)'} 25%, ${p.highlightColor || 'rgba(255,255,255,0.15)'} 37%, ${p.baseColor || 'rgba(255,255,255,0.08)'} 63%)`;
            dom.style.backgroundSize = '200% 100%';
            return;
        }

        // ── Pulse Loader ──
        if (type === 'pulse_loader') {
            dom.innerHTML = `<div class="ls-pulse" style="
                width:${p.pulseSize || 60}px;height:${p.pulseSize || 60}px;
                background:${p.color || '#6366f1'};
            "></div>`;
            return;
        }

        // ── Step Indicator ──
        if (type === 'step_indicator') {
            const steps = p.steps || ['Step 1','Step 2','Step 3'];
            dom.style.display = 'flex';
            dom.style.alignItems = 'center';
            dom.style.justifyContent = 'space-between';
            dom.dataset.stepIndicator = 'true';
            let html = '';
            for (let i = 0; i < steps.length; i++) {
                const active = i <= (p.activeStep || 0);
                html += `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                    <div style="width:24px;height:24px;border-radius:50%;background:${active ? (p.color || '#6366f1') : (p.inactiveColor || 'rgba(255,255,255,0.3)')};display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;">${i+1}</div>
                    <span style="font-size:11px;color:${active ? '#fff' : 'rgba(255,255,255,0.5)'}">${steps[i]}</span>
                </div>`;
                if (i < steps.length - 1) {
                    html += `<div style="flex:1;height:2px;background:${active ? (p.color || '#6366f1') : (p.inactiveColor || 'rgba(255,255,255,0.3)')};margin:0 8px;"></div>`;
                }
            }
            dom.innerHTML = html;
            return;
        }

        // ── Ticker Text / News Ticker ──
        if (type === 'ticker_text' || type === 'news_ticker') {
            dom.classList.add('ticker-wrapper');
            const items = type === 'news_ticker' ? (p.items || []).join(' ● ') : (p.text || '');
            const text = Variables.resolve(items);
            const speed = p.scrollSpeed || 50;
            dom.innerHTML = `<span class="ticker-content" style="
                animation-duration:${Math.max(5, text.length / speed * 10)}s;
                color:${p.color || '#fff'};
                font-size:${p.fontSize || 16}px;
                font-family:${p.fontFamily || 'Inter'},sans-serif;
            ">${_escapeHTML(text)}</span>`;
            return;
        }

        // ── Typewriter Text ──
        if (type === 'typewriter_text') {
            _applyTextStyles(dom, p);
            dom.textContent = '';
            _startTypewriter(dom, Variables.resolve(p.text || ''), p.typeSpeed || 80, p.loop !== false);
            return;
        }

        // ── Social Links ──
        if (type === 'social_links') {
            dom.style.display = 'flex';
            dom.style.alignItems = 'center';
            dom.style.gap = (p.gap || 16) + 'px';
            const links = p.links || [];
            for (const link of links) {
                const a = document.createElement('a');
                a.href = '#';
                a.style.color = p.iconColor || '#ffffff';
                a.style.fontSize = (p.iconSize || 24) + 'px';
                a.innerHTML = `<i class="${link.icon || 'fa-brands fa-discord'}"></i>`;
                dom.appendChild(a);
            }
            return;
        }

        // ── Rules / Feature / FAQ Lists ──
        if (['rules_list','feature_list','faq_list'].includes(type)) {
            const items = p.items || [];
            dom.style.color = p.color || '#cccccc';
            dom.style.fontSize = (p.fontSize || 14) + 'px';
            dom.style.fontFamily = `${p.fontFamily || 'Inter'}, sans-serif`;
            dom.style.overflowY = 'auto';
            let html = '';
            if (type === 'rules_list' && p.numbered) {
                html = '<ol style="padding-left:20px">';
                items.forEach(item => { html += `<li style="margin-bottom:6px">${_escapeHTML(item)}</li>`; });
                html += '</ol>';
            } else {
                html = '<ul style="padding-left:20px;list-style:none">';
                items.forEach(item => { html += `<li style="margin-bottom:6px">• ${_escapeHTML(item)}</li>`; });
                html += '</ul>';
            }
            dom.innerHTML = html;
            return;
        }

        // ── Tip Carousel ──
        if (type === 'tip_carousel') {
            _applyTextStyles(dom, p);
            dom.style.display = 'flex';
            dom.style.alignItems = 'center';
            dom.style.justifyContent = 'center';
            const tips = p.tips || ['Tip'];
            let idx = 0;
            dom.textContent = tips[0];
            setInterval(() => {
                idx = (idx + 1) % tips.length;
                dom.style.opacity = '0';
                setTimeout(() => {
                    dom.textContent = tips[idx];
                    dom.style.opacity = '1';
                }, 400);
            }, p.interval || 5000);
            dom.style.transition = 'opacity 0.4s ease';
            return;
        }

        // ── Stat Card (template) ──
        if (type === 'stat_card') {
            dom.style.display = 'flex';
            dom.style.flexDirection = 'column';
            dom.style.alignItems = 'center';
            dom.style.justifyContent = 'center';
            dom.style.gap = '8px';
            dom.style.padding = '16px';
            dom.innerHTML = `
                <i class="${p.iconClass || 'fa-solid fa-users'}" style="font-size:28px;color:${p.accentColor || '#6366f1'}"></i>
                <span style="font-size:28px;font-weight:bold;color:${p.color || '#fff'}">${_escapeHTML(p.value || '0')}</span>
                <span style="font-size:12px;color:rgba(255,255,255,0.6)">${_escapeHTML(p.label || 'Label')}</span>`;
            dom.dataset.dynamic = 'stat_card';
            return;
        }

        // ── Feature Card (template) ──
        if (type === 'feature_card') {
            dom.style.display = 'flex';
            dom.style.flexDirection = 'column';
            dom.style.alignItems = 'center';
            dom.style.textAlign = 'center';
            dom.style.gap = '12px';
            dom.style.padding = '24px';
            dom.innerHTML = `
                <i class="${p.iconClass || 'fa-solid fa-star'}" style="font-size:32px;color:${p.accentColor || '#6366f1'}"></i>
                <h3 style="font-size:18px;font-weight:600;color:${p.color || '#fff'};margin:0">${_escapeHTML(p.title || 'Feature')}</h3>
                <p style="font-size:14px;color:rgba(255,255,255,0.6);margin:0;line-height:1.5">${_escapeHTML(p.description || '')}</p>`;
            return;
        }

        // ── Team Card (template) ──
        if (type === 'team_card') {
            dom.style.display = 'flex';
            dom.style.flexDirection = 'column';
            dom.style.alignItems = 'center';
            dom.style.gap = '12px';
            dom.style.padding = '24px';
            dom.innerHTML = `
                <div style="width:80px;height:80px;border-radius:50%;overflow:hidden;background:rgba(255,255,255,0.1)">
                    ${p.avatarSrc ? `<img src="${_escapeAttr(p.avatarSrc)}" style="width:100%;height:100%;object-fit:cover">` : '<i class="fa-solid fa-user" style="font-size:32px;color:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;width:100%;height:100%"></i>'}
                </div>
                <strong style="color:${p.color || '#fff'};font-size:16px">${_escapeHTML(p.name || 'Name')}</strong>
                <span style="color:rgba(255,255,255,0.5);font-size:13px">${_escapeHTML(p.role || 'Role')}</span>`;
            return;
        }

        // ── Music Player ──
        if (type === 'music_player') {
            dom.classList.add('ls-music-player');
            dom.innerHTML = `
                <button class="music-toggle" style="background:none;border:none;color:${p.color || '#fff'};font-size:20px;cursor:pointer"><i class="fa-solid fa-play"></i></button>
                <span class="track-name" style="color:${p.color || '#fff'};font-size:14px">${_escapeHTML(p.trackName || 'Music')}</span>`;
            if (p.trackUrl) {
                const audio = new Audio(p.trackUrl);
                audio.loop = true;
                audio.volume = 0.5;
                const btn = dom.querySelector('.music-toggle');
                if (p.autoplay) {
                    audio.play().catch(() => {});
                    btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                }
                btn.addEventListener('click', () => {
                    if (audio.paused) {
                        audio.play();
                        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    } else {
                        audio.pause();
                        btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                    }
                });
            }
            return;
        }

        // ── Mute Button ──
        if (type === 'mute_button') {
            dom.style.display = 'flex';
            dom.style.alignItems = 'center';
            dom.style.justifyContent = 'center';
            dom.style.cursor = 'pointer';
            dom.innerHTML = `<i class="fa-solid fa-volume-high" style="color:${p.color || '#fff'};font-size:${p.fontSize || 20}px"></i>`;
            return;
        }

        // ── Gradient / Color / Blur Overlay ──
        if (type === 'gradient_overlay') {
            const colors = p.colors || ['rgba(0,0,0,0.8)', 'transparent'];
            const angle = p.gradientAngle || 180;
            const gType = p.gradientType === 'radial' ? 'radial-gradient(circle' : `linear-gradient(${angle}deg`;
            dom.style.background = `${gType}, ${colors.join(', ')})`;
            return;
        }

        if (type === 'color_overlay') {
            dom.style.background = p.overlayColor || 'rgba(0,0,0,0.5)';
            return;
        }

        if (type === 'blur_overlay') {
            dom.style.backdropFilter = `blur(${p.blurAmount || 5}px)`;
            return;
        }

        // ── Glow ──
        if (type === 'glow') {
            dom.style.borderRadius = '50%';
            dom.style.background = `radial-gradient(circle, ${p.glowColor || '#6366f1'} 0%, transparent 70%)`;
            dom.style.opacity = p.glowIntensity || 0.8;
            return;
        }

        // ── Shadow Box ──
        if (type === 'shadow_box') {
            dom.style.boxShadow = `${p.shadowOffsetX || 0}px ${p.shadowOffsetY || 10}px ${p.shadowBlur || 20}px ${p.shadowColor || 'rgba(0,0,0,0.5)'}`;
            return;
        }

        // ── Neon Border ──
        if (type === 'neon_border') {
            dom.classList.add('ls-neon-border');
            dom.style.setProperty('--neon-color', p.neonColor || '#6366f1');
            dom.style.setProperty('--neon-size', (p.neonSize || 3) + 'px');
            dom.style.border = `${p.neonSize || 3}px solid ${p.neonColor || '#6366f1'}`;
            if (p.animated) dom.classList.add('animated');
            return;
        }


        // ── Resource List (live loading) ──
        if (type === 'resource_list') {
            dom.style.overflowY = 'auto';
            dom.style.padding = (p.padding || 8) + 'px';
            dom.style.fontFamily = (p.fontFamily || 'JetBrains Mono') + ', monospace';
            dom.style.fontSize = (p.fontSize || 12) + 'px';
            dom.style.color = p.color || 'rgba(255,255,255,0.6)';
            dom.style.lineHeight = '1.6';
            dom.dataset.resourceList = 'true';
            dom.dataset.maxItems = p.maxVisibleItems || 15;
            dom.innerHTML = '<div class="resource-list-inner"></div>';

            Progress.onResource((name, all) => {
                const inner = dom.querySelector('.resource-list-inner');
                if (!inner) return;
                const maxItems = parseInt(dom.dataset.maxItems) || 15;
                const start = Math.max(0, all.length - maxItems);
                const visible = all.slice(start);
                inner.innerHTML = visible.map((r, i) => {
                    const isLatest = i === visible.length - 1;
                    const opacity = isLatest ? '1' : (0.3 + (i / visible.length) * 0.5);
                    return '<div style="opacity:' + opacity + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
                           (isLatest ? '<i class="fa-solid fa-circle" style="font-size:6px;color:#22c55e;margin-right:6px;vertical-align:middle"></i>' : '<i class="fa-solid fa-check" style="font-size:8px;color:rgba(255,255,255,0.2);margin-right:6px;vertical-align:middle"></i>') +
                           _escapeHTML(r) + '</div>';
                }).join('');
                inner.scrollTop = inner.scrollHeight;
            });
            return;
        }
        // ── Canvas Effects (particles, snow, rain, fog, scanlines) ──
        if (['particles','snowfall','rainfall','fog','scanlines'].includes(type)) {
            Effects.render(dom, el);
            return;
        }

        // ── Slideshow ──
        if (type === 'slideshow') {
            const images = p.images || [];
            if (images.length === 0) return;
            let idx = 0;
            const img = document.createElement('img');
            img.src = images[0];
            img.style.objectFit = p.objectFit || 'cover';
            img.style.transition = `opacity ${p.transition === 'fade' ? '1s' : '0s'} ease`;
            dom.appendChild(img);
            setInterval(() => {
                idx = (idx + 1) % images.length;
                if (p.transition === 'fade') {
                    img.style.opacity = '0';
                    setTimeout(() => {
                        img.src = images[idx];
                        img.style.opacity = '1';
                    }, 500);
                } else {
                    img.src = images[idx];
                }
            }, p.interval || 5000);
            return;
        }

        // ── Divider ──
        if (type === 'divider') {
            dom.style.backgroundColor = p.backgroundColor || 'rgba(255,255,255,0.2)';
            return;
        }

        // ── Countdown ──
        if (type === 'countdown') {
            _applyTextStyles(dom, p);
            dom.style.display = 'flex';
            dom.style.alignItems = 'center';
            dom.style.justifyContent = 'center';
            dom.textContent = p.format || '00:00:00';
            if (p.targetDate) {
                const target = new Date(p.targetDate).getTime();
                setInterval(() => {
                    const diff = Math.max(0, target - Date.now());
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    dom.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                }, 1000);
            }
            return;
        }

        // ── Language Selector (interactive DE/EN toggle) ──
        if (type === 'language_selector') {
            dom.style.display = 'flex';
            dom.style.alignItems = 'center';
            dom.style.justifyContent = 'center';
            dom.style.gap = '8px';
            dom.style.cursor = 'pointer';
            dom.style.userSelect = 'none';
            dom.style.fontFamily = (p.fontFamily || 'Inter') + ', sans-serif';
            dom.style.fontSize = (p.fontSize || 14) + 'px';

            const deSpan = document.createElement('span');
            deSpan.textContent = 'DE';
            deSpan.dataset.lang = 'de';
            const divider = document.createElement('span');
            divider.textContent = '|';
            divider.style.opacity = '0.3';
            const enSpan = document.createElement('span');
            enSpan.textContent = 'EN';
            enSpan.dataset.lang = 'en';

            function updateVisual() {
                const isDE = I18n.getLang() === 'de';
                deSpan.style.color = isDE ? (p.color || '#fff') : 'rgba(255,255,255,0.35)';
                deSpan.style.fontWeight = isDE ? '700' : '400';
                enSpan.style.color = !isDE ? (p.color || '#fff') : 'rgba(255,255,255,0.35)';
                enSpan.style.fontWeight = !isDE ? '700' : '400';
            }

            dom.appendChild(deSpan);
            dom.appendChild(divider);
            dom.appendChild(enSpan);
            updateVisual();

            dom.addEventListener('click', () => {
                I18n.toggle();
                updateVisual();
            });
            I18n.onChange(() => updateVisual());
            return;
        }

        // ── Staff List (online staff from Discord/server) ──
        if (type === 'staff_list') {
            dom.style.overflowY = 'auto';
            dom.style.padding = (p.padding || 8) + 'px';
            dom.style.fontFamily = (p.fontFamily || 'Inter') + ', sans-serif';
            dom.style.fontSize = (p.fontSize || 14) + 'px';
            dom.style.color = p.color || '#cccccc';
            dom.dataset.staffList = 'true';

            const members = p.members || [];
            const staffData = Variables.get('onlineStaff') || [];
            const list = staffData.length ? staffData : members;

            dom.innerHTML = list.map(m => {
                const name = m.name || m.username || 'Staff';
                const role = m.role || m.rank || '';
                const avatar = m.avatar || '';
                return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                    ${avatar ? `<img src="${avatar}" style="width:24px;height:24px;border-radius:50%;object-fit:cover">` : `<i class="fa-solid fa-circle" style="font-size:6px;color:#22c55e"></i>`}
                    <span>${_escapeHTML(name)}</span>
                    ${role ? `<span style="opacity:0.5;font-size:12px">${_escapeHTML(role)}</span>` : ''}
                </div>`;
            }).join('') || '<div style="opacity:0.4">No staff online</div>';
            return;
        }

        // ── Default: container / section / card / panel / row / column / grid ──
        if (['container','section','card','panel','row','column','grid','header_bar','footer_bar','sidebar_panel','hero_section','navbar','cta_section','gallery_grid','tabs','spacer','audio_visualizer','iframe','animation_layer','parallax_layer','skip_button','fullscreen_button','volume_slider','theme_switcher','settings_panel','changelog'].includes(type)) {
            if (p.display) dom.style.display = p.display;
            if (p.flexDirection) dom.style.flexDirection = p.flexDirection;
            if (p.gap) dom.style.gap = p.gap + 'px';
            if (p.padding) dom.style.padding = p.padding + 'px';
        }
    }

    // ─── Progress Updates ────────────────────────────────

    function _updateProgressElements(pct) {
        // Progress bars
        document.querySelectorAll('[data-progress-bar]').forEach(bar => {
            bar.style.width = pct + '%';
        });

        // Circular progress
        document.querySelectorAll('[data-circular-progress]').forEach(circle => {
            const circ = parseFloat(circle.dataset.circumference);
            circle.style.strokeDashoffset = circ - (circ * pct / 100);
            const textEl = circle.closest('.ls-circular-progress')?.querySelector('.percent-text');
            if (textEl) textEl.textContent = Math.round(pct) + '%';
        });

        // Percentage text
        document.querySelectorAll('[data-dynamic="percentage_text"]').forEach(el => {
            el.textContent = Math.round(pct) + '%';
        });

        // Step indicator
        document.querySelectorAll('[data-step-indicator]').forEach(el => {
            const elData = _design.elements.find(e => 'el-' + e.id === el.id);
            if (!elData) return;
            const p = elData.props || {};
            const steps = p.steps || ['Step 1','Step 2','Step 3'];
            const stepCount = steps.length;
            const activeStep = Math.min(stepCount - 1, Math.floor(pct / (100 / stepCount)));
            const activeColor = p.color || '#6366f1';
            const inactiveColor = p.inactiveColor || 'rgba(255,255,255,0.3)';

            // Re-render step indicator with updated active state
            let html = '';
            for (let i = 0; i < steps.length; i++) {
                const active = i <= activeStep;
                html += `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                    <div style="width:24px;height:24px;border-radius:50%;background:${active ? activeColor : inactiveColor};display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;">${i+1}</div>
                    <span style="font-size:11px;color:${active ? '#fff' : 'rgba(255,255,255,0.5)'}">${steps[i]}</span>
                </div>`;
                if (i < steps.length - 1) {
                    html += `<div style="flex:1;height:2px;background:${active ? activeColor : inactiveColor};margin:0 8px;"></div>`;
                }
            }
            el.innerHTML = html;
        });
    }

    // ─── Dynamic Variable Auto-Update ────────────────────

    function _startDynamicUpdates() {
        // Update time/date every second
        setInterval(() => {
            document.querySelectorAll('[data-dynamic="current_time"]').forEach(el => {
                const p = _design.elements.find(e => 'el-' + e.id === el.id)?.props || {};
                el.textContent = (p.prefix || '') + Variables.getDynamicValue('current_time') + (p.suffix || '');
            });
            document.querySelectorAll('[data-dynamic="current_date"]').forEach(el => {
                const p = _design.elements.find(e => 'el-' + e.id === el.id)?.props || {};
                el.textContent = (p.prefix || '') + Variables.getDynamicValue('current_date') + (p.suffix || '');
            });
        }, 1000);

        // Update resource-related dynamic elements
        Progress.onResource((name) => {
            document.querySelectorAll('[data-dynamic="current_resource"]').forEach(el => {
                const p = _design.elements.find(e => 'el-' + e.id === el.id)?.props || {};
                el.textContent = (p.prefix || '') + name + (p.suffix || '');
            });
            document.querySelectorAll('[data-dynamic="resource_count"]').forEach(el => {
                const p = _design.elements.find(e => 'el-' + e.id === el.id)?.props || {};
                el.textContent = (p.prefix || '') + Variables.getResourceCount() + (p.suffix || '');
            });
        });

        // Loading text dots animation
        setInterval(() => {
            document.querySelectorAll('[data-dots="true"]').forEach(el => {
                const base = el.textContent.replace(/\.+$/, '');
                const dots = (el.textContent.match(/\.+$/)?.[0]?.length || 0) % 3 + 1;
                el.textContent = base + '.'.repeat(dots);
            });
        }, 500);

        // Language switch: update all translatable text elements
        I18n.onChange((lang) => {
            document.querySelectorAll('[data-translatable="true"]').forEach(el => {
                const textDe = el.dataset.textDe || '';
                const textEn = el.dataset.textEn || '';
                const text = lang === 'en' && textEn ? textEn : textDe;
                const resolved = Variables.resolve(text);
                if (el.dataset.type === 'rich_text') {
                    el.innerHTML = _sanitizeHTML(resolved);
                } else {
                    el.textContent = resolved;
                }
            });
        });
    }

    // ─── Typewriter Effect ──────────────────────────────

    function _startTypewriter(dom, text, speed, loop) {
        let i = 0;
        let deleting = false;

        function type() {
            if (!deleting) {
                dom.textContent = text.substring(0, i + 1);
                i++;
                if (i >= text.length) {
                    if (!loop) return;
                    setTimeout(() => { deleting = true; type(); }, 2000);
                    return;
                }
            } else {
                dom.textContent = text.substring(0, i);
                i--;
                if (i <= 0) {
                    deleting = false;
                    setTimeout(type, 500);
                    return;
                }
            }
            setTimeout(type, deleting ? speed / 2 : speed);
        }
        type();
    }

    // ─── Helpers ─────────────────────────────────────────

    function _applyTextStyles(dom, p) {
        if (p.fontSize)    dom.style.fontSize   = p.fontSize + 'px';
        if (p.fontWeight)  dom.style.fontWeight  = p.fontWeight;
        if (p.fontFamily)  dom.style.fontFamily  = `${p.fontFamily}, sans-serif`;
        if (p.fontStyle)   dom.style.fontStyle   = p.fontStyle;
        if (p.color)       dom.style.color       = p.color;
        if (p.textAlign)   dom.style.textAlign   = p.textAlign;
        if (p.lineHeight)  dom.style.lineHeight  = p.lineHeight;
        dom.style.display = 'flex';
        dom.style.alignItems = 'center';
        if (p.textAlign === 'center') dom.style.justifyContent = 'center';
        if (p.textAlign === 'right')  dom.style.justifyContent = 'flex-end';
    }

    function _escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function _escapeAttr(str) {
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function _sanitizeHTML(html) {
        // Allow only basic formatting tags
        return html.replace(/<(?!\/?(?:p|br|b|i|u|strong|em|span|h[1-6]|ul|ol|li|a)\b)[^>]*>/gi, '');
    }

    return { init };
})();

// ─── Boot ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    Renderer.init();
});
