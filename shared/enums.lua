-- ═══════════════════════════════════════════════════════════
--  Element Categories & Types for Loadscreen Creator
--  103 element types across 10 categories
-- ═══════════════════════════════════════════════════════════

ElementCategory = {
    LAYOUT      = 'layout',
    TEXT        = 'text',
    MEDIA       = 'media',
    LOADING     = 'loading',
    DYNAMIC     = 'dynamic',
    INFORMATION = 'information',
    PLAYER      = 'player',
    INTERACTIVE = 'interactive',
    EFFECTS     = 'effects',
    TEMPLATES   = 'templates',
}

-- All available element types, grouped by category
ElementTypes = {
    -- ── Layout (10) ──────────────────────────────────────
    { id = 'container',       category = ElementCategory.LAYOUT,      label = 'Container',         icon = 'fa-square' },
    { id = 'row',             category = ElementCategory.LAYOUT,      label = 'Row',               icon = 'fa-arrows-left-right' },
    { id = 'column',          category = ElementCategory.LAYOUT,      label = 'Column',            icon = 'fa-arrows-up-down' },
    { id = 'section',         category = ElementCategory.LAYOUT,      label = 'Section',           icon = 'fa-layer-group' },
    { id = 'divider',         category = ElementCategory.LAYOUT,      label = 'Divider',           icon = 'fa-minus' },
    { id = 'spacer',          category = ElementCategory.LAYOUT,      label = 'Spacer',            icon = 'fa-expand' },
    { id = 'grid',            category = ElementCategory.LAYOUT,      label = 'Grid',              icon = 'fa-table-cells' },
    { id = 'card',            category = ElementCategory.LAYOUT,      label = 'Card',              icon = 'fa-id-card' },
    { id = 'panel',           category = ElementCategory.LAYOUT,      label = 'Panel',             icon = 'fa-window-maximize' },
    { id = 'tabs',            category = ElementCategory.LAYOUT,      label = 'Tabs',              icon = 'fa-folder' },

    -- ── Text (12) ────────────────────────────────────────
    { id = 'heading_h1',      category = ElementCategory.TEXT,        label = 'Heading H1',        icon = 'fa-heading' },
    { id = 'heading_h2',      category = ElementCategory.TEXT,        label = 'Heading H2',        icon = 'fa-heading' },
    { id = 'heading_h3',      category = ElementCategory.TEXT,        label = 'Heading H3',        icon = 'fa-heading' },
    { id = 'paragraph',       category = ElementCategory.TEXT,        label = 'Paragraph',         icon = 'fa-paragraph' },
    { id = 'label',           category = ElementCategory.TEXT,        label = 'Label',             icon = 'fa-tag' },
    { id = 'badge',           category = ElementCategory.TEXT,        label = 'Badge',             icon = 'fa-certificate' },
    { id = 'ticker_text',     category = ElementCategory.TEXT,        label = 'Ticker Text',       icon = 'fa-text-width' },
    { id = 'typewriter_text', category = ElementCategory.TEXT,        label = 'Typewriter',        icon = 'fa-i-cursor' },
    { id = 'countdown',       category = ElementCategory.TEXT,        label = 'Countdown',         icon = 'fa-hourglass-half' },
    { id = 'rich_text',       category = ElementCategory.TEXT,        label = 'Rich Text',         icon = 'fa-align-left' },
    { id = 'blockquote',      category = ElementCategory.TEXT,        label = 'Blockquote',        icon = 'fa-quote-left' },
    { id = 'code_block',      category = ElementCategory.TEXT,        label = 'Code Block',        icon = 'fa-code' },

    -- ── Media (10) ───────────────────────────────────────
    { id = 'image',           category = ElementCategory.MEDIA,       label = 'Image',             icon = 'fa-image' },
    { id = 'video',           category = ElementCategory.MEDIA,       label = 'Video',             icon = 'fa-video' },
    { id = 'background_image',category = ElementCategory.MEDIA,       label = 'Background Image',  icon = 'fa-panorama' },
    { id = 'background_video',category = ElementCategory.MEDIA,       label = 'Background Video',  icon = 'fa-film' },
    { id = 'icon',            category = ElementCategory.MEDIA,       label = 'Icon',              icon = 'fa-icons' },
    { id = 'logo',            category = ElementCategory.MEDIA,       label = 'Logo',              icon = 'fa-star' },
    { id = 'slideshow',       category = ElementCategory.MEDIA,       label = 'Slideshow',         icon = 'fa-images' },
    { id = 'gif',             category = ElementCategory.MEDIA,       label = 'GIF',               icon = 'fa-photo-film' },
    { id = 'iframe',          category = ElementCategory.MEDIA,       label = 'IFrame',            icon = 'fa-window-restore' },
    { id = 'audio_visualizer',category = ElementCategory.MEDIA,       label = 'Audio Visualizer',  icon = 'fa-wave-square' },

    -- ── Loading (10) ─────────────────────────────────────
    { id = 'progress_bar',    category = ElementCategory.LOADING,     label = 'Progress Bar',      icon = 'fa-bars-progress' },
    { id = 'spinner',         category = ElementCategory.LOADING,     label = 'Spinner',           icon = 'fa-spinner' },
    { id = 'circular_progress',category = ElementCategory.LOADING,    label = 'Circular Progress', icon = 'fa-circle-notch' },
    { id = 'loading_dots',    category = ElementCategory.LOADING,     label = 'Loading Dots',      icon = 'fa-ellipsis' },
    { id = 'loading_text',    category = ElementCategory.LOADING,     label = 'Loading Text',      icon = 'fa-font' },
    { id = 'percentage_text', category = ElementCategory.LOADING,     label = 'Percentage',        icon = 'fa-percent' },
    { id = 'skeleton_loader', category = ElementCategory.LOADING,     label = 'Skeleton Loader',   icon = 'fa-bone' },
    { id = 'bar_loader',      category = ElementCategory.LOADING,     label = 'Bar Loader',        icon = 'fa-grip-lines' },
    { id = 'pulse_loader',    category = ElementCategory.LOADING,     label = 'Pulse Loader',      icon = 'fa-heart-pulse' },
    { id = 'step_indicator',  category = ElementCategory.LOADING,     label = 'Step Indicator',    icon = 'fa-list-ol' },

    -- ── Dynamic Variables (12) ───────────────────────────
    { id = 'server_name',     category = ElementCategory.DYNAMIC,     label = 'Server Name',       icon = 'fa-server' },
    { id = 'player_count',    category = ElementCategory.DYNAMIC,     label = 'Player Count',      icon = 'fa-users' },
    { id = 'max_players',     category = ElementCategory.DYNAMIC,     label = 'Max Players',       icon = 'fa-user-group' },
    { id = 'server_ip',       category = ElementCategory.DYNAMIC,     label = 'Server IP',         icon = 'fa-network-wired' },
    { id = 'map_name',        category = ElementCategory.DYNAMIC,     label = 'Map Name',          icon = 'fa-map' },
    { id = 'game_type',       category = ElementCategory.DYNAMIC,     label = 'Game Type',         icon = 'fa-gamepad' },
    { id = 'queue_position',  category = ElementCategory.DYNAMIC,     label = 'Queue Position',    icon = 'fa-list' },
    { id = 'loading_message', category = ElementCategory.DYNAMIC,     label = 'Loading Message',   icon = 'fa-message' },
    { id = 'server_uptime',   category = ElementCategory.DYNAMIC,     label = 'Server Uptime',     icon = 'fa-clock' },
    { id = 'resource_count',  category = ElementCategory.DYNAMIC,     label = 'Resource Count',    icon = 'fa-cubes' },
    { id = 'current_time',    category = ElementCategory.DYNAMIC,     label = 'Current Time',      icon = 'fa-clock' },
    { id = 'current_date',    category = ElementCategory.DYNAMIC,     label = 'Current Date',      icon = 'fa-calendar' },

    -- ── Information (10) ─────────────────────────────────
    { id = 'rules_list',      category = ElementCategory.INFORMATION, label = 'Rules List',        icon = 'fa-gavel' },
    { id = 'feature_list',    category = ElementCategory.INFORMATION, label = 'Feature List',      icon = 'fa-list-check' },
    { id = 'changelog',       category = ElementCategory.INFORMATION, label = 'Changelog',         icon = 'fa-clock-rotate-left' },
    { id = 'news_ticker',     category = ElementCategory.INFORMATION, label = 'News Ticker',       icon = 'fa-newspaper' },
    { id = 'social_links',    category = ElementCategory.INFORMATION, label = 'Social Links',      icon = 'fa-share-nodes' },
    { id = 'staff_list',      category = ElementCategory.INFORMATION, label = 'Staff List',        icon = 'fa-user-tie' },
    { id = 'description_text',category = ElementCategory.INFORMATION, label = 'Description',       icon = 'fa-align-justify' },
    { id = 'faq_list',        category = ElementCategory.INFORMATION, label = 'FAQ List',          icon = 'fa-circle-question' },
    { id = 'tip_carousel',    category = ElementCategory.INFORMATION, label = 'Tip Carousel',      icon = 'fa-lightbulb' },
    { id = 'announcement',    category = ElementCategory.INFORMATION, label = 'Announcement',      icon = 'fa-bullhorn' },

    -- ── Player (8) ───────────────────────────────────────
    { id = 'player_name',     category = ElementCategory.PLAYER,      label = 'Player Name',       icon = 'fa-user' },
    { id = 'player_avatar',   category = ElementCategory.PLAYER,      label = 'Player Avatar',     icon = 'fa-circle-user' },
    { id = 'player_id',       category = ElementCategory.PLAYER,      label = 'Player ID',         icon = 'fa-id-badge' },
    { id = 'welcome_message', category = ElementCategory.PLAYER,      label = 'Welcome Message',   icon = 'fa-hand-wave' },
    { id = 'player_playtime', category = ElementCategory.PLAYER,      label = 'Playtime',          icon = 'fa-stopwatch' },
    { id = 'player_last_login',category = ElementCategory.PLAYER,     label = 'Last Login',        icon = 'fa-right-to-bracket' },
    { id = 'player_rank',     category = ElementCategory.PLAYER,      label = 'Player Rank',       icon = 'fa-ranking-star' },
    { id = 'player_character',category = ElementCategory.PLAYER,      label = 'Character Info',    icon = 'fa-person' },

    -- ── Interactive (8) ──────────────────────────────────
    { id = 'music_player',    category = ElementCategory.INTERACTIVE, label = 'Music Player',      icon = 'fa-music' },
    { id = 'volume_slider',   category = ElementCategory.INTERACTIVE, label = 'Volume Slider',     icon = 'fa-volume-high' },
    { id = 'theme_switcher',  category = ElementCategory.INTERACTIVE, label = 'Theme Switcher',    icon = 'fa-palette' },
    { id = 'language_selector',category = ElementCategory.INTERACTIVE,label = 'Language Selector', icon = 'fa-language' },
    { id = 'mute_button',     category = ElementCategory.INTERACTIVE, label = 'Mute Button',       icon = 'fa-volume-xmark' },
    { id = 'fullscreen_button',category = ElementCategory.INTERACTIVE,label = 'Fullscreen',        icon = 'fa-expand' },
    { id = 'skip_button',     category = ElementCategory.INTERACTIVE, label = 'Skip Button',       icon = 'fa-forward' },
    { id = 'settings_panel',  category = ElementCategory.INTERACTIVE, label = 'Settings Panel',    icon = 'fa-gear' },

    -- ── Effects (13) ─────────────────────────────────────
    { id = 'particles',       category = ElementCategory.EFFECTS,     label = 'Particles',         icon = 'fa-burst' },
    { id = 'snowfall',        category = ElementCategory.EFFECTS,     label = 'Snowfall',          icon = 'fa-snowflake' },
    { id = 'rainfall',        category = ElementCategory.EFFECTS,     label = 'Rainfall',          icon = 'fa-cloud-rain' },
    { id = 'fog',             category = ElementCategory.EFFECTS,     label = 'Fog',               icon = 'fa-smog' },
    { id = 'gradient_overlay',category = ElementCategory.EFFECTS,     label = 'Gradient Overlay',  icon = 'fa-droplet' },
    { id = 'blur_overlay',    category = ElementCategory.EFFECTS,     label = 'Blur Overlay',      icon = 'fa-eye-slash' },
    { id = 'color_overlay',   category = ElementCategory.EFFECTS,     label = 'Color Overlay',     icon = 'fa-fill-drip' },
    { id = 'animation_layer', category = ElementCategory.EFFECTS,     label = 'Animation Layer',   icon = 'fa-wand-magic-sparkles' },
    { id = 'parallax_layer',  category = ElementCategory.EFFECTS,     label = 'Parallax Layer',    icon = 'fa-layer-group' },
    { id = 'glow',            category = ElementCategory.EFFECTS,     label = 'Glow',              icon = 'fa-sun' },
    { id = 'shadow_box',      category = ElementCategory.EFFECTS,     label = 'Shadow Box',        icon = 'fa-clone' },
    { id = 'neon_border',     category = ElementCategory.EFFECTS,     label = 'Neon Border',       icon = 'fa-border-all' },
    { id = 'scanlines',       category = ElementCategory.EFFECTS,     label = 'Scanlines',         icon = 'fa-bars-staggered' },

    -- ── Templates (10) ──────────────────────────────────
    { id = 'hero_section',    category = ElementCategory.TEMPLATES,   label = 'Hero Section',      icon = 'fa-display' },
    { id = 'sidebar_panel',   category = ElementCategory.TEMPLATES,   label = 'Sidebar Panel',     icon = 'fa-table-columns' },
    { id = 'footer_bar',      category = ElementCategory.TEMPLATES,   label = 'Footer Bar',        icon = 'fa-window-minimize' },
    { id = 'header_bar',      category = ElementCategory.TEMPLATES,   label = 'Header Bar',        icon = 'fa-window-maximize' },
    { id = 'navbar',          category = ElementCategory.TEMPLATES,   label = 'Navigation Bar',    icon = 'fa-bars' },
    { id = 'stat_card',       category = ElementCategory.TEMPLATES,   label = 'Stat Card',         icon = 'fa-chart-simple' },
    { id = 'feature_card',    category = ElementCategory.TEMPLATES,   label = 'Feature Card',      icon = 'fa-puzzle-piece' },
    { id = 'team_card',       category = ElementCategory.TEMPLATES,   label = 'Team Card',         icon = 'fa-people-group' },
    { id = 'cta_section',     category = ElementCategory.TEMPLATES,   label = 'CTA Section',       icon = 'fa-hand-pointer' },
    { id = 'gallery_grid',    category = ElementCategory.TEMPLATES,   label = 'Gallery Grid',      icon = 'fa-grip' },
}

