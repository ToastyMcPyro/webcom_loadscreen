/* ═══════════════════════════════════════════════════════════
   media-manager.js – In-Editor Media File Picker & Upload
   Shows a modal with uploaded music/video files, allows
   selecting for element properties & uploading new files.
   ═══════════════════════════════════════════════════════════ */

const MediaManager = (() => {
    let _musicFiles = [];
    let _videoFiles = [];
    let _onSelectCallback = null;
    let _panel = null;
    let _activeTab = 'music';

    const MUSIC_FORMATS = ['.mp3', '.ogg', '.wav'];
    const VIDEO_FORMATS = ['.mp4', '.webm'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    function init() {
        _injectCSS();
        _refreshList();
    }

    function _refreshList() {
        NUI.post('getMediaFiles', {});
    }

    /** Called from app.js NUI message handler */
    function onMediaList(data) {
        _musicFiles = data.music || [];
        _videoFiles = data.video || [];
        if (_panel) _renderFileList(_activeTab);
    }

    /** Open the media picker modal. type = 'music' | 'video' */
    function openPicker(type, callback) {
        _onSelectCallback = callback;
        _activeTab = type || 'music';
        _showPanel();
    }

    /* ── Panel UI ── */

    function _showPanel() {
        if (_panel) _panel.remove();

        _panel = document.createElement('div');
        _panel.className = 'media-mgr-overlay';
        _panel.innerHTML = `
            <div class="media-mgr-panel">
                <div class="media-mgr-header">
                    <h3><i class="fa-solid fa-folder-open"></i> ${I18n.t('media.select')}</h3>
                    <button class="media-mgr-close"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="media-mgr-tabs">
                    <button class="media-mgr-tab ${_activeTab === 'music' ? 'active' : ''}" data-tab="music">
                        <i class="fa-solid fa-music"></i> ${I18n.t('media.music')}
                    </button>
                    <button class="media-mgr-tab ${_activeTab === 'video' ? 'active' : ''}" data-tab="video">
                        <i class="fa-solid fa-video"></i> ${I18n.t('media.video')}
                    </button>
                </div>
                <div class="media-mgr-body" id="media-mgr-list"></div>
                <div class="media-mgr-footer">
                    <label class="media-mgr-upload-btn">
                        <i class="fa-solid fa-cloud-arrow-up"></i> ${I18n.t('media.upload')}
                        <input type="file" id="media-mgr-file" style="display:none">
                    </label>
                    <span class="media-mgr-hint">${I18n.t('media.maxSize')} &middot;
                        ${_activeTab === 'video' ? I18n.t('media.formats.video') : I18n.t('media.formats.music')}</span>
                </div>
            </div>`;

        document.getElementById('editor-root').appendChild(_panel);

        // Tabs
        _panel.querySelectorAll('.media-mgr-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                _panel.querySelectorAll('.media-mgr-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                _activeTab = tab.dataset.tab;
                _renderFileList(_activeTab);
                _updateAccept();
                _panel.querySelector('.media-mgr-hint').innerHTML =
                    I18n.t('media.maxSize') + ' &middot; ' +
                    (_activeTab === 'video' ? I18n.t('media.formats.video') : I18n.t('media.formats.music'));
            });
        });

        // Close
        _panel.querySelector('.media-mgr-close').addEventListener('click', _close);
        _panel.addEventListener('click', e => { if (e.target === _panel) _close(); });

        // File input
        _updateAccept();
        _panel.querySelector('#media-mgr-file').addEventListener('change', _handleUpload);

        _renderFileList(_activeTab);
    }

    function _updateAccept() {
        const input = _panel?.querySelector('#media-mgr-file');
        if (!input) return;
        input.accept = (_activeTab === 'video' ? VIDEO_FORMATS : MUSIC_FORMATS).join(',');
    }

    function _renderFileList(type) {
        const list = _panel?.querySelector('#media-mgr-list');
        if (!list) return;

        const files = type === 'video' ? _videoFiles : _musicFiles;

        if (!files || files.length === 0) {
            list.innerHTML = `<div class="media-mgr-empty">
                <i class="fa-solid fa-folder-open"></i>
                <span>${I18n.t('media.noFiles')}</span>
            </div>`;
            return;
        }

        list.innerHTML = files.map(f => `
            <div class="media-mgr-item" data-path="${_escAttr(f.path)}" data-name="${_escAttr(f.name)}">
                <i class="fa-solid ${type === 'video' ? 'fa-film' : 'fa-music'} media-mgr-icon"></i>
                <span class="media-mgr-name">${_esc(f.name)}</span>
                <span class="media-mgr-size">${_fmtSize(f.size)}</span>
                <button class="media-mgr-sel-btn">${I18n.t('media.select')}</button>
                <button class="media-mgr-del-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>`).join('');

        // Select
        list.querySelectorAll('.media-mgr-sel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const path = btn.closest('.media-mgr-item').dataset.path;
                if (_onSelectCallback) _onSelectCallback(path);
                _close();
            });
        });

        // Delete
        list.querySelectorAll('.media-mgr-del-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.media-mgr-item');
                const name = item.dataset.name;
                NUI.post('deleteMedia', { folder: _activeTab, fileName: name });
                item.remove();

                // Remove from local arrays
                const arr = _activeTab === 'video' ? _videoFiles : _musicFiles;
                const idx = arr.findIndex(f => f.name === name);
                if (idx !== -1) arr.splice(idx, 1);
            });
        });
    }

    function _handleUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > MAX_SIZE) {
            alert(I18n.t('media.tooLarge'));
            e.target.value = '';
            return;
        }

        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const allowed = _activeTab === 'video' ? VIDEO_FORMATS : MUSIC_FORMATS;
        if (!allowed.includes(ext)) {
            alert(I18n.t('media.invalidFormat') + ' (' + allowed.join(', ') + ')');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

            NUI.post('uploadMedia', {
                folder: _activeTab,
                fileName: safeName,
                data: base64,
                size: file.size,
            });

            // Optimistic add
            const entry = { name: safeName, path: 'media/' + _activeTab + '/' + safeName, size: file.size };
            if (_activeTab === 'video') _videoFiles.push(entry);
            else _musicFiles.push(entry);
            _renderFileList(_activeTab);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    function _close() {
        if (_panel) { _panel.remove(); _panel = null; }
        _onSelectCallback = null;
    }

    /* ── Helpers ── */

    function _fmtSize(b) {
        if (!b) return '';
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
        return (b / 1048576).toFixed(1) + ' MB';
    }

    function _esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    function _escAttr(s) { return (s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

    function getMusicFiles() { return _musicFiles; }
    function getVideoFiles() { return _videoFiles; }

    /* ── Injected CSS ── */

    function _injectCSS() {
        if (document.getElementById('media-mgr-css')) return;
        const style = document.createElement('style');
        style.id = 'media-mgr-css';
        style.textContent = `
.media-mgr-overlay {
    position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10000;
    display:flex;align-items:center;justify-content:center;
}
.media-mgr-panel {
    background:#1a1a2e;border:1px solid rgba(255,255,255,.1);border-radius:12px;
    width:520px;max-height:70vh;display:flex;flex-direction:column;overflow:hidden;
    box-shadow:0 20px 60px rgba(0,0,0,.5);
}
.media-mgr-header {
    display:flex;justify-content:space-between;align-items:center;
    padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.06);
}
.media-mgr-header h3 { margin:0;font-size:15px;color:#fff;font-weight:600; }
.media-mgr-close {
    background:none;border:none;color:rgba(255,255,255,.4);font-size:16px;cursor:pointer;
}
.media-mgr-close:hover { color:#fff; }
.media-mgr-tabs {
    display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,.06);
}
.media-mgr-tab {
    flex:1;padding:10px;text-align:center;background:none;border:none;
    color:rgba(255,255,255,.4);font-size:13px;cursor:pointer;
    border-bottom:2px solid transparent;transition:all .15s;
}
.media-mgr-tab.active { color:#fff;border-bottom-color:#6366f1; }
.media-mgr-tab:hover { color:rgba(255,255,255,.7); }
.media-mgr-body {
    flex:1;overflow-y:auto;padding:8px 12px;min-height:150px;max-height:40vh;
}
.media-mgr-empty {
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:8px;padding:40px;color:rgba(255,255,255,.2);font-size:13px;
}
.media-mgr-empty i { font-size:28px; }
.media-mgr-item {
    display:flex;align-items:center;gap:10px;padding:8px 10px;
    border-radius:8px;transition:background .1s;
}
.media-mgr-item:hover { background:rgba(255,255,255,.04); }
.media-mgr-icon { color:rgba(255,255,255,.3);font-size:14px;min-width:18px;text-align:center; }
.media-mgr-name { flex:1;color:#fff;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.media-mgr-size { color:rgba(255,255,255,.3);font-size:11px;min-width:55px;text-align:right; }
.media-mgr-sel-btn {
    padding:4px 12px;border-radius:6px;border:1px solid rgba(99,102,241,.5);
    background:rgba(99,102,241,.15);color:#818cf8;font-size:11px;cursor:pointer;
    white-space:nowrap;
}
.media-mgr-sel-btn:hover { background:rgba(99,102,241,.3); }
.media-mgr-del-btn {
    background:none;border:none;color:rgba(255,255,255,.2);font-size:12px;cursor:pointer;
    padding:4px 6px;
}
.media-mgr-del-btn:hover { color:#ef4444; }
.media-mgr-footer {
    display:flex;align-items:center;justify-content:space-between;
    padding:12px 20px;border-top:1px solid rgba(255,255,255,.06);
}
.media-mgr-upload-btn {
    display:flex;align-items:center;gap:6px;padding:6px 14px;
    border-radius:8px;background:rgba(99,102,241,.2);color:#818cf8;
    font-size:12px;cursor:pointer;border:1px solid rgba(99,102,241,.3);
}
.media-mgr-upload-btn:hover { background:rgba(99,102,241,.35); }
.media-mgr-hint { color:rgba(255,255,255,.25);font-size:11px; }
`;
        document.head.appendChild(style);
    }

    return { init, onMediaList, openPicker, getMusicFiles, getVideoFiles };
})();
