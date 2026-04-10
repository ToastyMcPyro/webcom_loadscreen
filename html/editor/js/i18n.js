/* ═══════════════════════════════════════════════════════════
   i18n.js – Internationalisation (DE / EN)
   Provides t(key) for the editor UI; applied via data-i18n
   attributes and programmatic calls.
   Must load BEFORE all other editor modules.
   ═══════════════════════════════════════════════════════════ */

const I18n = (() => {
    let _lang = 'de';
    const _listeners = [];

    /* ── String table ── */
    const S = {
        // Toolbar
        'back':           { de: 'Zurück zur Liste', en: 'Back to list' },
        'undo':           { de: 'Rückgängig (Ctrl+Z)', en: 'Undo (Ctrl+Z)' },
        'redo':           { de: 'Wiederholen (Ctrl+Y)', en: 'Redo (Ctrl+Y)' },
        'zoom.in':        { de: 'Vergrößern', en: 'Zoom In' },
        'zoom.out':       { de: 'Verkleinern', en: 'Zoom Out' },
        'zoom.fit':       { de: 'Einpassen', en: 'Fit to Screen' },
        'preview':        { de: 'Vorschau', en: 'Preview' },
        'grid':           { de: 'Raster umschalten', en: 'Toggle Grid' },
        'save':           { de: 'Speichern', en: 'Save' },
        'deploy':         { de: 'Deploy', en: 'Deploy' },
        'close':          { de: 'Schließen', en: 'Close' },
        'closePreview':   { de: 'Vorschau schließen', en: 'Close Preview' },

        // Panels
        'elements':       { de: 'Elemente', en: 'Elements' },
        'searchElements': { de: 'Element suchen...', en: 'Search elements...' },
        'properties':     { de: 'Eigenschaften', en: 'Properties' },
        'layers':         { de: 'Ebenen', en: 'Layers' },
        'selectElement':  { de: 'Wähle ein Element aus', en: 'Select an element' },
        'noSelection':    { de: 'Kein Element ausgewählt', en: 'No element selected' },
        'multiSelect':    { de: '{n} Elemente ausgewählt', en: '{n} elements selected' },

        // Property groups
        'posSize':        { de: 'Position & Größe', en: 'Position & Size' },
        'appearance':     { de: 'Darstellung', en: 'Appearance' },
        'animation':      { de: 'Animation', en: 'Animation' },
        'visibility':     { de: 'Sichtbarkeit', en: 'Visibility' },
        'typeProps':      { de: 'Typ-Eigenschaften', en: 'Type Properties' },
        'mediaFiles':     { de: 'Medien-Dateien', en: 'Media Files' },
        'translation':    { de: 'Übersetzung (EN)', en: 'Translation (EN)' },

        // Property labels
        'width':          { de: 'Breite', en: 'Width' },
        'height':         { de: 'Höhe', en: 'Height' },
        'rotation':       { de: 'Rotation', en: 'Rotation' },
        'background':     { de: 'Hintergrund', en: 'Background' },
        'borderWidth':    { de: 'Border Breite', en: 'Border Width' },
        'borderColor':    { de: 'Border Farbe', en: 'Border Color' },
        'borderStyle':    { de: 'Border Stil', en: 'Border Style' },
        'animType':       { de: 'Typ', en: 'Type' },
        'animDuration':   { de: 'Dauer (s)', en: 'Duration (s)' },
        'animDelay':      { de: 'Delay (s)', en: 'Delay (s)' },
        'animRepeat':     { de: 'Wiederholungen', en: 'Repeats' },
        'visible':        { de: 'Sichtbar', en: 'Visible' },
        'locked':         { de: 'Gesperrt', en: 'Locked' },

        // Design list
        'designs.title':  { de: 'Loadscreen Designs', en: 'Loadscreen Designs' },
        'designs.new':    { de: 'Neues Design', en: 'New Design' },

        // Media
        'media.upload':         { de: 'Hochladen', en: 'Upload' },
        'media.music':          { de: 'Musik', en: 'Music' },
        'media.video':          { de: 'Video', en: 'Video' },
        'media.noFiles':        { de: 'Keine Dateien vorhanden', en: 'No files available' },
        'media.maxSize':        { de: 'Max. 5 MB', en: 'Max 5 MB' },
        'media.select':         { de: 'Datei auswählen', en: 'Select file' },
        'media.formats.music':  { de: 'MP3, OGG, WAV', en: 'MP3, OGG, WAV' },
        'media.formats.video':  { de: 'MP4, WEBM', en: 'MP4, WEBM' },
        'media.uploading':      { de: 'Wird hochgeladen...', en: 'Uploading...' },
        'media.uploaded':       { de: 'Hochgeladen!', en: 'Uploaded!' },
        'media.error':          { de: 'Fehler beim Hochladen', en: 'Upload failed' },
        'media.tooLarge':       { de: 'Datei zu groß (max. 5 MB)', en: 'File too large (max 5 MB)' },
        'media.invalidFormat':  { de: 'Ungültiges Format', en: 'Invalid format' },
        'media.browse':         { de: 'Durchsuchen', en: 'Browse' },

        // Categories
        'cat.layout':      { de: 'Layout', en: 'Layout' },
        'cat.text':        { de: 'Text', en: 'Text' },
        'cat.media':       { de: 'Media', en: 'Media' },
        'cat.loading':     { de: 'Laden', en: 'Loading' },
        'cat.dynamic':     { de: 'Dynamisch', en: 'Dynamic' },
        'cat.information': { de: 'Information', en: 'Information' },
        'cat.player':      { de: 'Spieler', en: 'Player' },
        'cat.interactive': { de: 'Interaktiv', en: 'Interactive' },
        'cat.effects':     { de: 'Effekte', en: 'Effects' },
        'cat.templates':   { de: 'Templates', en: 'Templates' },

        // Element labels (only those that differ de/en)
        'el.progress_bar':      { de: 'Fortschrittsbalken', en: 'Progress Bar' },
        'el.resource_list':     { de: 'Resource Liste', en: 'Resource List' },
        'el.player_count':      { de: 'Spieleranzahl', en: 'Player Count' },
        'el.current_resource':  { de: 'Aktuelle Resource', en: 'Current Resource' },
        'el.current_time':      { de: 'Uhrzeit', en: 'Time' },
        'el.current_date':      { de: 'Datum', en: 'Date' },
        'el.rules_list':        { de: 'Regeln', en: 'Rules' },
        'el.tip_carousel':      { de: 'Tipps', en: 'Tips' },
        'el.player_playtime':   { de: 'Spielzeit', en: 'Playtime' },
        'el.player_rank':       { de: 'Rang', en: 'Rank' },
        'el.snowfall':          { de: 'Schnee', en: 'Snow' },
        'el.rainfall':          { de: 'Regen', en: 'Rain' },
        'el.fog':               { de: 'Nebel', en: 'Fog' },
        'el.percentage_text':   { de: 'Prozent', en: 'Percent' },
        'el.loading_message':   { de: 'Nachricht', en: 'Message' },
        'el.description_text':  { de: 'Beschreibung', en: 'Description' },
        'el.language_selector': { de: 'Sprache', en: 'Language' },
        'el.welcome_message':   { de: 'Willkommen', en: 'Welcome' },
        'el.announcement':      { de: 'Ankündigung', en: 'Announcement' },

        // Generic
        'lang.de':  { de: 'Deutsch', en: 'German' },
        'lang.en':  { de: 'Englisch', en: 'English' },
        'lang':     { de: 'DE', en: 'EN' },
    };

    /* ── Public API ── */

    function t(key, vars) {
        const entry = S[key];
        let str = entry ? (entry[_lang] || entry.de || key) : key;
        if (vars) {
            for (const [k, v] of Object.entries(vars)) {
                str = str.replace(`{${k}}`, v);
            }
        }
        return str;
    }

    function getLang() { return _lang; }

    function setLang(lang) {
        if (lang !== 'de' && lang !== 'en') return;
        _lang = lang;
        try { localStorage.setItem('webcom_editor_lang', lang); } catch (e) {}
        _applyToDOM();
        _listeners.forEach(fn => fn(lang));
    }

    function toggle() { setLang(_lang === 'de' ? 'en' : 'de'); }

    function onChange(fn) { _listeners.push(fn); }

    /* ── DOM bindings ── */

    function _applyToDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const txt = t(key);
            const icon = el.querySelector('i');
            if (icon) {
                el.textContent = '';
                el.appendChild(icon);
                el.append(' ' + txt);
            } else {
                el.textContent = txt;
            }
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = t(el.dataset.i18nTitle);
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            el.placeholder = t(el.dataset.i18nPh);
        });
    }

    function init() {
        try { _lang = localStorage.getItem('webcom_editor_lang') || 'de'; } catch (e) {}
        _applyToDOM();
    }

    return { t, getLang, setLang, toggle, onChange, init, S };
})();