-- Lookup table for fast access by element id
ElementTypeMap = {}
for _, et in ipairs(ElementTypes) do
    ElementTypeMap[et.id] = et
end

-- ═══════════════════════════════════════════════════════════
--  Default Properties per Element Type
--  Every element gets these base props + type-specific ones
-- ═══════════════════════════════════════════════════════════

DefaultBaseProps = {
    x        = 0,
    y        = 0,
    width    = 200,
    height   = 100,
    rotation = 0,
    opacity  = 1,
    zIndex   = 1,
    visible  = true,
    locked   = false,
    -- Style
    backgroundColor = 'transparent',
    borderRadius    = 0,
    borderWidth     = 0,
    borderColor     = 'transparent',
    borderStyle     = 'solid',
    boxShadow       = 'none',
    overflow        = 'hidden',
    -- Animation
    animationType   = 'none',   -- none, fadeIn, slideIn, bounce, pulse, etc.
    animationDuration = 1.0,
    animationDelay    = 0,
    animationRepeat   = 1,      -- -1 = infinite
}

-- Type-specific default overrides
DefaultTypeProps = {
    -- Text types
    heading_h1      = { width = 600, height = 60,  text = 'Heading', fontSize = 48, fontWeight = 'bold',   fontFamily = 'Inter', color = '#ffffff', textAlign = 'left' },
    heading_h2      = { width = 500, height = 50,  text = 'Heading', fontSize = 36, fontWeight = 'bold',   fontFamily = 'Inter', color = '#ffffff', textAlign = 'left' },
    heading_h3      = { width = 400, height = 40,  text = 'Heading', fontSize = 28, fontWeight = '600',    fontFamily = 'Inter', color = '#ffffff', textAlign = 'left' },
    paragraph       = { width = 500, height = 80,  text = 'Lorem ipsum dolor sit amet...', fontSize = 16, fontWeight = 'normal', fontFamily = 'Inter', color = '#cccccc', textAlign = 'left', lineHeight = 1.6 },
    label           = { width = 120, height = 30,  text = 'Label',   fontSize = 14, fontWeight = '500',    fontFamily = 'Inter', color = '#aaaaaa', textAlign = 'center' },
    badge           = { width = 80,  height = 28,  text = 'NEW',     fontSize = 12, fontWeight = 'bold',   fontFamily = 'Inter', color = '#ffffff', textAlign = 'center', backgroundColor = '#6366f1', borderRadius = 14 },
    ticker_text     = { width = 800, height = 40,  text = 'Breaking news: Welcome to our server!', fontSize = 18, fontWeight = 'normal', fontFamily = 'Inter', color = '#ffffff', scrollSpeed = 50 },
    typewriter_text = { width = 600, height = 40,  text = 'Welcome to the server...', fontSize = 24, fontWeight = 'normal', fontFamily = 'Inter', color = '#ffffff', typeSpeed = 80, loop = true },
    countdown       = { width = 300, height = 80,  targetDate = '', fontSize = 36, fontWeight = 'bold', fontFamily = 'Inter', color = '#ffffff', format = 'HH:mm:ss' },
    rich_text       = { width = 500, height = 200, htmlContent = '<p>Rich text content</p>', color = '#ffffff' },
    blockquote      = { width = 500, height = 80,  text = 'Quote text here', fontSize = 18, fontStyle = 'italic', fontFamily = 'Inter', color = '#cccccc', borderLeftWidth = 4, borderLeftColor = '#6366f1' },
    code_block      = { width = 500, height = 150, text = '// Code here', fontSize = 14, fontFamily = 'JetBrains Mono', color = '#e2e8f0', backgroundColor = '#1e293b', borderRadius = 8 },

    -- Layout types
    container       = { width = 400, height = 300, backgroundColor = 'rgba(255,255,255,0.05)', borderRadius = 12 },
    row             = { width = 800, height = 100, display = 'flex', flexDirection = 'row', gap = 10 },
    column          = { width = 200, height = 400, display = 'flex', flexDirection = 'column', gap = 10 },
    section         = { width = 1920, height = 300, backgroundColor = 'rgba(0,0,0,0.3)' },
    divider         = { width = 800, height = 2,   backgroundColor = 'rgba(255,255,255,0.2)' },
    spacer          = { width = 100, height = 50,  backgroundColor = 'transparent' },
    grid            = { width = 800, height = 400, columns = 3, gap = 16 },
    card            = { width = 300, height = 200, backgroundColor = 'rgba(255,255,255,0.08)', borderRadius = 16, borderWidth = 1, borderColor = 'rgba(255,255,255,0.1)' },
    panel           = { width = 350, height = 500, backgroundColor = 'rgba(0,0,0,0.6)', borderRadius = 12 },
    tabs            = { width = 500, height = 300, tabLabels = {'Tab 1','Tab 2','Tab 3'}, activeTab = 0, color = '#ffffff', backgroundColor = 'rgba(0,0,0,0.4)' },

    -- Media types
    image           = { width = 300, height = 200, src = '', objectFit = 'cover', borderRadius = 0 },
    video           = { width = 500, height = 300, src = '', autoplay = true, loop = true, muted = true, objectFit = 'cover' },
    background_image= { width = 1920, height = 1080, x = 0, y = 0, src = '', objectFit = 'cover', zIndex = 0 },
    background_video= { width = 1920, height = 1080, x = 0, y = 0, src = '', autoplay = true, loop = true, muted = true, objectFit = 'cover', zIndex = 0 },
    icon            = { width = 48,  height = 48,  iconClass = 'fa-solid fa-star', color = '#ffffff', fontSize = 32 },
    logo            = { width = 200, height = 80,  src = '', objectFit = 'contain' },
    slideshow       = { width = 600, height = 400, images = {}, interval = 5000, transition = 'fade', objectFit = 'cover' },
    gif             = { width = 300, height = 200, src = '', objectFit = 'cover' },
    iframe          = { width = 500, height = 300, src = '' },
    audio_visualizer= { width = 400, height = 150, barCount = 32, barColor = '#6366f1', barGap = 2, style = 'bars' },

    -- Loading types
    progress_bar    = { width = 600, height = 20,  barColor = '#6366f1', trackColor = 'rgba(255,255,255,0.1)', borderRadius = 10, animated = true },
    spinner         = { width = 60,  height = 60,  spinnerColor = '#6366f1', spinnerSize = 4, spinnerStyle = 'border' },
    circular_progress = { width = 100, height = 100, strokeWidth = 6, strokeColor = '#6366f1', trackColor = 'rgba(255,255,255,0.1)', showPercent = true, color = '#ffffff', fontSize = 18 },
    loading_dots    = { width = 100, height = 40,  dotCount = 3, dotSize = 12, dotColor = '#6366f1', dotGap = 8 },
    loading_text    = { width = 300, height = 30,  text = 'Loading', fontSize = 16, fontFamily = 'Inter', color = '#ffffff', showDots = true },
    percentage_text = { width = 100, height = 40,  fontSize = 24, fontWeight = 'bold', fontFamily = 'Inter', color = '#ffffff' },
    skeleton_loader = { width = 300, height = 20,  borderRadius = 4, baseColor = 'rgba(255,255,255,0.08)', highlightColor = 'rgba(255,255,255,0.15)' },
    bar_loader      = { width = 400, height = 4,   barColor = '#6366f1', trackColor = 'transparent', animated = true },
    pulse_loader    = { width = 60,  height = 60,  color = '#6366f1', pulseSize = 60 },
    step_indicator  = { width = 500, height = 60,  steps = {'Connect','Load Assets','Initialize','Done'}, activeStep = 0, color = '#6366f1', inactiveColor = 'rgba(255,255,255,0.3)' },

    -- Dynamic types (server variables)
    server_name     = { width = 400, height = 40,  fontSize = 24, fontWeight = 'bold',   fontFamily = 'Inter', color = '#ffffff', prefix = '', suffix = '' },
    player_count    = { width = 150, height = 40,  fontSize = 20, fontWeight = '600',    fontFamily = 'Inter', color = '#ffffff', prefix = '', suffix = ' Players' },
    max_players     = { width = 100, height = 30,  fontSize = 16, fontFamily = 'Inter', color = '#aaaaaa', prefix = '/', suffix = '' },
    server_ip       = { width = 300, height = 30,  fontSize = 14, fontFamily = 'JetBrains Mono', color = '#aaaaaa' },
    map_name        = { width = 200, height = 30,  fontSize = 16, fontFamily = 'Inter', color = '#cccccc' },
    game_type       = { width = 200, height = 30,  fontSize = 16, fontFamily = 'Inter', color = '#cccccc' },
    queue_position  = { width = 200, height = 40,  fontSize = 20, fontWeight = '600', fontFamily = 'Inter', color = '#f59e0b', prefix = 'Queue: #', suffix = '' },
    loading_message = { width = 500, height = 30,  fontSize = 14, fontFamily = 'Inter', color = '#aaaaaa' },
    server_uptime   = { width = 200, height = 30,  fontSize = 14, fontFamily = 'Inter', color = '#aaaaaa', prefix = 'Uptime: ' },
    resource_count  = { width = 200, height = 30,  fontSize = 14, fontFamily = 'Inter', color = '#aaaaaa', suffix = ' resources' },
    current_time    = { width = 150, height = 30,  fontSize = 16, fontFamily = 'Inter', color = '#ffffff', format = 'HH:mm' },
    current_date    = { width = 200, height = 30,  fontSize = 14, fontFamily = 'Inter', color = '#aaaaaa', format = 'DD.MM.YYYY' },

    -- Information types
    rules_list      = { width = 400, height = 300, items = {'Rule 1','Rule 2','Rule 3'}, fontSize = 14, fontFamily = 'Inter', color = '#cccccc', numbered = true },
    feature_list    = { width = 400, height = 250, items = {'Feature 1','Feature 2','Feature 3'}, fontSize = 14, fontFamily = 'Inter', color = '#cccccc', iconColor = '#6366f1' },
    changelog       = { width = 400, height = 300, entries = {}, fontSize = 14, fontFamily = 'Inter', color = '#cccccc' },
    news_ticker     = { width = 1920, height = 40, items = {'News item 1','News item 2'}, fontSize = 16, fontFamily = 'Inter', color = '#ffffff', backgroundColor = 'rgba(0,0,0,0.5)', scrollSpeed = 40 },
    social_links    = { width = 300, height = 50,  links = {}, iconSize = 24, iconColor = '#ffffff', gap = 16 },
    staff_list      = { width = 400, height = 300, members = {}, fontSize = 14, fontFamily = 'Inter', color = '#cccccc', showAvatar = true },
    description_text= { width = 600, height = 150, text = 'Server description here...', fontSize = 16, fontFamily = 'Inter', color = '#cccccc', lineHeight = 1.6 },
    faq_list        = { width = 500, height = 400, items = {}, fontSize = 14, fontFamily = 'Inter', color = '#cccccc', accentColor = '#6366f1' },
    tip_carousel    = { width = 500, height = 80,  tips = {'Tip 1','Tip 2','Tip 3'}, fontSize = 16, fontFamily = 'Inter', color = '#ffffff', interval = 5000 },
    announcement    = { width = 600, height = 60,  text = 'Important announcement!', fontSize = 18, fontWeight = '600', fontFamily = 'Inter', color = '#ffffff', backgroundColor = '#6366f1', borderRadius = 8 },

    -- Player types
    player_name     = { width = 300, height = 40,  fontSize = 24, fontWeight = 'bold', fontFamily = 'Inter', color = '#ffffff', prefix = 'Welcome, ', suffix = '!' },
    player_avatar   = { width = 80,  height = 80,  borderRadius = 40, objectFit = 'cover', borderWidth = 2, borderColor = '#6366f1' },
    player_id       = { width = 150, height = 30,  fontSize = 14, fontFamily = 'JetBrains Mono', color = '#aaaaaa', prefix = 'ID: ' },
    welcome_message = { width = 500, height = 60,  text = 'Welcome back, {playerName}!', fontSize = 20, fontFamily = 'Inter', color = '#ffffff' },
    player_playtime = { width = 200, height = 30,  fontSize = 14, fontFamily = 'Inter', color = '#aaaaaa', prefix = 'Playtime: ' },
    player_last_login = { width = 250, height = 30, fontSize = 14, fontFamily = 'Inter', color = '#aaaaaa', prefix = 'Last seen: ' },
    player_rank     = { width = 150, height = 30,  fontSize = 14, fontWeight = '600', fontFamily = 'Inter', color = '#f59e0b' },
    player_character= { width = 300, height = 40,  fontSize = 16, fontFamily = 'Inter', color = '#cccccc' },

    -- Interactive types
    music_player    = { width = 300, height = 80,  trackUrl = '', trackName = 'Background Music', autoplay = true, showControls = true, color = '#ffffff', accentColor = '#6366f1' },
    volume_slider   = { width = 200, height = 40,  defaultVolume = 50, accentColor = '#6366f1', trackColor = 'rgba(255,255,255,0.2)' },
    theme_switcher  = { width = 120, height = 40,  themes = {'dark','light'}, activeTheme = 'dark', color = '#ffffff' },
    language_selector= { width = 150, height = 40, languages = {'de','en'}, activeLanguage = 'de', color = '#ffffff' },
    mute_button     = { width = 40,  height = 40,  color = '#ffffff', fontSize = 20 },
    fullscreen_button= { width = 40, height = 40,  color = '#ffffff', fontSize = 20 },
    skip_button     = { width = 120, height = 40,  text = 'Skip', fontSize = 14, fontFamily = 'Inter', color = '#ffffff', backgroundColor = 'rgba(255,255,255,0.1)', borderRadius = 8 },
    settings_panel  = { width = 300, height = 400, backgroundColor = 'rgba(0,0,0,0.8)', borderRadius = 12, color = '#ffffff' },

    -- Effects types
    particles       = { width = 1920, height = 1080, particleCount = 50, particleColor = '#ffffff', particleSize = 3, speed = 1, direction = 'random' },
    snowfall        = { width = 1920, height = 1080, flakeCount = 100, flakeColor = '#ffffff', speed = 1, wind = 0 },
    rainfall        = { width = 1920, height = 1080, dropCount = 200, dropColor = 'rgba(200,200,255,0.5)', speed = 2, angle = 0 },
    fog             = { width = 1920, height = 1080, fogColor = 'rgba(255,255,255,0.1)', density = 0.5, speed = 0.5 },
    gradient_overlay= { width = 1920, height = 1080, gradientType = 'linear', gradientAngle = 180, colors = {'rgba(0,0,0,0.8)','transparent'} },
    blur_overlay    = { width = 1920, height = 1080, blurAmount = 5 },
    color_overlay   = { width = 1920, height = 1080, overlayColor = 'rgba(0,0,0,0.5)' },
    animation_layer = { width = 400, height = 400, animationUrl = '', loop = true },
    parallax_layer  = { width = 1920, height = 1200, src = '', speed = 0.5, direction = 'vertical' },
    glow            = { width = 200, height = 200, glowColor = '#6366f1', glowSize = 20, glowIntensity = 0.8 },
    shadow_box      = { width = 300, height = 200, shadowColor = 'rgba(0,0,0,0.5)', shadowBlur = 20, shadowOffsetX = 0, shadowOffsetY = 10, backgroundColor = 'rgba(255,255,255,0.05)', borderRadius = 12 },
    neon_border     = { width = 300, height = 200, neonColor = '#6366f1', neonSize = 3, neonIntensity = 0.8, borderRadius = 8, animated = true },
    scanlines       = { width = 1920, height = 1080, lineSpacing = 4, lineColor = 'rgba(0,0,0,0.15)', lineWidth = 1, animated = false },

    -- Template types
    hero_section    = { width = 1920, height = 600, x = 0, y = 0, title = 'Server Name', subtitle = 'Welcome to our community', backgroundSrc = '', overlayColor = 'rgba(0,0,0,0.5)' },
    sidebar_panel   = { width = 350,  height = 1080, x = 0, y = 0, backgroundColor = 'rgba(0,0,0,0.7)', borderRadius = 0 },
    footer_bar      = { width = 1920, height = 80,  x = 0, y = 1000, backgroundColor = 'rgba(0,0,0,0.5)' },
    header_bar      = { width = 1920, height = 80,  x = 0, y = 0,    backgroundColor = 'rgba(0,0,0,0.5)' },
    navbar          = { width = 1920, height = 60,  x = 0, y = 0,    items = {'Home','Server','Rules','Discord'}, color = '#ffffff', backgroundColor = 'rgba(0,0,0,0.6)', fontSize = 14 },
    stat_card       = { width = 200,  height = 120, label = 'Players', value = '0', iconClass = 'fa-solid fa-users', color = '#ffffff', accentColor = '#6366f1', backgroundColor = 'rgba(255,255,255,0.08)', borderRadius = 12 },
    feature_card    = { width = 280,  height = 200, title = 'Feature', description = 'Description here', iconClass = 'fa-solid fa-star', color = '#ffffff', accentColor = '#6366f1', backgroundColor = 'rgba(255,255,255,0.05)', borderRadius = 12 },
    team_card       = { width = 250,  height = 280, name = 'Staff Name', role = 'Admin', avatarSrc = '', color = '#ffffff', backgroundColor = 'rgba(255,255,255,0.05)', borderRadius = 12 },
    cta_section     = { width = 800,  height = 200, title = 'Join Us!', subtitle = 'Connect and play now', buttonText = 'Copy IP', buttonColor = '#6366f1', color = '#ffffff', backgroundColor = 'rgba(0,0,0,0.4)', borderRadius = 16 },
    gallery_grid    = { width = 800,  height = 600, images = {}, columns = 3, gap = 8, borderRadius = 8 },
}

