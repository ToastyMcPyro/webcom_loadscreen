/* ═══════════════════════════════════════════════════════════
   elements.js – Element Factory & DOM Rendering
   Creates canvas DOM elements from element data
   ═══════════════════════════════════════════════════════════ */

const Elements = (() => {
    // Element type definitions mirror shared/enums.lua
    const CATEGORIES = [
        { id: 'layout',      label: 'Layout',       icon: 'fa-layer-group' },
        { id: 'text',        label: 'Text',         icon: 'fa-font' },
        { id: 'media',       label: 'Media',        icon: 'fa-image' },
        { id: 'loading',     label: 'Laden',        icon: 'fa-spinner' },
        { id: 'dynamic',     label: 'Dynamisch',    icon: 'fa-bolt' },
        { id: 'information', label: 'Information',  icon: 'fa-info-circle' },
        { id: 'player',      label: 'Spieler',      icon: 'fa-user' },
        { id: 'interactive', label: 'Interaktiv',   icon: 'fa-hand-pointer' },
        { id: 'effects',     label: 'Effekte',      icon: 'fa-wand-magic-sparkles' },
        { id: 'templates',   label: 'Templates',    icon: 'fa-puzzle-piece' },
    ];

    const ELEMENT_TYPES = [
        // Layout (10)
        { id: 'container', cat: 'layout', label: 'Container', icon: 'fa-square' },
        { id: 'row', cat: 'layout', label: 'Row', icon: 'fa-arrows-left-right' },
        { id: 'column', cat: 'layout', label: 'Column', icon: 'fa-arrows-up-down' },
        { id: 'section', cat: 'layout', label: 'Section', icon: 'fa-layer-group' },
        { id: 'divider', cat: 'layout', label: 'Divider', icon: 'fa-minus' },
        { id: 'spacer', cat: 'layout', label: 'Spacer', icon: 'fa-expand' },
        { id: 'grid', cat: 'layout', label: 'Grid', icon: 'fa-table-cells' },
        { id: 'card', cat: 'layout', label: 'Card', icon: 'fa-id-card' },
        { id: 'panel', cat: 'layout', label: 'Panel', icon: 'fa-window-maximize' },
        { id: 'tabs', cat: 'layout', label: 'Tabs', icon: 'fa-folder' },
        // Text (12)
        { id: 'heading_h1', cat: 'text', label: 'Heading H1', icon: 'fa-heading' },
        { id: 'heading_h2', cat: 'text', label: 'Heading H2', icon: 'fa-heading' },
        { id: 'heading_h3', cat: 'text', label: 'Heading H3', icon: 'fa-heading' },
        { id: 'paragraph', cat: 'text', label: 'Paragraph', icon: 'fa-paragraph' },
        { id: 'label', cat: 'text', label: 'Label', icon: 'fa-tag' },
        { id: 'badge', cat: 'text', label: 'Badge', icon: 'fa-certificate' },
        { id: 'ticker_text', cat: 'text', label: 'Ticker', icon: 'fa-text-width' },
        { id: 'typewriter_text', cat: 'text', label: 'Typewriter', icon: 'fa-i-cursor' },
        { id: 'countdown', cat: 'text', label: 'Countdown', icon: 'fa-hourglass-half' },
        { id: 'rich_text', cat: 'text', label: 'Rich Text', icon: 'fa-align-left' },
        { id: 'blockquote', cat: 'text', label: 'Blockquote', icon: 'fa-quote-left' },
        { id: 'code_block', cat: 'text', label: 'Code Block', icon: 'fa-code' },
        // Media (10)
        { id: 'image', cat: 'media', label: 'Image', icon: 'fa-image' },
        { id: 'video', cat: 'media', label: 'Video', icon: 'fa-video' },
        { id: 'background_image', cat: 'media', label: 'BG Image', icon: 'fa-panorama' },
        { id: 'background_video', cat: 'media', label: 'BG Video', icon: 'fa-film' },
        { id: 'icon', cat: 'media', label: 'Icon', icon: 'fa-icons' },
        { id: 'logo', cat: 'media', label: 'Logo', icon: 'fa-star' },
        { id: 'slideshow', cat: 'media', label: 'Slideshow', icon: 'fa-images' },
        { id: 'gif', cat: 'media', label: 'GIF', icon: 'fa-photo-film' },
        { id: 'iframe', cat: 'media', label: 'IFrame', icon: 'fa-window-restore' },
        { id: 'audio_visualizer', cat: 'media', label: 'Visualizer', icon: 'fa-wave-square' },
        // Loading (10)
        { id: 'progress_bar', cat: 'loading', label: 'Progress Bar', icon: 'fa-bars-progress' },
        { id: 'spinner', cat: 'loading', label: 'Spinner', icon: 'fa-spinner' },
        { id: 'circular_progress', cat: 'loading', label: 'Circular', icon: 'fa-circle-notch' },
        { id: 'loading_dots', cat: 'loading', label: 'Dots', icon: 'fa-ellipsis' },
        { id: 'loading_text', cat: 'loading', label: 'Text', icon: 'fa-font' },
        { id: 'percentage_text', cat: 'loading', label: 'Prozent', icon: 'fa-percent' },
        { id: 'skeleton_loader', cat: 'loading', label: 'Skeleton', icon: 'fa-bone' },
        { id: 'bar_loader', cat: 'loading', label: 'Bar', icon: 'fa-grip-lines' },
        { id: 'pulse_loader', cat: 'loading', label: 'Pulse', icon: 'fa-heart-pulse' },
        { id: 'step_indicator', cat: 'loading', label: 'Steps', icon: 'fa-list-ol' },
        { id: 'resource_list', cat: 'loading', label: 'Resource Liste', icon: 'fa-list-check' },
        // Dynamic (12)
        { id: 'server_name', cat: 'dynamic', label: 'Server Name', icon: 'fa-server' },
        { id: 'player_count', cat: 'dynamic', label: 'Spieleranzahl', icon: 'fa-users' },
        { id: 'max_players', cat: 'dynamic', label: 'Max Players', icon: 'fa-user-group' },
        { id: 'server_ip', cat: 'dynamic', label: 'Server IP', icon: 'fa-network-wired' },
        { id: 'map_name', cat: 'dynamic', label: 'Map Name', icon: 'fa-map' },
        { id: 'game_type', cat: 'dynamic', label: 'Game Type', icon: 'fa-gamepad' },
        { id: 'queue_position', cat: 'dynamic', label: 'Queue', icon: 'fa-list' },
        { id: 'loading_message', cat: 'dynamic', label: 'Nachricht', icon: 'fa-message' },
        { id: 'server_uptime', cat: 'dynamic', label: 'Uptime', icon: 'fa-clock' },
        { id: 'resource_count', cat: 'dynamic', label: 'Resources', icon: 'fa-cubes' },
        { id: 'current_resource', cat: 'dynamic', label: 'Aktuelle Resource', icon: 'fa-cube' },
        { id: 'current_time', cat: 'dynamic', label: 'Uhrzeit', icon: 'fa-clock' },
        { id: 'current_date', cat: 'dynamic', label: 'Datum', icon: 'fa-calendar' },
        // Information (10)
        { id: 'rules_list', cat: 'information', label: 'Regeln', icon: 'fa-gavel' },
        { id: 'feature_list', cat: 'information', label: 'Features', icon: 'fa-list-check' },
        { id: 'changelog', cat: 'information', label: 'Changelog', icon: 'fa-clock-rotate-left' },
        { id: 'news_ticker', cat: 'information', label: 'News Ticker', icon: 'fa-newspaper' },
        { id: 'social_links', cat: 'information', label: 'Social Links', icon: 'fa-share-nodes' },
        { id: 'staff_list', cat: 'information', label: 'Staff', icon: 'fa-user-tie' },
        { id: 'description_text', cat: 'information', label: 'Beschreibung', icon: 'fa-align-justify' },
        { id: 'faq_list', cat: 'information', label: 'FAQ', icon: 'fa-circle-question' },
        { id: 'tip_carousel', cat: 'information', label: 'Tipps', icon: 'fa-lightbulb' },
        { id: 'announcement', cat: 'information', label: 'Announcement', icon: 'fa-bullhorn' },
        // Player (8)
        { id: 'player_name', cat: 'player', label: 'Name', icon: 'fa-user' },
        { id: 'player_avatar', cat: 'player', label: 'Avatar', icon: 'fa-circle-user' },
        { id: 'player_id', cat: 'player', label: 'Player ID', icon: 'fa-id-badge' },
        { id: 'welcome_message', cat: 'player', label: 'Welcome', icon: 'fa-hand' },
        { id: 'player_playtime', cat: 'player', label: 'Spielzeit', icon: 'fa-stopwatch' },
        { id: 'player_last_login', cat: 'player', label: 'Last Login', icon: 'fa-right-to-bracket' },
        { id: 'player_rank', cat: 'player', label: 'Rang', icon: 'fa-ranking-star' },
        { id: 'player_character', cat: 'player', label: 'Character', icon: 'fa-person' },
        // Interactive (8)
        { id: 'music_player', cat: 'interactive', label: 'Music', icon: 'fa-music' },
        { id: 'volume_slider', cat: 'interactive', label: 'Volume', icon: 'fa-volume-high' },
        { id: 'theme_switcher', cat: 'interactive', label: 'Theme', icon: 'fa-palette' },
        { id: 'language_selector', cat: 'interactive', label: 'Sprache', icon: 'fa-language' },
        { id: 'mute_button', cat: 'interactive', label: 'Mute', icon: 'fa-volume-xmark' },
        { id: 'fullscreen_button', cat: 'interactive', label: 'Fullscreen', icon: 'fa-expand' },
        { id: 'skip_button', cat: 'interactive', label: 'Skip', icon: 'fa-forward' },
        { id: 'settings_panel', cat: 'interactive', label: 'Settings', icon: 'fa-gear' },
        // Effects (13)
        { id: 'particles', cat: 'effects', label: 'Particles', icon: 'fa-burst' },
        { id: 'snowfall', cat: 'effects', label: 'Schnee', icon: 'fa-snowflake' },
        { id: 'rainfall', cat: 'effects', label: 'Regen', icon: 'fa-cloud-rain' },
        { id: 'fog', cat: 'effects', label: 'Nebel', icon: 'fa-smog' },
        { id: 'gradient_overlay', cat: 'effects', label: 'Gradient', icon: 'fa-droplet' },
        { id: 'blur_overlay', cat: 'effects', label: 'Blur', icon: 'fa-eye-slash' },
        { id: 'color_overlay', cat: 'effects', label: 'Color', icon: 'fa-fill-drip' },
        { id: 'animation_layer', cat: 'effects', label: 'Animation', icon: 'fa-wand-magic-sparkles' },
        { id: 'parallax_layer', cat: 'effects', label: 'Parallax', icon: 'fa-layer-group' },
        { id: 'glow', cat: 'effects', label: 'Glow', icon: 'fa-sun' },
        { id: 'shadow_box', cat: 'effects', label: 'Shadow', icon: 'fa-clone' },
        { id: 'neon_border', cat: 'effects', label: 'Neon', icon: 'fa-border-all' },
        { id: 'scanlines', cat: 'effects', label: 'Scanlines', icon: 'fa-bars-staggered' },
        // Templates (10)
        { id: 'hero_section', cat: 'templates', label: 'Hero', icon: 'fa-display' },
        { id: 'sidebar_panel', cat: 'templates', label: 'Sidebar', icon: 'fa-table-columns' },
        { id: 'footer_bar', cat: 'templates', label: 'Footer', icon: 'fa-window-minimize' },
        { id: 'header_bar', cat: 'templates', label: 'Header', icon: 'fa-window-maximize' },
        { id: 'navbar', cat: 'templates', label: 'Navbar', icon: 'fa-bars' },
        { id: 'stat_card', cat: 'templates', label: 'Stat Card', icon: 'fa-chart-simple' },
        { id: 'feature_card', cat: 'templates', label: 'Feature Card', icon: 'fa-puzzle-piece' },
        { id: 'team_card', cat: 'templates', label: 'Team Card', icon: 'fa-people-group' },
        { id: 'cta_section', cat: 'templates', label: 'CTA', icon: 'fa-hand-pointer' },
        { id: 'gallery_grid', cat: 'templates', label: 'Gallery', icon: 'fa-grip' },
    ];

    // Default properties per type (mirrors shared/enums.lua DefaultTypeProps)
    const BASE_DEFAULTS = {
        x: 100, y: 100, width: 200, height: 100, rotation: 0, opacity: 1,
        zIndex: 1, visible: true, locked: false,
        backgroundColor: 'transparent', borderRadius: 0, borderWidth: 0,
        borderColor: 'transparent', borderStyle: 'solid', boxShadow: 'none',
        overflow: 'hidden', animationType: 'none', animationDuration: 1,
        animationDelay: 0, animationRepeat: 1,
    };

    const TYPE_DEFAULTS = {
        heading_h1:   { width: 600, height: 60, text: 'Heading', fontSize: 48, fontWeight: 'bold', fontFamily: 'Inter', color: '#ffffff', textAlign: 'left' },
        heading_h2:   { width: 500, height: 50, text: 'Heading', fontSize: 36, fontWeight: 'bold', fontFamily: 'Inter', color: '#ffffff', textAlign: 'left' },
        heading_h3:   { width: 400, height: 40, text: 'Heading', fontSize: 28, fontWeight: '600', fontFamily: 'Inter', color: '#ffffff', textAlign: 'left' },
        paragraph:    { width: 500, height: 80, text: 'Lorem ipsum dolor sit amet...', fontSize: 16, fontWeight: 'normal', fontFamily: 'Inter', color: '#cccccc', textAlign: 'left', lineHeight: 1.6 },
        label:        { width: 120, height: 30, text: 'Label', fontSize: 14, fontWeight: '500', fontFamily: 'Inter', color: '#aaaaaa', textAlign: 'center' },
        badge:        { width: 80, height: 28, text: 'NEW', fontSize: 12, fontWeight: 'bold', fontFamily: 'Inter', color: '#ffffff', textAlign: 'center', backgroundColor: '#6366f1', borderRadius: 14 },
        ticker_text:  { width: 800, height: 40, text: 'Breaking news: Welcome!', fontSize: 18, fontFamily: 'Inter', color: '#ffffff', scrollSpeed: 50 },
        typewriter_text: { width: 600, height: 40, text: 'Welcome to the server...', fontSize: 24, fontFamily: 'Inter', color: '#ffffff', typeSpeed: 80, loop: true },
        countdown:    { width: 300, height: 80, targetDate: '', fontSize: 36, fontWeight: 'bold', fontFamily: 'Inter', color: '#ffffff', format: 'HH:mm:ss' },
        rich_text:    { width: 500, height: 200, htmlContent: '<p>Rich text content</p>', color: '#ffffff' },
        blockquote:   { width: 500, height: 80, text: 'Quote text here', fontSize: 18, fontStyle: 'italic', fontFamily: 'Inter', color: '#cccccc', borderLeftWidth: 4, borderLeftColor: '#6366f1' },
        code_block:   { width: 500, height: 150, text: '// Code here', fontSize: 14, fontFamily: 'JetBrains Mono', color: '#e2e8f0', backgroundColor: '#1e293b', borderRadius: 8 },
        container:    { width: 400, height: 300, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
        row:          { width: 800, height: 100 },
        column:       { width: 200, height: 400 },
        section:      { width: 1920, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' },
        divider:      { width: 800, height: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
        spacer:       { width: 100, height: 50 },
        grid:         { width: 800, height: 400, columns: 3, gap: 16 },
        card:         { width: 300, height: 200, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
        panel:        { width: 350, height: 500, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12 },
        tabs:         { width: 500, height: 300, backgroundColor: 'rgba(0,0,0,0.4)' },
        image:        { width: 300, height: 200, src: '', objectFit: 'cover' },
        video:        { width: 500, height: 300, src: '', autoplay: true, loop: true, muted: true, objectFit: 'cover' },
        background_image: { width: 1920, height: 1080, x: 0, y: 0, src: '', objectFit: 'cover', zIndex: 0 },
        background_video: { width: 1920, height: 1080, x: 0, y: 0, src: '', autoplay: true, loop: true, muted: true, objectFit: 'cover', zIndex: 0 },
        icon:         { width: 48, height: 48, iconClass: 'fa-solid fa-star', color: '#ffffff', fontSize: 32 },
        logo:         { width: 200, height: 80, src: '', objectFit: 'contain' },
        slideshow:    { width: 600, height: 400, images: [], interval: 5000, transition: 'fade', objectFit: 'cover' },
        gif:          { width: 300, height: 200, src: '', objectFit: 'cover' },
        iframe:       { width: 500, height: 300, src: '' },
        audio_visualizer: { width: 400, height: 150, barCount: 32, barColor: '#6366f1', barGap: 2 },
        progress_bar: { width: 600, height: 20, barColor: '#6366f1', trackColor: 'rgba(255,255,255,0.1)', borderRadius: 10, animated: true },
        spinner:      { width: 60, height: 60, spinnerColor: '#6366f1', spinnerSize: 4 },
        circular_progress: { width: 100, height: 100, strokeWidth: 6, strokeColor: '#6366f1', trackColor: 'rgba(255,255,255,0.1)', showPercent: true, color: '#ffffff', fontSize: 18 },
        loading_dots: { width: 100, height: 40, dotCount: 3, dotSize: 12, dotColor: '#6366f1', dotGap: 8 },
        loading_text: { width: 300, height: 30, text: 'Loading', fontSize: 16, fontFamily: 'Inter', color: '#ffffff', showDots: true },
        percentage_text: { width: 100, height: 40, fontSize: 24, fontWeight: 'bold', fontFamily: 'Inter', color: '#ffffff' },
        skeleton_loader: { width: 300, height: 20, borderRadius: 4 },
        bar_loader:   { width: 400, height: 4, barColor: '#6366f1', animated: true },
        pulse_loader: { width: 60, height: 60, color: '#6366f1', pulseSize: 60 },
        step_indicator: { width: 500, height: 60, steps: ['Connect','Load','Init','Done'], activeStep: 0, color: '#6366f1' },
        resource_list: { width: 300, height: 400, fontFamily: 'JetBrains Mono', fontSize: 12, color: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 8, maxVisibleItems: 15 },
        server_name:  { width: 400, height: 40, fontSize: 24, fontWeight: 'bold', fontFamily: 'Inter', color: '#ffffff', prefix: '', suffix: '' },
        player_count: { width: 150, height: 40, fontSize: 20, fontWeight: '600', fontFamily: 'Inter', color: '#ffffff', prefix: '', suffix: ' Players' },
        max_players:  { width: 100, height: 30, fontSize: 16, fontFamily: 'Inter', color: '#aaaaaa', prefix: '/', suffix: '' },
        server_ip:    { width: 300, height: 30, fontSize: 14, fontFamily: 'JetBrains Mono', color: '#aaaaaa' },
        map_name:     { width: 200, height: 30, fontSize: 16, fontFamily: 'Inter', color: '#cccccc' },
        game_type:    { width: 200, height: 30, fontSize: 16, fontFamily: 'Inter', color: '#cccccc' },
        queue_position: { width: 200, height: 40, fontSize: 20, fontWeight: '600', fontFamily: 'Inter', color: '#f59e0b', prefix: 'Queue: #', suffix: '' },
        loading_message: { width: 500, height: 30, fontSize: 14, fontFamily: 'Inter', color: '#aaaaaa' },
        server_uptime: { width: 200, height: 30, fontSize: 14, fontFamily: 'Inter', color: '#aaaaaa', prefix: 'Uptime: ' },
        resource_count: { width: 200, height: 30, fontSize: 14, fontFamily: 'Inter', color: '#aaaaaa', suffix: ' resources' },
        current_resource: { width: 300, height: 30, fontSize: 14, fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,0.5)', prefix: 'Loading: ' },
        current_time: { width: 150, height: 30, fontSize: 16, fontFamily: 'Inter', color: '#ffffff' },
        current_date: { width: 200, height: 30, fontSize: 14, fontFamily: 'Inter', color: '#aaaaaa' },
        rules_list:   { width: 400, height: 300, items: ['Regel 1','Regel 2','Regel 3'], fontSize: 14, fontFamily: 'Inter', color: '#cccccc', numbered: true },
        feature_list: { width: 400, height: 250, items: ['Feature 1','Feature 2'], fontSize: 14, fontFamily: 'Inter', color: '#cccccc' },
        changelog:    { width: 400, height: 300, entries: [], fontSize: 14, fontFamily: 'Inter', color: '#cccccc' },
        news_ticker:  { width: 1920, height: 40, items: ['News 1','News 2'], fontSize: 16, fontFamily: 'Inter', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.5)', scrollSpeed: 40 },
        social_links: { width: 300, height: 50, links: [], iconSize: 24, iconColor: '#ffffff', gap: 16 },
        staff_list:   { width: 400, height: 300, members: [], fontSize: 14, fontFamily: 'Inter', color: '#cccccc' },
        description_text: { width: 600, height: 150, text: 'Server description...', fontSize: 16, fontFamily: 'Inter', color: '#cccccc', lineHeight: 1.6 },
        faq_list:     { width: 500, height: 400, items: [], fontSize: 14, fontFamily: 'Inter', color: '#cccccc' },
        tip_carousel: { width: 500, height: 80, tips: ['Tipp 1','Tipp 2'], fontSize: 16, fontFamily: 'Inter', color: '#ffffff', interval: 5000 },
        announcement: { width: 600, height: 60, text: 'Announcement!', fontSize: 18, fontWeight: '600', fontFamily: 'Inter', color: '#ffffff', backgroundColor: '#6366f1', borderRadius: 8 },
        player_name:  { width: 300, height: 40, fontSize: 24, fontWeight: 'bold', fontFamily: 'Inter', color: '#ffffff', prefix: 'Willkommen, ', suffix: '!' },
        player_avatar: { width: 80, height: 80, borderRadius: 40, objectFit: 'cover', borderWidth: 2, borderColor: '#6366f1' },
        player_id:    { width: 150, height: 30, fontSize: 14, fontFamily: 'JetBrains Mono', color: '#aaaaaa', prefix: 'ID: ' },
        welcome_message: { width: 500, height: 60, text: 'Willkommen zurück, {playerName}!', fontSize: 20, fontFamily: 'Inter', color: '#ffffff' },
        player_playtime: { width: 200, height: 30, fontSize: 14, fontFamily: 'Inter', color: '#aaaaaa', prefix: 'Spielzeit: ' },
        player_last_login: { width: 250, height: 30, fontSize: 14, fontFamily: 'Inter', color: '#aaaaaa', prefix: 'Zuletzt: ' },
        player_rank:  { width: 150, height: 30, fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#f59e0b' },
        player_character: { width: 300, height: 40, fontSize: 16, fontFamily: 'Inter', color: '#cccccc' },
        music_player: { width: 300, height: 80, trackUrl: '', trackName: 'Background Music', autoplay: true, color: '#ffffff', accentColor: '#6366f1' },
        volume_slider:{ width: 200, height: 40, defaultVolume: 50, accentColor: '#6366f1' },
        theme_switcher:{ width: 120, height: 40, color: '#ffffff' },
        language_selector: { width: 150, height: 40, color: '#ffffff' },
        mute_button:  { width: 40, height: 40, color: '#ffffff', fontSize: 20 },
        fullscreen_button: { width: 40, height: 40, color: '#ffffff', fontSize: 20 },
        skip_button:  { width: 120, height: 40, text: 'Skip', fontSize: 14, fontFamily: 'Inter', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
        settings_panel: { width: 300, height: 400, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12, color: '#ffffff' },
        particles:    { width: 1920, height: 1080, x: 0, y: 0, particleCount: 50, particleColor: '#ffffff', particleSize: 3, speed: 1 },
        snowfall:     { width: 1920, height: 1080, x: 0, y: 0, flakeCount: 100, flakeColor: '#ffffff', speed: 1, wind: 0 },
        rainfall:     { width: 1920, height: 1080, x: 0, y: 0, dropCount: 200, dropColor: 'rgba(200,200,255,0.5)', speed: 2, angle: 0 },
        fog:          { width: 1920, height: 1080, x: 0, y: 0, fogColor: 'rgba(255,255,255,0.1)', density: 0.5, speed: 0.5 },
        gradient_overlay: { width: 1920, height: 1080, x: 0, y: 0, gradientType: 'linear', gradientAngle: 180, colors: ['rgba(0,0,0,0.8)','transparent'] },
        blur_overlay: { width: 1920, height: 1080, x: 0, y: 0, blurAmount: 5 },
        color_overlay:{ width: 1920, height: 1080, x: 0, y: 0, overlayColor: 'rgba(0,0,0,0.5)' },
        animation_layer: { width: 400, height: 400, animationUrl: '', loop: true },
        parallax_layer: { width: 1920, height: 1200, src: '', speed: 0.5 },
        glow:         { width: 200, height: 200, glowColor: '#6366f1', glowSize: 20, glowIntensity: 0.8 },
        shadow_box:   { width: 300, height: 200, shadowColor: 'rgba(0,0,0,0.5)', shadowBlur: 20, shadowOffsetX: 0, shadowOffsetY: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
        neon_border:  { width: 300, height: 200, neonColor: '#6366f1', neonSize: 3, neonIntensity: 0.8, borderRadius: 8, animated: true },
        scanlines:    { width: 1920, height: 1080, x: 0, y: 0, lineSpacing: 4, lineColor: 'rgba(0,0,0,0.15)', lineWidth: 1. },
        hero_section: { width: 1920, height: 600, x: 0, y: 0, title: 'Server Name', subtitle: 'Welcome', backgroundSrc: '', overlayColor: 'rgba(0,0,0,0.5)' },
        sidebar_panel:{ width: 350, height: 1080, x: 0, y: 0, backgroundColor: 'rgba(0,0,0,0.7)' },
        footer_bar:   { width: 1920, height: 80, x: 0, y: 1000, backgroundColor: 'rgba(0,0,0,0.5)' },
        header_bar:   { width: 1920, height: 80, x: 0, y: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
        navbar:       { width: 1920, height: 60, x: 0, y: 0, items: ['Home','Server','Rules','Discord'], color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.6)', fontSize: 14 },
        stat_card:    { width: 200, height: 120, label: 'Players', value: '0', iconClass: 'fa-solid fa-users', color: '#ffffff', accentColor: '#6366f1', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 },
        feature_card: { width: 280, height: 200, title: 'Feature', description: 'Description', iconClass: 'fa-solid fa-star', color: '#ffffff', accentColor: '#6366f1', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
        team_card:    { width: 250, height: 280, name: 'Name', role: 'Admin', avatarSrc: '', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
        cta_section:  { width: 800, height: 200, title: 'Join Us!', subtitle: 'Connect now', buttonText: 'Copy IP', buttonColor: '#6366f1', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16 },
        gallery_grid: { width: 800, height: 600, images: [], columns: 3, gap: 8, borderRadius: 8 },
    };

    function getCategories() { return CATEGORIES; }
    function getElementTypes() { return ELEMENT_TYPES; }
    function getTypesByCategory(catId) { return ELEMENT_TYPES.filter(t => t.cat === catId); }
    function getTypeInfo(typeId) { return ELEMENT_TYPES.find(t => t.id === typeId); }

    /** Create a new element data object with defaults */
    function create(typeId, overrides = {}) {
        const id = _genId();
        const props = { ...BASE_DEFAULTS, ...(TYPE_DEFAULTS[typeId] || {}), ...overrides };
        // Set zIndex to top of stack
        const elements = State.getElements();
        props.zIndex = elements.length > 0 ? Math.max(...elements.map(e => e.props.zIndex || 0)) + 1 : 1;
        return { id, type: typeId, props };
    }

    /** Render an element as a DOM node for the canvas editor */
    function renderDom(el) {
        const dom = document.createElement('div');
        dom.className = 'canvas-element';
        dom.dataset.id = el.id;
        dom.dataset.type = el.type;
        dom.draggable = false; // Prevent native browser drag

        _applyPosition(dom, el.props);

        // Label
        const typeInfo = getTypeInfo(el.type);
        const label = document.createElement('span');
        label.className = 'element-label';
        label.textContent = typeInfo ? typeInfo.label : el.type;
        dom.appendChild(label);

        // Content preview
        const content = document.createElement('div');
        content.className = 'element-content';
        _renderPreview(content, el);
        dom.appendChild(content);

        return dom;
    }

    /** Update the DOM of an existing element */
    function updateDom(dom, el) {
        _applyPosition(dom, el.props);
        const content = dom.querySelector('.element-content');
        if (content) {
            content.innerHTML = '';
            _renderPreview(content, el);
        }
    }

    function _applyPosition(dom, p) {
        dom.style.left      = (p.x || 0) + 'px';
        dom.style.top       = (p.y || 0) + 'px';
        dom.style.width     = (p.width || 200) + 'px';
        dom.style.height    = (p.height || 100) + 'px';
        dom.style.zIndex    = p.zIndex || 1;
        dom.style.opacity   = p.opacity ?? 1;
        dom.style.transform = p.rotation ? `rotate(${p.rotation}deg)` : '';
        dom.style.display   = p.visible === false ? 'none' : '';
    }

    function _renderPreview(container, el) {
        const p = el.props || {};
        const type = el.type;

        // Give the container a visual background so users see shapes
        if (p.backgroundColor && p.backgroundColor !== 'transparent') {
            container.style.backgroundColor = p.backgroundColor;
        }
        if (p.borderRadius) container.style.borderRadius = p.borderRadius + 'px';
        if (p.borderWidth) container.style.border = `${p.borderWidth}px ${p.borderStyle||'solid'} ${p.borderColor||'transparent'}`;

        // Simple text preview for text types
        if (p.text || p.htmlContent) {
            const span = document.createElement('span');
            span.style.cssText = `
                display:flex;align-items:center;width:100%;height:100%;padding:4px;
                font-size:${Math.min(p.fontSize||16, 36)}px;
                font-weight:${p.fontWeight||'normal'};
                font-family:${p.fontFamily||'Inter'},sans-serif;
                color:${p.color||'#fff'};
                text-align:${p.textAlign||'left'};
                overflow:hidden;
                ${p.textAlign==='center'?'justify-content:center;':''}
            `;
            span.textContent = (p.prefix || '') + (p.text || 'Text') + (p.suffix || '');
            container.appendChild(span);
            return;
        }

        // Image preview
        if (type === 'image' || type === 'logo' || type === 'gif' || type === 'background_image') {
            if (p.src) {
                const img = document.createElement('img');
                img.src = p.src;
                img.style.cssText = `width:100%;height:100%;object-fit:${p.objectFit||'cover'};`;
                container.appendChild(img);
            } else {
                container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:rgba(255,255,255,0.2);font-size:24px"><i class="fa-solid fa-image"></i></div>`;
            }
            return;
        }

        // Icon preview
        if (type === 'icon') {
            container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;"><i class="${p.iconClass||'fa-solid fa-star'}" style="color:${p.color||'#fff'};font-size:${p.fontSize||32}px"></i></div>`;
            return;
        }

        // Progress bar preview
        if (type === 'progress_bar' || type === 'bar_loader') {
            container.innerHTML = `<div style="width:100%;height:100%;background:${p.trackColor||'rgba(255,255,255,0.1)'};border-radius:inherit;overflow:hidden"><div style="width:65%;height:100%;background:${p.barColor||'#6366f1'};border-radius:inherit"></div></div>`;
            return;
        }

        // Spinner preview
        if (type === 'spinner') {
            container.innerHTML = `<div style="width:100%;height:100%;border:${p.spinnerSize||4}px solid rgba(255,255,255,0.1);border-top-color:${p.spinnerColor||'#6366f1'};border-radius:50%;animation:spin 1s linear infinite"></div>`;
            return;
        }

        // Dynamic variable preview
        if (['server_name','player_count','max_players','server_ip','map_name','game_type','queue_position','loading_message','server_uptime','resource_count','current_time','current_date','player_name','player_id','player_playtime','player_last_login','player_rank','player_character','percentage_text'].includes(type)) {
            const previewValues = {
                server_name: 'My Server', player_count: '42', max_players: '64',
                server_ip: '127.0.0.1:30120', map_name: 'FiveM', game_type: 'Roleplay',
                queue_position: '5', loading_message: 'Loading resources...',
                server_uptime: '12h 30m', resource_count: '150', current_time: '14:30',
                current_date: '01.01.2025', player_name: 'Max', player_id: '1',
                player_playtime: '120h', player_last_login: 'Gestern',
                player_rank: 'Admin', player_character: 'Max Mustermann', percentage_text: '65%',
            };
            const span = document.createElement('span');
            span.style.cssText = `display:flex;align-items:center;width:100%;height:100%;font-size:${Math.min(p.fontSize||16,36)}px;font-weight:${p.fontWeight||'normal'};font-family:${p.fontFamily||'Inter'},sans-serif;color:${p.color||'#fff'};overflow:hidden;padding:4px;`;
            span.textContent = (p.prefix || '') + (previewValues[type] || type) + (p.suffix || '');
            container.appendChild(span);
            return;
        }

        // Gradient overlay preview
        if (type === 'gradient_overlay') {
            const colors = p.colors || ['rgba(0,0,0,0.8)', 'transparent'];
            container.style.background = `linear-gradient(${p.gradientAngle||180}deg, ${colors.join(', ')})`;
            return;
        }

        // Color overlay preview
        if (type === 'color_overlay') {
            container.style.background = p.overlayColor || 'rgba(0,0,0,0.5)';
            return;
        }

        // Glow preview
        if (type === 'glow') {
            container.style.borderRadius = '50%';
            container.style.background = `radial-gradient(circle, ${p.glowColor||'#6366f1'} 0%, transparent 70%)`;
            return;
        }

        // Neon border preview
        if (type === 'neon_border') {
            container.style.border = `${p.neonSize||3}px solid ${p.neonColor||'#6366f1'}`;
            container.style.boxShadow = `0 0 ${(p.neonSize||3)*2}px ${p.neonColor||'#6366f1'}`;
            return;
        }

        // Default: show type icon
        const typeInfo = getTypeInfo(type);
        if (typeInfo) {
            container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:rgba(255,255,255,0.15);font-size:20px"><i class="fa-solid ${typeInfo.icon}"></i></div>`;
        }
    }

    function _genId() {
        return Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    return {
        getCategories, getElementTypes, getTypesByCategory, getTypeInfo,
        create, renderDom, updateDom,
        BASE_DEFAULTS, TYPE_DEFAULTS,
    };
})();
