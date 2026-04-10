/* ═══════════════════════════════════════════════════════════
   i18n.js – Loadscreen Language Switcher (DE / EN)
   Used by the language_selector element to toggle language
   and update all translatable text elements.
   ═══════════════════════════════════════════════════════════ */

const I18n = (() => {
    let _lang = 'de';
    const _listeners = [];

    function getLang()  { return _lang; }

    function setLang(lang) {
        if (lang !== 'de' && lang !== 'en') return;
        _lang = lang;
        _listeners.forEach(fn => fn(lang));
    }

    function toggle() {
        setLang(_lang === 'de' ? 'en' : 'de');
        return _lang;
    }

    function onChange(fn) { _listeners.push(fn); }

    return { getLang, setLang, toggle, onChange };
})();