-- ═══════════════════════════════════════════════════════════
--  Animation Presets
-- ═══════════════════════════════════════════════════════════

AnimationPresets = {
    { id = 'none',       label = 'None' },
    { id = 'fadeIn',     label = 'Fade In' },
    { id = 'fadeOut',    label = 'Fade Out' },
    { id = 'slideInLeft',  label = 'Slide In Left' },
    { id = 'slideInRight', label = 'Slide In Right' },
    { id = 'slideInTop',   label = 'Slide In Top' },
    { id = 'slideInBottom',label = 'Slide In Bottom' },
    { id = 'zoomIn',    label = 'Zoom In' },
    { id = 'zoomOut',   label = 'Zoom Out' },
    { id = 'bounce',    label = 'Bounce' },
    { id = 'pulse',     label = 'Pulse' },
    { id = 'shake',     label = 'Shake' },
    { id = 'rotate',    label = 'Rotate' },
    { id = 'flip',      label = 'Flip' },
    { id = 'swing',     label = 'Swing' },
    { id = 'rubberBand',label = 'Rubber Band' },
    { id = 'float',     label = 'Float' },
    { id = 'glow',      label = 'Glow Pulse' },
    { id = 'typewriter',label = 'Typewriter' },
    { id = 'blink',     label = 'Blink' },
}

-- ═══════════════════════════════════════════════════════════
--  Font Families available in the editor
-- ═══════════════════════════════════════════════════════════

FontFamilies = {
    'Inter',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Poppins',
    'Oswald',
    'Raleway',
    'Playfair Display',
    'JetBrains Mono',
    'Fira Code',
    'Bebas Neue',
    'Orbitron',
    'Rajdhani',
    'Teko',
    'Russo One',
}
